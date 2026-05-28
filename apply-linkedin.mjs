import { chromium } from 'playwright';
import { resolve } from 'path';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const jobs = [
  { id: '034', company: 'Stellar Technologies', role: 'ML Engineer GenAI', score: '4.25',
    url: 'https://ae.linkedin.com/jobs/view/machine-learning-engineer-generative-ai-llms-rag-agentic-ai-at-stellar-technologies-4332333199',
    pdf: 'output/034-stellar-technologies-ml-engineer-genai-2026-05-12.pdf' },
  { id: '044', company: 'DataCamp', role: 'Principal AI Engineer - AI Tutor', score: '4.20',
    url: 'https://ae.linkedin.com/jobs/view/principal-ai-engineer-ai-tutor-at-datacamp-4410996118',
    pdf: 'output/044-datacamp-principal-ai-engineer-tutor-2026-05-12.pdf' },
  { id: '032', company: 'Deriv', role: 'Staff Applied AI Engineer', score: '4.15',
    url: 'https://ae.linkedin.com/jobs/view/staff-applied-ai-engineer-at-deriv-4394730234',
    pdf: 'output/032-deriv-staff-applied-ai-2026-05-12.pdf' },
  { id: '048', company: 'Hays', role: 'AI/ML Engineer 6mo Contract', score: '4.10',
    url: 'https://ae.linkedin.com/jobs/view/ai-ml-engineer-6-months-contract-at-hays-4407732620',
    pdf: 'output/048-hays-aiml-engineer-6mo-contract-2026-05-12.pdf' },
  { id: '037', company: 'TAT IT', role: 'Senior Agentic AI Engineer', score: '4.05',
    url: 'https://ae.linkedin.com/jobs/view/senior-ai-engineer-agentic-ai-engineer-at-tat-it-technolgies-4392500667',
    pdf: 'output/037-tat-it-senior-agentic-ai-2026-05-12.pdf' },
  { id: '046', company: 'Salt', role: 'Senior AI Engineer', score: '3.85',
    url: 'https://ae.linkedin.com/jobs/view/senior-ai-engineer-at-salt-4406450480',
    pdf: 'output/046-salt-senior-ai-engineer-2026-05-12.pdf' },
  { id: '049', company: 'Brain Co.', role: 'AI/ML Engineer Deployed', score: '3.80',
    url: 'https://ae.linkedin.com/jobs/view/ai-ml-engineer-deployed-at-brain-co-4275229612',
    pdf: 'output/049-brain-co-aiml-engineer-deployed-2026-05-12.pdf' },
  { id: '047', company: 'Dynamic Search', role: 'Head of AI', score: '3.65',
    url: 'https://ae.linkedin.com/jobs/view/head-of-artificial-intelligence-%233563191-at-dynamic-search-solutions-4412543857',
    pdf: 'output/047-dynamic-search-head-of-ai-2026-05-12.pdf' },
];

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  // Step 1: LinkedIn login
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });
  console.log('\n🔐 Please log into LinkedIn in the browser window.');
  await ask('Press ENTER here once you are logged in... ');

  // Step 2: Process each job
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const pdfPath = resolve(job.pdf);
    console.log(`\n[${i + 1}/${jobs.length}] #${job.id} ${job.company} — ${job.role} (${job.score}/5)`);
    console.log(`  PDF: ${pdfPath}`);

    await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    console.log(`  Page loaded. Click Apply, upload resume from path above, and fill the form.`);
    const action = await ask('  Press ENTER when done (or type "skip" to skip, "quit" to stop): ');

    if (action.trim().toLowerCase() === 'quit') {
      console.log('\nStopping. Remaining jobs not processed.');
      break;
    }
  }

  console.log('\n✅ LinkedIn apply session complete.');
  await browser.close();
  rl.close();
})();
