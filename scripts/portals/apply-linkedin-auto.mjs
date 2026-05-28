// Aggressive LinkedIn Easy Apply auto-fill for 2026-05-16.
// You log into LinkedIn once. Script then tries to:
//  - Click Easy Apply
//  - If multi-step: clicks Next/Continue, autofills text inputs with defaults, picks Yes radios, then Review -> Submit
//  - If form has unknown questions it cannot fill, it stops on that job for you to finish manually
//  - Logs result per job
//
// Run it: `node apply-linkedin-auto.mjs`

import { chromium } from 'playwright';
import { resolve } from 'path';
import { appendFile } from 'fs/promises';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const jobs = [
  { id: '135', co: 'Charterhouse Middle East', role: 'Principal AI/ML Engineer',
    url: 'https://ae.linkedin.com/jobs/view/principal-ai-ml-engineer-at-charterhouse-middle-east-4389483526' },
  { id: '136', co: 'Professional.me', role: 'Principal AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/principal-ai-engineer-at-professional-me-4412751695' },
  { id: '129', co: 'Fuse Energy', role: 'Applied AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/applied-ai-engineer-at-fuse-energy-4401743078' },
  { id: '131', co: 'Saal.ai', role: 'Senior ML Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-machine-learning-engineer-at-saal-ai-4409690894' },
  { id: '146', co: 'Hays', role: 'Senior AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-ai-engineer-at-hays-4413035405' },
  { id: '151', co: 'Hays', role: 'Senior ML Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-machine-learning-engineer-at-hays-4401901880' },
  { id: '140', co: 'Primis', role: 'AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/artificial-intelligence-engineer-at-primis-4409906589' },
  { id: '153', co: 'synvert', role: 'Lead AI/ML Engineer',
    url: 'https://ae.linkedin.com/jobs/view/lead-ai-ml-engineer-m-f-d-at-synvert-4412676104' },
  { id: '154', co: 'ClearPeaks', role: 'Lead AI/ML Engineer',
    url: 'https://ae.linkedin.com/jobs/view/lead-ai-ml-engineer-m-f-d-at-clearpeaks-4412743409' },
  { id: '138', co: 'SoftServe', role: 'Senior MLOps Engineer',
    url: 'https://ae.linkedin.com/jobs/view/senior-mlops-engineer-at-softserve-4409416043' },
  { id: '139', co: 'Epergne Solutions', role: 'AI/GenAI Lakehouse Engineer',
    url: 'https://ae.linkedin.com/jobs/view/ai-genai-lakehouse-applications-engineer-at-epergne-solutions-4375816104' },
  { id: '137', co: 'SoftServe', role: 'Data Scientist (GenAI)',
    url: 'https://ae.linkedin.com/jobs/view/data-scientist-genai-at-softserve-4409410588' },
];

const STATUS_FILE = resolve('apply-today-2026-05-16-status.tsv');

const ANSWERS = {
  phone: '9959822444',
  phoneCountry: 'India (+91)',
  yearsExpDefault: '3',
  yearsExpLLM: '3',
  yearsExpRAG: '2',
  yearsExpAgentic: '2',
  yearsExpPython: '5',
  yearsExpFastAPI: '2',
  yearsExpPyTorch: '2',
  yearsExpAWS: '2',
  salaryAED: '40000',
  visaStatus: 'Yes',
};

async function tryAutoApply(page, job) {
  // Click Easy Apply
  const easyApply = page.locator('button:has-text("Easy Apply"), a:has-text("Easy Apply")').first();
  if ((await easyApply.count()) === 0) {
    return { status: 'no-easy-apply', note: 'Easy Apply button not found (might be external/Manual)' };
  }
  await easyApply.click();
  await page.waitForTimeout(2500);

  // Loop through up to 6 steps
  for (let step = 0; step < 6; step++) {
    await page.waitForTimeout(1000);
    // Fill any visible required text inputs that are still empty
    const textInputs = await page.$$('input[type="text"]:not([disabled]), input[type="tel"]:not([disabled]), input[type="number"]:not([disabled])');
    for (const inp of textInputs) {
      const val = await inp.inputValue().catch(() => '');
      if (val) continue;
      // Look at adjacent label
      const labelText = await page.evaluate((el) => {
        const id = el.id;
        let label = '';
        if (id) {
          const l = document.querySelector(`label[for="${id}"]`);
          if (l) label = l.textContent || '';
        }
        if (!label) {
          let parent = el.parentElement;
          for (let i = 0; i < 4 && parent; i++) {
            const l = parent.querySelector('label');
            if (l && l !== el) { label = l.textContent || ''; break; }
            parent = parent.parentElement;
          }
        }
        return (label || '').toLowerCase();
      }, inp).catch(() => '');

      let value = '';
      if (labelText.includes('phone')) value = ANSWERS.phone;
      else if (labelText.includes('llm')) value = ANSWERS.yearsExpLLM;
      else if (labelText.includes('rag')) value = ANSWERS.yearsExpRAG;
      else if (labelText.includes('agent')) value = ANSWERS.yearsExpAgentic;
      else if (labelText.includes('python')) value = ANSWERS.yearsExpPython;
      else if (labelText.includes('fastapi')) value = ANSWERS.yearsExpFastAPI;
      else if (labelText.includes('pytorch')) value = ANSWERS.yearsExpPyTorch;
      else if (labelText.includes('aws') || labelText.includes('cloud')) value = ANSWERS.yearsExpAWS;
      else if (labelText.includes('salary') || labelText.includes('compensation') || labelText.includes('expected')) value = ANSWERS.salaryAED;
      else if (labelText.includes('years') || labelText.includes('experience')) value = ANSWERS.yearsExpDefault;
      if (value) {
        await inp.fill(value).catch(() => {});
      }
    }

    // For each radiogroup, pick Yes if available
    const yesRadios = await page.$$('label:has-text("Yes"), [role="radio"]:has-text("Yes"), input[type="radio"][value*="Yes" i]');
    for (const r of yesRadios) {
      await r.click().catch(() => {});
    }

    // Pick a default option for any empty select
    const selects = await page.$$('select');
    for (const s of selects) {
      const val = await s.inputValue().catch(() => '');
      if (val && val !== 'Select an option') continue;
      const options = await s.$$('option');
      // pick the second option (first is usually placeholder)
      if (options.length > 1) {
        const v = await options[1].getAttribute('value');
        if (v) await s.selectOption(v).catch(() => {});
      }
    }

    // Find Submit application -> click and finish
    const submitBtn = page.locator('button[aria-label*="Submit application" i], button:has-text("Submit application")').first();
    if ((await submitBtn.count()) > 0 && (await submitBtn.isEnabled().catch(() => false))) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
      return { status: 'Applied', note: `Submitted at step ${step + 1}` };
    }

    // Next/Review buttons
    const nextBtn = page.locator('button[aria-label*="Continue" i], button[aria-label*="Next" i], button:has-text("Review"), button:has-text("Next"), button:has-text("Continue")').first();
    if ((await nextBtn.count()) > 0 && (await nextBtn.isEnabled().catch(() => false))) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
      continue;
    }
    // No progress possible
    return { status: 'Manual', note: `Stuck at step ${step + 1}: need manual help in browser` };
  }
  return { status: 'Manual', note: 'Hit 6-step ceiling; needs manual review' };
}

(async () => {
  console.log(`\nLaunching HEADED browser. ${jobs.length} LinkedIn jobs queued.\n`);
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
  console.log('Log into LinkedIn in the browser window if not already.');
  await ask('Press ENTER when logged in to start the queue... ');

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`\n[${i + 1}/${jobs.length}] #${job.id} ${job.co} - ${job.role}`);

    try {
      await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log(`  Nav error: ${e.message}`);
      await appendFile(STATUS_FILE, `${job.id}\t${job.co}\t${job.role}\tNavError\t${job.url}\n`);
      continue;
    }

    const result = await tryAutoApply(page, job).catch(e => ({ status: 'Error', note: e.message }));
    console.log(`  -> ${result.status}: ${result.note}`);

    if (result.status === 'Manual' || result.status === 'Error') {
      const action = await ask('  Try manually now? Press ENTER when done, or type s to skip, q to quit: ');
      const code = action.trim().toLowerCase();
      if (code === 'q') {
        await appendFile(STATUS_FILE, `${job.id}\t${job.co}\t${job.role}\t${result.status}\t${job.url}\n`);
        break;
      }
      const finalStatus = code === 's' ? 'Skipped' : 'Applied';
      await appendFile(STATUS_FILE, `${job.id}\t${job.co}\t${job.role}\t${finalStatus}\t${job.url}\n`);
      console.log(`  -> ${finalStatus}, logged`);
    } else {
      await appendFile(STATUS_FILE, `${job.id}\t${job.co}\t${job.role}\t${result.status}\t${job.url}\n`);
    }
  }

  console.log('\nQueue done. Status: apply-today-2026-05-16-status.tsv');
  console.log('Close the browser when ready.');
  await new Promise(resolve => browser.on('disconnected', resolve));
  rl.close();
})().catch(e => { console.error(e); rl.close(); });
