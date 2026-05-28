// Manual-assist LinkedIn Easy Apply queue for 2026-05-16.
// User logs in once, then steps through 12 high-fit roles.
// Script just navigates + logs; user clicks Easy Apply + Submit per job.

import { chromium } from 'playwright';
import { resolve } from 'path';
import { appendFile } from 'fs/promises';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

// 12 LinkedIn Easy Apply candidates from the 127-155 New pool.
// Ordered by best-fit (Principal/Sr AI Engineer titles first).
const jobs = [
  { id: '135', company: 'Charterhouse Middle East', role: 'Principal AI/ML Engineer',
    url: 'https://ae.linkedin.com/jobs/view/principal-ai-ml-engineer-at-charterhouse-middle-east-4389483526' },
  { id: '136', company: 'Professional.me', role: 'Principal AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/principal-ai-engineer-at-professional-me-4412751695' },
  { id: '129', company: 'Fuse Energy', role: 'Applied AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/applied-ai-engineer-at-fuse-energy-4401743078' },
  { id: '131', company: 'Saal.ai', role: 'Senior Machine Learning Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-machine-learning-engineer-at-saal-ai-4409690894' },
  { id: '146', company: 'Hays', role: 'Senior AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-ai-engineer-at-hays-4413035405' },
  { id: '151', company: 'Hays', role: 'Senior Machine Learning Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-machine-learning-engineer-at-hays-4401901880' },
  { id: '140', company: 'Primis', role: 'Artificial Intelligence Engineer',
    url: 'https://ae.linkedin.com/jobs/view/artificial-intelligence-engineer-at-primis-4409906589' },
  { id: '153', company: 'synvert', role: 'Lead AI/ML Engineer',
    url: 'https://ae.linkedin.com/jobs/view/lead-ai-ml-engineer-m-f-d-at-synvert-4412676104' },
  { id: '154', company: 'ClearPeaks', role: 'Lead AI/ML Engineer',
    url: 'https://ae.linkedin.com/jobs/view/lead-ai-ml-engineer-m-f-d-at-clearpeaks-4412743409' },
  { id: '138', company: 'SoftServe', role: 'Senior MLOps Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-mlops-engineer-at-softserve-4409416043' },
  { id: '139', company: 'Epergne Solutions', role: 'AI / GenAI & Lakehouse Applications Engineer',
    url: 'https://ae.linkedin.com/jobs/view/ai-genai-lakehouse-applications-engineer-at-epergne-solutions-4375816104' },
  { id: '137', company: 'SoftServe', role: 'Data Scientist (GenAI)',
    url: 'https://ae.linkedin.com/jobs/view/data-scientist-genai-at-softserve-4409410588' },
];

const STATUS_FILE = resolve('apply-today-2026-05-16-status.tsv');

(async () => {
  console.log(`\nLaunching HEADED browser. ${jobs.length} jobs queued.\n`);
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
  console.log('Log into LinkedIn in the browser window if not already.');
  await ask('Press ENTER when you are logged in and ready to start the queue... ');

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`\n[${i + 1}/${jobs.length}] #${job.id} ${job.company} - ${job.role}`);
    console.log(`  URL: ${job.url}`);

    try {
      await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2500);
    } catch (e) {
      console.log(`  Nav error: ${e.message}`);
    }

    console.log('  Click "Easy Apply" -> step through -> Submit. Or skip if not Easy Apply.');
    const action = await ask('  Status when done? [a=Applied / m=Manual / s=Skipped/Closed / q=Quit]: ');
    const code = action.trim().toLowerCase();

    let status = 'Applied';
    if (code === 'm') status = 'Manual';
    else if (code === 's') status = 'Discarded';
    else if (code === 'q') {
      console.log('Stopping queue. Remaining jobs not processed.');
      break;
    }

    const line = `${job.id}\t${job.company}\t${job.role}\t${status}\t${job.url}\n`;
    await appendFile(STATUS_FILE, line);
    console.log(`  -> ${status}, logged to ${STATUS_FILE}`);
  }

  console.log('\nQueue finished. Status log: apply-today-2026-05-16-status.tsv');
  console.log('Close the browser when ready, then tell Claude "linkedin batch done".');
  await new Promise(resolve => browser.on('disconnected', resolve));
  rl.close();
})();
