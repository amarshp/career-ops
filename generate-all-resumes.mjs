import { writeFileSync } from 'fs';
import { resolve } from 'path';

const jobs = [
  {
    id: '001', slug: 'ai71-senior-machine-learning-engineer', date: '2026-05-04',
    subtitle: 'Senior ML Engineer | Production LLM Systems, RAG &amp; Agentic AI',
    location: 'Open to Abu Dhabi relocation',
    summary: 'Senior ML Engineer (IIT Hyderabad, AI) with 2.5+ years building production LLM applications, RAG pipelines with vector databases, and agentic systems with LangGraph. Shipped an enterprise AI Cockpit compressing workflows from 2 weeks to 2 days, and a 12x-faster CI/CD migration agent with LLM-powered evaluation and remediation loops adopted org-wide; built evaluation-driven RAG with ChromaDB achieving measurable reliability. Seeking to build and deploy production AI systems at scale.',
  },
  {
    id: '005', slug: 'sap-senior-mle', date: '2026-05-05',
    subtitle: 'Senior ML Engineer | Enterprise GenAI, RAG &amp; Agent Orchestration',
    location: 'Open to UAE relocation',
    summary: 'Senior ML Engineer (IIT Hyderabad, AI) with 2.5+ years building production-grade GenAI systems, RAG pipelines with evaluation harnesses, and multi-agent orchestration for enterprise environments. Shipped an enterprise AI Cockpit with safety controls and observability via LangSmith, and a 12x-faster CI/CD migration agent adopted org-wide; built evaluation-driven RAG with measurable reliability. Experienced with tool use, model serving, and MLOps at enterprise scale.',
  },
  {
    id: '006', slug: 'mbzuai-senior-mlops-engineer', date: '2026-05-05',
    subtitle: 'Senior MLOps / LLMOps Engineer | CI/CD, Model Lifecycle &amp; LLM Deployment',
    location: 'Open to Abu Dhabi relocation',
    summary: 'MLOps / LLMOps Engineer (IIT Hyderabad, AI) with 2.5+ years building production AI infrastructure, CI/CD automation, and LLM deployment pipelines. Shipped an enterprise AI Cockpit with end-to-end LangSmith observability and FastAPI serving, and a CI/CD migration agent automating 770 Jenkins-to-GitLab jobs with self-healing loops; built model evaluation pipelines with RAGAS and LLM-as-Judge. Experienced with Docker, Kubernetes, AWS, and production model lifecycle management.',
  },
  {
    id: '014', slug: 'ai71-backend-engineer', date: '2026-05-05',
    subtitle: 'Software Engineer &mdash; Backend | AI Applications, FastAPI &amp; LLM Integration',
    location: 'Open to Abu Dhabi relocation',
    summary: 'Backend Engineer (IIT Hyderabad, AI) with 2.5+ years building production AI-powered backend systems, API services, and data pipelines. Shipped an enterprise AI Cockpit served via FastAPI with end-to-end monitoring, and a CI/CD migration agent processing 770 jobs with persistent state management; built data pipelines on Snowflake and optimized ETL achieving 1000x runtime improvement. Experienced with Python, FastAPI, PostgreSQL, Redis, Docker, and AI model integration.',
  },
  {
    id: '019', slug: 'alpheya-principal-ai-engineer', date: '2026-05-05',
    subtitle: 'Principal AI Engineer | Production RAG/Agent Systems for Regulated Fintech',
    location: 'Open to Abu Dhabi relocation',
    summary: 'Production AI Systems Engineer (IIT Hyderabad, AI) with 2.5+ years shipping RAG pipelines, agentic systems, and AI platform services for regulated environments. Productionised an enterprise AI Cockpit with evaluation harnesses, observability via LangSmith, and CI/CD automation; built RAG for financial services at Visa with hallucination detection and faithfulness checks. Shipped a 12x-faster CI/CD migration agent with self-healing loops adopted org-wide. Seeking to take AI prototypes to production at scale.',
  },
  {
    id: '020', slug: 'sap-ai-architect', date: '2026-05-05',
    subtitle: 'AI Architect | LLM Orchestration, RAG &amp; Agent Framework Design',
    location: 'Open to UAE relocation',
    summary: 'AI Systems Architect (IIT Hyderabad, AI) with 2.5+ years designing and building production LLM orchestration, RAG architectures, and agent frameworks for enterprise environments. Architected an enterprise AI Cockpit with coordinator-specialist agent patterns and MCP tool contracts adopted as team-wide standard; designed RAG retrieval architecture with evaluation services for financial explainability at Visa. Experienced with responsible AI controls, evaluation harnesses, and guiding engineering teams on AI platform design.',
  },
  {
    id: '032', slug: 'deriv-staff-applied-ai', date: '2026-05-12',
    subtitle: 'Senior AI Engineer | Agentic Systems &amp; Autonomous Operations',
    location: 'Open to Dubai relocation',
    summary: 'Senior AI Engineer (IIT Hyderabad, AI) with 2.5+ years building production-hardened agentic systems, multi-agent orchestration pipelines, and autonomous operations tooling. Shipped an enterprise AI Cockpit with self-healing agent loops and a 12x-faster CI/CD migration agent with autonomous error remediation adopted org-wide; built evaluation-driven RAG systems with measurable reliability. Seeking to build autonomous AI systems that operate with minimal human intervention.',
  },
  {
    id: '034', slug: 'stellar-technologies-ml-engineer-genai', date: '2026-05-12',
    subtitle: 'ML Engineer | Generative AI, RAG &amp; Agentic Systems',
    location: 'Open to Abu Dhabi relocation',
    summary: 'ML Engineer (IIT Hyderabad, AI) with 2.5+ years building production GenAI systems, evaluation-driven RAG architectures, and multi-agent orchestration pipelines. Shipped an enterprise AI Cockpit with LangGraph agent orchestration and a 12x-faster CI/CD migration agent adopted org-wide; built RAG pipelines with ChromaDB, faithfulness evaluation, and hallucination detection for financial services at Visa. Seeking to build and ship GenAI/RAG systems at scale.',
  },
  {
    id: '037', slug: 'tat-it-senior-agentic-ai', date: '2026-05-12',
    subtitle: 'Senior AI Engineer | Agentic AI, MCP &amp; Enterprise LLM Systems',
    location: 'Open to Abu Dhabi relocation',
    summary: 'Senior AI Engineer (IIT Hyderabad, AI) with 2.5+ years building production agentic AI systems, MCP-integrated enterprise tooling, and multi-agent orchestration pipelines. Shipped an enterprise AI Cockpit with coordinator-specialist agent patterns and MCP tool contracts; built RAG with evaluation harnesses for financial transaction monitoring at Visa. Seeking to build banking-grade agentic AI systems at enterprise scale.',
  },
  {
    id: '044', slug: 'datacamp-principal-ai-engineer-tutor', date: '2026-05-12',
    subtitle: 'AI Engineer | Evaluation-Driven LLM Systems &amp; Agentic Workflows',
    location: 'Open to remote (UAE timezone)',
    summary: 'AI Engineer (IIT Hyderabad, AI) with 2.5+ years building evaluation-driven LLM systems, RAG architectures, and multi-agent orchestration pipelines. Built PersonaRAG achieving 37/37 pass rate across 4 independent eval suites through LLM-as-Judge; shipped an enterprise AI Cockpit with structured-output validation and a 12x-faster CI/CD migration agent. Experienced with prompt architecture design, faithfulness evaluation, and hallucination detection.',
  },
  {
    id: '046', slug: 'salt-senior-ai-engineer', date: '2026-05-12',
    subtitle: 'Senior AI Engineer | Multi-Agent Systems &amp; Agentic AI Infrastructure',
    location: 'Open to UAE relocation',
    summary: 'Senior AI Engineer (IIT Hyderabad, AI) with 2.5+ years building production multi-agent systems, planner-executor orchestration pipelines, and tool-using AI agents. Shipped an enterprise AI Cockpit with hierarchical agent routing and MCP tool contracts, and a 12x-faster CI/CD migration agent with self-healing loops adopted org-wide; built evaluation-driven RAG systems with measurable reliability. Seeking to build agentic AI infrastructure at scale.',
  },
  {
    id: '047', slug: 'dynamic-search-head-of-ai', date: '2026-05-12',
    subtitle: 'AI Strategy &amp; Engineering Lead | Agents, RAG, Copilots &amp; Enterprise AI Adoption',
    location: 'Open to UAE relocation',
    summary: 'AI Engineering Lead (IIT Hyderabad, AI) with 2.5+ years driving enterprise AI adoption through production agentic systems, copilot architectures, and LLM orchestration platforms. Shipped an enterprise AI Cockpit adopted as team-wide standard and a CI/CD migration agent driving org-wide adoption across 10+ teams; built evaluation-driven RAG for financial services. Experienced with leading AI strategy, mentoring engineers, and translating business needs into AI platform design.',
  },
  {
    id: '048', slug: 'hays-aiml-engineer-6mo-contract', date: '2026-05-12',
    subtitle: 'AI/ML Engineer | LLMOps, Evaluation Frameworks &amp; Multi-Agent Orchestration',
    location: 'Available immediately (30-day notice)',
    summary: 'AI/ML Engineer (IIT Hyderabad, AI) with 2.5+ years building production LLM systems with LangChain, LangGraph, CrewAI, PydanticAI, and FastAPI. Shipped an enterprise AI Cockpit with end-to-end LangSmith observability and evaluation harnesses, and a 12x-faster CI/CD migration agent with self-healing loops; built RAG evaluation pipelines with RAGAS measuring faithfulness and hallucination detection. Experienced with multi-agent orchestration and LLMOps at enterprise scale.',
  },
  {
    id: '049', slug: 'brain-co-aiml-engineer-deployed', date: '2026-05-12',
    subtitle: 'AI/ML Engineer | GenAI Agents, RAG &amp; Deployed AI Systems',
    location: 'Open to Abu Dhabi relocation',
    summary: 'AI/ML Engineer (IIT Hyderabad, AI) with 2.5+ years building and deploying GenAI agents, reasoning-driven RAG systems, and multi-agent orchestration pipelines. Shipped an enterprise AI Cockpit with agent orchestration and a 12x-faster CI/CD migration agent with self-healing loops adopted org-wide; built evaluation-driven RAG with hallucination detection for financial services at Visa. Seeking to deploy GenAI agents that solve real-world problems at scale.',
  },
  {
    id: '108', slug: 'emaratech-ai-developer', date: '2026-05-14',
    subtitle: 'Artificial Intelligence Developer | Production LLM Apps, RAG &amp; Agentic Systems',
    location: 'Open to Dubai relocation',
    summary: 'Artificial Intelligence Developer (IIT Hyderabad, AI) with 2.5+ years building production LLM applications, RAG systems, and agentic automation. Shipped an enterprise AI Cockpit with LangGraph orchestration, MCP tool integrations, FastAPI serving, and LangSmith observability; built a 12x-faster CI/CD migration agent adopted across 10+ teams. Seeking to build reliable AI products for high-scale UAE digital services.',
  },
  {
    id: '109', slug: 'bramwith-senior-ai-engineer', date: '2026-05-14',
    subtitle: 'Senior AI Engineer | FinTech GenAI, RAG &amp; Agentic Workflow Automation',
    location: 'Open to Dubai relocation',
    summary: 'Senior AI Engineer (IIT Hyderabad, AI) with 2.5+ years building production GenAI systems for enterprise and financial-services contexts. Built a Visa RAG explainability platform with hallucination checks and faithfulness evaluation, plus an OpenText AI Cockpit using LangGraph, MCP, FastAPI, and LangSmith; shipped a 12x-faster CI/CD migration agent with HITL controls. Seeking to build fintech-grade AI systems with reliability, traceability, and measurable business impact.',
  },
  {
    id: '110', slug: 'dicetek-ai-engineer', date: '2026-05-14',
    subtitle: 'AI Engineer | LLM Systems, RAG Pipelines &amp; Enterprise Automation',
    location: 'Open to Abu Dhabi relocation',
    summary: 'AI Engineer (IIT Hyderabad, AI) with 2.5+ years delivering enterprise LLM systems, RAG pipelines, and AI automation. Shipped an AI Cockpit with multi-agent orchestration, MCP tool use, FastAPI APIs, and LangSmith tracing; built RAG evaluation pipelines with RAGAS and a 12x-faster CI/CD migration agent adopted org-wide. Seeking to build practical AI systems for enterprise users in the UAE.',
  },
  {
    id: '111', slug: 'flatgigs-full-stack-ai-engineer', date: '2026-05-14',
    subtitle: 'Full Stack AI Engineer | FastAPI, LLM Apps, RAG &amp; Agentic Backends',
    location: 'Open to Dubai relocation',
    summary: 'Full Stack AI Engineer (IIT Hyderabad, AI) with 2.5+ years building AI-powered backend systems, API services, and LLM application workflows. Built an enterprise AI Cockpit served via FastAPI with LangGraph agent orchestration, MCP integrations, and LangSmith observability; shipped a 12x-faster CI/CD migration agent and production RAG systems with evaluation harnesses. Strong fit for teams turning AI prototypes into product-grade applications.',
  },
  {
    id: '112', slug: 'oryxsearch-mlops-ml-platform-engineer', date: '2026-05-14',
    subtitle: 'MLOps / ML Platform Engineer | LLMOps, Streaming Infra &amp; Evaluation',
    location: 'Open to Dubai relocation',
    summary: 'MLOps / ML Platform Engineer (IIT Hyderabad, AI) with 2.5+ years building production LLM systems, evaluation pipelines, and AI automation infrastructure. Shipped an enterprise AI Cockpit with FastAPI serving, LangSmith observability, and MCP tool contracts; built a self-healing CI/CD migration agent for 770 Jenkins-to-GitLab jobs and RAG evaluation pipelines with RAGAS. Seeking to harden LLM and ML platforms for reliability, monitoring, and scale.',
  },
  {
    id: '113', slug: 'reap-senior-software-engineer-ai-agents', date: '2026-05-14',
    subtitle: 'Senior Software Engineer, AI Agents | LangGraph, MCP &amp; Production LLM Systems',
    location: 'Open to Dubai relocation',
    summary: 'Senior Software Engineer focused on AI agents (IIT Hyderabad, AI) with 2.5+ years building production agentic systems, tool-using LLM workflows, and enterprise automation. Shipped an OpenText AI Cockpit with coordinator-specialist LangGraph agents, MCP integrations, structured-output validation, and FastAPI APIs; built a 12x-faster CI/CD migration agent with persistent state and HITL checkpoints. Seeking to build robust AI agent products at scale.',
  },
  {
    id: '114', slug: 'cntxt-ai-lead-machine-learning-engineer', date: '2026-05-14',
    subtitle: 'Lead Machine Learning Engineer | Production GenAI, RAG &amp; ML Systems',
    location: 'Open to Abu Dhabi relocation',
    summary: 'Lead-leaning Machine Learning Engineer (IIT Hyderabad, AI) with 2.5+ years building production GenAI, RAG, and ML automation systems while mentoring engineers on agent development. Shipped an enterprise AI Cockpit with LangGraph orchestration and MCP integrations; built a 12x-faster CI/CD migration agent adopted across 10+ teams and a Visa RAG explainability platform with evaluation harnesses. Seeking a high-scope UAE AI role building reliable ML and LLM systems.',
  },
  {
    id: '115', slug: 'faze3-ai-ml-devops-engineer', date: '2026-05-14',
    subtitle: 'AI/ML/DevOps Engineer | LLMOps, RAG, Agentic Workflows &amp; CI/CD',
    location: 'Open to Abu Dhabi relocation',
    summary: 'AI/ML/DevOps Engineer (IIT Hyderabad, AI) with 2.5+ years bridging production GenAI, LLMOps, RAG, and DevOps automation. Built an enterprise AI Cockpit with LangGraph agents, MCP tool integrations, FastAPI serving, and LangSmith observability; won a company hackathon for a self-healing CI/CD migration agent that accelerated 770 Jenkins-to-GitLab migrations by 12x. Seeking to build governed AI/ML platforms and agentic workflows for UAE enterprises.',
  },
  {
    id: '116', slug: 'almosafer-specialist-machine-learning', date: '2026-05-14',
    subtitle: 'Machine Learning Specialist | Applied ML, GenAI &amp; Production Data Pipelines',
    location: 'Open to Dubai relocation',
    summary: 'Machine Learning Specialist (IIT Hyderabad, AI) with 2.5+ years building applied ML, production GenAI, and data pipelines. Delivered enterprise RAG and agentic systems with LangGraph, FastAPI, and evaluation harnesses; built segmentation and uplift models for Walmart with 45% top-decile uplift and 13.4M-customer targeting. Seeking to build ML systems that improve high-scale travel and commerce products.',
  },
  {
    id: '117', slug: 'bhatia-artificial-intelligence-engineer', date: '2026-05-14',
    subtitle: 'Artificial Intelligence Engineer | Enterprise AI, RAG &amp; Automation',
    location: 'Open to Dubai relocation',
    summary: 'Artificial Intelligence Engineer (IIT Hyderabad, AI) with 2.5+ years shipping enterprise AI systems, RAG workflows, and automation tools. Built an AI Cockpit with LangGraph agents, MCP integrations, FastAPI services, and LangSmith observability; delivered a 12x-faster CI/CD migration agent adopted across 10+ teams. Seeking to apply reliable AI automation to operational and enterprise workflows.',
  },
  {
    id: '118', slug: 'bramwith-data-scientist-fintech', date: '2026-05-14',
    subtitle: 'Data Scientist | FinTech GenAI, RAG Evaluation &amp; Applied ML',
    location: 'Open to Dubai relocation',
    summary: 'Data Scientist (IIT Hyderabad, AI) with 2.5+ years combining applied ML, GenAI explainability, and production-grade data pipelines. Built a Visa RAG explainability platform with faithfulness and hallucination evaluation; delivered Walmart segmentation and uplift models with 45% top-decile uplift and optimized Snowflake/Spark pipelines by up to 1000x. Seeking a fintech data science role focused on explainable, reliable AI systems.',
  },
  {
    id: '119', slug: 'jobgether-ai-research-engineer-rl', date: '2026-05-14',
    subtitle: 'AI Research Engineer | Evaluation-Driven LLM Systems &amp; Applied ML',
    location: 'Open to UAE remote/hybrid',
    summary: 'AI Research Engineer (IIT Hyderabad, AI) with 2.5+ years building evaluation-driven LLM systems, RAG pipelines, and applied ML workflows. Built PersonaRAG with 37/37 pass rate across independent eval suites and 0 false positives on adversarial probes; shipped enterprise agentic systems with LangGraph and LLM-as-Judge evaluation. Seeking applied AI research roles where rigorous experimentation turns into production systems.',
  },
  {
    id: '120', slug: 'lancesoft-ai-engineer', date: '2026-05-14',
    subtitle: 'AI Engineer | LLM Apps, RAG, FastAPI &amp; Enterprise Automation',
    location: 'Open to Ras Al Khaimah / UAE relocation',
    summary: 'AI Engineer (IIT Hyderabad, AI) with 2.5+ years building LLM applications, RAG systems, and enterprise automation. Shipped an AI Cockpit with LangGraph orchestration, MCP tool integrations, FastAPI APIs, and LangSmith tracing; built a 12x-faster CI/CD migration agent and RAG evaluation pipelines with RAGAS. Seeking to build practical AI products for UAE enterprise users.',
  },
  {
    id: '121', slug: 'virtusa-data-scientist', date: '2026-05-14',
    subtitle: 'Data Scientist | Applied ML, GenAI Explainability &amp; Data Engineering',
    location: 'Open to Dubai relocation',
    summary: 'Data Scientist (IIT Hyderabad, AI) with 2.5+ years across applied ML, GenAI explainability, and production data engineering. Built RAG-based explainability systems for Visa, segmentation and uplift modeling for Walmart with 45% top-decile uplift, and high-performance Spark/Snowflake pipelines with major runtime improvements. Seeking data science roles where modeling, data platforms, and AI systems connect to business impact.',
  },
  {
    id: '122', slug: 'talabat-sr-data-scientist-ai-ml', date: '2026-05-14',
    subtitle: 'Senior Data Scientist | AI/ML, Experimentation &amp; Production Data Pipelines',
    location: 'Open to Dubai relocation',
    summary: 'Senior Data Scientist (IIT Hyderabad, AI) with 2.5+ years building ML pipelines, model evaluation workflows, and production GenAI systems. Delivered Walmart segmentation and uplift models with 45% top-decile uplift and 13.4M-customer targeting; built RAG explainability and evaluation systems for Visa and agentic automation at OpenText. Seeking to build AI/ML systems for marketplace, personalization, and operations use cases.',
  },
  {
    id: '123', slug: 'ajman-university-data-scientist', date: '2026-05-14',
    subtitle: 'Data Scientist | AI Research, RAG Evaluation &amp; Applied ML',
    location: 'Open to Ajman / UAE relocation',
    summary: 'Data Scientist (IIT Hyderabad, AI) with 2.5+ years applying ML, RAG evaluation, and production AI methods across enterprise settings. Built PersonaRAG with multi-query retrieval, cross-encoder reranking, and independent eval suites; shipped GenAI explainability systems and agentic automation with LangGraph and FastAPI. Seeking to contribute to applied AI, analytics, and research-driven data science work.',
  },
  {
    id: '124', slug: 'dubai-holding-associate-director-data-scientist', date: '2026-05-14',
    subtitle: 'Data Science Lead | Applied ML, GenAI Strategy &amp; Enterprise AI Delivery',
    location: 'Open to Dubai relocation',
    summary: 'Lead-leaning Data Scientist (IIT Hyderabad, AI) with 2.5+ years delivering applied ML, GenAI systems, and enterprise AI adoption while mentoring engineers. Built an AI Cockpit adopted as a team-wide standard, a 12x-faster CI/CD migration agent adopted by 10+ teams, and business-impact ML pipelines for Walmart. Seeking high-scope UAE roles where data science, AI product delivery, and stakeholder impact intersect.',
  },
  {
    id: '125', slug: 'global-software-solutions-senior-data-engineer', date: '2026-05-14',
    subtitle: 'Senior Data Engineer | ML Data Pipelines, Snowflake, Spark &amp; AI Platforms',
    location: 'Open to Dubai relocation',
    summary: 'Senior Data Engineer (IIT Hyderabad, AI) with 2.5+ years building ML-facing data pipelines, high-performance analytics marts, and AI platform backends. Built Walmart Spark/Snowflake pipelines with 7x faster datamarts and up to 1000x ETL runtime improvements; shipped FastAPI-backed GenAI systems and CI/CD automation for enterprise workflows. Seeking data engineering roles that support AI/ML systems at scale.',
  },
  {
    id: '126', slug: 'inception-applied-scientist', date: '2026-05-14',
    subtitle: 'Applied Scientist | LLM Systems, RAG Evaluation &amp; Production AI',
    location: 'Open to Abu Dhabi relocation',
    summary: 'Applied Scientist (IIT Hyderabad, AI) with 2.5+ years building LLM systems, RAG evaluation pipelines, and applied ML workflows. Built PersonaRAG with 37/37 eval pass rate and 0 false positives on adversarial probes; shipped enterprise agentic AI with LangGraph, MCP tool contracts, and LangSmith observability. Seeking applied science roles that bridge research rigor and production AI impact.',
  },
];

function generateHTML({ subtitle, location, summary }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Amarsh Pedapati - CV</title>
<style>
  @font-face { font-family: 'Space Grotesk'; src: url('../fonts/space-grotesk-latin.woff2') format('woff2'); font-weight: 300 700; font-style: normal; font-display: swap; }
  @font-face { font-family: 'Space Grotesk'; src: url('../fonts/space-grotesk-latin-ext.woff2') format('woff2'); font-weight: 300 700; font-style: normal; font-display: swap; }
  @font-face { font-family: 'DM Sans'; src: url('../fonts/dm-sans-latin.woff2') format('woff2'); font-weight: 100 1000; font-style: normal; font-display: swap; }
  @font-face { font-family: 'DM Sans'; src: url('../fonts/dm-sans-latin-ext.woff2') format('woff2'); font-weight: 100 1000; font-style: normal; font-display: swap; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'DM Sans', sans-serif; font-size: 10px; line-height: 1.4; color: #1a1a2e; background: #ffffff; }
  .page { width: 100%; max-width: 210mm; margin: 0 auto; padding: 2px 0; }
  .header { margin-bottom: 10px; } .header h1 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.02em; margin-bottom: 2px; line-height: 1.1; }
  .header-subtitle { font-family: 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 500; color: #555; margin-bottom: 5px; }
  .header-gradient { height: 2px; background: linear-gradient(to right, hsl(187,74%,32%), hsl(270,70%,45%)); border-radius: 1px; margin-bottom: 6px; }
  .contact-row { display: flex; flex-wrap: wrap; gap: 4px 10px; font-family: 'DM Sans', sans-serif; font-size: 9.5px; line-height: 1.3; color: #555; }
  .contact-row a { color: #555; text-decoration: none; } .contact-row .separator { color: #ccc; }
  .section { margin-bottom: 8px; }
  .section-title { font-family: 'Space Grotesk', sans-serif; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: hsl(187,74%,32%); border-bottom: 1.5px solid #e2e2e2; padding-bottom: 2px; margin-bottom: 6px; line-height: 1.2; }
  .summary-text { font-size: 10px; line-height: 1.5; color: #2f2f2f; } a { white-space: nowrap; }
  .job { margin-bottom: 7px; } .job-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 1px; }
  .job-company { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 600; color: hsl(270,70%,45%); }
  .job-period { font-size: 9.5px; color: #777; white-space: nowrap; }
  .job-role { font-size: 10px; font-weight: 600; color: #333; margin-bottom: 3px; } .job-location { font-size: 9px; color: #888; }
  .job-sub { font-size: 9.5px; font-weight: 600; color: #444; margin: 4px 0 1px; }
  .job ul { padding-left: 14px; margin-top: 2px; } .job li { font-size: 9.5px; line-height: 1.45; color: #333; margin-bottom: 2px; }
  .project { margin-bottom: 6px; } .project-title { font-family: 'Space Grotesk', sans-serif; font-size: 10.5px; font-weight: 600; color: hsl(270,70%,45%); }
  .project-badge { font-size: 8px; font-weight: 500; color: hsl(187,74%,32%); background: hsl(187,40%,95%); padding: 1px 4px; border-radius: 2px; margin-left: 4px; }
  .project-desc { font-size: 9.5px; color: #444; margin-top: 1px; line-height: 1.45; } .project-tech { font-size: 8.5px; color: #888; margin-top: 1px; }
  .edu-item { margin-bottom: 4px; } .edu-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .edu-title { font-weight: 600; font-size: 10px; color: #333; } .edu-org { color: hsl(270,70%,45%); font-weight: 500; } .edu-year { font-size: 9px; color: #777; white-space: nowrap; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 3px 10px; } .skill-item { font-size: 9.5px; color: #444; } .skill-category { font-weight: 600; color: #333; font-size: 9.5px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { padding: 0; } }
  .avoid-break, .job, .project, .edu-item { break-inside: avoid; page-break-inside: avoid; }
</style>
</head>
<body>
<div class="page">
  <div class="header avoid-break">
    <h1>Amarsh Pedapati</h1>
    <div class="header-subtitle">${subtitle}</div>
    <div class="header-gradient"></div>
    <div class="contact-row"><span>amarsh.pedapati@gmail.com</span><span class="separator">|</span><span>+91-9959822444</span><span class="separator">|</span><a href="https://www.linkedin.com/in/amarshp/">linkedin.com/in/amarshp</a><span class="separator">|</span><a href="https://github.com/amarshp">github.com/amarshp</a></div>
    <div class="contact-row" style="margin-top: 3px;"><span>Nationality: Indian</span><span class="separator">|</span><span>${location}</span><span class="separator">|</span><span>Notice Period: 30 days</span></div>
  </div>
  <div class="section avoid-break"><div class="section-title">Professional Summary</div>
    <div class="summary-text">${summary}</div>
  </div>
  <div class="section avoid-break"><div class="section-title">Education</div>
    <div class="edu-item"><div class="edu-header"><span class="edu-title">Bachelor of Technology, Artificial Intelligence -- <span class="edu-org">Indian Institute of Technology (IIT), Hyderabad</span></span><span class="edu-year">Jul 2019 -- May 2023</span></div></div>
  </div>
  <div class="section"><div class="section-title">Work Experience</div>
    <div class="job"><div class="job-header"><span class="job-company">OpenText</span><span class="job-period">Jan 2026 -- Present</span></div>
      <div class="job-role">Senior AI Engineer &middot; <span class="job-location">Hyderabad, India</span></div>
      <div class="job-sub">AI Cockpit: Expert Agent Orchestration &amp; MCP Integration</div>
      <ul><li>Compressed project planning and test automation from 2 weeks to 2 days by designing a hierarchical multi-agent orchestration layer in LangGraph that routes natural language requests to domain Expert Agents through RAG-driven context management and MCP tool integrations.</li>
      <li>Built Expert Agents with guardrails, role-based authorization, and structured-output validation that autonomously generate test cases from requirements and populate sprint timelines from spec sheets.</li>
      <li>Enabled enterprise tool use across product APIs with end-to-end LangSmith tracing; served via FastAPI, architecture adopted as team-wide standard; in beta testing with enterprise clients.</li></ul>
      <div class="job-sub">CI/CD Migration Agent &amp; DevOps Copilot Plugin</div>
      <ul><li>Achieved 12x acceleration on a 770-job Jenkins-to-GitLab migration (12 months to under 1 month) by architecting a LangGraph-based self-healing multi-agent system with persistent state and hard HITL checkpoints; won company hackathon (~200 participants).</li>
      <li>Designed and deployed the org-wide standard migration toolchain, a DevOps Plugin with composable agent skills and GitLab CI workflow definitions, adopted by 10+ teams post-hackathon; mentoring a senior SWE on agent development.</li></ul>
    </div>
    <div class="job"><div class="job-header"><span class="job-company">Blend360</span><span class="job-period">Oct 2023 -- Dec 2025</span></div>
      <div class="job-role">Data Scientist &middot; <span class="job-location">Hyderabad, India</span></div>
      <div class="job-sub">For Visa: GenAI Model Explainability Platform</div>
      <ul><li>Built a GenAI explainability platform using RAG and LangChain that converts raw model discrepancy signals into evidence-backed explanations; designed prompt-engineered reduction pipelines aggregating point-level outputs into executive narratives.</li>
      <li>Engineered an agentic chatbot with retrieval-augmented generation and data exploration; built an evaluation pipeline with RAGAS measuring Answer Relevancy, Faithfulness, and Hallucination detection across outputs.</li></ul>
      <div class="job-sub">For Walmart: Holiday Campaign (Data Engineering &amp; ML)</div>
      <ul><li>Achieved 45% uplift in top decile and enabled targeting of 13.4M customers from 130M by building end-to-end segmentation and uplift modeling pipelines with Scikit-learn and probability calibration.</li>
      <li>Engineered a high-performance Spark datamart (7x faster) on Snowflake and optimized ETL pipelines achieving 1000x runtime improvement; improved model lift by 100% through feature engineering and calibration.</li></ul>
    </div>
    <div class="job"><div class="job-header"><span class="job-company">AIBOD</span><span class="job-period">Jan -- Jun 2022</span></div>
      <div class="job-role">ML Engineer Intern &middot; <span class="job-location">Fukuoka, Japan</span></div>
      <ul><li>Reduced misclassification rate by 32% and improved accuracy by 18% by integrating a PyTorch-based OOD detection pipeline with uncertainty estimation and Mahalanobis distance for an AI-powered unmanned retail system.</li></ul>
    </div>
  </div>
  <div class="section avoid-break"><div class="section-title">Projects</div>
    <div class="project"><span class="project-title">PersonaRAG: Eval-Driven Hybrid RAG System</span><span class="project-badge">PUBLIC</span>
      <ul style="padding-left: 14px; margin-top: 2px;">
        <li style="font-size: 9.5px; line-height: 1.45; color: #444; margin-bottom: 2px;">Achieved 0 false positives across 30+ adversarial probes by building a hybrid-retrieval system over 4.75M words (2,334 chapters) with ChromaDB, a 4-layer prompt architecture, multi-query expansion + cross-encoder reranking, and a custom faithfulness guard catching fabrication-by-empty-context.</li>
        <li style="font-size: 9.5px; line-height: 1.45; color: #444; margin-bottom: 2px;">Achieved 37/37 pass rate across 4 independent eval suites (canon QA, design boundary, anti-fabrication stress, holdout) through eval-driven development with LLM-as-Judge; architectural decisions recorded as ADRs and validated via structured multi-perspective reviews.</li>
      </ul>
      <div class="project-tech">ChromaDB &middot; LLM-as-Judge &middot; Multi-query RAG &middot; Cross-encoder Reranking -- <a href="https://github.com/amarshp/persona-chatbot">github.com/amarshp/persona-chatbot</a></div></div>
  </div>
  <div class="section avoid-break"><div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      <span class="skill-item"><span class="skill-category">Agentic AI &amp; LLMs:</span> LangGraph, CrewAI, MCP, A2A, RAG (Multi-query, Cross-encoder Reranking, Long-context), Prompt Engineering, LLM Evaluation (LLM-as-Judge, A/B Testing), Hallucination Detection, Fine-tuning</span>
      <span class="skill-item"><span class="skill-category">ML &amp; Frameworks:</span> PyTorch, Hugging Face Transformers, PydanticAI, LangChain, OpenAI SDKs, Scikit-learn</span>
      <span class="skill-item"><span class="skill-category">Data, Infra &amp; Cloud:</span> FAISS, Pinecone, ChromaDB, PostgreSQL, Redis, Snowflake, AWS (Bedrock, SageMaker), Docker, Kubernetes, FastAPI, LangSmith</span>
      <span class="skill-item"><span class="skill-category">Languages &amp; Certs:</span> Python, C++, SQL | AWS AI Practitioner</span>
    </div>
  </div>
</div>
</body>
</html>`;
}

for (const job of jobs) {
  const filename = `${job.id}-${job.slug}-${job.date}.html`;
  const filepath = resolve('output', filename);
  const html = generateHTML(job);
  writeFileSync(filepath, html, 'utf8');
  console.log(`Generated: ${filename}`);
}
console.log(`\nDone. ${jobs.length} HTML files generated.`);
