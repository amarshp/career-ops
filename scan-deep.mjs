/**
 * scan-deep.mjs — Deep portal adapters for scan.mjs
 *
 * Adds LinkedIn Guest API, G42 Phenom API, and MBZUAI WordPress API
 * scanning to the existing zero-token scanner.
 *
 * All adapters return arrays of {title, url, company, location, source}.
 * Dedup and pipeline writing are handled by scan.mjs.
 */

const FETCH_TIMEOUT_MS = 15_000;
const UAE_LOCATIONS = ['united arab emirates', 'abu dhabi', 'dubai', 'sharjah', 'ajman', 'uae', 'al ain'];

function isUaeLocation(location) {
  const lower = (location || '').toLowerCase();
  return UAE_LOCATIONS.some(loc => lower.includes(loc));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, ...opts });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── G42 Phenom API ─────────────────────────────────────────────────

export async function scanPhenom(titleFilter) {
  const PAGE_SIZE = 100;
  const results = [];
  let from = 0;
  let totalScanned = 0;
  let filtered = 0;

  for (let page = 0; page < 5; page++) {
    const res = await fetchWithTimeout('https://careers.g42.ai/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: 'en_global', deviceType: 'desktop', country: 'global',
        pageName: 'search-results', ddoKey: 'refineSearch',
        sortBy: '', subsidiary: 'ALL', from, size: PAGE_SIZE,
        apply: true, jobs: true, counts: true,
        all_fields: ['category', 'country', 'state', 'city', 'type', 'subCategory', 'subsidiary'],
        query: '', locationData: {},
      }),
    });

    const json = await res.json();
    const jobs = json?.refineSearch?.data?.jobs;
    if (!jobs?.length) break;

    for (const job of jobs) {
      totalScanned++;
      const title = job.title || '';
      const brand = job.brand || 'G42';
      const location = [job.city, job.state, job.country].filter(Boolean).join(', ');

      if (!isUaeLocation(location)) { filtered++; continue; }
      if (!titleFilter(title)) { filtered++; continue; }

      const reqId = job.reqId || job.jobId || '';
      const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
      const url = `https://careers.g42.ai/${brandSlug}/global/en/job/${slugify(title)}/${reqId}`;

      results.push({ title, url, company: brand, location, source: 'phenom-api' });
    }

    from += PAGE_SIZE;
    if (jobs.length < PAGE_SIZE) break;
  }

  return { results, totalScanned, filtered };
}

// ── MBZUAI WordPress API ───────────────────────────────────────────

export async function scanWordPressCareers(titleFilter) {
  const results = [];
  let page = 1;
  let totalScanned = 0;
  let filtered = 0;

  while (page <= 5) {
    const res = await fetchWithTimeout(
      `https://careers.mbzuai.ac.ae/wp-json/wp/v2/career?per_page=100&page=${page}`
    );
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) break;

    for (const post of json) {
      totalScanned++;
      const title = (post.title?.rendered || '').replace(/&#8211;/g, '–').replace(/&amp;/g, '&');
      const url = post.link || '';

      if (!titleFilter(title)) { filtered++; continue; }

      results.push({
        title,
        url,
        company: 'MBZUAI',
        location: 'Abu Dhabi, UAE',
        source: 'wordpress-api',
      });
    }

    if (json.length < 100) break;
    page++;
  }

  return { results, totalScanned, filtered };
}

// ── LinkedIn Guest API ─────────────────────────────────────────────

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#x27;/g, "'");
}

function parseLinkedInCards(html) {
  const jobs = [];
  const cards = html.split('data-entity-urn="urn:li:jobPosting:');

  for (let i = 1; i < cards.length; i++) {
    const card = cards[i];

    const idMatch = card.match(/^(\d+)/);
    const jobId = idMatch?.[1] || '';

    const urlMatch = card.match(/href="(https?:\/\/[^"]*linkedin\.com\/jobs\/view\/[^"?]+)/);
    const titleMatch = card.match(/base-search-card__title"[^>]*>\s*([\s\S]*?)\s*<\/h3>/);
    const companyMatch = card.match(/hidden-nested-link[^>]*>\s*\n?\s*([\s\S]*?)\s*<\/a>/);
    const locationMatch = card.match(/job-search-card__location"[^>]*>\s*([\s\S]*?)\s*<\/span>/);

    const title = decodeHtmlEntities(titleMatch?.[1]?.trim() || '');
    const company = decodeHtmlEntities(companyMatch?.[1]?.trim() || '').split('|')[0].trim();
    const url = urlMatch?.[1]?.trim() || (jobId ? `https://www.linkedin.com/jobs/view/${jobId}` : '');

    if (title && url) {
      jobs.push({
        title,
        url: url.split('?')[0],
        company,
        location: decodeHtmlEntities(locationMatch?.[1]?.trim() || ''),
        source: 'linkedin-guest',
      });
    }
  }

  return jobs;
}

const LINKEDIN_QUERIES = [
  'AI Engineer',
  'Machine Learning Engineer',
  'Generative AI',
  'LLM Engineer',
  'Agentic AI',
  'MLOps Engineer',
  'Applied AI',
];
const LINKEDIN_DELAY_MS = 2500;
const LINKEDIN_MAX_PAGES = 4;

export async function scanLinkedInGuest(titleFilter) {
  const results = [];
  const seenUrls = new Set();
  let queryCount = 0;
  let totalScanned = 0;
  let filtered = 0;

  for (const query of LINKEDIN_QUERIES) {
    queryCount++;
    let queryNew = 0;

    for (let page = 0; page < LINKEDIN_MAX_PAGES; page++) {
      const start = page * 25;
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(query)}&location=United%20Arab%20Emirates&start=${start}`;

      try {
        const res = await fetchWithTimeout(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' },
        });
        const html = await res.text();
        if (!html || html.length < 200) break;

        const jobs = parseLinkedInCards(html);
        if (jobs.length === 0) break;

        for (const job of jobs) {
          totalScanned++;
          if (seenUrls.has(job.url)) continue;
          seenUrls.add(job.url);
          if (!titleFilter(job.title)) { filtered++; continue; }
          results.push(job);
          queryNew++;
        }

        await new Promise(r => setTimeout(r, LINKEDIN_DELAY_MS));
      } catch {
        break;
      }
    }

    process.stdout.write(`  [${queryCount}/${LINKEDIN_QUERIES.length}] "${query}" → ${queryNew} new (${results.length} total)\n`);
    await new Promise(r => setTimeout(r, LINKEDIN_DELAY_MS));
  }

  return { results, totalScanned, filtered };
}
