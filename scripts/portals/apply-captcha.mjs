import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROFILE = {
  firstName: 'Amarsh',
  lastName: 'Pedapati',
  email: 'amarsh.pedapati@gmail.com',
  phone: '9959822444',
  headline: 'AI Engineer | LLM Agents, RAG, Evaluation Systems | IIT Hyderabad',
  address: 'Hyderabad, India',
  nationality: 'Indian',
  noticePeriod: '30 days',
  linkedin: 'https://www.linkedin.com/in/amarshp/',
  github: 'https://github.com/amarshp',
  currentCompany: 'OpenText',
};

const RESUMES = {
  alpheya: path.join(__dirname, 'output', '019-alpheya-principal-ai-engineer-2026-05-05.pdf'),
  blackstone: path.join(__dirname, 'output', '022-blackstone-eit-applied-ai-engineer-2026-05-05.pdf'),
  mistral: path.join(__dirname, 'output', '028-mistral-ai-tech-lead-fde-2026-05-12.pdf'),
};

async function fillWorkable(page, resumePath) {
  await page.waitForTimeout(3000);

  const firstName = page.locator('input[autocomplete="given-name"]').first();
  if (await firstName.count() > 0 && !(await firstName.inputValue())) {
    await firstName.fill(PROFILE.firstName);
    await page.locator('input[autocomplete="family-name"]').first().fill(PROFILE.lastName);
    await page.locator('input[type="email"]').first().fill(PROFILE.email);
  }

  const headline = page.locator('input[name="headline"]').first();
  if (await headline.count() > 0 && !(await headline.inputValue())) {
    await headline.fill(PROFILE.headline);
  }

  const nationality = page.locator('input[name="nationality"]').first();
  if (await nationality.count() > 0 && !(await nationality.inputValue())) {
    await nationality.fill(PROFILE.nationality);
  }

  const noticePeriod = page.locator('input[name="notice_period"]').first();
  if (await noticePeriod.count() > 0 && !(await noticePeriod.inputValue())) {
    await noticePeriod.fill(PROFILE.noticePeriod);
  }

  const resumeInput = page.locator('input[type="file"][accept*="pdf"]').first();
  if (await resumeInput.count() > 0) {
    const fileName = path.basename(resumePath, '.pdf');
    const resumeUploaded = await page.locator(`text=${fileName}`).count();
    if (!resumeUploaded) {
      await resumeInput.setInputFiles(resumePath);
    }
  }

  const yesButtons = page.locator('label:has-text("YES"), [data-ui="radio"]:has-text("YES")');
  const count = await yesButtons.count();
  for (let i = 0; i < count; i++) {
    await yesButtons.nth(i).click();
  }

  console.log('  Workable form filled. Solve the CAPTCHA and click Submit.');
}

async function fillLever(page, resumePath) {
  await page.waitForTimeout(3000);

  const nameInput = page.locator('input[name="name"]');
  if (await nameInput.count() > 0 && !(await nameInput.inputValue())) {
    await nameInput.fill('Amarsh Pedapati');
  }

  const emailInput = page.locator('input[name="email"]');
  if (await emailInput.count() > 0 && !(await emailInput.inputValue())) {
    await emailInput.fill(PROFILE.email);
  }

  const phoneInput = page.locator('input[name="phone"]');
  if (await phoneInput.count() > 0 && !(await phoneInput.inputValue())) {
    await phoneInput.fill('+91' + PROFILE.phone);
  }

  const linkedinInput = page.locator('input[name="urls[LinkedIn]"]');
  if (await linkedinInput.count() > 0 && !(await linkedinInput.inputValue())) {
    await linkedinInput.fill(PROFILE.linkedin);
  }

  const githubInput = page.locator('input[name="urls[GitHub]"]');
  if (await githubInput.count() > 0 && !(await githubInput.inputValue())) {
    await githubInput.fill(PROFILE.github);
  }

  const companyInput = page.locator('input[name="org"]');
  if (await companyInput.count() > 0 && !(await companyInput.inputValue())) {
    await companyInput.fill(PROFILE.currentCompany);
  }

  const resumeInput = page.locator('input[type="file"]').first();
  if (await resumeInput.count() > 0) {
    await resumeInput.setInputFiles(resumePath).catch(() => {});
  }

  console.log('  Lever form filled. Solve the hCAPTCHA and click Submit.');
}

async function main() {
  console.log('Launching HEADED browser (you can see and interact with it)...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({ viewport: null });

  const apps = [
    { name: 'Alpheya', url: 'https://apply.workable.com/alpheya/j/06D17B8D3D/apply/', fill: fillWorkable, resume: RESUMES.alpheya },
    { name: 'BlackStone eIT', url: 'https://apply.workable.com/blackstone-eit/j/F46A499E38/apply/', fill: fillWorkable, resume: RESUMES.blackstone },
    { name: 'Mistral AI', url: 'https://jobs.lever.co/mistral/cb2986cc-4768-40b9-9d67-e53d78b247dc/apply', fill: fillLever, resume: RESUMES.mistral },
  ];

  for (const app of apps) {
    console.log(`Opening ${app.name} (resume: ${path.basename(app.resume)})...`);
    const page = await context.newPage();
    try {
      await page.goto(app.url, { timeout: 30000, waitUntil: 'domcontentloaded' });
      await app.fill(page, app.resume);
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }

  console.log('\nAll 3 tabs open and filled.');
  console.log('Solve the CAPTCHAs in each tab and click Submit.');
  console.log('Close the browser when done.\n');

  await new Promise(resolve => browser.on('disconnected', resolve));
  console.log('Browser closed. Done.');
}

main().catch(console.error);
