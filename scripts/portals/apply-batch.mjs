import { chromium } from 'playwright';
import { resolve } from 'path';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const profile = {
  firstName: 'Amarsh',
  lastName: 'Pedapati',
  email: 'pedapatiamarsh@gmail.com',
  phone: '+919959822444',
  phoneRaw: '9959822444',
  linkedin: 'https://www.linkedin.com/in/amarshp/',
  github: 'https://github.com/amarshp',
  location: 'Hyderabad, India',
  noticePeriod: '30 days',
  currentSalary: 'AED 14,000/month',
  expectedSalary: 'AED 35,000 - 40,000/month',
};

const jobs = [
  {
    id: '014', company: 'AI71', role: 'Backend Engineer',
    score: '4.05', type: 'greenhouse',
    url: 'https://job-boards.eu.greenhouse.io/ai71/jobs/4828789101',
    pdf: 'output/014-ai71-backend-engineer-2026-05-05.pdf',
  },
  {
    id: '034', company: 'Stellar Technologies', role: 'ML Engineer GenAI',
    score: '4.25', type: 'linkedin',
    url: 'https://ae.linkedin.com/jobs/view/machine-learning-engineer-generative-ai-llms-rag-agentic-ai-at-stellar-technologies-4332333199',
    pdf: 'output/034-stellar-technologies-ml-engineer-genai-2026-05-12.pdf',
  },
  {
    id: '005', company: 'SAP', role: 'Senior MLE',
    score: '4.20', type: 'direct',
    url: 'https://jobs.sap.com/job/Dubai-Senior-Machine-Learning-Engineer-Duba-118353/1381618433/',
    pdf: 'output/005-sap-senior-mle-2026-05-05.pdf',
  },
  {
    id: '044', company: 'DataCamp', role: 'Principal AI Engineer - AI Tutor',
    score: '4.20', type: 'linkedin',
    url: 'https://ae.linkedin.com/jobs/view/principal-ai-engineer-ai-tutor-at-datacamp-4410996118',
    pdf: 'output/044-datacamp-principal-ai-engineer-tutor-2026-05-12.pdf',
  },
  {
    id: '032', company: 'Deriv', role: 'Staff Applied AI Engineer',
    score: '4.15', type: 'linkedin',
    url: 'https://ae.linkedin.com/jobs/view/staff-applied-ai-engineer-at-deriv-4394730234',
    pdf: 'output/032-deriv-staff-applied-ai-2026-05-12.pdf',
  },
  {
    id: '006', company: 'MBZUAI', role: 'Senior MLOps Engineer',
    score: '4.15', type: 'direct',
    url: 'https://careers.mbzuai.ac.ae/careers/senior-mlops-engineer/',
    pdf: 'output/006-mbzuai-senior-mlops-engineer-2026-05-05.pdf',
  },
  {
    id: '048', company: 'Hays', role: 'AI/ML Engineer 6mo Contract',
    score: '4.10', type: 'linkedin',
    url: 'https://ae.linkedin.com/jobs/view/ai-ml-engineer-6-months-contract-at-hays-4407732620',
    pdf: 'output/048-hays-aiml-engineer-6mo-contract-2026-05-12.pdf',
  },
  {
    id: '037', company: 'TAT IT', role: 'Senior Agentic AI Engineer',
    score: '4.05', type: 'linkedin',
    url: 'https://ae.linkedin.com/jobs/view/senior-ai-engineer-agentic-ai-engineer-at-tat-it-technolgies-4392500667',
    pdf: 'output/037-tat-it-senior-agentic-ai-2026-05-12.pdf',
  },
  {
    id: '020', company: 'SAP', role: 'AI Architect',
    score: '4.05', type: 'indeed',
    url: 'https://to.indeed.com/aaktrt4ct2c9',
    pdf: 'output/020-sap-ai-architect-2026-05-05.pdf',
  },
  {
    id: '019', company: 'Alpheya', role: 'Principal AI Engineer',
    score: '4.30', type: 'indeed',
    url: 'https://to.indeed.com/aamjkzkvwrcy',
    pdf: 'output/019-alpheya-principal-ai-engineer-2026-05-05.pdf',
  },
  {
    id: '046', company: 'Salt', role: 'Senior AI Engineer',
    score: '3.85', type: 'linkedin',
    url: 'https://ae.linkedin.com/jobs/view/senior-ai-engineer-at-salt-4406450480',
    pdf: 'output/046-salt-senior-ai-engineer-2026-05-12.pdf',
  },
  {
    id: '049', company: 'Brain Co.', role: 'AI/ML Engineer Deployed',
    score: '3.80', type: 'linkedin',
    url: 'https://ae.linkedin.com/jobs/view/ai-ml-engineer-deployed-at-brain-co-4275229612',
    pdf: 'output/049-brain-co-aiml-engineer-deployed-2026-05-12.pdf',
  },
  {
    id: '047', company: 'Dynamic Search', role: 'Head of AI',
    score: '3.65', type: 'linkedin',
    url: 'https://ae.linkedin.com/jobs/view/head-of-artificial-intelligence-%233563191-at-dynamic-search-solutions-4412543857',
    pdf: 'output/047-dynamic-search-head-of-ai-2026-05-12.pdf',
  },
];

async function selectComboOption(page, comboName, searchText, optionText) {
  try {
    const combo = page.getByRole('combobox', { name: comboName });
    await combo.click();
    await combo.pressSequentially(searchText, { delay: 50 });
    await page.waitForTimeout(400);
    const option = page.getByRole('option', { name: optionText, exact: true });
    await option.click();
  } catch (e) {
    console.log(`  ⚠ Could not fill combo "${comboName}": ${e.message.slice(0, 80)}`);
  }
}

async function fillGreenhouseAI71(page, job) {
  await page.getByRole('textbox', { name: 'First Name', exact: true }).fill(profile.firstName);
  await page.getByRole('textbox', { name: 'Last Name' }).fill(profile.lastName);
  await page.getByRole('textbox', { name: 'Email' }).fill(profile.email);
  await page.getByRole('textbox', { name: 'Phone' }).fill(profile.phoneRaw);
  await page.getByRole('textbox', { name: 'LinkedIn Profile' }).fill(profile.linkedin);
  await page.getByRole('textbox', { name: 'Website' }).fill(profile.github);

  const customFields = [
    ['What is your country of birth?', 'India'],
    ['Do you hold dual citizenship', 'India (single citizenship)'],
    ['Please list all languages', 'English - full professional proficiency, Telugu - native, Hindi - professional working proficiency'],
    ['What is your notice period?', profile.noticePeriod],
    ['Current Salary (AED)', profile.currentSalary],
    ['Expected Salary (AED)', profile.expectedSalary],
  ];
  for (const [name, val] of customFields) {
    try { await page.getByRole('textbox', { name }).fill(val); } catch {}
  }

  await selectComboOption(page, 'Country', 'India', 'India +91');
  await selectComboOption(page, 'School', 'Other', 'Other');
  await selectComboOption(page, 'Degree', 'Bachelor', "Bachelor's Degree");
  await selectComboOption(page, 'Discipline', 'Computer Science', 'Computer Science');
  await selectComboOption(page, 'Start date month', 'July', 'July');
  try { await page.getByRole('spinbutton', { name: 'Start date year' }).fill('2019'); } catch {}
  await selectComboOption(page, 'End date month', 'May', 'May');
  try { await page.getByRole('spinbutton', { name: 'End date year' }).fill('2023'); } catch {}

  await selectComboOption(page, 'Are you currently located in', 'Yes', 'Yes');
  await selectComboOption(page, 'Do you require a work visa or', 'Yes', 'Yes');
  await selectComboOption(page, 'What gender do you identify', 'Male', 'Male');

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(resolve(job.pdf));
  console.log('  ✅ Greenhouse form auto-filled + resume uploaded.');
}

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });

  console.log(`\n🚀 BATCH APPLY — ${jobs.length} jobs\n`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`\n[${ i + 1}/${jobs.length}] #${job.id} ${job.company} — ${job.role} (${job.score}/5)`);
    console.log(`  URL: ${job.url}`);
    console.log(`  PDF: ${job.pdf}`);

    const page = await context.newPage();

    try {
      await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      if (job.type === 'greenhouse') {
        await fillGreenhouseAI71(page, job);
      } else {
        const fileInput = page.locator('input[type="file"]').first();
        const hasFileInput = await fileInput.count();
        if (hasFileInput > 0) {
          await fileInput.setInputFiles(resolve(job.pdf));
          console.log('  📎 Resume uploaded to file input.');
        } else {
          console.log('  📋 No auto-fill available — manual form. Resume path:');
          console.log(`     ${resolve(job.pdf)}`);
        }
      }
    } catch (e) {
      console.log(`  ⚠ Navigation issue: ${e.message.slice(0, 100)}`);
      console.log('  Page opened — please handle manually.');
    }

    const action = await ask('\n  Press ENTER when done with this job (or type "skip" to skip, "quit" to stop): ');
    if (action.trim().toLowerCase() === 'quit') {
      console.log('\nStopping batch. Remaining jobs not processed.');
      break;
    }
    await page.close();
  }

  console.log('\n✅ Batch apply session complete.');
  await browser.close();
  rl.close();
})();
