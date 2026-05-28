import { readFileSync } from 'fs';
import yaml from 'js-yaml';

function detectApi(company) {
  if (company.api && company.api.includes('greenhouse')) {
    return { type: 'greenhouse', url: company.api };
  }
  const url = company.careers_url || '';
  const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)/);
  if (ashbyMatch) return { type: 'ashby' };
  const leverMatch = url.match(/jobs\.lever\.co\/([^/?#]+)/);
  if (leverMatch) return { type: 'lever' };
  const ghEuMatch = url.match(/job-boards(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/);
  if (ghEuMatch && !company.api) return { type: 'greenhouse' };
  return null;
}

const config = yaml.load(readFileSync('portals.yml', 'utf-8'));
const companies = config.tracked_companies || [];

const withApi = [];
const withoutApi = [];

for (const company of companies) {
  const detection = detectApi(company);
  if (detection) {
    withApi.push({ name: company.name, type: detection.type });
  } else {
    withoutApi.push(company.name);
  }
}

console.log('COMPANIES WITH SUPPORTED ATS APIs:');
for (const c of withApi) {
  console.log(`  ${c.name} [${c.type.toUpperCase()}]`);
}
console.log('\nCOMPANIES WITHOUT SUPPORTED ATS APIs:');
for (const name of withoutApi) {
  console.log(`  ${name}`);
}
console.log(`\nWith API: ${withApi.length}, Without API: ${withoutApi.length}`);
