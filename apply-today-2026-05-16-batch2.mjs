// Batch 2 for 2026-05-16: Indeed-confirmed-accessible roles + fresh LinkedIn from pipeline.md.
// Same flow as batch 1: user logs in once, steps through queue manually.

import { chromium } from 'playwright';
import { resolve } from 'path';
import { appendFile } from 'fs/promises';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

// 4 Indeed (Cloudflare cleared 2026-05-16) + 6 LinkedIn from pipeline that are high-fit
// and not in batch 1.
const jobs = [
  { id: '128', company: 'Boston Consulting Group', role: 'Forward Deployed AI Engineer (BCG X)',
    url: 'https://to.indeed.com/aa2xstfg9bd4', source: 'Indeed' },
  { id: '147', company: 'Marcura', role: 'Generative AI Solutions Engineer',
    url: 'https://to.indeed.com/aacphdvwtdpl', source: 'Indeed' },
  { id: '148', company: 'Kearney', role: 'Data and AI Solution Architect',
    url: 'https://to.indeed.com/aany77tq6p7y', source: 'Indeed' },
  { id: '149', company: 'Xenonstack', role: 'Solution Architect Agentic Systems',
    url: 'https://to.indeed.com/aaq8ylmzdcjk', source: 'Indeed' },
  { id: '145', company: 'Jobgether', role: 'AI Research Engineer Pre-training',
    url: 'https://ae.linkedin.com/jobs/view/ai-research-engineer-pre-training-at-jobgether-4412715888', source: 'LinkedIn' },
  { id: '155', company: 'Nabat', role: 'Senior Data Scientist (Geospatial AI)',
    url: 'https://ae.linkedin.com/jobs/view/senior-data-scientist-geospatial-ai-at-nabat-4401932214', source: 'LinkedIn' },
  { id: '152', company: 'Cleveland Clinic Abu Dhabi', role: 'Data Scientist',
    url: 'https://ae.linkedin.com/jobs/view/data-scientist-at-cleveland-clinic-abu-dhabi-4408171091', source: 'LinkedIn' },
  { id: '150', company: 'LIQUIDITY', role: 'Senior Data Scientist',
    url: 'https://ae.linkedin.com/jobs/view/senior-data-scientist-at-liquidity-4412538986', source: 'LinkedIn' },
  // Fresh from pipeline.md (not yet in tracker, will be auto-added on apply)
  { id: 'P01', company: 'Jimmy Technologies', role: 'Senior Python AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-python-ai-engineer-at-jimmy-technologies-4362255506', source: 'LinkedIn' },
  { id: 'P02', company: 'Safe City Group', role: 'AI Computer Vision Engineer (Senior)',
    url: 'https://ae.linkedin.com/jobs/view/ai-computer-vision-engineer-senior-%E2%80%94-vehicle-recognition-at-safe-city-group-4412921013', source: 'LinkedIn' },
];

const STATUS_FILE = resolve('apply-today-2026-05-16-batch2-status.tsv');

(async () => {
  console.log(`\nLaunching HEADED browser. Batch 2: ${jobs.length} jobs queued.\n`);
  console.log('4 Indeed roles first (just-cleared Cloudflare), then 6 LinkedIn from pipeline.\n');
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
  console.log('Log into LinkedIn (Indeed jobs do not require login but the same browser tab is reused).');
  await ask('Press ENTER when you are logged in and ready to start the queue... ');

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`\n[${i + 1}/${jobs.length}] #${job.id} ${job.company} - ${job.role} [${job.source}]`);
    console.log(`  URL: ${job.url}`);

    try {
      await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log(`  Nav error: ${e.message}`);
    }

    if (job.source === 'Indeed') {
      console.log('  Indeed: click "Apply now" / "Apply on company website" -> external portal -> submit.');
    } else {
      console.log('  LinkedIn: click "Easy Apply" -> step through -> Submit. Or skip if not Easy Apply.');
    }

    const action = await ask('  Status when done? [a=Applied / m=Manual / s=Skipped/Closed / q=Quit]: ');
    const code = action.trim().toLowerCase();

    let status = 'Applied';
    if (code === 'm') status = 'Manual';
    else if (code === 's') status = 'Discarded';
    else if (code === 'q') {
      console.log('Stopping queue. Remaining jobs not processed.');
      break;
    }

    const line = `${job.id}\t${job.company}\t${job.role}\t${status}\t${job.source}\t${job.url}\n`;
    await appendFile(STATUS_FILE, line);
    console.log(`  -> ${status}, logged to ${STATUS_FILE}`);
  }

  console.log('\nQueue finished. Status log: apply-today-2026-05-16-batch2-status.tsv');
  console.log('Close the browser when ready, then tell Claude "batch 2 done".');
  await new Promise(resolve => browser.on('disconnected', resolve));
  rl.close();
})();
