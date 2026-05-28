import { chromium } from 'playwright';
import { resolve } from 'path';

const URL = 'https://job-boards.eu.greenhouse.io/ai71/jobs/4828803101';
const PDF_PATH = resolve('output/001-ai71-senior-machine-learning-engineer-2026-05-04.pdf');

const fields = {
  firstName: 'Amarsh',
  lastName: 'Pedapati',
  email: 'pedapatiamarsh@gmail.com',
  phone: '9959822444',
  linkedin: 'https://www.linkedin.com/in/amarshp/',
  website: 'https://github.com/amarshp',
  countryOfBirth: 'India',
  citizenship: 'India (single citizenship)',
  languages: 'English - full professional proficiency, Telugu - native, Hindi - professional working proficiency',
  noticePeriod: '30 days',
  currentSalary: 'AED 14,000/month',
  expectedSalary: 'AED 35,000 - 40,000/month',
};

async function selectComboOption(page, comboName, searchText, optionText) {
  const combo = page.getByRole('combobox', { name: comboName });
  await combo.click();
  await combo.pressSequentially(searchText, { delay: 50 });
  await page.waitForTimeout(300);
  const option = page.getByRole('option', { name: optionText, exact: true });
  await option.click();
}

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });
  console.log('Page loaded. Filling form...');

  // Text fields
  await page.getByRole('textbox', { name: 'First Name', exact: true }).fill(fields.firstName);
  await page.getByRole('textbox', { name: 'Last Name' }).fill(fields.lastName);
  await page.getByRole('textbox', { name: 'Email' }).fill(fields.email);
  await page.getByRole('textbox', { name: 'Phone' }).fill(fields.phone);
  await page.getByRole('textbox', { name: 'LinkedIn Profile' }).fill(fields.linkedin);
  await page.getByRole('textbox', { name: 'Website' }).fill(fields.website);
  await page.getByRole('textbox', { name: 'What is your country of birth?' }).fill(fields.countryOfBirth);
  await page.getByRole('textbox', { name: 'Do you hold dual citizenship' }).fill(fields.citizenship);
  await page.getByRole('textbox', { name: 'Please list all languages' }).fill(fields.languages);
  await page.getByRole('textbox', { name: 'What is your notice period?' }).fill(fields.noticePeriod);
  await page.getByRole('textbox', { name: 'Current Salary (AED)' }).fill(fields.currentSalary);
  await page.getByRole('textbox', { name: 'Expected Salary (AED)' }).fill(fields.expectedSalary);
  console.log('Text fields filled.');

  // Phone country
  await selectComboOption(page, 'Country', 'India', 'India +91');
  console.log('Phone country set.');

  // Education
  await selectComboOption(page, 'School', 'Other', 'Other');
  await selectComboOption(page, 'Degree', 'Bachelor', "Bachelor's Degree");
  await selectComboOption(page, 'Discipline', 'Computer Science', 'Computer Science');
  await selectComboOption(page, 'Start date month', 'July', 'July');
  await page.getByRole('spinbutton', { name: 'Start date year' }).fill('2019');
  await selectComboOption(page, 'End date month', 'May', 'May');
  await page.getByRole('spinbutton', { name: 'End date year' }).fill('2023');
  console.log('Education filled.');

  // Custom dropdowns
  await selectComboOption(page, 'Are you currently located in', 'Yes', 'Yes');
  await selectComboOption(page, 'Do you require a work visa or', 'Yes', 'Yes');
  await selectComboOption(page, 'What gender do you identify', 'Male', 'Male');
  console.log('Dropdowns filled.');

  // Upload resume
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(PDF_PATH);
  console.log('Resume uploaded.');

  // Scroll to submit
  await page.getByRole('button', { name: 'Submit application' }).scrollIntoViewIfNeeded();
  console.log('\n=== FORM READY ===');
  console.log('Review the form in the browser window and click Submit when ready.');
  console.log('The browser will stay open until you close it or press Ctrl+C here.');

  // Keep alive until user closes
  await page.waitForEvent('close', { timeout: 0 }).catch(() => {});
  await browser.close();
})();
