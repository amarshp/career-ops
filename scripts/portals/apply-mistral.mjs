// Standalone Mistral AI Forward Deployed Engineer apply
// Opens HEADED browser, fills ALL fields including AAIE narratives.
// User reviews, solves hCaptcha, and clicks Submit.

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RESUME = path.join(__dirname, 'output', '028-mistral-ai-tech-lead-fde-2026-05-12.pdf');
const URL = 'https://jobs.lever.co/mistral/cb2986cc-4768-40b9-9d67-e53d78b247dc/apply';

const ANSWERS = {
  fullName: 'Amarsh Pedapati',
  email: 'amarsh.pedapati@gmail.com',
  phone: '+919959822444',
  location: 'Hyderabad, India (open to Abu Dhabi relocation)',
  company: 'OpenText',
  linkedin: 'https://www.linkedin.com/in/amarshp/',
  github: 'https://github.com/amarshp',
  languages: 'English (fluent, professional), Hindi (native), Telugu (native)',
  llmProject: `PersonaRAG and the AI Cockpit at OpenText. Multi-agent persona-based RAG over a 200K+ document enterprise corpus chunked across ChromaDB and Pinecone, with a coordinator-specialist agent hierarchy wired through MCP tool contracts. The hard part was making it trustworthy: I built four evaluation suites driven by LLM-as-Judge (groundedness, faithfulness, persona-fidelity, action correctness) and a regression harness using LangSmith that gates every prompt or model change. Hallucination detection via groundedness scoring with citation backtracking; structured-output validation via Pydantic on every tool response. The system shipped to enterprise customers in beta, taking response cycles from 2 weeks to 2 days, and hit 37/37 on the eval suite at v1. I also built a 12x-faster CI/CD migration agent (770 Jenkins-to-GitLab jobs) with autonomous error remediation and human checkpoints, adopted org-wide. Full stack: Python, LangGraph, LangChain, FastAPI, ChromaDB, LangSmith, Pinecone, Anthropic + OpenAI.`,
  optimizeFor: `Compound learning velocity and shipping working systems that move metrics. I optimize for environments where I can take a problem from messy prototype to production rigorously, then transfer the learning into the next problem. The internal metric is "what did I durably learn this week that compounds into next month's output?" The external metric is "did the system I shipped actually move something for users?"`,
  intensity: `Very intensely. I run a 60-70 hour week comfortably when the problem is interesting, and LLM/agentic infrastructure is interesting all the way down. Sustainability comes from compounding. Every project teaches reusable building blocks, so the pace accelerates rather than burning out. I treat AI engineering as a craft to master and iterate weekly.`,
  aboutYou: `B.Tech in AI from IIT Hyderabad, now 2.5 years into building enterprise AI systems at OpenText. Went from fresh grad to owning the AI Cockpit as an org-wide platform plus a 12x-faster CI/CD migration agent that is now standard tooling. Building publicly: PersonaRAG, devops-copilot-plugin. Looking to apply the same scrappy/rigorous combination at Mistral's Abu Dhabi office; the customer-facing Forward Deployed work matches exactly the discovery-to-production pipeline I've been running internally. I treat FDE as the highest form of engineering, owning the whole pipeline from discovery to enterprise rollout, with safe human checkpoints. The experience gap (3 vs 7) is real, but the production agentic plus RAG plus eval-harness depth and IIT Hyderabad fundamentals are the parts of the job that compound the fastest.`,
};

async function fillField(page, locator, value) {
  const el = page.locator(locator).first();
  if (await el.count() === 0) {
    console.log(`  miss: ${locator}`);
    return false;
  }
  await el.fill(value);
  return true;
}

async function fillByLabelContains(page, labelText, value) {
  // Find textarea/input near a label containing labelText (case-insensitive)
  const filled = await page.evaluate(({ label, val }) => {
    const lower = label.toLowerCase();
    const labels = Array.from(document.querySelectorAll('label, .application-label, .application-question, span'));
    for (const l of labels) {
      if (l.textContent && l.textContent.toLowerCase().includes(lower)) {
        // Walk up to listitem then look for textarea or input
        let parent = l;
        for (let i = 0; i < 6 && parent; i++) {
          const ta = parent.querySelector('textarea, input[type="text"]');
          if (ta) {
            ta.focus();
            ta.value = val;
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
          parent = parent.parentElement;
        }
      }
    }
    return false;
  }, { label: labelText, val: value });
  if (!filled) console.log(`  miss-label: ${labelText.slice(0, 50)}`);
  return filled;
}

(async () => {
  console.log('\nLaunching HEADED browser for Mistral apply...\n');
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Dismiss cookie banner
  const dismiss = page.locator('button:has-text("Dismiss")').first();
  if (await dismiss.count() > 0) {
    await dismiss.click().catch(() => {});
  }

  // Resume upload
  console.log('Uploading resume:', path.basename(RESUME));
  await page.setInputFiles('input[type="file"]', RESUME).catch(e => console.log('  upload error:', e.message));
  await page.waitForTimeout(5000); // Let Lever parse

  // Basics
  console.log('Filling basic fields...');
  await fillField(page, 'input[name="name"]', ANSWERS.fullName);
  await fillField(page, 'input[name="email"]', ANSWERS.email);
  await fillField(page, 'input[name="phone"]', ANSWERS.phone);
  await fillField(page, 'input[name="location"]', ANSWERS.location);
  await fillField(page, 'input[name="org"]', ANSWERS.company);
  await fillField(page, 'input[name="urls[LinkedIn]"]', ANSWERS.linkedin);
  await fillField(page, 'input[name="urls[GitHub]"]', ANSWERS.github);

  // Work authorization: click Yes checkbox/radio
  const yesBox = page.locator('label:has-text("Yes")').first();
  if (await yesBox.count() > 0) {
    await yesBox.click().catch(() => {});
    console.log('Clicked work auth Yes');
  }

  // Custom card questions (Languages + AAIE narrative)
  console.log('Filling narrative answers via label-match...');
  await fillByLabelContains(page, 'languages are you fluent', ANSWERS.languages);
  await fillByLabelContains(page, 'most complex LLM project', ANSWERS.llmProject);
  await fillByLabelContains(page, 'optimize for in life', ANSWERS.optimizeFor);
  await fillByLabelContains(page, 'intensely do you like working', ANSWERS.intensity);
  await fillByLabelContains(page, 'should we know about you', ANSWERS.aboutYou);

  console.log('\n✓ Form filled. Review the browser, solve hCaptcha (if shown), and click Submit Application.');
  console.log('Close the browser when done.');

  await new Promise(resolve => browser.on('disconnected', resolve));
  console.log('Browser closed. Done.');
})().catch(console.error);
