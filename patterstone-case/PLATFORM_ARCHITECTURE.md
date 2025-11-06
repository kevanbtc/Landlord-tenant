# TENANT JUSTICE PLATFORM - Complete System Architecture

**Mission:** Democratize access to justice for tenants facing criminal negligence, bad faith, and habitability violations.

**Vision:** The world's most comprehensive tenant defense system - AI-powered legal intelligence + blockchain-verified evidence + dirt-cheap SaaS pricing.

---

## I. PLATFORM COMPONENTS

### 1. AI SWARM - The Legal Brain
**9 Specialized Agents Working as a Law Firm**

#### Agent 1: **Intake Specialist**
- **Job:** Convert messy tenant stories → structured case data
- **Inputs:** Raw text, voice notes, scattered facts
- **Outputs:** 
  - Parties (tenant, landlord, property manager, kids)
  - Property details (address, type, jurisdiction)
  - Problems (leaks, mold, no heat, pest infestation)
  - Timeline markers (moved in, first issue, notices sent)
  - Health impacts (children, disabilities, hospitalizations)

#### Agent 2: **Timeline Architect**
- **Job:** Build forensic-grade chronological case history
- **Inputs:** Messages, photos, receipts, maintenance records
- **Outputs:**
  - Precise timeline with dates, times, actors
  - Evidence linkage (each event → exhibit ID)
  - Pattern detection (delays, ghosting, bad faith)
  - Legal significance tagging (constructive eviction trigger, notice dates)

#### Agent 3: **Legal Mapper (Jurisdiction Expert)**
- **Job:** Map facts → laws, statutes, legal theories
- **Inputs:** Jurisdiction + fact pattern
- **Outputs:**
  - Applicable statutes (state + local codes)
  - Legal theories (breach of warranty, negligence, constructive eviction)
  - Required elements (what you need to prove)
  - Burden of proof standards
  - Case law / precedents
- **Coverage:** All 50 US states + major cities
- **Specialization:** Tenant-landlord law, housing codes, habitability standards

#### Agent 4: **Health & Safety Analyst**
- **Job:** Translate conditions → health risks + code violations
- **Inputs:** Photos of mold, water damage, pests, broken systems
- **Outputs:**
  - Health risk assessment (black mold, lead, CO dangers)
  - Building code violations
  - Habitability breach severity (minor, major, severe)
  - Medical documentation recommendations
  - Expert witness suggestions

#### Agent 5: **Damages Calculator**
- **Job:** Calculate money owed with mathematical precision
- **Inputs:** Rent, months affected, % of home lost, repair costs
- **Formulas:**
  - Rent abatement: `(% uninhabitable) × (months) × (monthly rent)`
  - Lost use value
  - Security deposit return
  - Relocation costs
  - Emotional distress ranges
  - Bad faith / punitive multipliers
- **Outputs:**
  - Conservative estimate
  - Aggressive estimate
  - Line-item breakdown table
  - Supporting calculations with citations

#### Agent 6: **Document Drafter**
- **Job:** Generate litigation-ready legal documents
- **Can Draft:**
  - Formal demand letters (with deadlines, statutes, $ amounts)
  - Certified termination notices
  - Complaints for court filing (formatted by jurisdiction)
  - Discovery requests
  - Evidence indexes (Exhibit A, B, C...)
  - Affidavits / declarations
  - Settlement demand packages
- **Quality:** 80% ready → lawyer just reviews, signs, files

#### Agent 7: **Defense Simulator (Red Team)**
- **Job:** Predict landlord's defense strategy
- **Analyzes:**
  - Weak points in your case
  - Likely defense arguments ("we didn't know," "tenant caused it," etc.)
  - Procedural traps
  - Settlement psychology
- **Outputs:**
  - Defense argument predictions
  - Strength/weakness assessment
  - Recommended evidence to gather
  - Counter-strategy preparation

#### Agent 8: **Rebuttal Engine**
- **Job:** Pre-write responses to every defense argument
- **Inputs:** Defense simulation predictions
- **Outputs:**
  - Rebuttal paragraphs (with evidence citations)
  - Legal counter-arguments
  - Exhibits that destroy defense claims
  - Cross-examination questions
- **Result:** Tenant/lawyer has pre-baked responses to everything

#### Agent 9: **Orchestrator (Conductor)**
- **Job:** Run the entire pipeline, ensure consistency
- **Flow:**
  1. Intake → 2. Timeline → 3. Legal Mapping → 4. Health Analysis
  5. Damages Calc → 6. Document Draft → 7. Defense Sim → 8. Rebuttal
- **Quality Control:**
  - Cross-check facts across all documents
  - Ensure evidence IDs match across timeline, docs, blockchain
  - Flag missing information
  - Generate "case readiness score"

---

### 2. LEGAL KNOWLEDGE DATABASE

**The Most Comprehensive Tenant Law Library on Earth**

#### A. Legal Code Repository
**Coverage by Jurisdiction:**
- **Federal:** FHA, ADA, lead disclosure, HUD standards
- **State:** All 50 states
  - Landlord-tenant statutes
  - Security deposit laws
  - Habitability standards
  - Repair/deduct rights
  - Constructive eviction criteria
  - Retaliation protections
  - Attorney fee statutes
- **Local:** Major cities (NYC, LA, Chicago, Atlanta, etc.)
  - Rent control
  - Local housing codes
  - Building safety standards
  - Inspection requirements

#### B. Case Law Database
- Key precedents for:
  - Habitability breaches
  - Bad faith / punitive damages
  - Constructive eviction
  - Mold liability
  - Attorney fee awards
- Organized by:
  - Jurisdiction
  - Issue type
  - Outcome

#### C. Legal Template Library
- Demand letters (by state)
- Complaint formats (by court jurisdiction)
- Discovery templates
- Affidavit forms
- Settlement agreements
- Termination notices

#### D. Violation Detection Engine
**AI-Powered Matching:**
- Input: Fact pattern
- Output: Every violated statute, code, regulation
- Includes:
  - Citation
  - Full text of law
  - Required proof elements
  - Typical damages range
  - Case law examples

---

### 3. BLOCKCHAIN EVIDENCE LAYER

**Immutable, Timestamped, Publicly Verifiable Case Records**

#### A. Smart Contract System
**Deployed on Multiple Chains:**
- Ethereum Mainnet (flagship)
- Polygon (low-cost)
- Arbitrum / Optimism (L2 speed)
- Sepolia / Goerli (testing)

**Contract: `TenantJusticeRegistry.sol`**

**Core Functions:**
```solidity
// Register a new case
function registerCase(
    string memory caseId,
    string memory jurisdiction,
    string memory summaryIPFS
)

// Register evidence for a case
function registerEvidence(
    string memory caseId,
    string memory evidenceId,
    string memory evidenceType,
    string memory ipfsHash
)

// Query case
function getCase(string memory caseId)

// Query evidence
function getEvidence(string memory caseId, string memory evidenceId)

// List all cases (paginated)
function getAllCases()
```

#### B. IPFS/Arweave Storage
**What Gets Stored:**
- Case summary JSON (parties, facts, claims - anonymized as needed)
- Evidence files:
  - Photos (compressed)
  - Messages (screenshots)
  - Documents (PDFs)
  - Audio (transcripts)
- Generated legal documents
- Timeline JSON

**Privacy Controls:**
- PII redaction options
- Anonymization for public viewing
- Private evidence (hash on-chain, file encrypted)

#### C. Verification Portal
**Public Website:** `verify.tenantjustice.io`

**Features:**
- Search by case ID
- View case summary
- See all evidence IDs + timestamps
- Download evidence from IPFS
- Verify hash integrity
- Export verification certificate
- No wallet required (read-only)

**Use Cases:**
- Lawyers verify evidence authenticity
- Judges check timestamps
- Journalists investigate landlord patterns
- Future tenants research property history

---

### 4. TENANT WEB APPLICATION

**User-Facing Platform**

#### A. Case Intake Flow
**Step 1: Basic Info**
- Your name, contact
- Property address
- Landlord/property manager info
- Move-in date, rent amount
- Lease type

**Step 2: Problem Description**
- What's wrong? (checkboxes + text)
  - Water leaks
  - Mold
  - No heat/AC
  - Pest infestation
  - Broken appliances
  - Unsafe conditions
  - Harassment
  - Illegal eviction
- When did it start?
- How long has it been ongoing?
- Did you notify landlord? (dates)

**Step 3: Evidence Upload**
- Drag-and-drop interface
- Supported: photos, videos, PDFs, messages
- Auto-metadata extraction (date, location if available)
- Description field for each item
- AI auto-categorization

**Step 4: Health & Impact**
- Anyone affected? (kids, elderly, disabled)
- Health issues? (respiratory, stress, etc.)
- Had to leave home temporarily?
- Medical records available?

**Step 5: What You Want**
- Repairs completed
- Rent refund
- Break lease without penalty
- Damages for suffering
- Expose the landlord
- All of the above

#### B. Case Dashboard
**Once case is submitted, tenant sees:**

- **Case Status:** Analyzing → Ready for Review → Action Recommended
- **Case Strength Score:** 7.5/10 (based on evidence + law)
- **Estimated Value:** $15,000 - $35,000
- **Timeline:** Visual timeline of events with evidence
- **Violations:** List of laws landlord broke
- **Documents:** Download your demand letter, complaint draft, etc.
- **Blockchain Status:** Evidence anchored ✓ (with links)
- **Next Steps:** Clear action plan
- **Find a Lawyer:** Matched lawyers in your area (optional)

#### C. Evidence Manager
- View all uploaded evidence
- Add more evidence anytime
- Tag evidence to timeline events
- Mint to blockchain (one-click)
- Share specific evidence (secure link)

#### D. Document Library
**Auto-Generated Documents Ready to Download:**
- Demand letter (Word + PDF)
- Formal complaint (court-ready)
- Evidence index
- Timeline (formatted for legal submission)
- Damages calculation worksheet
- Defense rebuttal memo
- Settlement proposal template

#### E. Communication Hub
- Message your matched lawyer
- Get AI assistance (chatbot)
- Schedule consultations
- Track deadlines

---

### 5. PUBLIC CASE EXPLORER

**Website:** `cases.tenantjustice.io`

#### A. Bad Landlord Database
**Searchable by:**
- Landlord/company name
- Property address
- Zip code
- Violation type

**Each Entry Shows:**
- Number of cases
- Common violations
- Total damages awarded/sought
- Case summaries (anonymized)
- Blockchain verification links
- Status (settled, won, ongoing)

#### B. Case Stats & Patterns
- Heatmap of problem properties
- Most common violations by city
- Average case values
- Success rate data
- Timeline to resolution

#### C. Educational Resources
- "Know Your Rights" by state
- How to document violations
- When to get a lawyer
- How to use the platform
- Video tutorials

---

### 6. LAWYER NETWORK

**B2B Component**

#### A. Lawyer Portal
**Lawyers can:**
- Browse cases in their jurisdiction
- See case strength scores
- Review AI-generated documents
- Accept cases with one click
- Get 80% of the work already done

#### B. Revenue Model
**Options:**
1. **Referral Fee:** Platform takes 10% of lawyer's contingency fee
2. **Subscription:** Lawyers pay $X/month for case flow
3. **Hybrid:** Small monthly + smaller referral %

#### C. Quality Control
- Lawyer verification (bar number, good standing)
- Client reviews
- Case outcome tracking
- Bad actor removal

---

## II. SAAS PRICING MODEL

**Mission: Dirt Cheap Access to Justice**

### Tier 1: **JUSTICE STARTER** - $29/month or $19/case
**Perfect for: Single case, just need the basics**

**Includes:**
- AI case analysis (all 9 agents)
- Legal violation mapping
- Damages calculator
- 1 demand letter
- 1 complaint draft
- Evidence organization (up to 50 items)
- Basic blockchain anchoring (IPFS hashes)
- 7-day support

**Value:** Replaces $1,500+ in paralegal work

---

### Tier 2: **JUSTICE PRO** - $79/month
**Perfect for: Serious case, need full arsenal**

**Everything in Starter, plus:**
- Unlimited document revisions
- Premium legal templates
- Defense simulation + rebuttal memos
- Multi-chain evidence minting (ETH + Polygon + Arweave)
- Evidence up to 500 items
- Priority AI processing
- Public case page (optional, anonymized)
- 24/7 support
- Lawyer matching service

**Value:** Replaces $5,000+ in legal prep

---

### Tier 3: **JUSTICE WARRIOR** - $199/month
**Perfect for: Multiple cases, tenant organizers, advocates**

**Everything in Pro, plus:**
- Up to 5 active cases
- Advanced analytics dashboard
- Pattern detection across your cases
- Media kit generator (for press exposure)
- Custom document templates
- API access (for organizations)
- White-label option
- Dedicated case manager
- Priority lawyer matching
- Expert witness database access

**Value:** Replaces $20,000+ in legal + investigative work

---

### Tier 4: **ORGANIZATION** - Custom Pricing
**Perfect for: Legal aid groups, tenant unions, advocacy orgs**

**Everything in Warrior, plus:**
- Unlimited cases
- Multi-user accounts
- Custom branding
- Dedicated AI training on your jurisdiction
- Direct lawyer network integration
- Bulk blockchain minting
- Custom integrations
- Training for your team
- SLA guarantees

**Value:** Replaces entire paralegal + IT staff

---

### Free Tier: **JUSTICE EXPLORER**
**For people just checking if they have a case**

- Basic intake questionnaire
- Case strength estimate (1-10 score)
- Violation quick-check
- Educational resources
- Links to free legal aid

**Conversion:** Designed to show value, then upgrade

---

## III. REVENUE MODEL

### A. Direct Revenue
- **Subscription:** $29-199/month per user
- **One-time cases:** $19-99 per case
- **Organization plans:** $500-5,000/month
- **Lawyer subscriptions:** $99-299/month

### B. Platform Fees
- **Lawyer referrals:** 10% of contingency fee on platform-sourced cases
- **Settlement facilitation:** 2% of settlement if done through platform

### C. Data Products (Anonymized & Aggregated)
- **Bad landlord reports:** Sold to tenant screening services
- **Market research:** Housing quality data for cities, researchers
- **Compliance:** Property manager training based on common violations

### D. White Label Licensing
- Sell the platform to:
  - Legal aid organizations
  - Tenant unions
  - Law firms specializing in tenant law
  - Government housing agencies

**Target:** $10K-100K per license

---

## IV. TECHNICAL STACK

### A. Frontend
**Framework:** Next.js 14 (React)
- **Why:** SEO, server-side rendering, fast
- **UI:** Tailwind CSS + shadcn/ui components
- **Forms:** React Hook Form + Zod validation
- **File Upload:** Uploadthing or S3 direct upload
- **Web3:** wagmi + viem for blockchain interaction

### B. Backend
**Framework:** Node.js + Express (or Next.js API routes)
- **Database:** PostgreSQL (case data, users, evidence metadata)
- **File Storage:** 
  - S3/R2 (original files)
  - IPFS (blockchain-linked copies)
  - Arweave (permanent archival)
- **Job Queue:** Bull/BullMQ (for AI processing, blockchain minting)
- **Cache:** Redis (API responses, document generation)

### C. AI Infrastructure
**LLM Provider:** OpenAI GPT-4 (primary) + Claude (backup)
- **Agent Framework:** LangChain or LangGraph
- **Vector DB:** Pinecone or Weaviate (for legal code search)
- **RAG:** Retrieve legal statutes/cases relevant to facts
- **Prompt Management:** Centralized prompt templates per agent

### D. Blockchain Layer
**Smart Contracts:** Solidity (Hardhat framework)
- **Deployment:** Multi-chain via Hardhat scripts
- **RPC:** Alchemy or Infura
- **Wallet:** Platform uses single admin wallet for minting
- **Indexing:** The Graph (for querying blockchain data)

### E. DevOps
- **Hosting:** Vercel (frontend) + AWS/Fly.io (backend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (errors) + Datadog (performance)
- **Uptime:** StatusPage

---

## V. DATA MODEL

### A. Core Entities

#### 1. **User**
```typescript
{
  id: uuid
  email: string
  name: string
  phone: string?
  subscriptionTier: enum
  createdAt: timestamp
}
```

#### 2. **Case**
```typescript
{
  id: uuid
  caseId: string // e.g., GA-FULTON-3530-PATTERSTONE-2025
  userId: uuid
  
  // Property Info
  propertyAddress: string
  jurisdiction: string // state + county
  landlordName: string
  landlordContact: string?
  propertyManagerName: string?
  
  // Lease Info
  moveInDate: date
  monthlyRent: decimal
  leaseType: enum // fixed, month-to-month
  securityDeposit: decimal
  
  // Case Info
  issueCategories: enum[] // leak, mold, no_heat, etc.
  firstIssueDate: date
  landlordNotifiedDate: date?
  ongoingDuration: integer // days
  healthImpact: text?
  childrenAffected: boolean
  childrenAges: integer[]?
  
  // AI Analysis
  caseStrengthScore: decimal // 0-10
  legalViolations: jsonb // array of statute objects
  estimatedDamagesLow: decimal
  estimatedDamagesHigh: decimal
  
  // Status
  status: enum // draft, analyzed, action_taken, settled, won, lost
  
  // Blockchain
  blockchainTxHash: string?
  ipfsHash: string?
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 3. **Evidence**
```typescript
{
  id: uuid
  caseId: uuid
  exhibitId: string // EXH-A-01
  
  type: enum // photo, video, message, document, audio
  description: text
  dateTaken: timestamp?
  
  // Storage
  s3Key: string
  ipfsHash: string?
  arweaveId: string?
  
  // Metadata
  fileSize: integer
  mimeType: string
  
  // Blockchain
  blockchainTxHash: string?
  
  createdAt: timestamp
}
```

#### 4. **TimelineEvent**
```typescript
{
  id: uuid
  caseId: uuid
  
  date: timestamp
  title: string
  description: text
  actor: string // tenant, landlord, handyman, etc.
  significance: enum // critical, major, minor
  
  evidenceIds: uuid[] // linked evidence
  
  createdAt: timestamp
}
```

#### 5. **Document**
```typescript
{
  id: uuid
  caseId: uuid
  
  type: enum // demand_letter, complaint, timeline, evidence_index
  title: string
  content: text // markdown or HTML
  
  s3Key: string? // PDF version
  ipfsHash: string?
  
  version: integer
  
  createdAt: timestamp
}
```

#### 6. **LegalCode**
```typescript
{
  id: uuid
  
  jurisdiction: string // US-GA, US-GA-FULTON, etc.
  code: string // O.C.G.A. § 44-7-13
  title: string
  fullText: text
  category: enum // habitability, security_deposit, retaliation, etc.
  
  // AI Embeddings
  embedding: vector // for semantic search
  
  effectiveDate: date
  lastUpdated: timestamp
}
```

---

## VI. AI AGENT IMPLEMENTATION

### Agent Architecture
**Framework:** LangGraph (for complex agent workflows)

### Example: Legal Mapper Agent

```typescript
class LegalMapperAgent {
  
  async analyze(caseData: Case) {
    // 1. Identify jurisdiction
    const jurisdiction = this.parseJurisdiction(caseData.jurisdiction)
    
    // 2. Extract fact pattern
    const facts = this.extractFacts(caseData)
    
    // 3. Semantic search legal codes
    const relevantCodes = await this.searchLegalCodes(jurisdiction, facts)
    
    // 4. GPT analysis
    const prompt = this.buildPrompt(facts, relevantCodes)
    const analysis = await this.llm.complete(prompt)
    
    // 5. Structure violations
    const violations = this.parseViolations(analysis)
    
    // 6. Add case law
    const precedents = await this.findPrecedents(violations, jurisdiction)
    
    return {
      violations,
      precedents,
      legalTheories: analysis.theories,
      requiredEvidence: analysis.evidenceNeeds
    }
  }
  
  private buildPrompt(facts, codes) {
    return `
You are an expert tenant-rights attorney analyzing a case.

JURISDICTION: ${facts.jurisdiction}

FACTS:
${facts.summary}

APPLICABLE LAWS:
${codes.map(c => c.code + ': ' + c.summary).join('\n')}

TASK:
1. Identify which laws the landlord violated
2. Map each violation to the facts
3. Determine legal theories (breach of warranty, negligence, etc.)
4. Assess strength of each claim
5. Identify evidence needed to prove each element

OUTPUT FORMAT: JSON
{
  "violations": [
    {
      "statute": "O.C.G.A. § 44-7-13",
      "violated": true,
      "facts": ["landlord notified 4 times", "no action taken in 90 days"],
      "strength": 9,
      "elements": {...}
    }
  ],
  "legalTheories": [...],
  "evidenceNeeds": [...]
}
`
  }
}
```

### Agent Coordination
**Orchestrator manages the pipeline:**

```typescript
class CaseOrchestrator {
  
  async processCase(caseId: string) {
    const case = await db.getCase(caseId)
    
    // Step 1: Intake (if needed)
    if (case.status === 'draft') {
      await IntakeAgent.structure(case)
    }
    
    // Step 2: Timeline
    const timeline = await TimelineAgent.build(case)
    await db.saveTimeline(caseId, timeline)
    
    // Step 3: Legal Analysis
    const legalAnalysis = await LegalMapperAgent.analyze(case)
    await db.updateCase(caseId, { legalViolations: legalAnalysis })
    
    // Step 4: Health Analysis
    const healthAnalysis = await HealthAgent.analyze(case)
    
    // Step 5: Damages
    const damages = await DamagesAgent.calculate(case, legalAnalysis)
    await db.updateCase(caseId, { 
      estimatedDamagesLow: damages.conservative,
      estimatedDamagesHigh: damages.aggressive
    })
    
    // Step 6: Documents
    await DocumentDrafter.generateAll(case, legalAnalysis, damages)
    
    // Step 7: Defense Simulation
    const defenseArgs = await DefenseSimulator.predict(case, legalAnalysis)
    
    // Step 8: Rebuttals
    const rebuttals = await RebuttalEngine.generate(case, defenseArgs)
    
    // Step 9: Case Score
    const score = this.calculateCaseScore(legalAnalysis, damages, timeline)
    await db.updateCase(caseId, { 
      caseStrengthScore: score,
      status: 'analyzed'
    })
    
    // Step 10: Blockchain (if user opted in)
    if (case.user.subscriptionTier !== 'free') {
      await BlockchainService.registerCase(case)
    }
    
    return { caseId, score, status: 'ready' }
  }
}
```

---

## VII. BLOCKCHAIN IMPLEMENTATION

### Smart Contract (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TenantJusticeRegistry {
    
    struct Case {
        string caseId;
        string jurisdiction;
        string summaryIPFS;
        uint256 timestamp;
        bool exists;
    }
    
    struct Evidence {
        string evidenceId;
        string evidenceType;
        string ipfsHash;
        uint256 timestamp;
        bool exists;
    }
    
    // caseId => Case
    mapping(string => Case) public cases;
    
    // caseId => evidenceId => Evidence
    mapping(string => mapping(string => Evidence)) public evidence;
    
    // caseId => evidenceId[]
    mapping(string => string[]) public caseEvidenceList;
    
    // All case IDs
    string[] public allCaseIds;
    
    event CaseRegistered(string indexed caseId, string jurisdiction, uint256 timestamp);
    event EvidenceRegistered(string indexed caseId, string evidenceId, uint256 timestamp);
    
    function registerCase(
        string memory _caseId,
        string memory _jurisdiction,
        string memory _summaryIPFS
    ) public {
        require(!cases[_caseId].exists, "Case already registered");
        
        cases[_caseId] = Case({
            caseId: _caseId,
            jurisdiction: _jurisdiction,
            summaryIPFS: _summaryIPFS,
            timestamp: block.timestamp,
            exists: true
        });
        
        allCaseIds.push(_caseId);
        
        emit CaseRegistered(_caseId, _jurisdiction, block.timestamp);
    }
    
    function registerEvidence(
        string memory _caseId,
        string memory _evidenceId,
        string memory _evidenceType,
        string memory _ipfsHash
    ) public {
        require(cases[_caseId].exists, "Case not found");
        require(!evidence[_caseId][_evidenceId].exists, "Evidence already registered");
        
        evidence[_caseId][_evidenceId] = Evidence({
            evidenceId: _evidenceId,
            evidenceType: _evidenceType,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            exists: true
        });
        
        caseEvidenceList[_caseId].push(_evidenceId);
        
        emit EvidenceRegistered(_caseId, _evidenceId, block.timestamp);
    }
    
    function getCase(string memory _caseId) public view returns (Case memory) {
        require(cases[_caseId].exists, "Case not found");
        return cases[_caseId];
    }
    
    function getEvidence(string memory _caseId, string memory _evidenceId) 
        public view returns (Evidence memory) {
        require(evidence[_caseId][_evidenceId].exists, "Evidence not found");
        return evidence[_caseId][_evidenceId];
    }
    
    function getCaseEvidenceList(string memory _caseId) 
        public view returns (string[] memory) {
        return caseEvidenceList[_caseId];
    }
    
    function getAllCases() public view returns (string[] memory) {
        return allCaseIds;
    }
    
    function getTotalCases() public view returns (uint256) {
        return allCaseIds.length;
    }
}
```

### Deployment Script

```javascript
// scripts/deploy-platform.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying Tenant Justice Platform contracts...");
  
  // Deploy to multiple chains
  const chains = [
    { name: "Ethereum Sepolia", rpc: process.env.SEPOLIA_RPC },
    { name: "Polygon Mumbai", rpc: process.env.MUMBAI_RPC },
    { name: "Arbitrum Goerli", rpc: process.env.ARB_GOERLI_RPC }
  ];
  
  for (const chain of chains) {
    console.log(`\nDeploying to ${chain.name}...`);
    
    const TenantJusticeRegistry = await hre.ethers.getContractFactory("TenantJusticeRegistry");
    const registry = await TenantJusticeRegistry.deploy();
    await registry.deployed();
    
    console.log(`✓ Contract deployed at: ${registry.address}`);
    
    // Save address to config
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('./config/contracts.json'));
    config[chain.name] = registry.address;
    fs.writeFileSync('./config/contracts.json', JSON.stringify(config, null, 2));
  }
  
  console.log("\n✓ All deployments complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## VIII. DEPLOYMENT PLAN

### Phase 1: MVP (Weeks 1-4)
- [ ] Basic intake form
- [ ] Single AI agent (intake + legal mapper)
- [ ] Damages calculator
- [ ] Demand letter generator
- [ ] Blockchain anchoring (Sepolia testnet)
- [ ] Simple dashboard
- [ ] Deploy Patterstone case as proof of concept

### Phase 2: Core Platform (Weeks 5-8)
- [ ] All 9 AI agents operational
- [ ] Multi-chain deployment (mainnet + L2s)
- [ ] Full document suite
- [ ] Evidence management system
- [ ] Public verification portal
- [ ] Stripe payment integration
- [ ] 3 pricing tiers live

### Phase 3: Scale (Weeks 9-12)
- [ ] Legal code database (top 20 states)
- [ ] Lawyer matching system
- [ ] Public case explorer
- [ ] Mobile-responsive design
- [ ] Email automation (reminders, deadlines)
- [ ] Analytics dashboard

### Phase 4: Domination (Months 4-6)
- [ ] All 50 states legal database
- [ ] API for integrations
- [ ] White-label licensing
- [ ] Organization tier features
- [ ] Mobile app (React Native)
- [ ] AI improvements (fine-tuning on case outcomes)

---

## IX. GO-TO-MARKET STRATEGY

### A. Launch with Patterstone Case
**Week 1 Strategy:**
1. Deploy Patterstone case through full platform
2. Document everything (video, screenshots)
3. Write case study: "How We Built a $50K Case for $29"
4. Post on:
   - Reddit (r/legaladvice, r/tenants, r/atlanta)
   - Twitter
   - TikTok (short form case breakdown)
   - LinkedIn (professional angle)

### B. Content Marketing
**"Tenant Rights Knowledge Hub"**
- Weekly blog posts:
  - "Top 10 Tenant Rights in [State]"
  - "How to Document Mold Properly"
  - "What Judges Look for in Habitability Cases"
- YouTube channel:
  - Platform tutorials
  - Case breakdowns
  - "Bad Landlord of the Week"
- SEO: Rank for "[State] tenant rights," "how to sue landlord," etc.

### C. Partnerships
- **Legal Aid Organizations:** Offer free org tier
- **Tenant Unions:** White-label deals
- **Housing Advocates:** Affiliate program (20% recurring commission)
- **Lawyers:** Join network, get referrals

### D. PR Strategy
- Press release: "AI + Blockchain Platform Levels Legal Playing Field for Tenants"
- Pitch stories:
  - TechCrunch: "Justice-Tech Startup"
  - HousingWire: "New Tool for Tenant Disputes"
  - Local news: Feature specific bad landlords exposed via platform

### E. Paid Acquisition
- Google Ads:
  - Keywords: "sue landlord," "tenant lawyer," "[city] tenant rights"
  - Budget: $5K/month initially
- Facebook/Instagram:
  - Target: Renters age 25-45, keywords: tenant, renting, apartment problems
- Reddit Ads: r/legaladvice, r/tenants

### F. Viral Growth Mechanics
- **Referral Program:** Give 1 month free for each referral
- **Public Case Pages:** Every case gets shareable link
- **Bad Landlord Leaderboard:** "Top 10 Worst Landlords This Month"
- **Social Proof:** "1,247 tenants have recovered $3.2M using this platform"

---

## X. SUCCESS METRICS

### User Metrics
- **Sign-ups:** Target 1,000 in Month 1
- **Conversion:** Free → Paid at 15%
- **Retention:** 70% month-over-month (until case resolves)
- **Case Completion:** 90% of started cases finish full analysis

### Financial Metrics
- **MRR:** Monthly Recurring Revenue
  - Month 3 target: $10K
  - Month 6 target: $50K
  - Month 12 target: $250K
- **CAC:** Customer Acquisition Cost < $50
- **LTV:** Lifetime Value > $200 (avg 3 months × $79)
- **LTV/CAC:** > 4x

### Impact Metrics
- **Total Damages Calculated:** Target $10M in first year
- **Cases Won/Settled:** Track outcomes
- **Attorney Fee Awards:** Separate metric (good for PR)
- **Bad Landlords Exposed:** Number of landlords with 2+ cases

### Platform Metrics
- **AI Accuracy:** Human lawyer review scores agents
- **Document Quality:** % of docs used without major edits
- **Blockchain Uptime:** 99.9%
- **Response Time:** < 2 min for case analysis

---

## XI. RISK MITIGATION

### Legal Risks
**Risk:** Unauthorized practice of law (UPL)
**Mitigation:**
- Clear disclaimers: "This is not legal advice"
- Position as "document preparation service"
- Encourage lawyer review before filing
- Don't give case strategy advice without lawyer in loop

**Risk:** Liability for bad outcomes
**Mitigation:**
- Terms of Service: No guarantee of results
- Insurance: E&O policy
- Quality control: Lawyer review of templates

### Technical Risks
**Risk:** Blockchain costs spike (gas fees)
**Mitigation:**
- Use L2s (Polygon, Arbitrum) for cheap minting
- Batch transactions
- Only mint on-chain for paid tiers

**Risk:** AI hallucinations (wrong legal advice)
**Mitigation:**
- RAG system (ground in actual statutes)
- Human lawyer spot-checks
- Confidence scores on AI outputs
- Version tracking (can see what AI said vs. what happened)

### Business Risks
**Risk:** Can't acquire users cheaply
**Mitigation:**
- Content marketing (SEO, YouTube)
- Partnerships (legal aid, tenant unions)
- Referral mechanics

**Risk:** Competitors copy model
**Mitigation:**
- Network effects (more cases = better AI)
- Blockchain creates moat (public case history)
- Brand: "The platform that took down [famous bad landlord]"

---

## XII. NEXT STEPS - BUILD SEQUENCE

### Immediate (This Week)
1. Set up project structure
2. Deploy smart contracts to testnets
3. Build basic intake form
4. Implement first AI agent (Legal Mapper)
5. Create demand letter template
6. Process Patterstone case as test

### Short-term (Weeks 2-4)
1. Build dashboard UI
2. Implement all 9 AI agents
3. Connect blockchain minting
4. Add payment processing
5. Launch beta with 10 test users

### Medium-term (Months 2-3)
1. Build public case explorer
2. Create lawyer portal
3. Expand legal database to top 10 states
4. Marketing campaign launch
5. Process 100 cases

### Long-term (Months 4-12)
1. Mobile app
2. API for partners
3. White-label licensing
4. International expansion (UK, Canada)
5. Process 10,000 cases

---

## BOTTOM LINE

You're building **the most powerful tenant defense system ever created**:

- **AI swarm** = Instant legal expertise (replaces $5K in lawyer time)
- **Blockchain** = Tamper-proof evidence (destroys "he said/she said")
- **Legal database** = Every tenant law, every jurisdiction
- **Document engine** = Court-ready papers in minutes
- **SaaS pricing** = $29-79/month (vs. $5,000+ lawyer retainer)

**This levels the playing field.**

Landlords have lawyers on retainer. Property managers have legal teams.
Now **tenants have an AI law firm in their pocket** that never sleeps, never forgets, and costs less than a dinner.

And every case makes the system smarter.
Every bad landlord gets permanently logged on a public blockchain.
Every win becomes a template for the next tenant.

**You're not just building a product. You're building a movement.**

Let's start coding.
