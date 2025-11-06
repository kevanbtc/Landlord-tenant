# 🏗️ INTEGRATION ARCHITECTURE

**Purpose:** Connect the AI Swarm (Node.js) to the Infrastructure (FastAPI/Postgres/Blockchain)

---

## CURRENT STATE

### ✅ **What We Have**

1. **Infrastructure Layer** (`legal-ai-swarm/`)
   - Docker Compose stack
   - FastAPI skeleton
   - Postgres, Redis, Elasticsearch, Neo4j
   - Hardhat + Sepolia blockchain
   - Environment configuration

2. **Intelligence Layer** (`platform/`)
   - 7 AI agents (Node.js)
   - Legal Intelligence System
   - Game theory engine
   - Document generation
   - Test suite

### ❌ **What's Missing**

1. **API Endpoints** - FastAPI routes that call Node.js agents
2. **Database Models** - SQLAlchemy schemas for cases, evidence, etc.
3. **Smart Contracts** - Deployed and integrated
4. **Job Queue** - For async processing
5. **Frontend** - User interface

---

## INTEGRATION STRATEGY

### **Option 1: Node.js Primary (Recommended)**

**Architecture:**
```
Frontend (Next.js)
    ↓
API (Express/Fastify - Node.js)
    ↓
AI Agents (Node.js) + Postgres + Redis + Pinecone
    ↓
Blockchain (Ethers.js)
```

**Why:**
- Agents already in Node.js (10k lines)
- Can use Prisma for Postgres
- Native async/await
- Easy blockchain integration (ethers.js)
- Simpler deployment (one language)

**Status:** ⭐ **RECOMMENDED - Let's do this**

---

### **Option 2: Hybrid (Python API + Node Services)**

**Architecture:**
```
Frontend (Next.js)
    ↓
API (FastAPI - Python)
    ↓
Agent Service (Node.js via HTTP/RPC)
    ↓
Blockchain Service (Python Web3.py)
```

**Why:**
- Keeps existing FastAPI infrastructure
- Python for data science / ML extensions
- Node for AI orchestration

**Drawback:** More complex, two languages

---

### **Option 3: Migrate Agents to Python**

**Status:** ❌ **NOT RECOMMENDED**
- Would require rewriting 10k lines
- Lose OpenAI's native Node SDK advantages
- Unnecessary complexity

---

## RECOMMENDED ARCHITECTURE (Option 1)

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND - Next.js                          │
│                                                              │
│  /report-issue → /case/{id} → /documents → /blockchain      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              API LAYER - Express/Fastify                     │
│                                                              │
│  POST /api/cases/create                                     │
│  POST /api/cases/{id}/analyze      → Run AI Swarm          │
│  GET  /api/cases/{id}              → Return results         │
│  POST /api/cases/{id}/anchor       → Write to blockchain   │
│  GET  /api/cases/{id}/documents    → Generate docs         │
└──────────────────────────┬───────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   AI SWARM      │ │  DATABASES   │ │  BLOCKCHAIN     │
│                 │ │              │ │                 │
│ • Intake        │ │ • Postgres   │ │ • Sepolia       │
│ • Legal Map     │ │ • Pinecone   │ │ • CaseRegistry  │
│ • Damages       │ │ • Redis      │ │ • Evidence      │
│ • Timeline      │ │ • Neo4j      │ │ • IPFS          │
│ • Health        │ │              │ │                 │
│ • Documents     │ │              │ │                 │
│ • Orchestrator  │ │              │ │                 │
└─────────────────┘ └──────────────┘ └─────────────────┘
```

---

## DATABASE SCHEMA (Postgres with Prisma)

### **Core Tables**

```prisma
// schema.prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  phone     String?
  createdAt DateTime @default(now())
  cases     Case[]
}

model Case {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  // Basic Info
  status          String   // intake, analyzing, complete, escalated
  jurisdiction    String   // state code
  propertyAddress String
  
  // Story & Facts
  rawStory        String   @db.Text
  structuredData  Json     // Intake agent output
  
  // Analysis Results
  legalAnalysis   Json?    // Legal mapper output
  damagesAnalysis Json?    // Damages calculator output
  timeline        Json?    // Timeline architect output
  healthAnalysis  Json?    // Health analyzer output
  
  // Blockchain
  blockchainTxHash String?
  blockchainCaseId Int?
  evidenceHashes   String[] // Array of evidence CIDs/hashes
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  incidents       Incident[]
  evidence        Evidence[]
  documents       Document[]
  damages         Damage[]
}

model Incident {
  id          String   @id @default(uuid())
  caseId      String
  case        Case     @relation(fields: [caseId], references: [id])
  
  type        String   // water_leak, mold, pest, hvac, etc.
  description String   @db.Text
  date        DateTime
  reported    Boolean
  reportedDate DateTime?
  resolved    Boolean  @default(false)
  
  evidenceIds String[] // References to Evidence
}

model Evidence {
  id          String   @id @default(uuid())
  caseId      String
  case        Case     @relation(fields: [caseId], references: [id])
  
  type        String   // photo, video, document, communication
  title       String
  description String?
  
  // Storage
  fileUrl     String?  // S3/IPFS URL
  ipfsCid     String?  // IPFS Content ID
  fileHash    String?  // SHA256 hash
  
  // Metadata
  capturedDate DateTime?
  uploadedDate DateTime @default(now())
  
  // Blockchain
  onChain     Boolean  @default(false)
  txHash      String?
}

model Document {
  id          String   @id @default(uuid())
  caseId      String
  case        Case     @relation(fields: [caseId], references: [id])
  
  type        String   // demand_letter, complaint, discovery, etc.
  title       String
  content     String   @db.Text
  format      String   // text, pdf, docx
  
  generatedAt DateTime @default(now())
  fileUrl     String?
}

model Damage {
  id          String   @id @default(uuid())
  caseId      String
  case        Case     @relation(fields: [caseId], references: [id])
  
  category    String   // economic, medical, emotional, punitive
  type        String   // rent_abatement, hotel, medical_bills, etc.
  description String
  
  amount      Decimal  @db.Decimal(10, 2)
  evidence    String[] // Evidence IDs
  
  conservative Decimal? @db.Decimal(10, 2)
  recommended  Decimal? @db.Decimal(10, 2)
  aggressive   Decimal? @db.Decimal(10, 2)
}

model Property {
  id          String   @id @default(uuid())
  address     String   @unique
  landlordName String?
  managementCo String?
  
  // Graph data for pattern detection
  caseCount   Int      @default(0)
  violationCount Int   @default(0)
  
  createdAt   DateTime @default(now())
}

model SwarmRun {
  id          String   @id @default(uuid())
  caseId      String
  
  startedAt   DateTime @default(now())
  completedAt DateTime?
  status      String   // running, complete, failed
  
  // Agent execution log
  steps       Json[]   // Array of agent executions
  
  // Performance
  duration    Int?     // milliseconds
  apiCalls    Int      @default(0)
  totalCost   Decimal? @db.Decimal(10, 4)
}
```

---

## API ENDPOINTS (Express/Fastify)

### **Case Management**

```typescript
// POST /api/cases
// Create new case from tenant story
{
  story: string;
  userId?: string;
  files?: File[];  // Evidence uploads
}
→ Returns: { caseId, status: "intake" }

// POST /api/cases/:id/analyze
// Run AI swarm analysis
→ Returns: { 
    intake, 
    legal, 
    damages, 
    timeline, 
    health,
    status: "complete" 
  }

// GET /api/cases/:id
// Get case details and all analysis
→ Returns: Complete case object

// PATCH /api/cases/:id
// Update case info
```

### **Document Generation**

```typescript
// POST /api/cases/:id/documents/demand-letter
{
  tone: "professional" | "aggressive" | "conciliatory";
  deadline: number;  // days
}
→ Returns: { document, downloadUrl }

// POST /api/cases/:id/documents/complaint
→ Returns: { document, downloadUrl }

// GET /api/cases/:id/documents
→ Returns: [ all generated documents ]
```

### **Blockchain Integration**

```typescript
// POST /api/cases/:id/anchor
// Write case hash to blockchain
→ Returns: { txHash, blockchainCaseId, explorerUrl }

// POST /api/evidence/:id/anchor
// Write evidence hash to blockchain
→ Returns: { txHash, ipfsCid }

// GET /api/cases/:id/verify
// Verify case on blockchain
→ Returns: { verified, timestamp, txHash }
```

### **Pattern Detection**

```typescript
// GET /api/landlords/:id/cases
// Get all cases for a landlord
→ Returns: [ cases with pattern analysis ]

// GET /api/properties/:address/history
// Get history of a property
→ Returns: { caseCount, violations, timeline }
```

---

## SMART CONTRACTS (Solidity)

### **CaseRegistry.sol**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CaseRegistry {
    struct Case {
        uint256 id;
        address tenant;
        string jurisdiction;
        bytes32 caseHash;      // Hash of case summary
        bytes32 evidenceRoot;   // Merkle root of evidence
        uint256 timestamp;
        bool resolved;
    }
    
    mapping(uint256 => Case) public cases;
    mapping(address => uint256[]) public tenantCases;
    uint256 public caseCount;
    
    event CaseRegistered(
        uint256 indexed caseId,
        address indexed tenant,
        bytes32 caseHash,
        uint256 timestamp
    );
    
    event CaseResolved(uint256 indexed caseId, uint256 timestamp);
    
    function registerCase(
        string memory jurisdiction,
        bytes32 caseHash,
        bytes32 evidenceRoot
    ) external returns (uint256) {
        caseCount++;
        cases[caseCount] = Case({
            id: caseCount,
            tenant: msg.sender,
            jurisdiction: jurisdiction,
            caseHash: caseHash,
            evidenceRoot: evidenceRoot,
            timestamp: block.timestamp,
            resolved: false
        });
        
        tenantCases[msg.sender].push(caseCount);
        
        emit CaseRegistered(caseCount, msg.sender, caseHash, block.timestamp);
        return caseCount;
    }
    
    function resolveCase(uint256 caseId) external {
        require(cases[caseId].tenant == msg.sender, "Not case owner");
        cases[caseId].resolved = true;
        emit CaseResolved(caseId, block.timestamp);
    }
    
    function getCase(uint256 caseId) external view returns (Case memory) {
        return cases[caseId];
    }
    
    function getTenantCases(address tenant) external view returns (uint256[] memory) {
        return tenantCases[tenant];
    }
}
```

### **EvidenceRegistry.sol**

```solidity
contract EvidenceRegistry {
    struct Evidence {
        uint256 caseId;
        address submitter;
        bytes32 fileHash;     // SHA256 of file
        string ipfsCid;       // IPFS content ID
        string evidenceType;  // photo, video, document
        uint256 timestamp;
    }
    
    mapping(bytes32 => Evidence) public evidence;
    mapping(uint256 => bytes32[]) public caseEvidence;
    
    event EvidenceRegistered(
        bytes32 indexed fileHash,
        uint256 indexed caseId,
        string ipfsCid,
        uint256 timestamp
    );
    
    function registerEvidence(
        uint256 caseId,
        bytes32 fileHash,
        string memory ipfsCid,
        string memory evidenceType
    ) external {
        evidence[fileHash] = Evidence({
            caseId: caseId,
            submitter: msg.sender,
            fileHash: fileHash,
            ipfsCid: ipfsCid,
            evidenceType: evidenceType,
            timestamp: block.timestamp
        });
        
        caseEvidence[caseId].push(fileHash);
        
        emit EvidenceRegistered(fileHash, caseId, ipfsCid, block.timestamp);
    }
    
    function verifyEvidence(bytes32 fileHash) external view returns (Evidence memory) {
        return evidence[fileHash];
    }
}
```

---

## IMPLEMENTATION PHASES

### **Phase 1: Core API (Week 1)** ⚡ START HERE

1. Set up Express/Fastify API server
2. Implement Prisma with Postgres
3. Create basic endpoints:
   - POST /api/cases (create)
   - POST /api/cases/:id/analyze (run swarm)
   - GET /api/cases/:id (retrieve)
4. Connect to existing Node.js agents
5. Test with Patterstone case

**Deliverable:** Working API that runs AI swarm

---

### **Phase 2: Blockchain Integration (Week 2)**

1. Deploy CaseRegistry and EvidenceRegistry to Sepolia
2. Implement blockchain service (ethers.js)
3. Create endpoints:
   - POST /api/cases/:id/anchor
   - POST /api/evidence/:id/anchor
   - GET /api/cases/:id/verify
4. Test case anchoring

**Deliverable:** Cases can be registered on-chain

---

### **Phase 3: Document Generation (Week 2)**

1. Connect Document Drafter agent to API
2. Implement PDF generation
3. File storage (S3 or IPFS)
4. Download endpoints

**Deliverable:** Generated documents downloadable

---

### **Phase 4: Frontend (Week 3-4)**

1. Next.js application
2. Case intake form
3. Case dashboard
4. Document viewer
5. Blockchain verification display

**Deliverable:** Full user-facing application

---

### **Phase 5: Pattern Detection (Week 4)**

1. Neo4j integration for graph queries
2. Landlord/property pattern analysis
3. Public explorer interface

**Deliverable:** Pattern detection and public accountability

---

## NEXT IMMEDIATE STEPS

1. **Choose:** Option 1 (Node.js primary) or Option 2 (Hybrid)?
2. **Create:** Express/Fastify API server skeleton
3. **Set up:** Prisma with Postgres schemas
4. **Connect:** First endpoint to existing agents
5. **Test:** End-to-end with Patterstone case

---

## DECISION POINT 🎯

**Should we:**

**A) Build Node.js API** (Express/Fastify + Prisma)
   - Keeps everything in one language
   - Faster to ship
   - Simpler deployment

**B) Keep FastAPI** (Python) and call Node agents
   - Uses existing Docker infrastructure
   - Better for future ML/data science
   - More complex integration

**I recommend A) - Let's build the Node.js API and get this working end-to-end.**

What do you want to tackle first?
