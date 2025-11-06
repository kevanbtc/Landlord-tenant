# Tenant Justice Stack – System Architecture

**Version:** 0.1  
**Date:** November 6, 2025  
**Status:** Design Phase → Implementation  

---

## Executive Summary

The **Tenant Justice Stack** is a three-layer platform that enables tenants to:

1. **Intake & Structure** their housing crisis into court-ready facts
2. **AI-Powered Analysis** mapping facts to jurisdiction-specific law
3. **Document Generation** creating demand letters, complaints, evidence indexes
4. **Blockchain Registration** anchoring evidence on immutable ledgers
5. **Public Verification** allowing courts, lawyers, or media to independently verify

**Target User:** Low-income tenants facing habitability crises (mold, water, no repair, health hazards)

**Non-Target:** This is NOT a replacement for licensed attorneys. It IS a force multiplier that lets tenants walk into negotiations or court with professional-grade preparation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TENANT FRONTEND (UI)                     │
│  Guided intake wizard → case builder → document downloads   │
│           verification portal (public, read-only)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               AI SWARM LAYER (Backend Services)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Intake  │→ │ Timeline │→ │   Law    │→ │ Damages  │    │
│  │   Bot    │  │   Bot    │  │   Bot    │  │   Bot    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│       ↓               ↓             ↓             ↓          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Drafting │← │ Defense  │← │ Rebuttal │← │Orchestr. │    │
│  │   Bot    │  │   Sim    │  │   Bot    │  │  (main)  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                               │
│  + Law Packs (jurisdiction-specific statutes & rules)       │
│  + Templates (demand letter, complaint, evidence list)      │
│  + Health/Mold Domain Knowledge Base                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           BLOCKCHAIN & DATA LAYER (Web3)                     │
│  ┌────────────────────┐      ┌──────────────────────┐       │
│  │ Smart Contract     │      │ IPFS/Arweave Storage │       │
│  │ TenantCaseRegistry │      │ (Evidence files)     │       │
│  │                    │      │                      │       │
│  │ • openCase()       │  ←→  │ • Case summaries     │       │
│  │ • registerEvidence │      │ • Timeline JSONs     │       │
│  │ • linkCourt()      │      │ • Evidence CIDs      │       │
│  │ • closeCase()      │      │ • Photo/doc hashes   │       │
│  └────────────────────┘      └──────────────────────┘       │
│                                                               │
│  Multi-chain deployment:                                     │
│  ├─ Ethereum Mainnet (archival)                             │
│  ├─ Polygon (primary production)                            │
│  ├─ Optimism / Arbitrum (redundancy)                        │
│  ├─ Base (cost-effective)                                   │
│  └─ Sepolia Testnet (staging)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. DATA MODEL

### 1.1 Core Entities

```json
{
  "Case": {
    "id": "string (UUID)",
    "caseId": "GA-FULTON-2025-001",
    "tenantWallet": "0x...",
    "jurisdiction": "US-GA-Fulton",
    "propertyAddress": "string",
    "propertyCoordinates": { "lat": 33.9, "lng": -84.1 },
    "openedAt": "ISO8601",
    "status": "active|resolved|archived",
    
    "summary": {
      "mainIssues": ["mold", "no_water", "no_repair"],
      "durationMonths": 5,
      "healthImpact": "respiratory|skin|behavioral|etc",
      "occupants": { "adults": 1, "children": 2, "ages": [8, 12] }
    },
    
    "parties": {
      "tenant": { "name": "anonymized or full", "contact": "email|phone" },
      "landlord": { "name": "string", "entity": "individual|llc|corp" },
      "propertyManager": { "name": "optional", "company": "optional" }
    },
    
    "documents": {
      "lease": { "fileId": "string", "hash": "IPFS_CID" },
      "photos": [{ "id": "EXH-A-01", "date": "2025-05-15", "hash": "IPFS_CID" }],
      "messages": [{ "id": "EXH-B-01", "date": "2025-05-16", "type": "text|email", "hash": "IPFS_CID" }],
      "medicalReports": [{ "id": "EXH-M-01", "hash": "IPFS_CID", "anonymized": true }]
    },
    
    "timeline": [
      {
        "date": "2025-05-10",
        "actor": "tenant",
        "action": "noticed_leak",
        "description": "Water dripping from ceiling, bathroom",
        "evidence": ["EXH-A-01", "EXH-A-02"],
        "notificationMethod": null
      },
      {
        "date": "2025-05-11",
        "actor": "tenant",
        "action": "notified_landlord",
        "description": "Called landlord, left voicemail",
        "evidence": ["EXH-B-01"],
        "notificationMethod": "phone"
      },
      {
        "date": "2025-05-15",
        "actor": "landlord",
        "action": "sent_contractor",
        "description": "Contractor came, said 'beyond scope, need plumber'",
        "evidence": ["EXH-C-01"],
        "notificationMethod": "in_person"
      },
      {
        "date": "2025-09-01",
        "actor": "tenant",
        "action": "case_filed",
        "description": "Opened case in system",
        "evidence": [],
        "notificationMethod": null
      }
    ],
    
    "legalAnalysis": {
      "jurisdiction": "US-GA-Fulton",
      "applicableStatutes": [
        {
          "citation": "O.C.G.A. § 44-7-13",
          "shortName": "Duty to Keep in Repair",
          "summary": "Landlord must keep premises in repair",
          "relevance": "direct_violation",
          "evidence": ["EXH-A-01", "EXH-A-02"]
        },
        {
          "citation": "HB 404",
          "shortName": "Safe at Home Act",
          "summary": "Habitability protections; tenant right to repair/rent abate",
          "relevance": "direct_violation",
          "evidence": ["Timeline: 5 months without repair"]
        },
        {
          "citation": "O.C.G.A. § 34-7-2",
          "shortName": "Implied Warranty of Habitability",
          "summary": "Premises must be fit for human occupancy",
          "relevance": "direct_violation",
          "evidence": ["Medical reports indicating mold exposure"]
        }
      ],
      "legalTheories": [
        {
          "theory": "Breach of Habitability",
          "strength": "strong",
          "elements": [
            { "element": "Landlord had duty", "satisfied": true, "evidence": ["O.C.G.A. § 44-7-13"] },
            { "element": "Landlord breached (no repair)", "satisfied": true, "evidence": ["EXH-B-01", "Timeline"] },
            { "element": "Tenant notified", "satisfied": true, "evidence": ["EXH-B-01", "EXH-B-02"] },
            { "element": "Duration (>30 days)", "satisfied": true, "evidence": ["Timeline: 5 months"] }
          ]
        },
        {
          "theory": "Constructive Eviction",
          "strength": "moderate",
          "elements": [
            { "element": "Uninhabitable condition", "satisfied": true, "evidence": ["Medical reports"] },
            { "element": "Caused by landlord", "satisfied": true, "evidence": ["Failure to repair"] },
            { "element": "Tenant vacated as result", "satisfied": false, "evidence": ["Still occupying"] }
          ]
        },
        {
          "theory": "Negligence (Mold)",
          "strength": "strong",
          "elements": [
            { "element": "Duty to maintain", "satisfied": true, "evidence": ["Lease", "Statute"] },
            { "element": "Breach (ignored leak → mold)", "satisfied": true, "evidence": ["Timeline"] },
            { "element": "Causation (mold → health)", "satisfied": true, "evidence": ["Medical reports"] },
            { "element": "Damages (medical, relocation)", "satisfied": true, "evidence": ["Receipts"] }
          ]
        }
      ],
      "defenseAnticipatd": [
        {
          "defense": "We didn't know",
          "likelihood": "high",
          "rebuttal": "Tenant notified on [DATE] via [METHOD]; evidence: EXH-B-01"
        },
        {
          "defense": "We were working on it / contractor delays",
          "likelihood": "high",
          "rebuttal": "5 months elapsed; contractor said 'beyond scope'; landlord took no follow-up action. Evidence: EXH-C-01, Timeline"
        },
        {
          "defense": "Tenant caused damage",
          "likelihood": "moderate",
          "rebuttal": "Water intrusion from roof; tenant has no control over exterior. Evidence: EXH-A-01 shows ceiling damage, not fixture misuse"
        }
      ]
    },
    
    "damages": {
      "rentAbatement": {
        "monthlyRent": 3000,
        "percentageUninhab": 60,
        "monthsAffected": 5,
        "subtotal": 9000,
        "notes": "60% = loss of 2 of 3 bathrooms + water damage in living area"
      },
      "repairCosts": {
        "moldRemediation": 5000,
        "plumbing": 3500,
        "drywall": 2000,
        "subtotal": 10500
      },
      "relocation": {
        "hotelNights": 15,
        "costPerNight": 150,
        "subtotal": 2250
      },
      "medical": {
        "doctorVisits": 3,
        "costPerVisit": 200,
        "prescriptions": 400,
        "subtotal": 1000
      },
      "securityDeposit": 3000,
      
      "total": {
        "conservative": 25750,
        "aggressive": 50000,
        "punitiveDamagesPotential": "25000-50000 if bad faith shown"
      },
      "calculation_notes": "See damages worksheet attached as EXH-D-01"
    },
    
    "blockchainAnchors": [
      {
        "network": "polygon",
        "contractAddress": "0x...",
        "caseRegistryTxn": "0x...",
        "blockNumber": 12345678,
        "timestamp": "2025-11-06T14:32:00Z",
        "summaryIPFS": "QmXxxx...",
        "status": "registered"
      },
      {
        "network": "ethereum",
        "contractAddress": "0x...",
        "status": "pending"
      }
    ],
    
    "publicVerificationLink": "https://verify.tenant-justice.io/case/GA-FULTON-2025-001?key=XxXx",
    
    "notes": "string; internal case notes"
  },
  
  "Evidence": {
    "id": "EXH-A-01",
    "caseId": "GA-FULTON-2025-001",
    "type": "photo|message|document|medical|receipt|other",
    "category": "damage|communication|lease|proof_of_notice|medical|financial|timeline",
    "description": "Water damage in bathroom ceiling, taken morning after tenant reported leak",
    "date": "2025-05-15",
    "uploadedAt": "2025-11-05",
    "submittedBy": "tenant|landlord|third_party",
    
    "file": {
      "name": "bathroom_ceiling_20250515.jpg",
      "mimeType": "image/jpeg",
      "sizeBytes": 2048000,
      "localPath": "/evidence/...",
      "ipfsCID": "QmXxxx...",
      "arweaveID": "optional"
    },
    
    "metadata": {
      "location": "bathroom, main floor",
      "timestamp": "2025-05-15T08:30:00Z",
      "relevantToLegalTheories": ["breach_of_habitability", "negligence"],
      "rebuttsDefense": "Tenant did not cause damage; clearly water intrusion from above"
    },
    
    "anonymization": {
      "requiresRedaction": false,
      "sensitiveData": null,
      "redactedVersion": null
    },
    
    "blockchainReference": {
      "registeredOn": ["polygon", "ethereum"],
      "txnHashes": ["0x...", "0x..."],
      "timestamp": "2025-11-06T14:32:00Z"
    }
  },
  
  "Timeline": {
    "caseId": "GA-FULTON-2025-001",
    "events": [
      {
        "date": "2025-05-10",
        "time": "09:00",
        "actor": "tenant",
        "action": "noticed_leak",
        "description": "Water dripping from ceiling in bathroom",
        "evidence": ["EXH-A-01", "EXH-A-02"],
        "legalSignificance": "Marks beginning of habitability defect"
      }
    ],
    "durationAnalysis": {
      "issueStarted": "2025-05-10",
      "issueResolved": null,
      "daysUnrepaired": 145,
      "legalThreshold": "30+ days = clear breach",
      "assessment": "FAR EXCEEDS statutory requirement for breach"
    }
  },
  
  "LawPack": {
    "jurisdiction": "US-GA-Fulton",
    "statutes": [
      {
        "citation": "O.C.G.A. § 44-7-13",
        "title": "Duty to Keep in Repair",
        "fullText": "...",
        "summary": "Landlord must keep premises in repair and fit for human occupancy",
        "relevantSections": ["repair", "habitability"],
        "remedies": ["rent_abatement", "specific_performance", "damages"]
      }
    ],
    "casesPrecedent": [
      {
        "citation": "Example v. Landlord (2020)",
        "court": "Georgia Supreme Court",
        "facts": "Similar habitability issue",
        "holding": "Tenant entitled to rent abatement"
      }
    ]
  }
}
```

---

## 2. AI SWARM – Agent Architecture

### 2.1 Agent Types & Data Flow

```
INPUT: Case Object (partial or full)
       ↓
    ┌─────────────────────────────────────┐
    │    ORCHESTRATOR (Conductor Agent)   │
    │  Decides flow & consistency         │
    └─────────────────────────────────────┘
       ↓
    ┌─────────────────────────────────────┐
    │ 1. INTAKE BOT                       │
    │ Raw story → Structured facts        │
    │ Output: Case object (partial)       │
    └──────────────┬──────────────────────┘
       ↓
    ┌─────────────────────────────────────┐
    │ 2. TIMELINE BOT                     │
    │ Facts → Chronological order         │
    │ Attach evidence IDs                 │
    │ Output: Timeline array              │
    └──────────────┬──────────────────────┘
       ↓
    ┌─────────────────────────────────────┐
    │ 3. LAW BOT (with Law Pack)          │
    │ Facts + jurisdiction → Statutes     │
    │ Output: Applicable laws, theories   │
    └──────────────┬──────────────────────┘
       ↓
    ┌─────────────────────────────────────┐
    │ 4. HEALTH/MOLD BOT                  │
    │ Issue type → Health risks           │
    │ Output: Medical context             │
    └──────────────┬──────────────────────┘
       ↓
    ┌─────────────────────────────────────┐
    │ 5. DAMAGES BOT                      │
    │ Rent + months + repairs → $$$       │
    │ Output: Damages table               │
    └──────────────┬──────────────────────┘
       ↓
    ┌─────────────────────────────────────┐
    │ 6. DRAFTING BOT (with Templates)    │
    │ Case object → Documents             │
    │ Output: Demand letter, complaint    │
    └──────────────┬──────────────────────┘
       ↓
    ┌─────────────────────────────────────┐
    │ 7. DEFENSE SIM BOT                  │
    │ Predicts landlord arguments         │
    │ Output: Anticipated defenses        │
    └──────────────┬──────────────────────┘
       ↓
    ┌─────────────────────────────────────┐
    │ 8. REBUTTAL BOT                     │
    │ Defense → Counter arguments         │
    │ Output: Rebuttal language           │
    └──────────────┬──────────────────────┘
       ↓
    FINAL OUTPUT: Complete case package
                 (timeline, law, damages, docs, rebuttals)
```

### 2.2 Agent Specification

Each agent is a Python class with:

```python
class Agent:
    def __init__(self, config, law_pack=None, templates=None):
        self.config = config
        self.law_pack = law_pack
        self.templates = templates
    
    def process(self, case_object):
        """Main processing method"""
        pass
    
    def validate_output(self, result):
        """Ensure output meets quality threshold"""
        pass
    
    def add_provenance(self, result):
        """Tag output with agent name, timestamp, version"""
        pass
```

Example: `LawMappingAgent`

```python
class LawMappingAgent(Agent):
    def process(self, case):
        """
        Input: Case with timeline + issues
        Output: Applicable statutes, legal theories, defenses
        """
        applicable_laws = []
        
        # Load jurisdiction law pack
        laws = self.law_pack.get(case.jurisdiction)
        
        # For each issue in case, find matching laws
        for issue in case.summary.mainIssues:
            for law in laws:
                if self._matches(issue, law):
                    applicable_laws.append({
                        'citation': law['citation'],
                        'relevance': self._score_relevance(issue, law),
                        'evidence': self._find_evidence(case, law)
                    })
        
        # Generate legal theories from applicable laws
        theories = self._build_theories(applicable_laws, case)
        
        # Predict defenses using historical patterns
        defenses = self._anticipate_defenses(applicable_laws, case)
        
        return {
            'applicableStatutes': applicable_laws,
            'legalTheories': theories,
            'anticipatedDefenses': defenses
        }
```

---

## 3. BLOCKCHAIN LAYER

### 3.1 Smart Contract: `TenantCaseRegistry.sol`

```solidity
pragma solidity ^0.8.20;

contract TenantCaseRegistry {
    
    struct Case {
        uint256 id;
        address tenant;
        string jurisdiction;
        string caseIdExternal;  // "GA-FULTON-2025-001"
        string summaryIpfs;     // IPFS CID of full case JSON
        uint256 openedAt;
        uint256 closedAt;
        bool isClosed;
        string publicVerificationKey;  // Unique token for public link
    }
    
    struct Evidence {
        uint256 caseId;
        string externalId;      // "EXH-A-01"
        string category;        // "photo", "message", etc.
        string ipfsHash;        // IPFS CID of file
        uint256 timestamp;
        string description;     // Plain English description
    }
    
    mapping(uint256 => Case) public cases;
    mapping(uint256 => Evidence[]) public caseEvidence;
    mapping(string => uint256) public externalIdToCase;
    
    uint256 public nextCaseId = 1;
    
    event CaseOpened(uint256 indexed caseId, address indexed tenant, string jurisdiction);
    event EvidenceRegistered(uint256 indexed caseId, string externalId, uint256 timestamp);
    event CaseClosed(uint256 indexed caseId, uint256 timestamp);
    
    function openCase(
        string memory _jurisdiction,
        string memory _caseIdExternal,
        string memory _summaryIpfs
    ) external returns (uint256) {
        uint256 caseId = nextCaseId++;
        cases[caseId] = Case({
            id: caseId,
            tenant: msg.sender,
            jurisdiction: _jurisdiction,
            caseIdExternal: _caseIdExternal,
            summaryIpfs: _summaryIpfs,
            openedAt: block.timestamp,
            closedAt: 0,
            isClosed: false,
            publicVerificationKey: keccak256(abi.encodePacked(msg.sender, caseId, block.timestamp))
        });
        
        externalIdToCase[_caseIdExternal] = caseId;
        emit CaseOpened(caseId, msg.sender, _jurisdiction);
        return caseId;
    }
    
    function registerEvidence(
        uint256 _caseId,
        string memory _externalId,
        string memory _category,
        string memory _ipfsHash,
        string memory _description
    ) external {
        require(msg.sender == cases[_caseId].tenant, "Only case owner");
        require(!cases[_caseId].isClosed, "Case is closed");
        
        caseEvidence[_caseId].push(Evidence({
            caseId: _caseId,
            externalId: _externalId,
            category: _category,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            description: _description
        }));
        
        emit EvidenceRegistered(_caseId, _externalId, block.timestamp);
    }
    
    function getCase(uint256 _caseId) external view returns (Case memory) {
        return cases[_caseId];
    }
    
    function getEvidence(uint256 _caseId) external view returns (Evidence[] memory) {
        return caseEvidence[_caseId];
    }
    
    function closeCase(uint256 _caseId) external {
        require(msg.sender == cases[_caseId].tenant, "Only case owner");
        cases[_caseId].isClosed = true;
        cases[_caseId].closedAt = block.timestamp;
        emit CaseClosed(_caseId, block.timestamp);
    }
}
```

### 3.2 Deployment Strategy

**Multi-Chain Rollout:**

| Network | Type | Cost | Purpose | When |
|---------|------|------|---------|------|
| Sepolia | L1 Testnet | FREE | Staging | Phase 1 |
| Polygon | L2 | $2–10/case | Primary | Phase 2 |
| Ethereum | L1 Mainnet | $50–200/case | Archival | Phase 2 |
| Arbitrum | L2 | $0.50–2/case | Redundancy | Phase 2 |
| Optimism | L2 | $0.50–2/case | Redundancy | Phase 3 |
| Base | L2 | $0.20–1/case | Redundancy | Phase 3 |

**Deployment Script (hardhat):**

```bash
npx hardhat run scripts/deploy.js --network polygon
npx hardhat run scripts/deploy.js --network ethereum
npx hardhat run scripts/deploy.js --network arbitrum
# etc.
```

---

## 4. FRONTEND – Tenant UI

### 4.1 User Flow

```
┌─────────────────────────────────┐
│  Tenant Visit Website            │
└──────────────┬──────────────────┘
               ↓
        ┌──────────────────────┐
        │ "What happened?"     │
        │ Guided Interview     │
        │ (Vue component)      │
        └──────────┬───────────┘
               ↓
        ┌──────────────────────┐
        │ Upload Evidence      │
        │ Photos, messages,    │
        │ documents, medical   │
        └──────────┬───────────┘
               ↓
        ┌──────────────────────┐
        │ Select Jurisdiction  │
        │ (GA, CA, NY, etc.)   │
        └──────────┬───────────┘
               ↓
        ┌──────────────────────┐
        │ AI Swarm Processes   │
        │ (backend, ~30 sec)   │
        └──────────┬───────────┘
               ↓
        ┌──────────────────────┐
        │ Review & Refine      │
        │ • Timeline OK?       │
        │ • Damages right?     │
        │ • Missing evidence?  │
        └──────────┬───────────┘
               ↓
        ┌──────────────────────┐
        │ Download Package     │
        │ • Demand letter      │
        │ • Complaint draft    │
        │ • Evidence index     │
        │ • Timeline           │
        │ • Damages worksheet  │
        └──────────┬───────────┘
               ↓
        ┌──────────────────────┐
        │ Optional: Register   │
        │ Evidence on-chain    │
        │ (1-3 min per network)│
        └──────────┬───────────┘
               ↓
        ┌──────────────────────┐
        │ Get Public Link      │
        │ for verification     │
        │ (share w/ lawyer,    │
        │  landlord, court)    │
        └──────────────────────┘
```

### 4.2 Key Vue Components

```
tenant-justice-stack/frontend/
├── src/
│   ├── components/
│   │   ├── TenantIntake.vue        # "Tell your story" interview
│   │   ├── EvidenceUpload.vue      # Photo + doc uploader
│   │   ├── JurisdictionSelect.vue  # Pick state/county
│   │   ├── CaseReview.vue          # Review AI output
│   │   ├── DocumentGenerator.vue   # Download docs
│   │   └── BlockchainRegister.vue  # Register on-chain
│   ├── pages/
│   │   ├── Home.vue                # Landing
│   │   ├── BuildCase.vue           # Main workflow
│   │   ├── VerificationPortal.vue  # Public view (read-only)
│   │   └── FAQ.vue
│   └── assets/
│       ├── law_packs/              # Jurisdiction data
│       ├── templates/              # Document templates
│       └── images/
└── public/
```

---

## 5. DATA FLOW – Example: Patterstone Case

**Input (Tenant Interview):**

```
Q: What's the main issue?
A: Water leak, mold, no repair for months

Q: When did it start?
A: May 10, 2025

Q: How did you notify the landlord?
A: Called May 11, emailed May 12, called again May 20

Q: How long has it been broken?
A: 5 months (since May)

Q: Do you have photos?
A: Yes (uploads 10 photos)

Q: Have you incurred costs?
A: Hotel ($2,250), doctor visits ($1,000), supplies ($500)

Q: Jurisdiction?
A: Georgia, Fulton County
```

**Processing Flow:**

1. **Intake Bot** → Structures into case object
2. **Timeline Bot** → Orders events, links photos
3. **Law Bot** → Maps to GA statutes (44-7-13, HB 404, 34-7-2)
4. **Health Bot** → Contextualizes mold exposure risk
5. **Damages Bot** → Calculates: rent abatement (9K) + repairs (10.5K) + relocation (2.2K) + medical (1K) = $22.7K conservative, $45K+ aggressive
6. **Drafting Bot** → Generates demand letter, complaint draft
7. **Defense Sim Bot** → "They'll say we didn't know" → generates rebuttal
8. **Orchestrator** → Packages everything into downloadable docs + blockchain registration option

**Output (Tenant Downloads):**

- `demand_letter_GA_FULTON_2025_001.docx`
- `complaint_draft.docx`
- `evidence_index.pdf` (EXH-A through EXH-F)
- `damages_calculation.xlsx`
- `timeline_summary.md`
- `anticipate_defenses.md`

**Blockchain Registration (Optional):**

- Case summary → IPFS → blockchain
- Evidence CIDs → blockchain
- Public link: `verify.tenant-justice.io/case/GA-FULTON-2025-001?key=XxXx`

---

## 6. DEPLOYMENT & ROLLOUT

### Phase 1: MVP (1 month)

- AI swarm skeleton (intake → law → damages → drafting)
- Single jurisdiction (Georgia, habitability only)
- Local deployment (testnet blockchain only)
- Manual intake (no UI; use JSON upload)

### Phase 2: UI + Production (2 months)

- Tenant intake UI (Vue)
- Multi-state law packs (CA, NY added)
- Blockchain deployment (Polygon mainnet)
- Document generator improvements

### Phase 3: Scale + Polish (3+ months)

- More jurisdictions
- Insurance subrogation module
- Landlord defense database
- Community feedback loop

---

## 7. REPOSITORY STRUCTURE

```
tenant-justice-stack/
├── README.md                      # Overview
├── ARCHITECTURE.md                # This file
├── SETUP.md                       # Dev setup
├── CONTRIBUTING.md
│
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── orchestrator.py        # Main conductor
│   │   ├── intake.py              # Parse stories
│   │   ├── timeline.py            # Build chronology
│   │   ├── law_mapper.py          # Facts → Laws
│   │   ├── health_mold.py         # Health context
│   │   ├── damages.py             # Calculate money
│   │   ├── drafting.py            # Generate docs
│   │   ├── defense_sim.py         # Predict defenses
│   │   └── rebuttal.py            # Counter-arguments
│   │
│   ├── data/
│   │   ├── models.py              # Core data structures
│   │   ├── schema.py              # JSON schemas
│   │   └── db.py                  # Optional: DB layer
│   │
│   ├── law_packs/
│   │   ├── us_ga_habitability.json
│   │   ├── us_ca_habitability.json
│   │   ├── us_ny_habitability.json
│   │   ├── mold_health.json
│   │   └── insurance_subrogation.json
│   │
│   ├── templates/
│   │   ├── demand_letter.j2
│   │   ├── complaint.j2
│   │   ├── evidence_index.j2
│   │   └── timeline.j2
│   │
│   ├── app.py                     # Flask/FastAPI main app
│   ├── config.py
│   ├── utils.py
│   └── requirements.txt
│
├── blockchain/
│   ├── contracts/
│   │   ├── TenantCaseRegistry.sol
│   │   └── EvidenceNFT.sol        # Optional
│   │
│   ├── deployments/
│   │   ├── deploy.js              # Main Hardhat script
│   │   ├── networks.config.js
│   │   └── verify.js              # Etherscan verification
│   │
│   ├── scripts/
│   │   ├── register_case.js       # Register single case
│   │   ├── bulk_register.js       # Batch register
│   │   └── query.js               # Query contract
│   │
│   ├── subgraph/                  # Optional: The Graph indexing
│   │   ├── schema.graphql
│   │   ├── mapping.ts
│   │   └── subgraph.yaml
│   │
│   ├── hardhat.config.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TenantIntake.vue
│   │   │   ├── EvidenceUpload.vue
│   │   │   ├── JurisdictionSelect.vue
│   │   │   ├── CaseReview.vue
│   │   │   ├── DocumentGenerator.vue
│   │   │   └── BlockchainRegister.vue
│   │   ├── pages/
│   │   │   ├── Home.vue
│   │   │   ├── BuildCase.vue
│   │   │   ├── VerificationPortal.vue
│   │   │   └── FAQ.vue
│   │   ├── assets/
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── legal/
│   ├── disclaimers.md             # "Not a lawyer" warnings
│   ├── playbooks/
│   │   ├── georgia_habitability.md
│   │   ├── mold_and_health.md
│   │   ├── insurance_subrogation.md
│   │   └── code_enforcement.md
│   ├── faq.md
│   └── resources.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SETUP.md
│   ├── DATA_SCHEMA.md
│   ├── DEPLOYMENT.md
│   └── FAQ.md
│
└── examples/
    ├── patterstone_case/          # Original proof of concept
    │   ├── case.json
    │   ├── evidence/
    │   │   ├── photos/
    │   │   └── messages/
    │   └── outputs/
    │       ├── demand_letter.docx
    │       ├── complaint_draft.docx
    │       └── evidence_index.pdf
    │
    └── sample_cases/
        ├── georgia_mold.json
        ├── california_water.json
        └── new_york_repair.json
```

---

## 8. Technical Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Backend** | Python 3.11 | Easy AI/NLP, good for data processing |
| **API** | FastAPI | Async, fast, great docs |
| **Frontend** | Vue 3 | Lightweight, great for forms/interviews |
| **Templates** | Jinja2 | Powerful document generation |
| **Blockchain** | Solidity 0.8.20 | EVM standard, mature tooling |
| **Deployment** | Hardhat | Industry standard for Solidity |
| **Storage** | IPFS/Pinata | Decentralized, cheap, permanent |
| **DB** | Optional: PostgreSQL | If you want to track cases server-side |
| **Hosting** | Docker + GitHub Actions | CI/CD, reproducibility |

---

## 9. Key Non-Functional Requirements

### Security

- Tenant data (if stored) must be encrypted at rest
- Private keys never in code (use `.env`)
- IPFS hashes verify immutability
- Public verification portal shows only necessary info

### Scalability

- Backend designed for horizontal scaling (stateless)
- Blockchain scales automatically (L2s are cheap)
- IPFS is peer-to-peer (no bottleneck)

### Reliability

- Multi-chain redundancy (case survives single network failure)
- Evidence backs up to IPFS + multiple block explorers
- Blockchain timestamps are tamper-proof

### Usability

- Tenant should complete intake in <15 minutes
- No blockchain knowledge required
- All outputs are MS Word / PDF (can print, sign)

---

## 10. Next Steps

### Immediate (This Week)

1. Finalize data schema (Case, Evidence, Timeline objects)
2. Stub out AI agent classes
3. Create law pack for Georgia (1 jurisdiction, 3 statutes)
4. Deploy TenantCaseRegistry to Sepolia testnet

### Short Term (2–4 Weeks)

1. Implement intake → law → damages pipeline
2. Build document generation (using Jinja2)
3. Implement simple frontend intake UI
4. Test end-to-end with Patterstone case

### Medium Term (1–3 Months)

1. Add CA, NY law packs
2. Implement defense sim & rebuttal
3. Deploy to Polygon mainnet
4. Open-source + community contribution process

---

**This is your blueprint. Let me know what piece you want to build first.**
