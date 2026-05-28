param(
    [string[]]$Ids = @(),
    [switch]$SkipPdf
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$masterDocx = "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\Amarsh_Pedapati_SeniorAIEngineer_UAE(1).docx"
$outputDir = "C:\Users\Amarsh\OneDrive\Documents\Personal\Projects\JobApplicationAI\career-ops\output"

$originalSubtitle = "Senior AI Engineer | Agentic Systems &amp; LLM Orchestration"
$originalLocation = "Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days"
$originalSummary = "Senior AI Engineer (IIT Hyderabad, AI) with 3+ years building production agentic systems, multi-agent orchestration pipelines, and MCP-based enterprise tooling. Shipped an enterprise AI Cockpit to beta and a 12x-faster CI/CD migration agent; built evaluation-driven RAG systems from scratch. Seeking to bring agentic AI and LLM infrastructure expertise to the UAE market."

$jobs = @(
    @{ id="001"; slug="ai71-senior-machine-learning-engineer"; date="2026-05-04";
       subtitle="Senior ML Engineer | LLM Systems, RAG & Agentic AI";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Senior ML Engineer (IIT Hyderabad, AI) with 3+ years building production LLM systems, RAG pipelines, and agentic orchestration with LangGraph. Shipped an enterprise AI Cockpit (2 weeks to 2 days) and a 12x-faster CI/CD migration agent adopted org-wide; built evaluation-driven RAG with ChromaDB. Seeking to build production AI systems at scale." },
    @{ id="005"; slug="sap-senior-mle"; date="2026-05-05";
       subtitle="Senior ML Engineer | GenAI, RAG & Agent Orchestration";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Senior ML Engineer (IIT Hyderabad, AI) with 3+ years building production GenAI systems, RAG pipelines, and multi-agent orchestration for enterprise. Shipped an enterprise AI Cockpit with LangSmith observability and a 12x-faster CI/CD migration agent adopted org-wide; built evaluation-driven RAG. Experienced with tool use, model serving, and MLOps at enterprise scale." },
    @{ id="006"; slug="mbzuai-senior-mlops-engineer"; date="2026-05-05";
       subtitle="Senior MLOps Engineer | CI/CD, Model Lifecycle & LLM Deployment";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="MLOps Engineer (IIT Hyderabad, AI) with 3+ years building production AI infrastructure, CI/CD automation, and LLM deployment pipelines. Shipped an AI Cockpit with LangSmith observability and FastAPI serving; automated 770 Jenkins-to-GitLab jobs with self-healing loops. Experienced with Docker, Kubernetes, AWS, and production model lifecycle management." },
    @{ id="014"; slug="ai71-backend-engineer"; date="2026-05-05";
       subtitle="Software Engineer - Backend | AI Apps, FastAPI & LLM Integration";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Backend Engineer (IIT Hyderabad, AI) with 3+ years building production AI-powered backend systems, API services, and data pipelines. Shipped an enterprise AI Cockpit via FastAPI with end-to-end monitoring and a CI/CD migration agent with persistent state; built ETL on Snowflake with 1000x runtime improvement. Experienced with Python, FastAPI, PostgreSQL, Redis, and Docker." },
    @{ id="019"; slug="alpheya-principal-ai-engineer"; date="2026-05-05";
       subtitle="Principal AI Engineer | RAG/Agent Systems for Fintech";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="AI Systems Engineer (IIT Hyderabad, AI) with 3+ years shipping RAG pipelines, agentic systems, and AI platforms for regulated environments. Shipped an enterprise AI Cockpit with evaluation harnesses and LangSmith observability; built RAG for Visa with hallucination detection. Built a 12x-faster CI/CD migration agent adopted org-wide. Seeking to bring AI prototypes to production." },
    @{ id="020"; slug="sap-ai-architect"; date="2026-05-05";
       subtitle="AI Architect | LLM Orchestration, RAG & Agent Design";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="AI Architect (IIT Hyderabad, AI) with 3+ years designing production LLM orchestration, RAG architectures, and agent frameworks for enterprise. Architected an AI Cockpit with coordinator-specialist patterns and MCP tool contracts adopted as team standard; designed RAG for financial explainability at Visa. Experienced with responsible AI controls and guiding engineering teams on AI platform design." },
    @{ id="022"; slug="blackstone-eit-applied-ai-engineer"; date="2026-05-05";
       subtitle="Applied AI Engineer | GenAI, RAG & Agentic Systems";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Applied AI Engineer (IIT Hyderabad, AI) with 3+ years shipping production GenAI systems, RAG pipelines, and agentic orchestration for enterprise clients. Shipped an AI Cockpit with LangSmith observability and structured-output validation; built RAG with hallucination detection for Visa and a 12x-faster CI/CD migration agent adopted org-wide. Experienced with FastAPI, LangChain/LangGraph, vector DBs and turning AI prototypes into reliable production services." },
    @{ id="028"; slug="mistral-ai-tech-lead-fde"; date="2026-05-12";
       subtitle="Forward Deployed AI Engineer | Customer-Facing LLM/Agentic Systems";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Forward Deployed AI Engineer (IIT Hyderabad, AI) with 3+ years building customer-facing LLM and agentic systems end-to-end — from discovery and architecture to production deployment. Shipped an enterprise AI Cockpit with coordinator-specialist agents, MCP tool contracts, and LangSmith observability adopted as team standard; built a 12x-faster CI/CD migration agent with autonomous remediation and human checkpoints. Experienced with RAG evaluation harnesses, prompt architecture, and bridging research-grade models to enterprise production." },
    @{ id="032"; slug="deriv-staff-applied-ai"; date="2026-05-12";
       subtitle="Senior AI Engineer | Agentic Systems & Autonomous Ops";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Senior AI Engineer (IIT Hyderabad, AI) with 3+ years building production agentic systems, multi-agent orchestration, and autonomous operations tooling. Shipped an AI Cockpit with self-healing agent loops and a 12x-faster CI/CD migration agent with autonomous error remediation adopted org-wide; built evaluation-driven RAG. Seeking to build autonomous AI systems at minimal human intervention." },
    @{ id="034"; slug="stellar-technologies-ml-engineer-genai"; date="2026-05-12";
       subtitle="ML Engineer | Generative AI, RAG & Agentic Systems";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="ML Engineer (IIT Hyderabad, AI) with 3+ years building production GenAI systems, evaluation-driven RAG, and multi-agent orchestration. Shipped an enterprise AI Cockpit with LangGraph orchestration and a 12x-faster CI/CD migration agent adopted org-wide; built RAG with ChromaDB and hallucination detection for Visa. Seeking to build and ship GenAI/RAG systems at scale." },
    @{ id="037"; slug="tat-it-senior-agentic-ai"; date="2026-05-12";
       subtitle="Senior AI Engineer | Agentic AI, MCP & Enterprise LLM";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Senior AI Engineer (IIT Hyderabad, AI) with 3+ years building production agentic AI systems, MCP-integrated enterprise tooling, and multi-agent orchestration. Shipped an AI Cockpit with coordinator-specialist agent patterns and MCP tool contracts; built RAG with evaluation harnesses for Visa. Seeking to build banking-grade agentic AI systems at enterprise scale." },
    @{ id="044"; slug="datacamp-principal-ai-engineer-tutor"; date="2026-05-12";
       subtitle="AI Engineer | Eval-Driven LLM Systems & Agentic AI";
       location="Nationality: Indian  |  Open to remote (UAE timezone)  |  Notice Period: 30 days";
       summary="AI Engineer (IIT Hyderabad, AI) with 3+ years building evaluation-driven LLM systems, RAG, and multi-agent orchestration. Built PersonaRAG achieving 37/37 pass rate across 4 eval suites via LLM-as-Judge; shipped an AI Cockpit with structured-output validation and a 12x CI/CD migration agent. Experienced with prompt architecture and hallucination detection." },
    @{ id="046"; slug="salt-senior-ai-engineer"; date="2026-05-12";
       subtitle="Senior AI Engineer | Multi-Agent Systems & Agentic AI";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Senior AI Engineer (IIT Hyderabad, AI) with 3+ years building production multi-agent systems, planner-executor orchestration, and tool-using AI agents. Shipped an AI Cockpit with hierarchical agent routing and MCP tool contracts, and a 12x-faster CI/CD migration agent adopted org-wide; built evaluation-driven RAG. Seeking to build agentic AI infrastructure at scale." },
    @{ id="047"; slug="dynamic-search-head-of-ai"; date="2026-05-12";
       subtitle="AI & Engineering Lead | Agents, RAG & Enterprise AI";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="AI Engineering Lead (IIT Hyderabad, AI) with 3+ years driving enterprise AI adoption through production agentic systems and LLM orchestration. Shipped an AI Cockpit adopted as team standard and a CI/CD migration agent adopted by 10+ teams; built evaluation-driven RAG for financial services. Experienced with AI strategy, mentoring engineers, and translating business needs into AI design." },
    @{ id="048"; slug="hays-aiml-engineer-6mo-contract"; date="2026-05-12";
       subtitle="AI/ML Engineer | LLMOps & Multi-Agent Orchestration";
       location="Nationality: Indian  |  Available immediately (30-day notice)  |  Notice Period: 30 days";
       summary="AI/ML Engineer (IIT Hyderabad, AI) with 3+ years building production LLM systems with LangGraph and FastAPI. Shipped an AI Cockpit with LangSmith observability, and a 12x CI/CD migration agent with self-healing loops; built RAG evaluation with RAGAS measuring faithfulness and hallucination. Experienced with multi-agent orchestration and LLMOps at scale." },
    @{ id="049"; slug="brain-co-aiml-engineer-deployed"; date="2026-05-12";
       subtitle="AI/ML Engineer | GenAI Agents, RAG & Deployed Systems";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="AI/ML Engineer (IIT Hyderabad, AI) with 3+ years building and deploying GenAI agents, RAG systems, and multi-agent orchestration. Shipped an AI Cockpit with agent orchestration and a 12x-faster CI/CD migration agent adopted org-wide; built evaluation-driven RAG with hallucination detection for Visa. Seeking to deploy GenAI agents that solve real-world problems at scale." }
    @{ id="108"; slug="emaratech-ai-developer"; date="2026-05-14";
       subtitle="Artificial Intelligence Developer | Production LLM Apps, RAG & Agentic Systems";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Artificial Intelligence Developer (IIT Hyderabad, AI) with 3+ years building production LLM applications, RAG systems, and agentic automation. Shipped an AI Cockpit with LangGraph orchestration, MCP tool integrations, FastAPI serving, and LangSmith observability; built a 12x-faster CI/CD migration agent adopted across 10+ teams. Seeking to build reliable AI products for high-scale UAE digital services." }
    @{ id="109"; slug="bramwith-senior-ai-engineer"; date="2026-05-14";
       subtitle="Senior AI Engineer | FinTech GenAI, RAG & Agentic Automation";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Senior AI Engineer (IIT Hyderabad, AI) with 3+ years building production GenAI systems for enterprise and financial-services contexts. Built a Visa RAG explainability platform with hallucination checks and faithfulness evaluation, plus an AI Cockpit using LangGraph, MCP, FastAPI, and LangSmith; shipped a 12x-faster CI/CD migration agent with HITL controls. Seeking to build fintech-grade AI systems with reliability, traceability, and measurable business impact." }
    @{ id="110"; slug="dicetek-ai-engineer"; date="2026-05-14";
       subtitle="AI Engineer | LLM Systems, RAG Pipelines & Enterprise Automation";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="AI Engineer (IIT Hyderabad, AI) with 3+ years delivering enterprise LLM systems, RAG pipelines, and AI automation. Shipped an AI Cockpit with multi-agent orchestration, MCP tool use, FastAPI APIs, and LangSmith tracing; built RAG evaluation pipelines with RAGAS and a 12x-faster CI/CD migration agent adopted org-wide. Seeking to build practical AI systems for enterprise users in the UAE." }
    @{ id="111"; slug="flatgigs-full-stack-ai-engineer"; date="2026-05-14";
       subtitle="Full Stack AI Engineer | FastAPI, LLM Apps, RAG & Agentic Backends";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Full Stack AI Engineer (IIT Hyderabad, AI) with 3+ years building AI-powered backend systems, API services, and LLM application workflows. Built an AI Cockpit served via FastAPI with LangGraph agent orchestration, MCP integrations, and LangSmith observability; shipped a 12x-faster CI/CD migration agent and production RAG systems with evaluation harnesses. Strong fit for teams turning AI prototypes into product-grade applications." }
    @{ id="112"; slug="oryxsearch-mlops-ml-platform-engineer"; date="2026-05-14";
       subtitle="MLOps / ML Platform Engineer | LLMOps, Infra & Evaluation";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="MLOps / ML Platform Engineer (IIT Hyderabad, AI) with 3+ years building production LLM systems, evaluation pipelines, and AI automation infrastructure. Shipped an AI Cockpit with FastAPI serving, LangSmith observability, and MCP tool contracts; built a self-healing CI/CD migration agent for 770 Jenkins-to-GitLab jobs and RAG evaluation pipelines with RAGAS. Seeking to harden LLM and ML platforms for reliability, monitoring, and scale." }
    @{ id="113"; slug="reap-senior-software-engineer-ai-agents"; date="2026-05-14";
       subtitle="Senior Software Engineer, AI Agents | LangGraph, MCP & LLM Systems";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Senior Software Engineer focused on AI agents (IIT Hyderabad, AI) with 3+ years building production agentic systems, tool-using LLM workflows, and enterprise automation. Shipped an AI Cockpit with coordinator-specialist LangGraph agents, MCP integrations, structured-output validation, and FastAPI APIs; built a 12x-faster CI/CD migration agent with persistent state and HITL checkpoints. Seeking to build robust AI agent products at scale." }
    @{ id="114"; slug="cntxt-ai-lead-machine-learning-engineer"; date="2026-05-14";
       subtitle="Lead Machine Learning Engineer | Production GenAI, RAG & ML Systems";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Lead-leaning Machine Learning Engineer (IIT Hyderabad, AI) with 3+ years building production GenAI, RAG, and ML automation systems while mentoring engineers on agent development. Shipped an AI Cockpit with LangGraph orchestration and MCP integrations; built a 12x-faster CI/CD migration agent adopted across 10+ teams and a Visa RAG explainability platform with evaluation harnesses. Seeking a high-scope UAE AI role building reliable ML and LLM systems." }
    @{ id="115"; slug="faze3-ai-ml-devops-engineer"; date="2026-05-14";
       subtitle="AI/ML/DevOps Engineer | LLMOps, RAG, Agentic Workflows & CI/CD";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="AI/ML/DevOps Engineer (IIT Hyderabad, AI) with 3+ years bridging production GenAI, LLMOps, RAG, and DevOps automation. Built an AI Cockpit with LangGraph agents, MCP tool integrations, FastAPI serving, and LangSmith observability; won a company hackathon for a self-healing CI/CD migration agent that accelerated 770 Jenkins-to-GitLab migrations by 12x. Seeking to build governed AI/ML platforms and agentic workflows for UAE enterprises." }
    @{ id="116"; slug="almosafer-specialist-machine-learning"; date="2026-05-14";
       subtitle="Machine Learning Specialist | Applied ML, GenAI & Data Pipelines";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Machine Learning Specialist (IIT Hyderabad, AI) with 3+ years building applied ML, production GenAI, and data pipelines. Delivered enterprise RAG and agentic systems with LangGraph, FastAPI, and evaluation harnesses; built segmentation and uplift models for Walmart with 45% top-decile uplift and 13.4M-customer targeting. Seeking to build ML systems that improve high-scale travel and commerce products." }
    @{ id="117"; slug="bhatia-artificial-intelligence-engineer"; date="2026-05-14";
       subtitle="Artificial Intelligence Engineer | Enterprise AI, RAG & Automation";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Artificial Intelligence Engineer (IIT Hyderabad, AI) with 3+ years shipping enterprise AI systems, RAG workflows, and automation tools. Built an AI Cockpit with LangGraph agents, MCP integrations, FastAPI services, and LangSmith observability; delivered a 12x-faster CI/CD migration agent adopted across 10+ teams. Seeking to apply reliable AI automation to operational and enterprise workflows." }
    @{ id="118"; slug="bramwith-data-scientist-fintech"; date="2026-05-14";
       subtitle="Data Scientist | FinTech GenAI, RAG Evaluation & Applied ML";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Data Scientist (IIT Hyderabad, AI) with 3+ years combining applied ML, GenAI explainability, and production-grade data pipelines. Built a Visa RAG explainability platform with faithfulness and hallucination evaluation; delivered Walmart segmentation and uplift models with 45% top-decile uplift and optimized Snowflake/Spark pipelines by up to 1000x. Seeking a fintech data science role focused on explainable, reliable AI systems." }
    @{ id="119"; slug="jobgether-ai-research-engineer-rl"; date="2026-05-14";
       subtitle="AI Research Engineer | Evaluation-Driven LLM Systems & Applied ML";
       location="Nationality: Indian  |  Open to UAE remote/hybrid  |  Notice Period: 30 days";
       summary="AI Research Engineer (IIT Hyderabad, AI) with 3+ years building evaluation-driven LLM systems, RAG pipelines, and applied ML workflows. Built PersonaRAG with 37/37 pass rate across independent eval suites and 0 false positives on adversarial probes; shipped enterprise agentic systems with LangGraph and LLM-as-Judge evaluation. Seeking applied AI research roles where rigorous experimentation turns into production systems." }
    @{ id="120"; slug="lancesoft-ai-engineer"; date="2026-05-14";
       subtitle="AI Engineer | LLM Apps, RAG, FastAPI & Enterprise Automation";
       location="Nationality: Indian  |  Open to Ras Al Khaimah / UAE relocation  |  Notice Period: 30 days";
       summary="AI Engineer (IIT Hyderabad, AI) with 3+ years building LLM applications, RAG systems, and enterprise automation. Shipped an AI Cockpit with LangGraph orchestration, MCP tool integrations, FastAPI APIs, and LangSmith tracing; built a 12x-faster CI/CD migration agent and RAG evaluation pipelines with RAGAS. Seeking to build practical AI products for UAE enterprise users." }
    @{ id="121"; slug="virtusa-data-scientist"; date="2026-05-14";
       subtitle="Data Scientist | Applied ML, GenAI Explainability & Data Engineering";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Data Scientist (IIT Hyderabad, AI) with 3+ years across applied ML, GenAI explainability, and production data engineering. Built RAG-based explainability systems for Visa, segmentation and uplift modeling for Walmart with 45% top-decile uplift, and high-performance Spark/Snowflake pipelines with major runtime improvements. Seeking data science roles where modeling, data platforms, and AI systems connect to business impact." }
    @{ id="122"; slug="talabat-sr-data-scientist-ai-ml"; date="2026-05-14";
       subtitle="Senior Data Scientist | AI/ML, Experimentation & Data Pipelines";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Senior Data Scientist (IIT Hyderabad, AI) with 3+ years building ML pipelines, model evaluation workflows, and production GenAI systems. Delivered Walmart segmentation and uplift models with 45% top-decile uplift and 13.4M-customer targeting; built RAG explainability and evaluation systems for Visa and agentic automation at OpenText. Seeking to build AI/ML systems for marketplace, personalization, and operations use cases." }
    @{ id="123"; slug="ajman-university-data-scientist"; date="2026-05-14";
       subtitle="Data Scientist | AI Research, RAG Evaluation & Applied ML";
       location="Nationality: Indian  |  Open to Ajman / UAE relocation  |  Notice Period: 30 days";
       summary="Data Scientist (IIT Hyderabad, AI) with 3+ years applying ML, RAG evaluation, and production AI methods across enterprise settings. Built PersonaRAG with multi-query retrieval, cross-encoder reranking, and independent eval suites; shipped GenAI explainability systems and agentic automation with LangGraph and FastAPI. Seeking to contribute to applied AI, analytics, and research-driven data science work." }
    @{ id="124"; slug="dubai-holding-associate-director-data-scientist"; date="2026-05-14";
       subtitle="Data Science Lead | Applied ML, GenAI Strategy & Enterprise AI";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Lead-leaning Data Scientist (IIT Hyderabad, AI) with 3+ years delivering applied ML, GenAI systems, and enterprise AI adoption while mentoring engineers. Built an AI Cockpit adopted as a team-wide standard, a 12x-faster CI/CD migration agent adopted by 10+ teams, and business-impact ML pipelines for Walmart. Seeking high-scope UAE roles where data science, AI product delivery, and stakeholder impact intersect." }
    @{ id="125"; slug="global-software-solutions-senior-data-engineer"; date="2026-05-14";
       subtitle="Senior Data Engineer | ML Data Pipelines, Snowflake, Spark & AI Platforms";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Senior Data Engineer (IIT Hyderabad, AI) with 3+ years building ML-facing data pipelines, high-performance analytics marts, and AI platform backends. Built Walmart Spark/Snowflake pipelines with 7x faster datamarts and up to 1000x ETL runtime improvements; shipped FastAPI-backed GenAI systems and CI/CD automation for enterprise workflows. Seeking data engineering roles that support AI/ML systems at scale." }
    @{ id="126"; slug="inception-applied-scientist"; date="2026-05-14";
       subtitle="Applied Scientist | LLM Systems, RAG Evaluation & Production AI";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Applied Scientist (IIT Hyderabad, AI) with 3+ years building LLM systems, RAG evaluation pipelines, and applied ML workflows. Built PersonaRAG with 37/37 eval pass rate and 0 false positives on adversarial probes; shipped enterprise agentic AI with LangGraph, MCP tool contracts, and LangSmith observability. Seeking applied science roles that bridge research rigor and production AI impact." }
    @{ id="127"; slug="kartago-senior-ai-engineer-architect"; date="2026-05-16";
       subtitle="Senior AI Engineer / AI Architect | LLM Systems & Document Intelligence";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Senior AI Engineer (IIT Hyderabad, AI) with 3+ years building production LLM systems, document intelligence pipelines, and agentic retrieval workflows. Built PersonaRAG with multi-query retrieval, cross-encoder reranking, and 37/37 eval pass rate; shipped an enterprise AI Cockpit with LangGraph orchestration, MCP tool integrations, and structured-output validation. Seeking to build LLM-powered document intelligence and AI architecture at scale." }
    @{ id="128"; slug="bcg-x-forward-deployed-ai-engineer"; date="2026-05-16";
       subtitle="Forward Deployed AI Engineer | Agentic AI, LLM Systems & Enterprise Delivery";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Forward Deployed AI Engineer (IIT Hyderabad, AI) with 3+ years translating enterprise requirements into production agentic systems and LLM workflows. Shipped an AI Cockpit adopted as team standard; built a 12x-faster CI/CD migration agent adopted by 10+ enterprise teams; delivered GenAI explainability for Visa with structured evaluation. Combines technical depth with client-facing delivery speed and business impact tracking." }
    @{ id="129"; slug="fuse-energy-applied-ai-engineer"; date="2026-05-16";
       subtitle="Applied AI Engineer | GenAI Systems, Agentic Automation & Data Pipelines";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Applied AI Engineer (IIT Hyderabad, AI) with 3+ years shipping production GenAI systems, agentic automation, and data pipelines for enterprise. Built an AI Cockpit with LangGraph agents, MCP integrations, FastAPI serving, and LangSmith observability; delivered a 12x-faster CI/CD migration agent and RAG evaluation pipelines. Seeking to apply AI engineering depth to energy-sector automation and intelligent operations." }
    @{ id="130"; slug="insilico-medicine-machine-learning-engineer"; date="2026-05-16";
       subtitle="Machine Learning Engineer | Production ML, GenAI & Scientific AI Systems";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Machine Learning Engineer (IIT Hyderabad, AI) with 3+ years building production ML systems, GenAI workflows, and evaluation-driven AI pipelines. Delivered enterprise agentic systems with LangGraph and FastAPI; built RAG explainability for Visa with hallucination detection and faithfulness evaluation; shipped Walmart ML models with 45% top-decile uplift. Seeking ML engineering roles bridging applied research and production AI systems." }
    @{ id="131"; slug="saal-ai-senior-machine-learning-engineer"; date="2026-05-16";
       subtitle="Senior Machine Learning Engineer | Production ML, LLM Systems & AI Platforms";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Senior Machine Learning Engineer (IIT Hyderabad, AI) with 3+ years building production ML systems, LLM applications, and AI platforms at enterprise scale. Shipped an AI Cockpit with coordinator-specialist agent orchestration, MCP integrations, and LangSmith observability; delivered a 12x-faster CI/CD migration agent and evaluation-driven RAG pipelines. Seeking to build scalable ML and LLM systems at a UAE-native AI company." }
    @{ id="132"; slug="dyson-data-intelligence-ml-engineer"; date="2026-05-16";
       subtitle="Data Intelligence ML Engineer | Applied ML, Data Pipelines & AI Workflows";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Data Intelligence ML Engineer (IIT Hyderabad, AI) with 3+ years building production ML workflows, data pipelines, and AI systems. Delivered Walmart segmentation and uplift models (45% top-decile uplift, 13.4M customers); built Snowflake/Spark pipelines with up to 1000x ETL improvement; shipped LLM evaluation pipelines and RAG systems with RAGAS. Seeking to build ML-powered data intelligence products with measurable consumer impact." }
    @{ id="133"; slug="dyson-data-intelligence-mlops-engineer"; date="2026-05-16";
       subtitle="Data Intelligence MLOps Engineer | LLMOps, ML Infrastructure & AI Observability";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Data Intelligence MLOps Engineer (IIT Hyderabad, AI) with 3+ years building ML infrastructure, LLMOps pipelines, and AI observability systems. Built an AI Cockpit with LangSmith tracing, FastAPI serving, and Docker; automated 770 Jenkins-to-GitLab migrations with self-healing loops; built RAGAS evaluation harnesses for RAG reliability monitoring. Seeking to build MLOps and LLMOps infrastructure that keeps production AI systems reliable and observable." }
    @{ id="134"; slug="whiteshield-data-scientist-ai-economics"; date="2026-05-16";
       subtitle="Data Scientist | AI Economics, Applied ML & Policy Analytics";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Data Scientist (IIT Hyderabad, AI) with 3+ years applying ML, causal reasoning, and GenAI to business and policy problems. Delivered Walmart uplift modeling with 45% top-decile lift targeting 13.4M customers; built GenAI explainability platforms for financial AI systems at Visa; shipped evaluation-driven RAG pipelines. Seeking data science roles where rigorous quantitative methods and AI intersect with economic and policy impact." }
    @{ id="135"; slug="charterhouse-principal-ai-ml-engineer"; date="2026-05-16";
       subtitle="Principal AI/ML Engineer | LLM Systems, RAG & Agentic AI at Scale";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Principal-track AI/ML Engineer (IIT Hyderabad, AI) with 3+ years building production LLM systems, agentic AI, and RAG pipelines for enterprise. Shipped an AI Cockpit with coordinator-specialist agent patterns and MCP tool contracts adopted as team standard; built a 12x-faster CI/CD migration agent and evaluation-driven RAG for Visa. Seeking senior/principal AI roles where I can build high-impact systems and set technical direction." }
    @{ id="136"; slug="professional-me-principal-ai-engineer"; date="2026-05-16";
       subtitle="Principal AI Engineer | Agentic AI, LLM Systems & Enterprise GenAI";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Principal AI Engineer (IIT Hyderabad, AI) with 3+ years building production agentic AI, multi-agent orchestration, and enterprise LLM systems. Shipped an AI Cockpit with LangGraph coordinator-specialist agents, MCP tool contracts, FastAPI serving, and LangSmith observability; built a 12x-faster CI/CD migration agent adopted org-wide; delivered RAG explainability for Visa. Seeking principal AI roles that combine technical leadership with production GenAI impact." }
    @{ id="137"; slug="softserve-data-scientist-genai"; date="2026-05-16";
       subtitle="Data Scientist (GenAI) | LLM Systems, RAG Evaluation & GenAI Product Delivery";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="GenAI Data Scientist (IIT Hyderabad, AI) with 3+ years building LLM applications, evaluation-driven RAG systems, and GenAI product pipelines. Built PersonaRAG with 37/37 pass rate and 0 false positives; shipped an enterprise AI Cockpit with LangGraph orchestration and structured output validation; delivered Walmart ML models with measurable business uplift. Seeking GenAI data science roles turning experimental AI into production products." }
    @{ id="138"; slug="softserve-senior-mlops-engineer"; date="2026-05-16";
       subtitle="Senior MLOps Engineer | LLMOps, ML Infrastructure & CI/CD for AI";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Senior MLOps Engineer (IIT Hyderabad, AI) with 3+ years building LLMOps pipelines, ML infrastructure, and CI/CD for AI systems. Built an AI Cockpit with LangSmith observability, FastAPI serving, and Docker; automated 770 Jenkins-to-GitLab migrations with self-healing agent loops in under 1 month (from 12-month estimate); built RAG evaluation harnesses with RAGAS. Seeking to harden production AI systems with robust MLOps and LLMOps practices." }
    @{ id="139"; slug="epergne-ai-genai-lakehouse-engineer"; date="2026-05-16";
       subtitle="AI / GenAI & Lakehouse Engineer | LLM Systems, RAG & Data Platforms";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="AI/GenAI and Data Engineer (IIT Hyderabad, AI) with 3+ years building LLM applications, RAG pipelines, and high-performance data platforms. Shipped an AI Cockpit with LangGraph and FastAPI; built Walmart Snowflake/Spark analytics pipelines with 7x faster datamarts and 1000x ETL runtime improvement; delivered evaluation-driven RAG systems. Seeking roles combining GenAI application development with data lakehouse engineering." }
    @{ id="140"; slug="primis-artificial-intelligence-engineer"; date="2026-05-16";
       subtitle="Artificial Intelligence Engineer | LLM Apps, RAG & Agentic Systems";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Artificial Intelligence Engineer (IIT Hyderabad, AI) with 3+ years building production LLM applications, RAG systems, and agentic AI workflows. Shipped an AI Cockpit with multi-agent orchestration, MCP integrations, FastAPI services, and LangSmith observability; built a 12x-faster CI/CD migration agent adopted org-wide; delivered RAGAS evaluation for RAG reliability. Seeking AI engineering roles building practical, reliable AI systems." }
    @{ id="141"; slug="inception-senior-applied-scientist"; date="2026-05-16";
       subtitle="Senior Applied Scientist | LLM Research, RAG Evaluation & Production AI";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Senior Applied Scientist (IIT Hyderabad, AI) with 3+ years bridging AI research and production LLM systems. Built PersonaRAG with multi-query retrieval, cross-encoder reranking, LLM-as-Judge evaluation, and 37/37 pass rate across independent test suites; shipped enterprise agentic AI with LangGraph, MCP tool contracts, and LangSmith observability. Seeking applied science roles at research-led organizations where rigor and production impact intersect." }
    @{ id="142"; slug="analog-g42-senior-research-engineer"; date="2026-05-16";
       subtitle="Senior Research Engineer | AI Systems, LLM Infrastructure & Applied Research";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Senior Research Engineer (IIT Hyderabad, AI) with 3+ years building production AI systems, LLM infrastructure, and applied research pipelines. Shipped an enterprise AI Cockpit with coordinator-specialist agent patterns, MCP integrations, and FastAPI serving; built evaluation-driven RAG with RAGAS and LLM-as-Judge; delivered a 12x-faster CI/CD automation agent. Seeking to build research-grade AI systems at an industry-leading UAE AI lab." }
    @{ id="143"; slug="analog-g42-senior-scientist-speech-language"; date="2026-05-16";
       subtitle="Senior Scientist - Speech & Language | NLP, LLM Systems & Evaluation";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="NLP-focused AI Engineer (IIT Hyderabad, AI) with 3+ years building LLM systems, evaluation frameworks, and NLP pipelines. Built PersonaRAG with semantic retrieval, cross-encoder reranking, and LLM-as-Judge evaluation achieving 37/37 pass rate; shipped enterprise agentic AI with structured-output validation and LangSmith observability. Strong foundation in NLP, language models, and rigorous evaluation for production speech and language systems." }
    @{ id="144"; slug="mbzuai-applied-research-scientist"; date="2026-05-16";
       subtitle="Applied Research Scientist | LLM Systems, RAG & Production AI Research";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Applied Research Scientist (IIT Hyderabad, AI) with 3+ years combining AI research rigor with production system delivery. Built PersonaRAG with multi-query retrieval, LLM-as-Judge evaluation, and 37/37 independent test pass rate; shipped enterprise agentic AI systems and evaluation-driven RAG pipelines at OpenText. Seeking applied science roles at MBZUAI where research contributes directly to the frontier of AI and language technology." }
    @{ id="145"; slug="jobgether-ai-research-engineer-pretraining"; date="2026-05-16";
       subtitle="AI Research Engineer - Pre-training | LLM Systems, Evaluation & Applied ML";
       location="Nationality: Indian  |  Open to UAE remote/hybrid  |  Notice Period: 30 days";
       summary="AI Research Engineer (IIT Hyderabad, AI) with 3+ years building evaluation-driven LLM systems, applied ML pipelines, and production AI research workflows. Built PersonaRAG with 37/37 eval pass rate and 0 false positives on adversarial probes; shipped enterprise agentic AI with structured-output validation; delivered applied ML models with measurable business uplift at Walmart and Visa. Seeking AI research engineering roles contributing to LLM development and evaluation." }
    @{ id="146"; slug="hays-senior-ai-engineer-2"; date="2026-05-16";
       subtitle="Senior AI Engineer | Production GenAI, Agentic Systems & LLM Infrastructure";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Senior AI Engineer (IIT Hyderabad, AI) with 3+ years building production GenAI systems, agentic AI workflows, and LLM infrastructure for enterprise. Shipped an AI Cockpit with LangGraph multi-agent orchestration, MCP tool integrations, FastAPI serving, and LangSmith observability; built a 12x-faster CI/CD migration agent adopted org-wide; delivered evaluation-driven RAG for Visa. Seeking senior AI engineering roles where agentic systems and LLM infrastructure deliver real business value." }
    @{ id="147"; slug="marcura-generative-ai-solutions-engineer"; date="2026-05-16";
       subtitle="Generative AI Solutions Engineer | LLM Systems, RAG & Enterprise GenAI";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Generative AI Solutions Engineer (IIT Hyderabad, AI) with 3+ years building production GenAI solutions, RAG systems, and agentic workflows for enterprise domains. Shipped an AI Cockpit with LangGraph orchestration, FastAPI serving, and LangSmith observability; built RAG explainability for Visa financial AI with hallucination detection; delivered a 12x-faster CI/CD migration agent. Seeking to engineer GenAI solutions for maritime and logistics domains where reliability and traceability are paramount." }
    @{ id="148"; slug="kearney-data-ai-solution-architect"; date="2026-05-16";
       subtitle="Data & AI Solution Architect | LLM Systems, AI Strategy & Enterprise Architecture";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="AI Solution Architect (IIT Hyderabad, AI) with 3+ years designing and building production AI architectures, LLM systems, and data platforms. Architected an AI Cockpit with coordinator-specialist agent patterns and MCP tool contracts adopted as team standard; designed evaluation-driven RAG for financial AI at Visa; built Snowflake/Spark data platforms with 7x datamart acceleration. Combines architecture thinking with hands-on delivery across AI, data, and enterprise systems." }
    @{ id="149"; slug="xenonstack-solution-architect-agentic-systems"; date="2026-05-16";
       subtitle="Solution Architect - Agentic Systems | Multi-Agent AI, LangGraph & Enterprise AI";
       location="Nationality: Indian  |  Open to Dubai relocation  |  Notice Period: 30 days";
       summary="Agentic AI Architect (IIT Hyderabad, AI) with 3+ years designing and building production multi-agent systems, agentic workflows, and LLM infrastructure. Architected an AI Cockpit with coordinator-specialist LangGraph agents, MCP tool contracts, and structured-output validation adopted as team standard; built a 12x-faster CI/CD migration agent with autonomous error remediation and HITL checkpoints. Seeking to architect and deliver enterprise-grade agentic AI systems." }
    @{ id="150"; slug="liquidity-senior-data-scientist"; date="2026-05-16";
       subtitle="Senior Data Scientist | Applied ML, GenAI & Financial AI Systems";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Senior Data Scientist (IIT Hyderabad, AI) with 3+ years applying ML, GenAI, and data science to financial and enterprise problems. Built a Visa RAG explainability platform with hallucination detection and faithfulness evaluation; delivered Walmart segmentation and uplift models with 45% top-decile uplift targeting 13.4M customers; shipped production GenAI systems with LangGraph and FastAPI. Seeking senior DS roles in financial services where AI rigor and business impact align." }
    @{ id="151"; slug="hays-senior-machine-learning-engineer"; date="2026-05-16";
       subtitle="Senior Machine Learning Engineer | Production ML, LLM Systems & MLOps";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Senior Machine Learning Engineer (IIT Hyderabad, AI) with 3+ years building production ML systems, LLM applications, and MLOps pipelines. Shipped an AI Cockpit with LangGraph orchestration, LangSmith observability, and FastAPI serving; built evaluation-driven RAG and RAGAS harnesses; delivered Walmart uplift models with measurable business impact. Seeking senior ML engineering roles that combine model development, LLM systems, and reliable production deployment." }
    @{ id="152"; slug="cleveland-clinic-abu-dhabi-data-scientist"; date="2026-05-16";
       subtitle="Data Scientist | Healthcare AI, Applied ML & Clinical Analytics";
       location="Nationality: Indian  |  Open to Abu Dhabi relocation  |  Notice Period: 30 days";
       summary="Data Scientist (IIT Hyderabad, AI) with 3+ years applying ML, explainable AI, and production data pipelines to high-stakes analytical domains. Built GenAI explainability systems for Visa financial AI with hallucination detection and faithfulness evaluation; delivered Walmart segmentation models with 45% top-decile uplift; shipped agentic AI with structured-output validation and LLM-as-Judge evaluation. Seeking data science roles in healthcare where ML rigor, explainability, and clinical impact are priorities." }
    @{ id="153"; slug="synvert-lead-ai-ml-engineer"; date="2026-05-16";
       subtitle="Lead AI/ML Engineer | LLM Systems, Multi-Agent AI & Technical Leadership";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Lead-leaning AI/ML Engineer (IIT Hyderabad, AI) with 3+ years building production LLM systems, agentic AI, and ML pipelines while mentoring engineers on agent development. Shipped an AI Cockpit adopted as team standard and a 12x-faster CI/CD migration agent adopted by 10+ teams; built evaluation-driven RAG for Visa. Seeking lead AI/ML roles where I can combine hands-on engineering with technical mentorship and architecture ownership." }
    @{ id="154"; slug="clearpeaks-lead-ai-ml-engineer"; date="2026-05-16";
       subtitle="Lead AI/ML Engineer | LLM Systems, Data Platforms & GenAI Products";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Lead AI/ML Engineer (IIT Hyderabad, AI) with 3+ years building production LLM systems, GenAI products, and ML-facing data platforms. Shipped an AI Cockpit with LangGraph orchestration, FastAPI serving, and LangSmith observability; built Snowflake/Spark data platforms with 7x datamart acceleration; delivered evaluation-driven RAG pipelines. Seeking lead AI/ML roles combining GenAI product engineering with data platform expertise." }
    @{ id="155"; slug="nabat-senior-data-scientist-geospatial-ai"; date="2026-05-16";
       subtitle="Senior Data Scientist | Geospatial AI, Applied ML & Location Intelligence";
       location="Nationality: Indian  |  Open to UAE relocation  |  Notice Period: 30 days";
       summary="Senior Data Scientist (IIT Hyderabad, AI) with 3+ years applying ML, deep learning, and production AI to spatial and business intelligence problems. Delivered Walmart segmentation and uplift models processing 130M+ customers with spatial targeting; built evaluation-driven RAG systems and production ML pipelines with LangGraph and FastAPI. Seeking geospatial AI roles where ML, location intelligence, and data science deliver measurable real-world impact." }
)

if ($Ids.Count -gt 0) {
    $idSet = @{}
    foreach ($idArg in $Ids) {
        foreach ($id in ($idArg -split ",")) {
            $trimmed = $id.Trim()
            if ($trimmed) { $idSet[$trimmed] = $true }
        }
    }
    $jobs = @($jobs | Where-Object { $idSet.ContainsKey($_.id) })
}

if ($jobs.Count -eq 0) {
    Write-Output "No matching resume jobs selected."
    exit 0
}

Write-Output "Selected $($jobs.Count) resume job(s): $($jobs.id -join ', ')"

# Step 1: Generate all docx copies with text replacements
foreach ($job in $jobs) {
    $outName = "$($job.id)-$($job.slug)-$($job.date)"
    $outDocx = Join-Path $outputDir "$outName.docx"

    # Copy master
    Copy-Item $masterDocx $outDocx -Force

    # Open as zip, read document.xml, replace text, write back
    $zip = [System.IO.Compression.ZipFile]::Open($outDocx, [System.IO.Compression.ZipArchiveMode]::Update)
    $entry = $zip.Entries | Where-Object { $_.FullName -eq "word/document.xml" }
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xmlText = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()

    # Replace subtitle (& is &amp; in XML)
    $newSubtitle = $job.subtitle -replace '&', '&amp;'
    $xmlText = $xmlText -replace [regex]::Escape($originalSubtitle), $newSubtitle

    # Replace location
    $newLocation = $job.location
    $xmlText = $xmlText -replace [regex]::Escape($originalLocation), $newLocation

    # Replace summary
    $xmlText = $xmlText -replace [regex]::Escape($originalSummary), $job.summary

    # Delete old entry and create new one with modified content
    $entry.Delete()
    $newEntry = $zip.CreateEntry("word/document.xml", [System.IO.Compression.CompressionLevel]::Optimal)
    $writer = New-Object System.IO.StreamWriter($newEntry.Open())
    $writer.Write($xmlText)
    $writer.Close()

    $zip.Dispose()
    Write-Output "DOCX: $outName.docx"
}

if ($SkipPdf) {
    Write-Output "`nDone. $($jobs.Count) docx files generated. PDF conversion skipped."
    exit 0
}

# Step 2: Convert all docx to PDF using Word COM
Write-Output "`nStarting Word for PDF conversion..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0  # wdAlertsNone

foreach ($job in $jobs) {
    $outName = "$($job.id)-$($job.slug)-$($job.date)"
    $docxPath = Join-Path $outputDir "$outName.docx"
    $pdfPath = Join-Path $outputDir "$outName.pdf"

    if (Test-Path -LiteralPath $pdfPath) {
        Remove-Item -LiteralPath $pdfPath -Force
    }

    $doc = $word.Documents.Open($docxPath, $false, $true)
    $doc.ExportAsFixedFormat($pdfPath, 17)  # 17 = wdExportFormatPDF
    $doc.Close($false)

    Write-Output "PDF:  $outName.pdf"
}

$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

Write-Output "`nDone. $($jobs.Count) docx + $($jobs.Count) PDF files generated."
