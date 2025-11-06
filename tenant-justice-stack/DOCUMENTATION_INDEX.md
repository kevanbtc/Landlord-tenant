# Tenant Justice Stack – Documentation Index

**Complete Platform Documentation**  
**Status:** v0.1-alpha | November 6, 2025

---

## 📖 Documentation Map

### For Different Audiences

#### 👤 **Tenants / End Users**
Start here if you need legal help with housing:

1. **[README.md](./README.md)** – Overview, quick start (5 min read)
2. **[DEPLOYMENT_SETUP_GUIDE.md](./web3/DEPLOYMENT_SETUP_GUIDE.md)** – How to use the platform
3. **FAQ** (coming soon) – Common questions answered
4. **Legal Playbooks** in `legal/` folder – Jurisdiction-specific guides

**Time to first document:** ~20 minutes

---

#### 👨‍💼 **Lawyers / Legal Professionals**
Start here if you want to understand the system for clients:

1. **[README.md](./README.md)** – What this system does (5 min)
2. **[ARCHITECTURE.md](./ARCHITECTURE.md#1-data-model)** – Section 1: Data model (10 min)
3. **[PLATFORM_SUMMARY.md](./PLATFORM_SUMMARY.md)** – Executive overview (15 min)
4. **[legal/disclaimers.md](./legal/disclaimers.md)** – What we do/don't do (5 min)

**Time to understand system:** ~35 minutes

---

#### 👨‍💻 **Developers / Technical Team**
Start here if you're building the platform:

**Phase 0 (DevOps/Infrastructure):**
1. [README.md](./README.md) – Tech stack overview
2. [ROADMAP.md](./ROADMAP.md#phase-0-infrastructure-setup-week-1) – Phase 0 plan
3. Setup instructions: `make dev-setup`

**Phase 1 (Backend/AI):**
1. [ARCHITECTURE.md](./ARCHITECTURE.md) – Complete system design (30 min)
2. [DATA_SCHEMA.md](./DATA_SCHEMA.md) – Data structures & API (30 min)
3. [AGENTS.md](./AGENTS.md) – AI agent specs with Python code (45 min)
4. `backend/agents/base.py` – Start with this file

**Phase 2 (Data/Law):**
1. [ROADMAP.md](./ROADMAP.md#phase-2-law-packs--document-generation-weeks-3-4) – Phase 2 plan
2. [DATA_SCHEMA.md](./DATA_SCHEMA.md#1-core-schema-definitions)Section 1.4: Statute schema
3. `backend/data/law_packs/` – Law pack JSON format

**Phase 3 (Blockchain):**
1. `web3/BLOCKCHAIN_DEPLOYMENT_GUIDE.md` – Technical deep dive
2. `blockchain/contracts/TenantCaseRegistry.sol` – Smart contract
3. `blockchain/scripts/deploy.js` – Deployment automation

**Phase 4 (Frontend):**
1. [ARCHITECTURE.md](./ARCHITECTURE.md#4-frontend--tenant-ui) – Section 4: UI design
2. `frontend/src/components/` – Vue component structure
3. `frontend/README.md` (coming soon)

**Phase 5 (QA/Integration):**
1. [ROADMAP.md](./ROADMAP.md#phase-5-integration--qa-week-8) – Phase 5 plan
2. `backend/tests/fixtures.py` – Test data
3. `Makefile` – Build/test targets

**Time to understand codebase:** 2-3 hours

---

#### 🎯 **Project Manager / Team Lead**
Start here if you're coordinating the effort:

1. **[PLATFORM_SUMMARY.md](./PLATFORM_SUMMARY.md)** – What we've built & what's next (15 min)
2. **[ROADMAP.md](./ROADMAP.md)** – 8-week timeline with phases (20 min)
3. **[ARCHITECTURE.md](./ARCHITECTURE.md#8-deployment--rollout)** – Section 8: Deployment strategy (10 min)
4. **Team Roles section** of [ROADMAP.md](./ROADMAP.md#team-roles)

**Time to understand scope:** ~45 minutes

---

### 📚 Complete Documentation Breakdown

| Document | Purpose | Audience | Length | Time |
|----------|---------|----------|--------|------|
| **README.md** | Project intro, quick start, features, license | Everyone | 400 lines | 10 min |
| **ARCHITECTURE.md** | System design, data model, tech stack, deployment | Developers, technical leads | 1,200 lines | 30 min |
| **DATA_SCHEMA.md** | JSON schemas, API endpoints, validation, database | Backend developers | 800 lines | 30 min |
| **AGENTS.md** | AI agent specifications, Python code, testing | Backend/AI developers | 900 lines | 45 min |
| **ROADMAP.md** | 8-week development timeline, phases, team roles | Everyone involved | 600 lines | 25 min |
| **PLATFORM_SUMMARY.md** | What's been built, decisions needed, next steps | Project leads, existing team | 400 lines | 20 min |

**Total Documentation:** ~4,700 lines across 6 documents

---

## 🗂️ File Organization

```
tenant-justice-stack/
│
├── 📖 README.md                      ← START HERE (if new to project)
├── 📖 ARCHITECTURE.md                ← System design deep dive
├── 📖 DATA_SCHEMA.md                 ← Data structures & API
├── 📖 AGENTS.md                      ← AI implementation specs
├── 📖 ROADMAP.md                     ← Development timeline
├── 📖 PLATFORM_SUMMARY.md            ← Executive summary
├── 📖 THIS FILE (INDEX)              ← Navigation guide
│
├── 📁 docs/                          ← Additional documentation (coming)
│   ├── SETUP.md                      ← Developer environment setup
│   ├── API.md                        ← REST API reference
│   └── CONTRIBUTING.md               ← How to contribute
│
├── 📁 legal/                         ← Legal content & disclaimers
│   ├── disclaimers.md                ← Legal notice (not a lawyer)
│   ├── georgia_habitability.md       ← GA statute explanations
│   ├── mold_and_health.md            ← Health context for mold
│   ├── faq.md                        ← Frequently asked questions
│   └── resources.md                  ← Links to housing resources
│
├── 📁 backend/                       ← Python AI implementation (to be built)
│   ├── agents/
│   │   ├── base.py                   ← Base Agent class
│   │   ├── intake.py                 ← IntakeBotAgent
│   │   ├── timeline.py               ← TimelineBotAgent
│   │   ├── law_mapper.py             ← LawMappingAgent
│   │   └── ... (8 agents total)
│   ├── data/
│   │   ├── models.py                 ← Core data structures
│   │   └── schema.py                 ← JSON schema definitions
│   ├── law_packs/                    ← Jurisdiction statutes
│   │   ├── us_ga_habitability.json
│   │   ├── us_ca_habitability.json
│   │   └── us_ny_habitability.json
│   ├── templates/                    ← Jinja2 document templates
│   │   ├── demand_letter.j2
│   │   ├── complaint.j2
│   │   └── evidence_index.j2
│   ├── app.py                        ← Flask/FastAPI main app
│   ├── requirements.txt               ← Python dependencies
│   └── tests/
│       ├── test_agents.py
│       └── fixtures.py               ← Test data (Patterstone case)
│
├── 📁 blockchain/                    ← Solidity & Hardhat (partially complete)
│   ├── contracts/
│   │   └── TenantCaseRegistry.sol    ← Main smart contract
│   ├── scripts/
│   │   └── deploy.js                 ← Deployment automation
│   ├── hardhat.config.js             ← Network configuration (6 networks)
│   └── package.json                  ← Node dependencies
│
├── 📁 frontend/                      ← Vue.js UI (to be built)
│   ├── src/
│   │   ├── components/
│   │   │   ├── TenantIntake.vue       ← Main interview form
│   │   │   ├── EvidenceUpload.vue
│   │   │   ├── CaseReview.vue
│   │   │   └── DocumentGenerator.vue
│   │   └── App.vue
│   ├── vite.config.js
│   └── package.json
│
├── 📁 web3/                          ← Patterstone proof of concept ✅
│   ├── PatterstoneCase.sol           ← Smart contract (compiled)
│   ├── scripts/deploy.js             ← Deployment script (tested)
│   ├── hardhat.config.js             ← Configuration (all 6 networks)
│   ├── .env                          ← Ready for user credentials
│   ├── verification_portal.html      ← Public blockchain viewer
│   ├── DEPLOYMENT_SETUP_GUIDE.md
│   ├── DEPLOYMENT_STATUS_REPORT.md
│   └── MULTI_CHAIN_DEPLOYMENT.md
│
├── 📁 examples/                      ← Sample cases & outputs
│   ├── patterstone_case/             ← Original proof of concept
│   │   ├── case.json
│   │   ├── evidence/
│   │   │   ├── photos/
│   │   │   └── messages/
│   │   └── outputs/
│   │       ├── demand_letter.docx
│   │       ├── complaint_draft.docx
│   │       └── evidence_index.pdf
│   └── sample_cases/                 ← Additional test cases
│
├── 📁 .github/
│   └── workflows/
│       └── ci.yml                    ← GitHub Actions CI/CD (coming)
│
├── docker-compose.yml                ← Local development environment
├── Makefile                          ← Build targets
├── .gitignore                        ← Git configuration
└── LICENSE                           ← MIT License
```

---

## 🚀 Getting Started by Role

### I'm a Tenant
```
1. Open README.md
2. Go to "Getting Started for End Users"
3. Follow the 5-minute quick start
4. Build your case (15 minutes)
```

### I'm a Lawyer Reviewing This
```
1. Read README.md (section: "For Lawyers & Organizations")
2. Skim ARCHITECTURE.md (focus on data model)
3. Read PLATFORM_SUMMARY.md (section: "Legal Decisions")
4. Review legal/disclaimers.md
5. Contact: legal@tenant-justice-stack.io
```

### I'm a Python Developer
```
1. Read ARCHITECTURE.md (full document)
2. Read AGENTS.md (full document)
3. Review DATA_SCHEMA.md (sections 1-3)
4. Clone repo: git clone <url>
5. Run: make dev-setup
6. Start: backend/agents/base.py
```

### I'm a Blockchain Developer
```
1. Read web3/BLOCKCHAIN_DEPLOYMENT_GUIDE.md
2. Review blockchain/hardhat.config.js
3. Review blockchain/contracts/TenantCaseRegistry.sol
4. Check web3/deployment scripts
5. Test on Sepolia testnet first
```

### I'm a Frontend Developer
```
1. Read README.md (tech stack section)
2. Read ARCHITECTURE.md (section 4: Frontend)
3. Review frontend/src/components structure
4. Start with TenantIntake.vue
5. Follow Vue 3 + Vite conventions
```

### I'm a Project Manager
```
1. Read PLATFORM_SUMMARY.md (15 min)
2. Read ROADMAP.md (25 min)
3. Review team roles section of ROADMAP.md
4. Create GitHub milestones for Phases 0-5
5. Assign tasks to team members
```

---

## 📋 Documentation Checklist

### ✅ Completed (This Session)
- [x] README.md – Project overview, quick start, features
- [x] ARCHITECTURE.md – Complete system design
- [x] DATA_SCHEMA.md – JSON schemas, API endpoints
- [x] AGENTS.md – AI specifications with Python code
- [x] ROADMAP.md – 8-week development timeline
- [x] PLATFORM_SUMMARY.md – Executive summary

### 🔄 In Progress (Next)
- [ ] docs/SETUP.md – Developer environment setup
- [ ] docs/API.md – REST API reference (OpenAPI/Swagger)
- [ ] docs/CONTRIBUTING.md – Contribution guidelines
- [ ] legal/disclaimers.md – Legal notice
- [ ] legal/georgia_habitability.md – GA statute explainers

### 📝 TODO (Future)
- [ ] User guide (non-technical, step-by-step)
- [ ] Video tutorials (screen recordings)
- [ ] Architecture decision records (ADRs)
- [ ] Security & privacy documentation
- [ ] Deployment runbook (production)
- [ ] Troubleshooting guide

---

## 🎯 Quick Navigation

**I want to...**

| Task | Read This |
|------|-----------|
| Understand what this project does | [README.md](./README.md) |
| See the system architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Learn about data structures | [DATA_SCHEMA.md](./DATA_SCHEMA.md) |
| Implement AI agents | [AGENTS.md](./AGENTS.md) |
| Plan the development | [ROADMAP.md](./ROADMAP.md) |
| Get executive summary | [PLATFORM_SUMMARY.md](./PLATFORM_SUMMARY.md) |
| Deploy Patterstone case | [DEPLOYMENT_SETUP_GUIDE.md](./web3/DEPLOYMENT_SETUP_GUIDE.md) |
| Understand legal basis | [legal/disclaimers.md](./legal/disclaimers.md) |
| Set up development | `make dev-setup` |
| Run tests | `make test` |
| View project status | [PLATFORM_SUMMARY.md](./PLATFORM_SUMMARY.md) |

---

## 📊 Documentation Statistics

| Metric | Value |
|--------|-------|
| Total Lines | 4,700+ |
| Total Words | ~85,000 |
| Code Examples | 50+ |
| JSON Schemas | 6 |
| API Endpoints | 10+ |
| Use Cases Documented | 5 |
| Phases Planned | 5 |
| Languages | 5 (Markdown, Python, Solidity, JavaScript, Vue) |
| Hours to Read All | ~3 hours |
| Hours to Implement | ~8 weeks (320 hours) |

---

## 🔗 Cross-References

### Architecture references:
- ARCHITECTURE.md links to DATA_SCHEMA.md (data model)
- ARCHITECTURE.md links to AGENTS.md (AI specs)
- DATA_SCHEMA.md links to API endpoints
- AGENTS.md includes Python implementation sketches

### Roadmap references:
- ROADMAP.md phases reference specific documentation
- ROADMAP.md Phase 2 references DATA_SCHEMA.md law packs
- ROADMAP.md Phase 1 references AGENTS.md

### Deployment references:
- web3/DEPLOYMENT_SETUP_GUIDE.md references hardhat.config.js
- PLATFORM_SUMMARY.md references ROADMAP.md phases

---

## 📞 Getting Help

**If you're stuck:**

1. **Check Documentation**
   - Use Cmd+F to search within documents
   - Check "I want to..." table above
   - Read FAQ section (legal/faq.md)

2. **Check Code Examples**
   - backend/tests/fixtures.py – Real case data
   - AGENTS.md Section 8 – Python code samples
   - blockchain/scripts/ – Deployment examples

3. **Ask for Help**
   - Open GitHub Issue with details
   - Post in GitHub Discussions
   - Email: help@tenant-justice-stack.io (coming soon)

---

## 🎓 Learning Path

### Beginner (New to project)
1. README.md (10 min)
2. PLATFORM_SUMMARY.md (20 min)
3. Pick a role below

### Intermediate (Contributing code)
1. ARCHITECTURE.md (30 min)
2. Role-specific documentation (30-60 min)
3. Clone repo and run `make dev-setup` (15 min)
4. Read relevant source code (30-90 min)

### Advanced (Project lead)
1. All documentation (3 hours)
2. Review all source code (2-4 hours)
3. Plan sprints based on ROADMAP.md (1 hour)
4. Start Phase 0 (infrastructure)

---

## 📄 Version & License

**Documentation Version:** 0.1-alpha  
**Last Updated:** November 6, 2025  
**License:** MIT (code), CC-BY-4.0 (documentation)

**Copyright:** 2025 Tenant Justice Stack Contributors  
**License:** Open Source (MIT)

---

**Ready to dive in? [Start with README.md](./README.md) →**

---

*Navigation last updated: November 6, 2025*
