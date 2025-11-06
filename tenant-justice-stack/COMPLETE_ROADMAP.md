# Complete Platform Roadmap: From Phase 0 to Scalable Legal Tech

**Project:** Tenant Justice Stack → Scalable Legal Tech Platform  
**Version:** 1.0-MVP  
**Last Updated:** November 6, 2025  
**Status:** 🚀 READY FOR EXECUTION

---

## 🎯 Grand Vision

Build a **fully automated, AI-powered legal platform** that:

1. **Starts with tenant housing rights** (Phase 1-5)
2. **Expands to multi-jurisdiction support** (Phase 6-7)
3. **Scales to any practice area** (Phase 8+)
4. **Deploys across Web3 domains** (.law, .tenant, .legal)
5. **Auto-generates documentation** for every case type
6. **Registers all cases immutably on blockchain** for verification
7. **Builds legal research database** as platform matures

---

## 📊 Execution Timeline (16 Weeks to Full Platform MVP)

```
Week 1:      Phase 0 ─ Infrastructure & Integration Setup
Weeks 1-2:   Phase 1 ─ AI Swarm Implementation
Weeks 3-4:   Phase 2 ─ Law Packs & Document Generation
Week 5:      Phase 3 ─ Blockchain Deployment
Weeks 6-7:   Phase 4 ─ Frontend UI (Tenant & Legal Portals)
Week 8:      Phase 5 ─ Integration & QA (MVP Release)
─────────────────────────────────────────────────────────
Weeks 9-10:  Phase 6 ─ Multi-Jurisdiction Support (GA, CA, NY)
Weeks 11-12: Phase 7 ─ Law Practice Plugin System
Weeks 13-16: Phase 8 ─ Scale to Other Practice Areas
```

---

## 📋 Phase Breakdown

### Phase 0: Infrastructure & Integration (Week 1)
**Status:** DOCUMENTED IN `PHASE_0_EXECUTION_PLAN.md`

**Deliverables:**
- GitHub repository with CI/CD pipeline
- Docker Compose local development environment
- FastAPI backend with OpenAI/Claude integration
- Hardhat blockchain setup
- Astro website with auto-deployment
- Web3 domain structure (.law, .tenant, .legal)

**Outcome:** Full local development stack ready to code

---

### Phase 1: AI Swarm Implementation (Weeks 1-2)

**Goal:** Build 8 specialized AI agents orchestrated in sequence

#### 1.1: Complete Agent Implementations

**Agent 1: IntakeBotAgent** (Weeks 1-2)
```
Input: Tenant's free-form story
Processing: OpenAI GPT-4 extracts structured case data
Output: {tenant_name, property, landlord, issues, timeline, contact}
Tests: Parse Patterstone case, verify all fields extracted
```

**Agent 2: TimelineBotAgent** (Week 1)
```
Input: Extracted case data + narrative
Processing: Order events chronologically, link evidence
Output: [{date, event, evidence_ids, proof_of_notice}]
Tests: Patterstone timeline validation
```

**Agent 3: LawMappingAgent** (Week 1)
```
Input: Case facts + jurisdiction
Processing: Match facts to statutes, build legal theories
Output: {applicable_statutes, legal_theories, damages_potential}
Tests: GA habitability law mapping
```

**Agent 4: HealthMoldBotAgent** (Week 1)
```
Input: Health issues + property conditions
Processing: Link environmental hazards to health impacts
Output: {health_conditions, causation, medical_experts_needed}
Tests: Mold → respiratory disease linking
```

**Agent 5: DamagesBotAgent** (Week 2)
```
Input: Case facts + state law
Processing: Calculate compensatory damages (abatement, repairs, medical, relocation)
Output: {damages_breakdown, calculation_method, confidence_level}
Tests: Patterstone damages calculation
```

**Agent 6: DraftingBotAgent** (Week 2)
```
Input: Case data + document template
Processing: Fill Jinja2 templates with case facts
Output: Generated documents (demand letter, complaint, evidence index)
Tests: Generate all doc types for Patterstone
```

**Agent 7: DefenseSimBotAgent** (Week 2)
```
Input: Case facts + legal theories
Processing: Predict landlord arguments from historical patterns
Output: [{defense_argument, likelihood, rebuttal_points}]
Tests: Predict Patterstone defenses
```

**Agent 8: RebuttalBotAgent** (Week 2)
```
Input: Anticipated defenses
Processing: Generate counter-arguments with legal citations
Output: [{defense_point, rebuttal, case_citations, statute_refs}]
Tests: Rebut Patterstone landlord defenses
```

#### 1.2: Orchestrator Pattern

```python
class CaseOrchestrator:
    """Sequences agents in optimal order with error handling"""
    
    agents = [
        IntakeBotAgent,        # 1. Parse story
        TimelineBotAgent,      # 2. Build timeline
        LawMappingAgent,       # 3. Map to law
        HealthMoldBotAgent,    # 4. Health impacts (parallel)
        DamagesBotAgent,       # 5. Calculate damages
        DraftingBotAgent,      # 6. Generate documents
        DefenseSimBotAgent,    # 7. Predict defenses (parallel)
        RebuttalBotAgent       # 8. Generate rebuttals
    ]
    
    def process_case(self, case_input):
        """Run all agents in sequence"""
        result = {}
        for agent in self.agents:
            try:
                result = agent.execute(result or case_input)
            except Exception as e:
                result['error'] = str(e)
                break
        return result
```

#### 1.3: API Endpoints

```
POST /api/v1/cases
  → Create case from intake story
  → Trigger orchestrator
  → Return case ID + status

POST /api/v1/cases/{id}/analyze
  → Re-run analysis on existing case
  → Return updated analysis

GET /api/v1/cases/{id}
  → Retrieve case data + analysis

POST /api/v1/cases/{id}/documents
  → Generate specific documents for case

GET /api/v1/cases/{id}/blockchain
  → Get blockchain registration proof
```

#### 1.4: Testing

```bash
pytest backend/tests/agents/ -v --cov

# Each agent test:
- Test with Patterstone case data
- Verify output schema
- Check error handling
- Measure LLM response time
```

**Success Criteria:**
- ✅ All 8 agents implemented
- ✅ Orchestrator running without errors
- ✅ 80%+ test coverage
- ✅ Patterstone case fully processed through all agents
- ✅ API responding with proper schema

---

### Phase 2: Law Packs & Document Generation (Weeks 3-4)

**Goal:** Build law packs and document templates for jurisdiction-specific generation

#### 2.1: Georgia Law Pack

Create `backend/law_packs/georgia.json`:

```json
{
  "jurisdiction": "georgia",
  "state_code": "GA",
  "statutes": [
    {
      "code": "O.C.G.A. § 44-7-2",
      "title": "Implied Warranty of Habitability",
      "summary": "Landlord must maintain dwelling in habitable condition",
      "elements": [
        "Safe structure",
        "Working utilities (water, electricity)",
        "Heat in winter",
        "Pest-free environment",
        "Working plumbing"
      ],
      "remedies": ["repair_deduct", "rent_abatement", "damages"],
      "precedent_cases": [
        {
          "case": "Javins v. First National Realty Corp",
          "year": 1970,
          "holding": "Habitability implied in all leases",
          "relevance": "Leading habitability case"
        }
      ]
    },
    {
      "code": "O.C.G.A. § 44-7-13",
      "title": "Proof of Notice Requirements",
      "summary": "Landlord must have notice of defect",
      "notice_methods": ["written", "email", "registered_mail", "text", "in_person"],
      "response_time_days": 14
    },
    {
      "code": "O.C.G.A. § 44-7-14",
      "title": "Tenant Remedies for Non-Repair",
      "summary": "Tenant remedies when landlord fails to repair",
      "available_remedies": [
        {
          "type": "repair_deduct",
          "description": "Repair and deduct from rent",
          "max_percentage": 0.20,
          "limit_per_month": "reasonable"
        },
        {
          "type": "rent_abatement",
          "description": "Reduce rent to reflect uninhabitable portion",
          "calculation": "percentage_of_unit_unusable"
        }
      ]
    }
  ],
  "document_templates": {
    "demand_letter": "demand_letter_ga.j2",
    "complaint": "complaint_ga.j2",
    "evidence_index": "evidence_index.j2",
    "timeline": "timeline.j2"
  },
  "damages_calculation": {
    "abatement_factor": 0.5,
    "repair_estimates": {
      "mold_remediation": 2500,
      "plumbing_repair": 500,
      "electrical_repair": 800,
      "pest_control": 300
    },
    "health_damages_multiplier": 1.5
  }
}
```

#### 2.2: Document Templates (Jinja2)

**demand_letter_ga.j2:**
```jinja2
{{ tenant_name }}
{{ property_address }}
{{ city }}, GA {{ zip }}

{{ date }}

{{ landlord_name }}
{{ landlord_address }}
{{ landlord_city }}, GA {{ landlord_zip }}

DEMAND LETTER - FAILURE TO MAINTAIN HABITABILITY

Dear {{ landlord_name }}:

This letter serves as formal notice that the property located at {{ property_address }} 
has multiple unresolved habitability violations that began on {{ issue_start_date }}.

VIOLATIONS:
{% for issue in issues %}
- {{ issue.description }} (reported {{ issue.report_date }})
{% endfor %}

Under O.C.G.A. § 44-7-2, you are required to maintain this dwelling in habitable condition.

LEGAL BASIS:
The following defects violate Georgia's implied warranty of habitability:
{% for statute in applicable_statutes %}
- {{ statute.code }}: {{ statute.summary }}
{% endfor %}

DEMAND:
You must remedy all defects within 14 days of receipt of this letter.

If repairs are not completed, we will pursue all available remedies under O.C.G.A. § 44-7-14, including:
- Rent abatement
- Repair and deduct
- Damages for breach of habitability
- Attorney's fees

Sincerely,

{{ tenant_name }}
```

**complaint_ga.j2:**
```jinja2
IN THE COURT OF [COUNTY], GEORGIA
[TENANT] v. [LANDLORD]

COMPLAINT FOR BREACH OF WARRANTY OF HABITABILITY

FACTS:
1. Plaintiff {{ tenant_name }} leased the property at {{ property_address }}
2. Issues began on {{ issue_start_date }}
3. Landlord received notice via {{ proof_of_notice }}
4. Landlord failed to repair within 14 days

LEGAL CLAIMS:
1. Breach of Implied Warranty of Habitability (O.C.G.A. § 44-7-2)
2. Breach of Contract (Lease Agreement)
3. Violation of Tenant Remedies Statute (O.C.G.A. § 44-7-14)

DAMAGES:
1. Rent Abatement: ${{ rent_abatement_amount }}
2. Repair Costs: ${{ repair_cost_amount }}
3. Health-Related Damages: ${{ health_damages_amount }}
4. Total: ${{ total_damages }}

Wherefore, Plaintiff demands judgment in the amount of ${{ total_damages }}.
```

#### 2.3: Law Pack Validation

```python
# backend/services/law_pack_validator.py

class LawPackValidator:
    """Validates law pack JSON structure"""
    
    def validate_statute(self, statute):
        required = ['code', 'title', 'summary', 'remedies']
        if not all(k in statute for k in required):
            raise ValueError(f"Statute missing required fields: {statute}")
        return True
    
    def validate_template(self, template_name, template_content):
        # Verify Jinja2 syntax
        try:
            Template(template_content)
        except Exception as e:
            raise ValueError(f"Invalid template {template_name}: {e}")
        return True
    
    def load_and_validate(self, jurisdiction):
        # Load law pack JSON
        # Validate all statutes
        # Validate all templates
        # Return validated law pack
        pass
```

#### 2.4: Document Generation Workflow

```python
# backend/services/document_generator.py

class DocumentGenerator:
    """Generate documents from templates and case data"""
    
    def generate_demand_letter(self, case_id):
        case = get_case(case_id)
        law_pack = load_law_pack(case.jurisdiction)
        template = Template(law_pack.templates['demand_letter'])
        
        context = {
            'tenant_name': case.tenant_name,
            'property_address': case.property_address,
            'issue_start_date': case.issue_start_date,
            'applicable_statutes': case.legal_analysis.statutes,
            'proof_of_notice': case.proof_of_notice
        }
        
        document = template.render(context)
        return generate_pdf_or_docx(document)
    
    def generate_all_documents(self, case_id):
        docs = {}
        for doc_type in ['demand_letter', 'complaint', 'evidence_index', 'timeline']:
            docs[doc_type] = self.generate_document(case_id, doc_type)
        return docs
```

#### 2.5: Testing

```bash
# Test law pack validation
pytest backend/tests/law_packs/ -v

# Test document generation
pytest backend/tests/documents/ -v

# Generate Patterstone documents
python scripts/generate_test_docs.py --case patterstone
```

**Success Criteria:**
- ✅ Georgia law pack validated and complete
- ✅ 4 document templates working
- ✅ Document generation tested with Patterstone data
- ✅ Generated documents pass PDF/Word validation
- ✅ DraftingBotAgent integrated with templates

---

### Phase 3: Blockchain Deployment (Week 5)

**Goal:** Deploy smart contract to Sepolia testnet, then Polygon mainnet

#### 3.1: Smart Contract Deployment

```bash
# Deploy to Sepolia (testnet - FREE)
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# Deploy to Polygon (mainnet - ~$5-10)
npx hardhat run scripts/deploy.js --network polygon

# Verify on Polygonscan
npx hardhat verify --network polygon <CONTRACT_ADDRESS>
```

#### 3.2: Case Registration API

```python
# backend/services/blockchain_service.py

class BlockchainService:
    def register_case_on_chain(self, case_id):
        """Register case on blockchain"""
        case = get_case(case_id)
        
        # 1. Upload case data to IPFS
        ipfs_hash = upload_to_ipfs(case.to_json())
        
        # 2. Call smart contract
        web3 = Web3(Web3.HTTPProvider(POLYGON_RPC_URL))
        contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        
        tx = contract.functions.registerCase(
            jurisdiction=case.jurisdiction,
            tenantAddress=case.tenant_wallet,
            propertyAddress=case.property_address,
            ipfsHash=ipfs_hash
        ).transact()
        
        # 3. Wait for confirmation
        receipt = web3.eth.wait_for_transaction_receipt(tx)
        
        # 4. Update case record
        case.blockchain_tx = receipt['transactionHash']
        case.blockchain_confirmed = True
        case.save()
        
        return {
            'tx_hash': receipt['transactionHash'],
            'case_id': case_id,
            'blockchain_url': f"https://polygonscan.com/tx/{receipt['transactionHash']}"
        }
```

#### 3.3: Verification Portal

```html
<!-- blockchain/verification_portal.html -->

<!DOCTYPE html>
<html>
<head>
    <title>Tenant Case Verification</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Tenant Justice Stack - Case Verification</h1>
        <p>Verify case authenticity on the blockchain</p>
        
        <input type="text" id="caseId" placeholder="Enter Case ID">
        <button onclick="verifyCaseOnBlockchain()">Verify</button>
        
        <div id="result"></div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js"></script>
    <script>
        async function verifyCaseOnBlockchain() {
            const caseId = document.getElementById('caseId').value;
            
            // Query blockchain
            const web3 = new Web3('https://polygon-rpc.com');
            const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            
            const caseData = await contract.methods.getCase(caseId).call();
            
            document.getElementById('result').innerHTML = `
                <div class="verified">
                    <h2>✅ Case Verified</h2>
                    <p>Tenant: ${caseData.tenantAddress}</p>
                    <p>Property: ${caseData.propertyAddress}</p>
                    <p>Registered: ${new Date(caseData.registrationDate * 1000).toLocaleDateString()}</p>
                    <a href="https://polygonscan.com/address/${CONTRACT_ADDRESS}">View on Polygon</a>
                </div>
            `;
        }
    </script>
</body>
</html>
```

**Success Criteria:**
- ✅ Smart contract deployed to Sepolia
- ✅ Contract verified on Etherscan
- ✅ Smart contract deployed to Polygon
- ✅ Case registration working
- ✅ Verification portal accessible

---

### Phase 4: Frontend UI (Weeks 6-7)

**Goal:** Build Vue.js intake portal, case dashboard, document viewer

#### 4.1: Tenant Portal (tenant.law)

```vue
<!-- frontend/src/components/TenantIntake.vue -->

<template>
  <div class="intake-wizard">
    <h1>Tell Us Your Story</h1>
    <p>Describe your housing situation in your own words</p>
    
    <div class="steps">
      <div class="step" v-for="(step, index) in steps" :key="index">
        <h2>{{ step.title }}</h2>
        <component :is="step.component" v-model="formData[step.key]" />
      </div>
    </div>
    
    <button @click="submitIntake" class="btn-primary">
      Analyze My Case
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        story: '',
        contact: '',
        jurisdiction: 'georgia'
      },
      steps: [
        {
          title: "What's Your Housing Situation?",
          key: 'story',
          component: 'TextAreaStep'
        },
        {
          title: 'Your Contact Information',
          key: 'contact',
          component: 'ContactStep'
        }
      ]
    };
  },
  methods: {
    async submitIntake() {
      const response = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.formData)
      });
      
      const result = await response.json();
      this.$router.push(`/cases/${result.case_id}`);
    }
  }
};
</script>
```

#### 4.2: Case Dashboard

```vue
<!-- frontend/src/components/CaseDashboard.vue -->

<template>
  <div class="dashboard">
    <h1>Your Case: {{ case.property_address }}</h1>
    
    <div class="case-status">
      <div class="status-card">
        <h3>Case Status</h3>
        <p>{{ case.status }}</p>
      </div>
      
      <div class="status-card">
        <h3>Potential Damages</h3>
        <p>${{ case.damages_estimate }}</p>
      </div>
      
      <div class="status-card">
        <h3>Blockchain Registration</h3>
        <button v-if="!case.blockchain_tx" @click="registerOnBlockchain">
          Register Case
        </button>
        <a v-else :href="polygonscanUrl" target="_blank">
          View on Polygon ✓
        </a>
      </div>
    </div>
    
    <div class="documents">
      <h2>Generated Documents</h2>
      <button v-for="doc in documents" :key="doc" @click="downloadDocument(doc)">
        📄 {{ formatDocName(doc) }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  async mounted() {
    this.loadCase();
  },
  methods: {
    async loadCase() {
      const response = await fetch(`/api/v1/cases/${this.$route.params.id}`);
      this.case = await response.json();
    },
    async registerOnBlockchain() {
      const response = await fetch(`/api/v1/cases/${this.case.id}/blockchain/register`, {
        method: 'POST'
      });
      const result = await response.json();
      this.case.blockchain_tx = result.tx_hash;
    },
    async downloadDocument(docType) {
      window.location = `/api/v1/cases/${this.case.id}/documents/${docType}`;
    }
  }
};
</script>
```

#### 4.3: Legal Professional Portal (legal.law)

```vue
<!-- frontend/src/components/LegalPortal.vue -->

<template>
  <div class="legal-portal">
    <h1>Legal Professional Dashboard</h1>
    
    <div class="pro-bono-cases">
      <h2>Available Pro-Bono Cases</h2>
      <div class="case-list">
        <div v-for="case in cases" :key="case.id" class="case-item">
          <h3>{{ case.property_address }}</h3>
          <p>Tenant: {{ case.tenant_name }}</p>
          <p>Damages: ${{ case.damages_estimate }}</p>
          <p>Legal Theory: {{ case.primary_legal_theory }}</p>
          <button @click="acceptCase(case.id)">Accept Case</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

**Success Criteria:**
- ✅ Tenant intake wizard complete
- ✅ Case dashboard working
- ✅ Document download functioning
- ✅ Legal portal accessible
- ✅ Blockchain integration UI-complete
- ✅ Mobile-responsive design

---

### Phase 5: Integration & QA (Week 8)

**Goal:** Full E2E testing, security audit, MVP release

#### 5.1: E2E Testing

```bash
# End-to-end flow: Story → Case → Documents → Blockchain

# 1. Intake story
curl -X POST http://localhost:8000/api/v1/cases \
  -H "Content-Type: application/json" \
  -d '{"story": "I have mold in my apartment..."}'

# 2. Retrieve case
curl http://localhost:8000/api/v1/cases/{caseId}

# 3. Generate documents
curl -X POST http://localhost:8000/api/v1/cases/{caseId}/documents

# 4. Register on blockchain
curl -X POST http://localhost:8000/api/v1/cases/{caseId}/blockchain/register

# 5. Verify on blockchain
curl http://verify.law/case/{caseId}
```

#### 5.2: Security Audit Checklist

- [ ] API input validation (prevent SQL injection)
- [ ] Authentication/Authorization (JWT tokens)
- [ ] CORS configuration (allow only .law subdomains)
- [ ] SSL certificates (Let's Encrypt valid)
- [ ] Private key management (.env properly ignored)
- [ ] Database encryption (at rest)
- [ ] PII encryption (tenant data)
- [ ] Rate limiting (prevent abuse)
- [ ] HTTPS redirect (all traffic encrypted)

#### 5.3: Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Case intake | < 5 seconds | TBD |
| Document generation | < 10 seconds | TBD |
| API response | < 200ms | TBD |
| Website load | < 2 seconds | TBD |
| Blockchain registration | < 30 seconds | TBD |

**Success Criteria:**
- ✅ E2E tests passing 100%
- ✅ Security audit passed
- ✅ Performance targets met
- ✅ MVP ready for public launch
- ✅ All documentation complete

---

### Phase 6: Multi-Jurisdiction Support (Weeks 9-10)

**Goal:** Add California and New York law packs

#### 6.1: California Law Pack

```json
{
  "jurisdiction": "california",
  "state_code": "CA",
  "statutes": [
    {
      "code": "Cal. Civil Code § 1941",
      "title": "Implied Warranty of Habitability",
      "summary": "Landlord must maintain premises in condition fit for occupancy"
    },
    {
      "code": "Cal. Civil Code § 1942",
      "title": "Tenant's Right to Repair and Deduct",
      "remedies": ["repair_deduct", "repair_and_sue", "constructive_eviction"]
    }
  ]
}
```

#### 6.2: New York Law Pack

```json
{
  "jurisdiction": "newyork",
  "state_code": "NY",
  "statutes": [
    {
      "code": "NY Real Property Law § 235-b",
      "title": "Warranty of Habitability",
      "summary": "Premises must be fit for dwelling for ordinary use"
    },
    {
      "code": "NY Real Property Law § 223-e",
      "title": "Repair and Deduct",
      "remedies": ["repair_deduct", "rent_abatement", "warranty_breach_suit"]
    }
  ]
}
```

#### 6.3: Jurisdiction Selection

- Update intake form to select jurisdiction
- Auto-load correct law pack based on property address
- Generate state-specific documents
- Use state-appropriate statutes in legal analysis

**Success Criteria:**
- ✅ 3-state MVP (GA, CA, NY)
- ✅ Jurisdiction-specific documents generating correctly
- ✅ Legal analysis using correct statutes
- ✅ Multi-state E2E testing passing

---

### Phase 7: Law Practice Plugin System (Weeks 11-12)

**Goal:** Build extensible framework for any practice area

#### 7.1: Generic Practice Area Plugin

```python
# backend/plugins/base_practice_plugin.py

class PracticeAreaPlugin:
    """Base class for any legal practice area"""
    
    def __init__(self, name, jurisdiction, statutes, templates):
        self.name = name  # "housing", "family_law", "immigration"
        self.jurisdiction = jurisdiction
        self.statutes = statutes
        self.templates = templates
        self.agents = self._load_agents()
    
    def _load_agents(self):
        """Load agents for this practice area"""
        # Load generic agents + practice-specific agents
        pass
    
    def process_case(self, case_data):
        """Process case through practice area agents"""
        pass
    
    def generate_documents(self, case_id):
        """Generate practice-area-specific documents"""
        pass
```

#### 7.2: Example - Family Law Plugin

```python
class FamilyLawPlugin(PracticeAreaPlugin):
    def __init__(self):
        super().__init__(
            name="family_law",
            jurisdiction="georgia",
            statutes=[
                "GA Code § 34-26-2",  # Domestic violence
                "GA Code § 19-6-20"   # Child custody
            ],
            templates=[
                "protective_order",
                "custody_petition",
                "support_calculation"
            ]
        )
    
    def process_case(self, case_data):
        # Family law specific processing
        pass
```

#### 7.3: Plugin Registry

```python
# backend/plugin_registry.py

PLUGINS = {
    'housing': HousingPlugin,
    'family_law': FamilyLawPlugin,
    'immigration': ImmigrationPlugin,
    'employment': EmploymentPlugin,
    'consumer': ConsumerPlugin,
}

def load_plugin(practice_area, jurisdiction):
    plugin_class = PLUGINS.get(practice_area)
    if not plugin_class:
        raise ValueError(f"Unknown practice area: {practice_area}")
    return plugin_class()
```

**Success Criteria:**
- ✅ Plugin system designed and tested
- ✅ Housing plugin refactored as plugin
- ✅ 2+ additional plugins created (Family Law, Immigration)
- ✅ Plugin marketplace documentation written

---

### Phase 8: Scale to Other Practice Areas (Weeks 13-16)

**Goal:** Launch employment, immigration, consumer practice areas

#### 8.1: Employment Law Plugin

```python
class EmploymentPlugin(PracticeAreaPlugin):
    statutes = [
        "Fair Labor Standards Act",
        "Americans with Disabilities Act",
        "Title VII (discrimination)",
        "Family Medical Leave Act"
    ]
    
    agents = [
        'intake_bot',
        'timeline_bot',
        'law_mapping_bot',
        'damages_calculator_employment',
        'document_generator',
        'defense_simulator'
    ]
    
    templates = [
        'cease_and_desist',
        'demand_letter_unpaid_wages',
        'discrimination_complaint',
        'eeoc_charge'
    ]
```

#### 8.2: Immigration Law Plugin

```python
class ImmigrationPlugin(PracticeAreaPlugin):
    statutes = [
        "Immigration and Nationality Act",
        "Violence Against Women Act",
        "Trafficking Victims Protection Act"
    ]
    
    agents = [
        'intake_bot',
        'eligibility_analyzer',
        'form_generator',
        'interview_prep_bot'
    ]
    
    templates = [
        'i_130_petition',
        'i_485_adjustment',
        'i_539_extension',
        'u_visa_application'
    ]
```

#### 8.3: Consumer Protection Plugin

```python
class ConsumerPlugin(PracticeAreaPlugin):
    statutes = [
        "Fair Debt Collection Practices Act",
        "Truth in Lending Act",
        "Fair Credit Reporting Act"
    ]
    
    agents = [
        'intake_bot',
        'debt_analyzer',
        'statute_of_limitations_checker',
        'validation_letter_generator'
    ]
    
    templates = [
        'debt_validation_letter',
        'cease_and_desist_collection',
        'cease_communications'
    ]
```

**Success Criteria:**
- ✅ 5+ practice areas operational
- ✅ Each area has 3+ statutes documented
- ✅ Each area has 3+ document templates
- ✅ Auto-routing based on practice area
- ✅ 24-week completion target achieved

---

## 🌍 Web3 Domain Architecture

### Primary Domains

| Domain | Purpose | Tech Stack | Auto-Deploy |
|--------|---------|-----------|-------------|
| **app.law** | Tenant intake | Vue.js | Vercel |
| **tenant.law** | Tenant portal | Vue.js + FastAPI | GitHub Pages + Vercel |
| **legal.law** | Lawyer portal | Vue.js + FastAPI | GitHub Pages |
| **api.law** | REST API | FastAPI | AWS Lambda / Railway |
| **docs.law** | API docs | Swagger + Astro | GitHub Pages |
| **verify.law** | Blockchain verification | HTML/JS + Web3 | GitHub Pages |
| **admin.law** | Admin dashboard | Vue.js + FastAPI | Private (VPC) |

### Deployment Targets

- **Tenant Portal:** Vercel (global CDN, auto-scaling)
- **Lawyer Portal:** GitHub Pages (static, free)
- **API:** AWS Lambda + API Gateway (serverless, auto-scale)
- **Database:** AWS RDS (managed PostgreSQL)
- **Blockchain:** Polygon Network (mainnet)
- **Storage:** AWS S3 + CloudFront (documents, evidence)
- **Email:** SendGrid (transactional)

---

## 💰 Cost Analysis (Monthly Estimates)

| Component | Free Tier | Production |
|-----------|-----------|-----------|
| **FastAPI Backend** | Heroku free tier | AWS Lambda: $1-50 |
| **Database** | PostgreSQL local | AWS RDS: $50-200 |
| **Website Hosting** | GitHub Pages | Vercel/Netlify: $50-100 |
| **Blockchain** | Sepolia testnet (free) | Polygon: $0-20 |
| **IPFS Storage** | Pinata free (1GB) | Pinata paid: $20-100 |
| **Email** | SendGrid free (100/day) | SendGrid: $10-50 |
| **CDN/Cache** | Cloudflare free | Cloudflare: $0-50 |
| **SSL Certificates** | Let's Encrypt (free) | Let's Encrypt (free) |
| **DNS** | Route53/Cloudflare | Route53: $10 |
| **Monitoring** | Sentry free | Sentry: $30-100 |
| **Total** | ~$0 | ~$170-610 |

**Profitability Path:**
- Phase 5 (Week 8): Launch MVP free for all users
- Phase 10 (Week 12+): Introduce freemium model ($5-20/case for lawyers)
- Phase 12 (Week 16+): B2B licensing to law firms
- **Projected ARR at scale:** $500K-$2M

---

## 🎯 Success Metrics (16-Week Timeline)

| Milestone | Metric | Target | Current |
|-----------|--------|--------|---------|
| **Week 1** | Infra ready | ✅ All services up | 0% |
| **Week 2** | Agents working | ✅ 8/8 agents passing | 0% |
| **Week 4** | Documents generating | ✅ 4 document types | 0% |
| **Week 5** | Blockchain live | ✅ On Sepolia + Polygon | 0% |
| **Week 7** | UI complete | ✅ Tenant + Legal portals | 0% |
| **Week 8** | MVP launch | ✅ Georgia cases ready | 0% |
| **Week 10** | 3-state | ✅ GA + CA + NY | 0% |
| **Week 12** | Plugin system | ✅ 5 practice areas | 0% |
| **Week 16** | Full platform | ✅ 5+ practice areas live | 0% |

---

## 🚀 Next Steps

### Immediate (Today)

1. ✅ Create GitHub repository with structure
2. ✅ Setup Docker Compose environment
3. ✅ Deploy Phase 0 infrastructure code

### Week 1

4. Run `docker-compose up` and verify all services start
5. Test API: `curl http://localhost:8000/health`
6. Begin Phase 1 agent implementation

### Ongoing

7. Weekly sprint reviews
8. Bi-weekly demos to stakeholders
9. Monthly law pack additions
10. Continuous security audits

---

## 📞 Support & Escalation

**GitHub Issues:** Use for bugs and feature requests  
**Discussions:** Use for architecture questions  
**Wiki:** Use for documentation  
**Email:** Use for sensitive matters  

---

**Version:** 1.0  
**Last Updated:** November 6, 2025  
**Status:** 🚀 READY TO EXECUTE  
**Questions?** See DOCUMENTATION_INDEX.md for navigation
