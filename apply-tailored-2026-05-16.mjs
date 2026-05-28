// Tailored-resume apply for non-LinkedIn jobs on 2026-05-16.
// Per-job tailored PDF gets uploaded automatically when the portal exposes a file input.
// Script tries Indeed redirects, follows to company portal, fills basics, attaches the right PDF.
// You review + Submit. Type a / m / s / q per job.

import { chromium } from 'playwright';
import { resolve } from 'path';
import { appendFile } from 'fs/promises';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const PROFILE = {
  firstName: 'Amarsh',
  lastName: 'Pedapati',
  fullName: 'Amarsh Pedapati',
  email: 'amarsh.pedapati@gmail.com',
  phone: '9959822444',
  phoneIntl: '+919959822444',
  location: 'Hyderabad, India (open to UAE)',
  company: 'OpenText',
  linkedin: 'https://www.linkedin.com/in/amarshp/',
  github: 'https://github.com/amarshp',
};

const out = (id, slug, date) => resolve('output', `${id}-${slug}-${date}.pdf`);

const jobs = [
  { id: '128', co: 'BCG X', role: 'Forward Deployed AI Engineer',
    url: 'https://to.indeed.com/aa2xstfg9bd4',
    pdf: out('128', 'bcg-x-forward-deployed-ai-engineer', '2026-05-16'),
    source: 'Indeed' },
  { id: '147', co: 'Marcura', role: 'Generative AI Solutions Engineer',
    url: 'https://to.indeed.com/aacphdvwtdpl',
    pdf: out('147', 'marcura-generative-ai-solutions-engineer', '2026-05-16'),
    source: 'Indeed' },
  { id: '148', co: 'Kearney', role: 'Data and AI Solution Architect',
    url: 'https://to.indeed.com/aany77tq6p7y',
    pdf: out('148', 'kearney-data-ai-solution-architect', '2026-05-16'),
    source: 'Indeed' },
  { id: '149', co: 'Xenonstack', role: 'Solution Architect Agentic Systems',
    url: 'https://to.indeed.com/aaq8ylmzdcjk',
    pdf: out('149', 'xenonstack-solution-architect-agentic-systems', '2026-05-16'),
    source: 'Indeed' },
];

const STATUS_FILE = resolve('apply-tailored-2026-05-16-status.tsv');

async function tryAutoFill(page, pdfPath) {
  // Upload PDF on any visible file input
  const fileInputs = await page.$$('input[type="file"]');
  for (const fi of fileInputs) {
    try {
      await fi.setInputFiles(pdfPath);
      console.log(`  attached: ${pdfPath.split(/[\\/]/).pop()}`);
      break;
    } catch {}
  }

  // Common text field patterns
  const tries = [
    { sel: 'input[name*="first" i], input[autocomplete="given-name"]', val: PROFILE.firstName },
    { sel: 'input[name*="last" i], input[autocomplete="family-name"]', val: PROFILE.lastName },
    { sel: 'input[name="name"], input[name*="full" i][name*="name" i], input[autocomplete="name"]', val: PROFILE.fullName },
    { sel: 'input[type="email"], input[name*="email" i]', val: PROFILE.email },
    { sel: 'input[type="tel"], input[name*="phone" i], input[autocomplete="tel"]', val: PROFILE.phoneIntl },
    { sel: 'input[name*="location" i], input[name*="city" i], input[autocomplete="address-level2"]', val: PROFILE.location },
    { sel: 'input[name*="company" i], input[name="org"]', val: PROFILE.company },
    { sel: 'input[name*="linkedin" i], input[name="urls[LinkedIn]"]', val: PROFILE.linkedin },
    { sel: 'input[name*="github" i], input[name="urls[GitHub]"]', val: PROFILE.github },
  ];
  for (const t of tries) {
    const el = page.locator(t.sel).first();
    if ((await el.count()) > 0) {
      const cur = await el.inputValue().catch(() => '');
      if (!cur) await el.fill(t.val).catch(() => {});
    }
  }
}

async function tryClickApplyLink(page) {
  // After Indeed redirect to viewjob, find the "Apply on company website" / "Apply now" link
  const applyButtonSelectors = [
    'a:has-text("Apply on company website")',
    'a:has-text("Apply now")',
    'button:has-text("Apply on company website")',
    'button:has-text("Apply now")',
    'a[href*="apply" i]',
  ];
  for (const s of applyButtonSelectors) {
    const el = page.locator(s).first();
    if ((await el.count()) > 0) {
      try {
        await el.click({ timeout: 5000 });
        await page.waitForTimeout(4000);
        return true;
      } catch {}
    }
  }
  return false;
}

(async () => {
  console.log(`\nTailored apply, ${jobs.length} jobs queued.\n`);
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null, acceptDownloads: false });
  const page = await context.newPage();

  await ask('Press ENTER to start the queue... ');

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`\n[${i + 1}/${jobs.length}] #${job.id} ${job.co} - ${job.role}`);
    console.log(`  PDF: ${job.pdf.split(/[\\/]/).pop()}`);
    console.log(`  URL: ${job.url}`);

    try {
      await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3500);
    } catch (e) {
      console.log(`  Nav error: ${e.message}`);
    }

    // If we landed on ae.indeed.com viewjob, try to advance to company portal
    const urlNow = page.url();
    if (urlNow.includes('indeed.com')) {
      const advanced = await tryClickApplyLink(page);
      if (advanced) console.log(`  advanced to apply portal: ${page.url()}`);
    }

    await tryAutoFill(page, job.pdf);

    console.log('  Review the browser, fill any extra Qs, click Submit.');
    const action = await ask('  Status? [a=Applied / m=Manual / s=Skipped / q=Quit]: ');
    const code = action.trim().toLowerCase();

    let status = 'Applied';
    if (code === 'm') status = 'Manual';
    else if (code === 's') status = 'Discarded';
    else if (code === 'q') {
      console.log('Stopping queue.');
      break;
    }
    await appendFile(STATUS_FILE, `${job.id}\t${job.co}\t${job.role}\t${status}\t${job.pdf.split(/[\\/]/).pop()}\t${job.url}\n`);
    console.log(`  -> ${status}, logged`);
  }

  console.log('\nQueue done. Status: apply-tailored-2026-05-16-status.tsv');
  console.log('Close the browser when ready.');
  await new Promise(resolve => browser.on('disconnected', resolve));
  rl.close();
})().catch(e => { console.error(e); rl.close(); });
