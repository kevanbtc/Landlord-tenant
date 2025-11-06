# Tenant Justice Stack – Platform Roadmap

**Version:** 0.1  
**Status:** Development Planning  
**Timeline:** 8 Weeks to MVP

---

## Phase Overview

| Phase | Focus | Duration | Deliverables | Go-Live |
|-------|-------|----------|--------------|---------|
| **0** | Infrastructure Setup | 1 week | Repository, CI/CD, Docker | Ongoing |
| **1** | Core AI Swarm | 2 weeks | 8 agents (skeleton), orchestrator | Week 2 |
| **2** | Law Packs + Drafting | 2 weeks | GA statutes, Jinja2 templates, documents | Week 4 |
| **3** | Blockchain Deployment | 1 week | TenantCaseRegistry.sol, Sepolia → Polygon | Week 5 |
| **4** | Frontend UI | 2 weeks | Vue.js intake, review, download flow | Week 7 |
| **5** | Integration + QA | 1 week | E2E testing, security review, docs | Week 8 |

---

## Phase 0: Infrastructure Setup (Week 1)

### Goals
- GitHub repository with proper structure
- Docker for local development & production
- CI/CD pipeline (GitHub Actions)
- Documentation scaffolding

### Deliverables

#### 0.1 Repository Structure
```
tenant-justice-stack/
├── backend/                    # Python APIs, agents, orchestration
├── blockchain/                 # Solidity contracts, Hardhat
├── frontend/                   # Vue.js UI
├── legal/                      # Playbooks, disclaimers, resources
├── docs/                       # Architecture, API, setup
├── .github/workflows/          # CI/CD
├── docker-compose.yml          # Local dev environment
├── Makefile                    # Build targets
└── README.md                   # Quick start
```

#### 0.2 Docker Setup
```dockerfile
# Dockerfile (backend)
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

CMD ["python", "-m", "app"]
```

#### 0.3 GitHub Actions CI
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements.txt
      - run: pytest
      - run: python -m pylint backend/
```

#### 0.4 Development Setup Guide
- Install Node.js (for blockchain)
- Install Python 3.11
- Copy `.env.example` to `.env`
- `make dev-setup` runs all setup

### Success Criteria
- ✅ Repository created and initialized
- ✅ All team members can clone and `docker-compose up`
- ✅ CI passes on empty repo

---

## Phase 1: Core AI Swarm (Weeks 1-2)

### Goals
- Implement 8 agent classes with skeleton logic
- Build orchestrator to chain agents
- Create test fixtures with real cases
- Enable local testing without LLM (hardcoded outputs for now)

### Deliverables

#### 1.1 Agent Implementations
```python
# All 8 agents with process() method
- IntakeBotAgent (parse story → structured facts)
- TimelineBotAgent (order events chronologically)
- LawMappingAgent (facts → statutes, theories)
- HealthMoldBotAgent (issue context & medical info)
- DamagesBotAgent (calculate money damages)
- DraftingBotAgent (generate documents via templates)
- DefenseSimBotAgent (predict landlord arguments)
- RebuttalBotAgent (counter-arguments with citations)
```

#### 1.2 Orchestrator
```python
CaseOrchestrator class with:
- Agent sequencing (intake → drafting → rebuttal)
- Error handling and rollback
- Audit trail (track all agent outputs)
- Confidence scoring
```

#### 1.3 Test Suite
```bash
pytest backend/tests/

# Tests cover:
- Intake bot parses Patterstone story correctly
- Timeline bot orders events chronologically
- Law bot identifies O.C.G.A. § 44-7-13
- Each agent validates input/output
- End-to-end orchestration
```

#### 1.4 Fixtures
```python
# backend/tests/fixtures.py
- Patterstone case (hardcoded)
- Simple GA mold case
- Complex CA water damage case
- Each with expected outputs
```

### Success Criteria
- ✅ All 8 agents have working `process()` methods
- ✅ Orchestrator runs Patterstone → full case output
- ✅ Test suite passes with 80%+ coverage
- ✅ Can run locally in Docker

### Example Output
```json
{
  "caseId": "GA-FULTON-2025-001",
  "summary": { "mainIssues": ["mold", "water_leak"], ... },
  "timeline": [
    { "date": "2025-05-10", "action": "noticed_issue", "evidence": ["EXH-A-01"] },
    { "date": "2025-05-11", "action": "notified_landlord", "evidence": ["EXH-B-01"] }
  ],
  "legalAnalysis": {
    "applicableStatutes": [
      { "citation": "O.C.G.A. § 44-7-13", "relevance": "direct_violation" }
    ],
    "legalTheories": [
      { "theory": "breach_of_habitability", "strength": "strong" }
    ],
    "anticipatedDefenses": [
      { "defense": "We didn't know", "likelihood": "likely", "rebuttal": "..." }
    ]
  },
  "damages": { "rentAbatement": 9000, "repairs": 10500, "total": 22700 }
}
```

---

## Phase 2: Law Packs + Document Generation (Weeks 3-4)

### Goals
- Create law pack for Georgia habitability
- Build Jinja2 templates for demand letter, complaint, evidence index
- Test document generation end-to-end

### Deliverables

#### 2.1 Georgia Law Pack
```json
# backend/data/law_packs/us_ga_habitability.json
{
  "jurisdiction": "US-GA",
  "statutes": [
    {
      "citation": "O.C.G.A. § 44-7-13",
      "title": "Duty to Keep in Repair",
      "keywords": ["repair", "maintain", "habitability"],
      "remedies": ["rent_abatement", "damages"],
      "text": "..."
    },
    {
      "citation": "O.C.G.A. § 44-7-14",
      "title": "Remedies for Failure to Repair",
      "keywords": ["damages", "abatement"],
      "remedies": ["specific_performance", "attorney_fees"]
    },
    {
      "citation": "HB 404",
      "title": "Safe at Home Act",
      "keywords": ["habitability", "safety", "mold"],
      "remedies": ["rent_abatement", "repair"]
    }
  ],
  "precedentCases": [
    {
      "citation": "Example v. Landlord (2020)",
      "facts": "Habitability breach",
      "holding": "Tenant entitled to rent abatement"
    }
  ]
}
```

#### 2.2 Document Templates
```jinja2
{# demand_letter.j2 #}
[TENANT NAME]
[DATE]

[LANDLORD NAME]
[PROPERTY ADDRESS]

Re: Demand for Repair and Damages
    Property: [PROPERTY]
    Period: [START_DATE] to [END_DATE]
    Amount: $[TOTAL]

Dear [LANDLORD]:

I am writing to demand that you cure the following habitability violations:

{% for issue in case.summary.mainIssues %}
- {{ issue|capitalize }}: [DESCRIPTION FROM TIMELINE]
{% endfor %}

Under O.C.G.A. § 44-7-13, you are required to keep the premises fit for human 
occupation. You have failed to repair these conditions despite notice on 
[NOTICE_DATE].

EVIDENCE:
{% for ev in case.documents.evidence %}
- [{{ ev.id }}]: {{ ev.description }}
{% endfor %}

DAMAGES CLAIMED:
- Rent Abatement: ${{ case.damages.rentAbatement }}
- Repair Costs: ${{ case.damages.repairCosts }}
- Total: ${{ case.damages.total.conservative }}

You have 14 days to:
1. Cure these violations, OR
2. Provide written explanation

Failure to respond will result in legal action.

Sincerely,
[TENANT]
```

#### 2.3 DraftingBot Implementation
```python
class DraftingBotAgent(Agent):
    def __init__(self):
        self.env = jinja2.Environment(
            loader=jinja2.FileSystemLoader("templates/")
        )
    
    def process(self, input_data: Dict) -> Dict:
        case = input_data["case"]
        
        outputs = {}
        
        # Generate demand letter
        template = self.env.get_template("demand_letter.j2")
        outputs["demand_letter"] = template.render(case=case)
        
        # Generate complaint draft
        template = self.env.get_template("complaint.j2")
        outputs["complaint_draft"] = template.render(case=case)
        
        # Generate evidence index
        template = self.env.get_template("evidence_index.j2")
        outputs["evidence_index"] = template.render(case=case)
        
        # Generate timeline document
        template = self.env.get_template("timeline.j2")
        outputs["timeline_doc"] = template.render(timeline=case["timeline"])
        
        return outputs
```

#### 2.4 End-to-End Test
```python
def test_document_generation():
    orchestrator = CaseOrchestrator()
    result = orchestrator.process_case(PATTERSTONE_INPUT)
    
    assert "demand_letter" in result["documents"]
    assert "complaint_draft" in result["documents"]
    assert "O.C.G.A. § 44-7-13" in result["documents"]["demand_letter"]
    assert result["documents"]["demand_letter"] > 500  # chars
```

### Success Criteria
- ✅ GA law pack complete with 5+ statutes
- ✅ Demand letter generates with correct format
- ✅ Complaint draft populates legal theories
- ✅ Evidence index lists all exhibits
- ✅ All documents include Patterstone facts

---

## Phase 3: Blockchain Deployment (Week 5)

### Goals
- Deploy TenantCaseRegistry.sol to Sepolia testnet
- Test with Patterstone case
- Prepare multi-network deployment strategy

### Deliverables

#### 3.1 Smart Contract Deployment
```bash
cd blockchain/
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

#### 3.2 Contract Verification
```bash
npx hardhat verify --network sepolia <contract_address>
# Published on Etherscan
```

#### 3.3 Test: Register Patterstone Case
```javascript
// scripts/register_patterstone.js
const registry = await TenantCaseRegistry.at(deployedAddress);

const case_summary = {
  jurisdiction: "US-GA-Fulton",
  caseIdExternal: "GA-FULTON-2025-001",
  summaryIPFS: "QmXxxx..."  // Case JSON on IPFS
};

const tx = await registry.openCase(
  case_summary.jurisdiction,
  case_summary.caseIdExternal,
  case_summary.summaryIPFS
);

console.log("Case registered:", tx.receipt.transactionHash);
```

#### 3.4 Multi-Network Deploy Config
```javascript
// blockchain/networks.config.js
module.exports = {
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC,
      accounts: [process.env.PRIVATE_KEY]
    },
    ethereum: {
      url: process.env.ETHEREUM_RPC,
      accounts: [process.env.PRIVATE_KEY]
    },
    arbitrum: { ... },
    optimism: { ... },
    base: { ... }
  }
};
```

### Success Criteria
- ✅ Contract deploys to Sepolia
- ✅ Patterstone case registers successfully
- ✅ Case visible on Etherscan
- ✅ Multi-network config working
- ✅ Cost estimation for mainnet calculated

---

## Phase 4: Frontend UI (Weeks 6-7)

### Goals
- Build Vue.js intake wizard
- Implement case review screen
- Create document download flow
- Optional: blockchain registration UI

### Deliverables

#### 4.1 Main Components
```
frontend/src/components/
├── TenantIntake.vue        # "Tell your story" form (15 min)
├── EvidenceUpload.vue      # File uploader
├── JurisdictionSelect.vue  # State/county picker
├── CaseReview.vue          # Review AI output
├── DocumentGenerator.vue   # Download generated docs
└── BlockchainRegister.vue  # Register on-chain (optional)
```

#### 4.2 TenantIntake.vue (Sketch)
```vue
<template>
  <div class="intake-wizard">
    <div class="step" v-if="step === 1">
      <h2>What's the main housing issue?</h2>
      <textarea v-model="form.story" placeholder="Describe what happened..."></textarea>
      <button @click="nextStep">Next</button>
    </div>
    
    <div class="step" v-if="step === 2">
      <h2>Upload evidence (photos, emails, etc.)</h2>
      <file-uploader @files-uploaded="handleUpload"></file-uploader>
      <button @click="nextStep">Next</button>
    </div>
    
    <div class="step" v-if="step === 3">
      <h2>Where is your property?</h2>
      <input v-model="form.propertyAddress" placeholder="123 Main St, City, ST 12345">
      <button @click="nextStep">Next</button>
    </div>
    
    <div class="step" v-if="step === 4">
      <h2>Processing with AI...</h2>
      <progress-bar :value="progress"></progress-bar>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      step: 1,
      form: {
        story: "",
        propertyAddress: "",
        jurisdiction: "US-GA-Fulton",
        evidence: []
      },
      progress: 0
    };
  },
  methods: {
    nextStep() {
      if (this.step === 4) {
        // Call backend
        this.processCase();
      } else {
        this.step++;
      }
    },
    async processCase() {
      const response = await fetch("/api/cases", {
        method: "POST",
        body: JSON.stringify(this.form)
      });
      const result = await response.json();
      this.$emit("case-ready", result);
    }
  }
};
</script>
```

#### 4.3 Router & Pages
```javascript
// frontend/src/router.js
export const routes = [
  { path: "/", component: Home },
  { path: "/build", component: BuildCase },
  { path: "/verify/:caseId", component: VerificationPortal }
];
```

### Success Criteria
- ✅ Intake wizard guides user through case in <20 minutes
- ✅ File upload works for photos, PDFs, messages
- ✅ Case review displays AI output clearly
- ✅ Documents download as Word/PDF
- ✅ Mobile-responsive design

---

## Phase 5: Integration + QA (Week 8)

### Goals
- End-to-end testing (UI → backend → blockchain)
- Security audit
- Performance optimization
- Documentation finalization

### Deliverables

#### 5.1 E2E Test Suite
```bash
# tests/e2e/full_flow.spec.js
describe("Full Case Flow", () => {
  it("should process Patterstone case end-to-end", () => {
    // 1. Visit home page
    // 2. Fill intake form
    // 3. Upload evidence
    // 4. Review case
    // 5. Download documents
    // 6. Register on blockchain
    // 7. Verify public link
  });
});
```

#### 5.2 Security Checklist
- ✅ Private keys never in code (use .env)
- ✅ API validates all inputs
- ✅ IPFS hashes verify immutability
- ✅ No PII in public blockchain data
- ✅ CORS properly configured
- ✅ Rate limiting on API

#### 5.3 Performance Targets
- ✅ Intake UI loads <2 sec
- ✅ Case processing <30 sec
- ✅ Document generation <5 sec
- ✅ Blockchain deployment <5 min

#### 5.4 Documentation
- ✅ User guide for tenants
- ✅ Developer setup guide
- ✅ API documentation (OpenAPI/Swagger)
- ✅ Contributing guidelines
- ✅ License (MIT or GPL-3)

### Success Criteria
- ✅ All E2E tests pass
- ✅ Security audit complete
- ✅ Performance meets targets
- ✅ Documentation published
- ✅ Ready for public beta

---

## Post-MVP (Weeks 9+)

### Additional Jurisdictions
- Add CA Tenant Rights Act
- Add NY Real Property Law
- Add Texas habitability code

### Additional Issue Types
- Pest/rodent infestations
- Mold certification
- Code enforcement integration
- Insurance subrogation

### Platform Features
- Case database (track outcomes)
- Community forum for tenants
- Lawyer referral network
- Settlement tracking

---

## Success Metrics

| Metric | Target | By Week |
|--------|--------|---------|
| Agents implemented | 8/8 | 2 |
| Statutes documented | 15+ | 4 |
| Documents generated | 5 types | 4 |
| Test coverage | 80%+ | 5 |
| UI components | 10+ | 7 |
| E2E tests | 20+ | 8 |
| Public beta users | 50+ | 12+ |

---

## Dependencies

### Tech Stack
- **Backend:** Python 3.11, Flask/FastAPI
- **Frontend:** Vue.js 3, Vite
- **Blockchain:** Solidity 0.8.20, Hardhat, ethers.js
- **Templates:** Jinja2
- **Testing:** pytest, Vitest, Playwright
- **CI/CD:** GitHub Actions
- **Hosting:** Docker, AWS/Azure/Digital Ocean

### External Services
- **IPFS:** Pinata or Infura (for evidence storage)
- **RPC Endpoints:** Infura, Alchemy, or QuickNode
- **LLM:** OpenAI GPT-4 or Anthropic Claude (for agents—Phase 2+)

---

## Team Roles

| Role | Tasks | By Week |
|------|-------|---------|
| **Backend Lead** | Agents, orchestrator, API | 4 |
| **Blockchain Dev** | Contracts, deployment scripts | 5 |
| **Frontend Dev** | UI components, routing | 7 |
| **Legal/Compliance** | Law packs, disclaimers | 4 |
| **QA/DevOps** | Testing, CI/CD, Docker | 8 |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| LLM API costs | High | Use hardcoded outputs until Phase 2+ |
| Contract bugs | Critical | Audit on testnet thoroughly |
| Law pack incomplete | Medium | Start with GA; expand incrementally |
| User drop-off | Medium | Keep intake <15 minutes |
| Blockchain gas fees | Low | Use L2s (Polygon) for primary |

---

## Rollback Plan

If a phase fails:
1. Pause that phase
2. Continue with simpler version (e.g., static documents instead of generated)
3. Don't block other phases
4. Re-attempt after unblocking issues

**Example:** If AI agents too complex, use hardcoded outputs for MVP.

---

**Next Action:** Kickoff Phase 0 infrastructure setup
