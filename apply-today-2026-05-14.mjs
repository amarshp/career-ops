import { chromium } from 'playwright';
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolveAnswer) => rl.question(q, resolveAnswer));

const STATUS_PATH = 'data/apply-today-2026-05-14-status.tsv';
const PROFILE_DIR = resolve('.playwright-apply-today-profile');
const AUTO_SUBMIT = process.argv.includes('--auto-submit');
const LINKEDIN_EMAIL = process.env.LINKEDIN_EMAIL || '';
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD || '';

const profile = {
  firstName: 'Amarsh',
  lastName: 'Pedapati',
  fullName: 'Amarsh Pedapati',
  email: 'amarsh.pedapati@gmail.com',
  phone: '+919959822444',
  phoneRaw: '9959822444',
  linkedin: 'https://www.linkedin.com/in/amarshp/',
  github: 'https://github.com/amarshp',
  location: 'Hyderabad, India',
};

const jobs = [
  {
    id: '108',
    company: 'emaratech',
    role: 'Artificial Intelligence Developer',
    url: 'https://ae.linkedin.com/jobs/view/artificial-intelligence-developer-at-emaratech-4413928845',
    pdf: 'output/108-emaratech-ai-developer-2026-05-14.pdf',
    notes: 'Strong UAE digital-services fit. Use AI Cockpit + MCP + LangGraph proof points.',
  },
  {
    id: '109',
    company: 'Bramwith Consulting',
    role: 'Senior AI Engineer - FinTech Software House - Dubai Based',
    url: 'https://ae.linkedin.com/jobs/view/senior-ai-engineer-%E2%80%93-fintech-software-house-%E2%80%93-dubai-based-at-bramwith-consulting-4410177344',
    pdf: 'output/109-bramwith-senior-ai-engineer-2026-05-14.pdf',
    notes: 'High-priority fintech AI role. Lead with Visa RAG + production GenAI reliability.',
  },
  {
    id: '110',
    company: 'Dicetek LLC',
    role: 'AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/ai-engineer-at-dicetek-llc-4414512295',
    pdf: 'output/110-dicetek-ai-engineer-2026-05-14.pdf',
    notes: 'Enterprise AI role. Position around practical LLM/RAG delivery and FastAPI systems.',
  },
  {
    id: '111',
    company: 'Flatgigs',
    role: 'Full Stack AI Engineer',
    url: 'https://ae.linkedin.com/jobs/view/full-stack-ai-engineer-at-flatgigs-4413924547',
    pdf: 'output/111-flatgigs-full-stack-ai-engineer-2026-05-14.pdf',
    notes: 'Good AI product build role. Emphasize backend APIs, RAG, and agentic app shipping.',
  },
  {
    id: '112',
    company: 'oryxsearch.io',
    role: 'MLOps / ML Platform Engineer (LLM & Streaming Infra)',
    url: 'https://ae.linkedin.com/jobs/view/mlops-ml-platform-engineer-llm-streaming-infra-at-oryxsearch-io-4410364916',
    pdf: 'output/112-oryxsearch-mlops-ml-platform-engineer-2026-05-14.pdf',
    notes: 'Strong LLMOps/platform fit. Lead with observability, CI/CD migration agent, and evals.',
  },
  {
    id: '113',
    company: 'Reap',
    role: 'Senior Software Engineer, AI Agents',
    url: 'https://ae.linkedin.com/jobs/view/senior-software-engineer-ai-agents-at-reap-4401137914',
    pdf: 'output/113-reap-senior-software-engineer-ai-agents-2026-05-14.pdf',
    notes: 'High-priority agent role. Lead with LangGraph, MCP, tool-using agents, and HITL controls.',
  },
  {
    id: '114',
    company: 'CNTXT AI',
    role: 'Lead Machine Learning Engineer',
    url: 'https://ae.linkedin.com/jobs/view/lead-machine-learning-engineer-at-cntxt-ai-4414115929',
    pdf: 'output/114-cntxt-ai-lead-machine-learning-engineer-2026-05-14.pdf',
    notes: 'High-scope Abu Dhabi AI role. Emphasize production GenAI + mentoring + G42/UAE fit.',
  },
  {
    id: '115',
    company: 'Faze 3 Consulting',
    role: 'AI/ML/DevOps Engineer',
    url: 'https://faze3consulting.com/careers/AI_ML_DevOps_Engineer',
    pdf: 'output/115-faze3-ai-ml-devops-engineer-2026-05-14.pdf',
    notes: 'Direct role; AED 25K-33K is borderline but stack is excellent: LLMOps, RAG, agentic, DevOps.',
  },
];

function ensureStatusFile() {
  if (!existsSync(STATUS_PATH)) {
    writeFileSync(STATUS_PATH, 'id\tcompany\trole\turl\tpdf\tstatus\ttimestamp\tnotes\n', 'utf8');
  }
}

function record(job, status, notes = '-') {
  const timestamp = new Date().toISOString();
  const row = [job.id, job.company, job.role, job.url, job.pdf, status, timestamp, notes]
    .map((value) => String(value).replace(/\t/g, ' ').replace(/\r?\n/g, ' '))
    .join('\t');
  appendFileSync(STATUS_PATH, `${row}\n`, 'utf8');
}

async function maybeUploadResume(page, job) {
  if (AUTO_SUBMIT) {
    const uploaded = await uploadResume(page, job);
    if (!uploaded) console.log('  No file input found for auto-upload.');
    return;
  }

  const answer = (await ask('  Type "upload" to attach the tailored PDF if a file picker is visible; otherwise press ENTER: ')).trim().toLowerCase();
  if (answer !== 'upload') return;

  await uploadResume(page, job);
}

async function uploadResume(page, job) {
  const input = page.locator('input[type="file"]');
  const count = await input.count();
  if (count === 0) {
    return false;
  }

  await input.first().setInputFiles(resolve(job.pdf));
  console.log(`  Attached ${resolve(job.pdf)}`);
  return true;
}

async function getVisibleButton(page, labels) {
  const buttons = page.locator('button, a[role="button"], input[type="submit"], input[type="button"]');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    if (!(await button.isVisible().catch(() => false))) continue;
    if (!(await button.isEnabled().catch(() => false))) continue;

    const text = [
      await button.innerText().catch(() => ''),
      await button.getAttribute('value').catch(() => ''),
      await button.getAttribute('aria-label').catch(() => ''),
      await button.getAttribute('title').catch(() => ''),
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

    if (labels.some((label) => text.toLowerCase().includes(label.toLowerCase()))) {
      return button;
    }
  }

  return null;
}

async function clickVisibleButton(page, labels) {
  const button = await getVisibleButton(page, labels);
  if (!button) return false;
  await button.click();
  await page.waitForTimeout(1200);
  return true;
}

async function fillIfPresent(page, selectors, value) {
  for (const selector of selectors) {
    const fields = page.locator(selector);
    const count = await fields.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const field = fields.nth(i);
      if (!(await field.isVisible().catch(() => false))) continue;
      if (!(await field.isEnabled().catch(() => false))) continue;
      const current = await field.inputValue().catch(() => '');
      if (current.trim()) continue;
      await field.fill(value).catch(() => {});
    }
  }
}

async function fillFirstVisible(page, selector, value) {
  const fields = page.locator(selector);
  await fields.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const count = await fields.count().catch(() => 0);
  for (let i = 0; i < count; i++) {
    const field = fields.nth(i);
    if (!(await field.isVisible().catch(() => false))) continue;
    if (!(await field.isEnabled().catch(() => false))) continue;
    await field.fill(value);
    return field;
  }
  return null;
}

async function fillCommonFields(page) {
  await fillIfPresent(page, [
    'input[name*="first" i]',
    'input[id*="first" i]',
    'input[aria-label*="First" i]',
  ], profile.firstName);

  await fillIfPresent(page, [
    'input[name*="last" i]',
    'input[id*="last" i]',
    'input[aria-label*="Last" i]',
  ], profile.lastName);

  await fillIfPresent(page, [
    'input[name*="name" i]',
    'input[id*="name" i]',
    'input[aria-label*="Name" i]',
  ], profile.fullName);

  await fillIfPresent(page, [
    'input[type="email"]',
    'input[name*="email" i]',
    'input[id*="email" i]',
    'input[aria-label*="Email" i]',
  ], profile.email);

  await fillIfPresent(page, [
    'input[type="tel"]',
    'input[name*="phone" i]',
    'input[id*="phone" i]',
    'input[aria-label*="Phone" i]',
    'input[aria-label*="Mobile" i]',
  ], profile.phoneRaw);

  await fillIfPresent(page, [
    'input[name*="linkedin" i]',
    'input[id*="linkedin" i]',
    'input[aria-label*="LinkedIn" i]',
  ], profile.linkedin);

  await fillIfPresent(page, [
    'input[name*="github" i]',
    'input[id*="github" i]',
    'input[aria-label*="GitHub" i]',
    'input[name*="website" i]',
    'input[id*="website" i]',
    'input[aria-label*="Website" i]',
  ], profile.github);
}

async function hasSuccessSignal(page) {
  const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  return /application (was )?sent|application submitted|successfully submitted|thank you for applying|your application has been received/i.test(text);
}

async function hasManualBlocker(page) {
  const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  if (/captcha|hcaptcha|turnstile|verify you are human|verification code|one-time|otp|security check/i.test(text)) {
    return 'CAPTCHA/OTP/security verification present';
  }
  if (/additional questions|screening questions/i.test(text) && !/submit application/i.test(text)) {
    return 'screening questions require review';
  }
  return null;
}

async function waitForLinkedInVerification(page, timeoutMs = 10 * 60 * 1000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    const stillBlocked = /checkpoint|challenge|captcha|security verification|verification code|pin|login/i.test(currentUrl + ' ' + bodyText);
    const loggedInSignal = /feed|jobs|messaging|notifications|me\b|profile/i.test(currentUrl + ' ' + bodyText);
    if (!stillBlocked && loggedInSignal) return true;
  }
  return false;
}

async function submitLinkedInEasyApply(page, job) {
  for (let step = 0; step < 8; step++) {
    await fillCommonFields(page);
    await uploadResume(page, job);

    const blocker = await hasManualBlocker(page);
    if (blocker) return { status: 'blocked', notes: blocker };

    if (await hasSuccessSignal(page)) return { status: 'submitted', notes: 'LinkedIn success signal' };

    if (await clickVisibleButton(page, ['Submit application'])) {
      await page.waitForTimeout(2000);
      if (await hasSuccessSignal(page)) return { status: 'submitted', notes: 'LinkedIn Easy Apply submitted' };
      return { status: 'blocked', notes: 'clicked submit but no success signal; review browser' };
    }

    if (await clickVisibleButton(page, ['Review'])) continue;
    if (await clickVisibleButton(page, ['Next'])) continue;
    if (await clickVisibleButton(page, ['Continue'])) continue;

    return { status: 'blocked', notes: 'no supported LinkedIn Easy Apply next/review/submit button' };
  }

  return { status: 'blocked', notes: 'too many LinkedIn Easy Apply steps' };
}

async function submitGenericPage(page, job) {
  await fillCommonFields(page);
  await uploadResume(page, job);

  const blocker = await hasManualBlocker(page);
  if (blocker) return { status: 'blocked', notes: blocker };

  const submit = await getVisibleButton(page, ['Submit application', 'Submit', 'Apply now', 'Send application']);
  if (!submit) return { status: 'blocked', notes: 'external/direct form not recognized' };

  await submit.click();
  await page.waitForTimeout(2500);
  if (await hasSuccessSignal(page)) return { status: 'submitted', notes: 'direct form success signal' };
  return { status: 'blocked', notes: 'submitted direct form but no success signal; review browser' };
}

async function autoApply(page, job) {
  if (job.url.includes('linkedin.com/jobs/')) {
    const easyApply = await getVisibleButton(page, ['Easy Apply']);
    if (easyApply) {
      await easyApply.click();
      await page.waitForTimeout(1500);
      return submitLinkedInEasyApply(page, job);
    }

    const apply = await getVisibleButton(page, ['Apply']);
    if (apply) {
      await apply.click();
      await page.waitForTimeout(3000);
      if (page.url().includes('linkedin.com')) {
        return { status: 'blocked', notes: 'LinkedIn apply did not open Easy Apply; likely external redirect or login issue' };
      }
      return submitGenericPage(page, job);
    }

    return { status: 'blocked', notes: 'no LinkedIn Apply/Easy Apply button found; login may be missing' };
  }

  return submitGenericPage(page, job);
}

async function loginLinkedIn(page) {
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 });

  if (!LINKEDIN_EMAIL || !LINKEDIN_PASSWORD) {
    console.log('Log into LinkedIn in the browser if needed. This script cannot know your password or OTP.');
    await ask('Press ENTER here when ready to start the application queue... ');
    return;
  }

  await fillFirstVisible(page, 'input[name="session_key"], input#username', LINKEDIN_EMAIL);
  const passwordField = await fillFirstVisible(page, 'input[name="session_password"], input#password', LINKEDIN_PASSWORD);

  const signInButton = await getVisibleButton(page, ['Sign in', 'Sign In']);
  if (signInButton) {
    await signInButton.click();
    await page.waitForTimeout(5000);
  } else if (passwordField) {
    await passwordField.press('Enter');
    await page.waitForTimeout(5000);
  }

  const currentUrl = page.url();
  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  if (/checkpoint|challenge|captcha|security verification|verification code|pin/i.test(currentUrl + ' ' + bodyText)) {
    console.log('LinkedIn needs manual security verification. Complete it in the browser.');
    const ok = await waitForLinkedInVerification(page);
    if (!ok) throw new Error('Timed out waiting for LinkedIn security verification');
  }

  if (page.url().includes('/login')) {
    console.log('LinkedIn still appears to be on the login page. Complete login in the browser.');
    const ok = await waitForLinkedInVerification(page);
    if (!ok) throw new Error('Timed out waiting for LinkedIn login');
  }
}

async function main() {
  ensureStatusFile();

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: null,
    args: ['--start-maximized'],
  });
  const page = context.pages()[0] || await context.newPage();

  console.log('\nApplication batch: 2026-05-14');
  console.log(AUTO_SUBMIT
    ? 'AUTO-SUBMIT enabled for the authorized 2026-05-14 batch. The script stops on CAPTCHA/OTP/unknown screeners.'
    : 'This script will not click final Submit/Apply. You review and submit manually.');
  console.log(`Status log: ${resolve(STATUS_PATH)}\n`);

  await loginLinkedIn(page);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`\n[${i + 1}/${jobs.length}] #${job.id} ${job.company} - ${job.role}`);
    console.log(`  URL: ${job.url}`);
    console.log(`  PDF: ${resolve(job.pdf)}`);
    console.log(`  Notes: ${job.notes}`);

    await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((err) => {
      console.log(`  Navigation warning: ${err.message.split('\n')[0]}`);
    });

    if (AUTO_SUBMIT) {
      const result = await autoApply(page, job);
      console.log(`  Result: ${result.status} (${result.notes})`);
      record(job, result.status, result.notes);
      continue;
    }

    await maybeUploadResume(page, job);
    console.log('  Review the page/form. Submit manually only if everything looks correct.');
    const action = (await ask('  Type "submitted", "skip", "blocked", or "quit": ')).trim().toLowerCase();

    if (action === 'quit') {
      record(job, 'quit', 'stopped here');
      break;
    }

    if (['submitted', 'skip', 'blocked'].includes(action)) {
      const note = await ask('  Optional note for tracker/status log: ');
      record(job, action, note || '-');
    } else {
      record(job, 'unknown', `unrecognized action: ${action || 'blank'}`);
    }
  }

  console.log('\nDone. Review the status TSV before updating applications.md.');
  await context.close();
  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
