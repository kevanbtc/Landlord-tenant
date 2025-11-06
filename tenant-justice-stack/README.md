# 🏛️ Tenant Justice Stack

**Empowering tenants with AI-powered legal preparation and blockchain-anchored evidence.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-tenant--justice--stack-blue?logo=github)](https://github.com/yourusername/tenant-justice-stack)
[![Status: Early Development](https://img.shields.io/badge/Status-Early%20Development-orange)]()

---

## What is This?

The **Tenant Justice Stack** is a free, open-source platform that helps low-income tenants facing housing crises (habitability violations, mold, water damage, lack of repairs) prepare professional-grade legal cases **without a lawyer**.

### The Problem
- Most tenants can't afford lawyers
- They don't know their rights
- They lack proof their landlord knew about problems
- Landlords often deny responsibility or delay repairs

### The Solution
1. **AI-Powered Case Builder** – Tenants tell their story; AI extracts facts, timelines, applicable laws
2. **Document Generator** – Automatically creates demand letters, complaints, evidence indexes
3. **Blockchain Registry** – Anchors case evidence on immutable ledgers (Polygon, Ethereum)
4. **Public Verification** – Lawyers, courts, media can independently verify evidence

### Who It Serves
- Renters facing habitability violations
- Tenants without legal representation
- Legal aid organizations scaling their impact
- Housing courts seeking verified evidence

---

## Quick Start

### For Tenants (5 minutes)

1. Visit **[tenant-justice-stack.io](https://tenant-justice-stack.io)** (coming soon)
2. Click **"Build Your Case"**
3. Answer guided questions (~15 min)
4. Upload photos, emails, receipts
5. Download your documents (demand letter, complaint draft, evidence index)
6. Optionally register on blockchain for permanent verification

**Cost:** Completely FREE (or $1-5 if registering on blockchain)

### For Developers (10 minutes)

```bash
# Clone the repo
git clone https://github.com/yourusername/tenant-justice-stack
cd tenant-justice-stack

# Set up development environment
make dev-setup

# Start local services
docker-compose up

# Run tests
pytest backend/tests/ -v

# Open http://localhost:3000 in browser
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           TENANT FRONTEND (Vue.js)                      │
│    Guided intake → case builder → document downloads   │
│         verification portal (public, read-only)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│          AI SWARM (Python Backend)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Intake  │→ │ Timeline │→ │   Law    │→ ...         │
│  │   Bot    │  │   Bot    │  │   Bot    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  Generates: Demand letters, complaints, evidence index  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│    BLOCKCHAIN LAYER (Solidity + Hardhat)               │
│                                                          │
│  ┌────────────────────┐      ┌──────────────────────┐  │
│  │ Smart Contract     │  ←→  │ IPFS Storage        │  │
│  │ TenantCaseRegistry │      │ (Evidence Files)    │  │
│  └────────────────────┘      └──────────────────────┘  │
│                                                          │
│  Multi-chain: Polygon, Ethereum, Arbitrum, Optimism   │
└─────────────────────────────────────────────────────────┘
```

**Read more:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Project Structure

```
tenant-justice-stack/
├── backend/                    # Python AI agents, orchestration, APIs
│   ├── agents/                 # 8 AI agent classes
│   ├── law_packs/              # Jurisdiction-specific statutes (GA, CA, NY)
│   ├── templates/              # Jinja2 document templates
│   ├── app.py                  # Flask/FastAPI main app
│   └── requirements.txt        # Python dependencies
│
├── blockchain/                 # Solidity smart contracts, deployment
│   ├── contracts/
│   │   └── TenantCaseRegistry.sol  # Main registry contract
│   ├── scripts/deploy.js       # Hardhat deployment script
│   ├── hardhat.config.js       # 6-network configuration
│   └── package.json            # Node dependencies
│
├── frontend/                   # Vue.js UI
│   ├── src/
│   │   ├── components/         # Vue components (intake, upload, review)
│   │   ├── pages/              # Page layouts
│   │   └── App.vue             # Main app
│   └── vite.config.js          # Build config
│
├── legal/                      # Legal playbooks, disclaimers, resources
│   ├── georgia_habitability.md
│   ├── disclaimers.md
│   └── faq.md
│
├── docs/                       # Developer documentation
│   ├── ARCHITECTURE.md         # System design
│   ├── DATA_SCHEMA.md          # JSON schemas
│   ├── AGENTS.md               # AI agent specifications
│   ├── ROADMAP.md              # Development timeline
│   ├── API.md                  # API endpoints
│   └── SETUP.md                # Developer setup
│
└── docker-compose.yml          # Local dev environment
```

---

## Key Features

### ✅ Current (MVP)
- [x] Case documentation and timeline generation
- [x] Blockchain foundation (Patterstone proof of concept)
- [x] Architecture and schema documentation
- [x] AI agent framework (skeleton)

### 🔄 In Development (Phase 1-2)
- [ ] AI swarm implementation (8 agents)
- [ ] Georgia law pack (5+ statutes)
- [ ] Document generation (demand letter, complaint, evidence index)
- [ ] Vue.js intake UI
- [ ] Blockchain case registration

### 🗺️ Planned (Phase 3+)
- [ ] Multi-state support (CA, NY, TX)
- [ ] Additional issue types (pest, electrical, gas)
- [ ] Tenant community forum
- [ ] Lawyer referral network
- [ ] Insurance subrogation module
- [ ] Code enforcement integration

---

## Data & Privacy

### What We Collect
- Case facts (property address, issues, timeline)
- Evidence (photos, emails, documents)
- Optional: tenant contact info (if registering on blockchain)

### What We Don't Do
- ✅ We don't store data on centralized servers (optional IPFS storage)
- ✅ We don't share with landlords or law enforcement
- ✅ We don't require payment (blockchain optional, costs $1-5)

### Blockchain Registration (Optional)
If you choose to register your case on blockchain:
- Your case summary becomes **public and permanent**
- Anyone can verify your evidence (lawyers, courts, media)
- You can revoke access but evidence remains on blockchain
- Recommended for strong negotiating position

**Read more:** [Privacy Policy](./legal/privacy.md) (coming soon)

---

## Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Vue.js 3 + Vite | Fast, responsive, beginner-friendly |
| **Backend** | Python 3.11 + FastAPI | Excellent for NLP/AI agents |
| **Blockchain** | Solidity 0.8.20 + Hardhat | EVM standard, mature tooling |
| **Templates** | Jinja2 | Powerful document generation |
| **Storage** | IPFS + Pinata | Decentralized, permanent |
| **Testing** | pytest + Vitest | Comprehensive coverage |
| **DevOps** | Docker + GitHub Actions | Reproducible, scalable |

---

## Getting Started

### For End Users (Non-Technical)
1. Go to **[tenant-justice-stack.io](https://tenant-justice-stack.io)**
2. Click **"Build Your Case"**
3. Follow the 15-minute interview
4. Download your documents
5. Share with landlord or attorney

**No coding required. No account needed.**

### For Developers

#### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git

#### Installation
```bash
# Clone repo
git clone https://github.com/yourusername/tenant-justice-stack
cd tenant-justice-stack

# Install dependencies
make dev-setup

# Start services (backend, frontend, IPFS)
docker-compose up

# Run tests
make test

# Start frontend dev server (http://localhost:3000)
cd frontend && npm run dev
```

#### First Steps
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
2. Review [DATA_SCHEMA.md](./DATA_SCHEMA.md) for data structures
3. Check out [AGENTS.md](./AGENTS.md) for AI implementation
4. Look at [ROADMAP.md](./ROADMAP.md) for development phases

**Read more:** [SETUP.md](./docs/SETUP.md)

---

## Legal Notice ⚖️

### Disclaimer
🚨 **This is NOT a substitute for legal advice.** 
- The Tenant Justice Stack is an educational tool
- It does NOT create attorney-client relationships
- You should consult a licensed attorney before taking legal action
- This platform may not apply to your specific situation

### Licensing
- Code: [MIT License](./LICENSE)
- Documentation: [Creative Commons BY-4.0](./LICENSE-CC)
- Legal playbooks: Educational only (not legal advice)

### For Lawyers & Organizations
- This tool is designed to complement (not replace) legal representation
- Consider partnering with us to provide pro bono services
- Contact: [legal@tenant-justice-stack.io](mailto:legal@tenant-justice-stack.io)

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How to Help
- **Lawyers:** Review legal content, add state-specific statutes
- **Developers:** Build agents, improve UI, add features
- **Testers:** Report bugs, suggest improvements
- **Translators:** Help us reach non-English speakers
- **Funders:** Support continued development

---

## Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| **MVP** | Weeks 1-8 | Core AI swarm, GA law pack, simple UI |
| **Beta** | Weeks 9-16 | Multi-state support, lawyer partnership |
| **Scale** | Weeks 17+ | Community features, insurance integration |

**Full roadmap:** [ROADMAP.md](./ROADMAP.md)

---

## Example Output

**Input:** Tenant fills out intake form about 5-month water leak, mold, no repairs

**Output:** 
- ✅ Demand letter (customized to Georgia law)
- ✅ Evidence timeline (dates, witnesses, notifications)
- ✅ Applicable statutes (O.C.G.A. § 44-7-13, HB 404)
- ✅ Damages calculation ($22,700 conservative, $50K+ potential)
- ✅ Anticipated landlord defenses + rebuttals
- ✅ Optional: Blockchain registration with public verification link

---

## Community & Support

### Questions?
- **FAQ:** [legal/faq.md](./legal/faq.md)
- **GitHub Discussions:** [Discussions](https://github.com/yourusername/tenant-justice-stack/discussions)
- **Email:** hello@tenant-justice-stack.io

### Stay Updated
- ⭐ Star the repo to show support
- 🐦 Follow us on Twitter [@TenantJustice](https://twitter.com/tenantjustice)
- 📧 Sign up for updates at [tenant-justice-stack.io](https://tenant-justice-stack.io)

### Partner With Us
- Legal Aid Organizations
- Law Schools
- Housing Justice Groups
- Government Housing Agencies

---

## Proof of Concept: Patterstone Case

We've tested the system with a real habitability case:

**Tenant:** Yoda Burns  
**Property:** 3530 Patterstone Drive, Alpharetta GA  
**Issue:** 5-month water leak, mold, no repairs  
**Outcome:** Case prepared, blockchain registered, $50K potential damages documented

**View the case:** [examples/patterstone_case/](./examples/patterstone_case/)

---

## Metrics & Impact Goals

| Goal | Metric | Target |
|------|--------|--------|
| **Accessibility** | Tenants served | 10,000+ in first year |
| **Quality** | Case outcomes | 70%+ favorable resolution |
| **Efficiency** | Case prep time | <30 minutes per case |
| **Coverage** | States covered | All 50 states (long-term) |

---

## Citation

If you use or reference this project, please cite as:

```bibtex
@software{tenant_justice_stack_2025,
  title = {Tenant Justice Stack},
  subtitle = {AI-Powered Legal Case Preparation and Blockchain Evidence Registry},
  author = {[Contributors]},
  year = {2025},
  url = {https://github.com/yourusername/tenant-justice-stack},
  license = {MIT}
}
```

---

## Funding & Support

This project is **100% open-source and free**. If you'd like to support development:

- **Donate:** [Open Collective](https://opencollective.com/tenant-justice-stack) (coming soon)
- **Sponsor:** Become a corporate sponsor
- **Volunteer:** Contribute code, legal expertise, or translations
- **Spread the word:** Tell renters about us

---

## License

- **Code:** [MIT License](./LICENSE)
- **Documentation:** [Creative Commons Attribution 4.0](./LICENSE-CC)
- **Legal Content:** Educational only; consult attorneys for legal advice

---

## Acknowledgments

Built with ❤️ for housing justice.

Special thanks to:
- Legal aid organizations and tenant advocates
- Housing rights experts who reviewed our work
- Open-source blockchain community
- Every person fighting for safe, dignified housing

---

## Status

🚧 **This is early-stage software.** We're actively developing and welcome feedback.

- ✅ Architecture designed
- ✅ Proof of concept complete (Patterstone case)
- ✅ Blockchain infrastructure tested
- 🔄 AI agents: in development
- 🔄 UI: in development
- 🔄 Law packs: expanding

**Latest Release:** v0.1-alpha (December 2025)  
**Next Milestone:** v0.2-beta (February 2026)

---

**Let's build justice for renters. [Get started.](./docs/SETUP.md)**

---

<div align="center">

Made with 🏛️ for justice  
[Home](https://tenant-justice-stack.io) • [Docs](./docs/) • [GitHub](https://github.com/yourusername/tenant-justice-stack) • [Twitter](https://twitter.com/tenantjustice)

</div>
