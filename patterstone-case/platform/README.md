# TENANT JUSTICE PLATFORM

**The World's Most Powerful Tenant Defense System**

AI-Powered Legal Intelligence + Blockchain-Verified Evidence + Dirt-Cheap SaaS Pricing

---

## 🎯 WHAT THIS IS

A comprehensive platform that turns tenant stories into legal weapons:

- **AI Swarm** (9 specialized agents) = Your 24/7 law firm brain
- **Blockchain Evidence** = Tamper-proof, timestamped case records
- **Legal Database** = Every tenant law in all 50 states
- **Document Engine** = Court-ready legal documents in minutes
- **Public Case Explorer** = Expose bad landlords permanently

**Cost:** $29-$79/month (vs. $5,000+ for a lawyer)

---

## 🚀 QUICK START

### 1. Installation

```bash
cd platform
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
# OpenAI for AI agents
OPENAI_API_KEY=your_openai_key

# Blockchain (for evidence minting)
ETHEREUM_RPC_URL=your_alchemy_url
WALLET_PRIVATE_KEY=your_wallet_key
CONTRACT_ADDRESS=deployed_contract_address

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tenant_justice

# IPFS (for decentralized storage)
IPFS_API_KEY=your_pinata_or_web3storage_key

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App
NODE_ENV=development
PORT=3000
```

### 3. Run the Platform

```bash
# Start development server
npm run dev

# Run AI agents pipeline
npm run agent:process <caseId>

# Deploy blockchain contracts
npm run blockchain:deploy

# Seed legal database
npm run legal:seed
```

---

## 📁 PROJECT STRUCTURE

```
platform/
├── agents/                    # AI Agent System
│   ├── agent_intake.js       # Story → Structured data
│   ├── agent_legal_mapper.js # Facts → Laws
│   ├── agent_damages.js      # Calculate money owed
│   ├── agent_timeline.js     # Build chronological timeline
│   ├── agent_health.js       # Health risk assessment
│   ├── agent_document_drafter.js  # Generate legal docs
│   ├── agent_defense_simulator.js # Predict defenses
│   ├── agent_rebuttal.js     # Counter-arguments
│   └── agent_orchestrator.js # Run full pipeline
│
├── legal-database/           # Tenant Law Library
│   ├── statutes/            # All 50 states
│   ├── case-law/            # Precedents
│   ├── templates/           # Legal document templates
│   └── seed/                # Database seeding scripts
│
├── blockchain/              # Evidence Registry
│   ├── contracts/           # Smart contracts
│   ├── scripts/             # Deployment scripts
│   └── verification/        # Public verification portal
│
├── web-app/                 # Frontend Application
│   ├── pages/               # Next.js pages
│   ├── components/          # React components
│   ├── api/                 # API routes
│   └── lib/                 # Utilities
│
├── templates/               # Document Templates
│   ├── demand-letters/
│   ├── complaints/
│   ├── timelines/
│   └── evidence-indexes/
│
└── tests/                   # Test suite
    ├── agents/              # Agent tests
    ├── integration/         # End-to-end tests
    └── fixtures/            # Sample cases
```

---

## 🤖 THE AI AGENTS

### 1. **Intake Specialist**
Converts raw stories into structured case data
- **Input:** "My landlord won't fix the leak..."
- **Output:** Clean JSON with parties, dates, issues, timeline

### 2. **Timeline Architect**
Builds forensic-grade chronological timeline
- **Input:** Messages, photos, receipts
- **Output:** Dated events linked to evidence

### 3. **Legal Mapper** 🧠
Maps facts to laws and legal theories
- **Input:** Jurisdiction + fact pattern
- **Output:** Violated statutes, legal theories, case strength

### 4. **Health & Safety Analyst**
Assesses health risks and code violations
- **Input:** Photos of mold, leaks, etc.
- **Output:** Health risk level, building code violations

### 5. **Damages Calculator** 💰
Calculates money owed
- **Input:** Rent, duration, conditions
- **Output:** Conservative & aggressive estimates ($15K-$50K+)

### 6. **Document Drafter** 📄
Generates all legal documents
- **Output:** Demand letters, complaints, timelines, evidence indexes

### 7. **Defense Simulator**
Predicts landlord's defense strategy
- **Output:** Likely arguments, weak points

### 8. **Rebuttal Engine**
Pre-writes responses to defense arguments
- **Output:** Counter-arguments with evidence citations

### 9. **Orchestrator**
Runs the full pipeline and ensures consistency

---

## 💰 PRICING TIERS

### **JUSTICE STARTER** - $29/month
- AI case analysis
- Legal violation mapping
- Damages calculator
- 1 demand letter + complaint draft
- Basic blockchain anchoring
- Up to 50 evidence items

**Replaces $1,500+ in paralegal work**

### **JUSTICE PRO** - $79/month
- Everything in Starter
- Unlimited documents
- Defense simulation + rebuttals
- Multi-chain evidence minting
- Up to 500 evidence items
- Lawyer matching
- Public case page (optional)

**Replaces $5,000+ in legal prep**

### **JUSTICE WARRIOR** - $199/month
- Up to 5 active cases
- Advanced analytics
- Media kit generator
- Custom templates
- API access
- Expert witness database

**Replaces $20,000+ in legal work**

---

## ⛓️ BLOCKCHAIN EVIDENCE LAYER

### What Gets Anchored

1. **Case Summary** → IPFS → Blockchain
2. **Evidence Items** (photos, messages, docs) → IPFS → Blockchain
3. **Timestamps** = Proof evidence existed at specific date
4. **Public Verification** = Anyone can verify authenticity

### Chains Supported

- Ethereum Mainnet (flagship)
- Polygon (low-cost)
- Arbitrum (L2 speed)
- Sepolia/Goerli (testing)

### Smart Contract

```solidity
function registerCase(caseId, jurisdiction, ipfsHash)
function registerEvidence(caseId, evidenceId, ipfsHash)
function getCase(caseId) → returns case data
function getEvidence(caseId, evidenceId) → returns evidence data
```

---

## 📚 LEGAL DATABASE

### Coverage

- **Federal:** FHA, ADA, lead disclosure, HUD standards
- **State:** All 50 states
  - Landlord-tenant statutes
  - Security deposit laws
  - Habitability standards
  - Repair/deduct rights
  - Retaliation protections
  - Attorney fee statutes
- **Local:** Major cities (NYC, LA, Chicago, Atlanta, etc.)
  - Rent control
  - Local housing codes
  - Building safety standards

### Example Statutes (Georgia)

- **O.C.G.A. § 44-7-13** - Duty to keep premises in repair
- **O.C.G.A. § 44-7-14** - Notice requirements
- **O.C.G.A. § 13-6-11** - Attorney fees (bad faith)
- **HB 404 (Safe at Home Act)** - Habitability protections
- **O.C.G.A. § 44-7-20** - Constructive eviction

---

## 🧪 TESTING

### Run Tests

```bash
# All tests
npm test

# Agent tests only
npm run test:agents

# Integration tests
npm run test:integration

# Test with sample case (Patterstone)
npm run test:case patterstone
```

### Sample Case

The **3530 Patterstone Drive case** is included as a test fixture:
- 5 months of water leaks + mold
- Lost bathroom
- 2 children affected
- Multiple violations
- $40K-$70K in damages

---

## 🌐 DEPLOYMENT

### Production Deployment

```bash
# Deploy smart contracts to mainnet
npm run blockchain:deploy:mainnet

# Build frontend
npm run build

# Deploy to Vercel
vercel --prod

# Run migrations
npm run db:migrate:prod
```

### Environment Variables (Production)

All sensitive keys should be in production `.env` (not committed to git).

---

## 🤝 INTEGRATIONS

### Lawyer Network
- Lawyers browse cases in their jurisdiction
- See AI-generated documents
- Accept cases with one click
- Platform takes 10% referral fee

### Data Products (Anonymized)
- Bad landlord database
- Market research (housing quality data)
- Compliance training for property managers

### White Label
- Sell platform to legal aid orgs
- Tenant unions
- Law firms
- $10K-$100K per license

---

## 📊 SUCCESS METRICS

### User Metrics
- Sign-ups: Target 1,000 in Month 1
- Conversion (Free → Paid): 15%
- Retention: 70% MoM

### Financial Metrics
- MRR Month 3: $10K
- MRR Month 6: $50K
- MRR Month 12: $250K
- CAC: < $50
- LTV: > $200
- LTV/CAC: > 4x

### Impact Metrics
- Total Damages Calculated: $10M in Year 1
- Cases Won/Settled: Track outcomes
- Bad Landlords Exposed: Public database

---

## 🔒 SECURITY & PRIVACY

### Data Protection
- PII encryption at rest
- Anonymization for public case pages
- Optional private evidence (encrypted IPFS)

### Compliance
- GDPR compliant (EU tenants)
- SOC 2 Type II (in progress)
- Attorney-client privilege considerations

---

## 🚨 DISCLAIMER

This platform provides **legal information and document preparation services**, not legal advice.

Users should consult with a licensed attorney before filing legal documents.

The platform is designed to **assist** tenants and lawyers, not replace professional legal counsel.

---

## 📞 SUPPORT

- **Documentation:** https://docs.tenantjustice.io
- **Email:** support@tenantjustice.io
- **Community:** Discord server (link)

---

## 🎯 ROADMAP

### Phase 1: MVP (Weeks 1-4) ✅
- [x] Platform architecture
- [x] Core AI agents (Intake, Legal Mapper, Damages)
- [ ] Basic web app
- [ ] Blockchain deployment (testnet)
- [ ] Patterstone case as proof-of-concept

### Phase 2: Core Platform (Weeks 5-8)
- [ ] All 9 agents operational
- [ ] Multi-chain mainnet deployment
- [ ] Full document suite
- [ ] Payment integration (Stripe)
- [ ] Public verification portal

### Phase 3: Scale (Weeks 9-12)
- [ ] Legal database (top 20 states)
- [ ] Lawyer matching system
- [ ] Public case explorer
- [ ] Mobile responsive
- [ ] Email automation

### Phase 4: Domination (Months 4-6)
- [ ] All 50 states legal database
- [ ] API for integrations
- [ ] White-label licensing
- [ ] Mobile app
- [ ] AI fine-tuning on outcomes

---

## 💪 THE MISSION

**Democratize access to justice for tenants.**

Landlords have lawyers on retainer.  
Property managers have legal teams.  
Now **tenants have an AI law firm in their pocket** that never sleeps.

Every case makes the system smarter.  
Every bad landlord gets permanently logged.  
Every win becomes a template for the next tenant.

**You're not just using software. You're joining a movement.**

---

## 📝 LICENSE

Proprietary - All Rights Reserved

© 2025 Tenant Justice Platform

---

## 👨‍💻 BUILT BY

**Kevan** - Founder & Lead Developer

*Inspired by the 3530 Patterstone Drive case*

---

**LET'S BUILD JUSTICE.**
