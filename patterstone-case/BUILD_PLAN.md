# 🚀 BUILD PLAN: INTEGRATION LAYER

**Goal:** Connect AI Swarm to Infrastructure in 4 weeks
**Current Date:** November 6, 2025

---

## WEEK 1: NODE.JS API + DATABASE

### Day 1-2: API Server Setup

**Create:** `platform/api/` directory structure

```
platform/api/
├── server.js              # Express server
├── routes/
│   ├── cases.js          # Case endpoints
│   ├── documents.js      # Document endpoints
│   └── blockchain.js     # Blockchain endpoints
├── services/
│   ├── swarmService.js   # Orchestrates AI agents
│   ├── blockchainService.js
│   └── documentService.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
└── prisma/
    └── schema.prisma     # Database models
```

**Tasks:**
- [ ] Install Express + dependencies
- [ ] Set up Prisma with Postgres
- [ ] Create database schemas
- [ ] Implement basic auth (JWT)
- [ ] Add health check endpoint

### Day 3-4: Core Case API

**Build these endpoints:**

```typescript
POST   /api/cases              // Create case from story
POST   /api/cases/:id/analyze  // Run AI swarm
GET    /api/cases/:id          // Get case details
PATCH  /api/cases/:id          // Update case
DELETE /api/cases/:id          // Delete case
```

**Connect to existing agents:**
- Import `agent_orchestrator.js`
- Wrap in Express route handlers
- Store results in Postgres

### Day 5: Testing & Refinement

- [ ] Test with Patterstone case
- [ ] Validate all 7 agents work via API
- [ ] Test database persistence
- [ ] Document API with OpenAPI/Swagger

**Deliverable:** Working API that analyzes cases ✅

---

## WEEK 2: BLOCKCHAIN INTEGRATION

### Day 1-2: Smart Contracts

**Deploy to Sepolia:**

```solidity
// Deploy these contracts
CaseRegistry.sol
EvidenceRegistry.sol
```

**Tasks:**
- [ ] Write deployment script
- [ ] Deploy to Sepolia testnet
- [ ] Verify on Etherscan
- [ ] Save contract addresses

### Day 3-4: Blockchain Service

**Create:** `services/blockchainService.js`

```javascript
class BlockchainService {
  async registerCase(caseId, caseData) {
    // Hash case summary
    // Call CaseRegistry.registerCase()
    // Return tx hash
  }
  
  async registerEvidence(evidenceId, fileHash, ipfsCid) {
    // Call EvidenceRegistry.registerEvidence()
    // Return tx hash
  }
  
  async verifyCase(blockchainCaseId) {
    // Query CaseRegistry
    // Return case data
  }
}
```

**Endpoints:**

```typescript
POST /api/cases/:id/anchor        // Register on blockchain
POST /api/evidence/:id/anchor     // Register evidence
GET  /api/cases/:id/verify        // Verify on blockchain
GET  /api/blockchain/:txHash      // Get transaction details
```

### Day 5: IPFS Integration

**Set up IPFS for evidence storage:**

- [ ] Connect to IPFS (web3.storage or Pinata)
- [ ] Upload evidence files
- [ ] Store CIDs in database
- [ ] Link to blockchain registry

**Deliverable:** Cases anchored on blockchain ✅

---

## WEEK 3: DOCUMENT GENERATION & STORAGE

### Day 1-2: Document API

**Endpoints:**

```typescript
POST /api/cases/:id/documents/demand-letter
POST /api/cases/:id/documents/complaint
POST /api/cases/:id/documents/discovery
POST /api/cases/:id/documents/settlement
GET  /api/cases/:id/documents
GET  /api/documents/:id/download
```

**Connect to:**
- `agent_document_drafter.js`
- Convert to PDF (pdf-lib)
- Store in S3 or IPFS

### Day 3-4: File Storage

**Options:**
1. **AWS S3** - Simple, reliable
2. **IPFS** - Decentralized, blockchain-friendly
3. **Both** - S3 for speed, IPFS for permanence

**Implementation:**
- [ ] Set up storage service
- [ ] Generate presigned URLs
- [ ] Handle file uploads
- [ ] Implement download endpoints

### Day 5: PDF Generation

**Features:**
- [ ] Convert markdown to PDF
- [ ] Professional formatting
- [ ] Include case information
- [ ] Add QR code for blockchain verification

**Deliverable:** Downloadable legal documents ✅

---

## WEEK 4: FRONTEND APPLICATION

### Day 1-2: Next.js Setup

**Create:** `platform/web/` directory

```
platform/web/
├── app/
│   ├── page.tsx              # Landing page
│   ├── report/page.tsx       # Intake form
│   ├── cases/[id]/page.tsx   # Case details
│   └── verify/page.tsx       # Blockchain verification
├── components/
│   ├── IntakeForm.tsx
│   ├── CaseTimeline.tsx
│   ├── DocumentList.tsx
│   └── BlockchainProof.tsx
└── lib/
    └── api.ts               # API client
```

### Day 3: Case Intake Form

**Build interactive form:**

```tsx
// Components needed:
- Story textarea
- Evidence upload (photos, documents)
- Property address input
- Timeline builder
- Progress indicator
```

**UX Flow:**
1. User enters story
2. Uploads evidence
3. Reviews extracted facts
4. Confirms and submits
5. Sees analysis progress

### Day 4: Case Dashboard

**Show:**
- Case status
- Legal analysis summary
- Damages breakdown
- Timeline visualization
- Health impacts
- Generated documents
- Blockchain proof

### Day 5: Document Viewer & Download

**Features:**
- Preview documents in-browser
- Download as PDF
- Print-ready formatting
- Blockchain verification badge

**Deliverable:** Full user-facing application ✅

---

## WEEK 5: PATTERN DETECTION & PUBLIC EXPLORER

### Day 1-2: Neo4j Integration

**Graph queries:**

```cypher
// Find landlord patterns
MATCH (l:Landlord)-[:OWNS]->(p:Property)<-[:LOCATED_AT]-(c:Case)
WHERE c.violations CONTAINS 'habitability'
RETURN l, COUNT(c) as violations

// Find property history
MATCH (p:Property)<-[:LOCATED_AT]-(c:Case)
RETURN p.address, COLLECT(c) as cases

// Find common patterns
MATCH (c1:Case)-[:SIMILAR_TO]->(c2:Case)
WHERE c1.landlord = c2.landlord
RETURN c1, c2
```

### Day 3-4: Pattern Analysis Endpoints

```typescript
GET /api/landlords/:id/cases       // All cases for landlord
GET /api/landlords/:id/patterns    // Identified patterns
GET /api/properties/:address/history
GET /api/patterns/mold             // All mold cases
GET /api/patterns/retaliation      // Retaliation patterns
```

### Day 5: Public Explorer

**Build:** `platform/web/app/explorer/`

**Features:**
- Search by landlord, property, or issue
- Anonymized case summaries
- Pattern visualizations
- Blockchain verification
- Stats dashboard

**Deliverable:** Public accountability platform ✅

---

## IMPLEMENTATION CHECKLIST

### Infrastructure
- [ ] Node.js API server (Express)
- [ ] Prisma + Postgres setup
- [ ] Redis for caching/queues
- [ ] Environment configuration

### Database
- [ ] Prisma schema complete
- [ ] Migrations created
- [ ] Seed data added
- [ ] Indexes optimized

### API Endpoints
- [ ] Case CRUD operations
- [ ] AI swarm integration
- [ ] Document generation
- [ ] Blockchain anchoring
- [ ] Pattern detection
- [ ] Authentication/authorization

### Blockchain
- [ ] CaseRegistry deployed
- [ ] EvidenceRegistry deployed
- [ ] IPFS integration
- [ ] Verification endpoints

### Frontend
- [ ] Next.js application
- [ ] Intake form
- [ ] Case dashboard
- [ ] Document viewer
- [ ] Blockchain verification
- [ ] Public explorer

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] End-to-end tests
- [ ] Load testing
- [ ] Security audit

---

## DEPLOYMENT STRATEGY

### Development (Local)
```bash
# API
cd platform/api
npm run dev

# Frontend
cd platform/web
npm run dev
```

### Staging (Docker)
```bash
docker-compose -f docker-compose.staging.yml up
```

### Production
**Options:**
1. **Vercel** - Frontend
2. **Railway/Render** - API + DB
3. **Fly.io** - Full stack
4. **AWS** - EC2 + RDS + S3

---

## SUCCESS METRICS

### Week 1
- ✅ API accepts case stories
- ✅ AI swarm runs successfully
- ✅ Results stored in database
- ✅ Response time < 60 seconds

### Week 2
- ✅ Cases registered on blockchain
- ✅ Verification working
- ✅ IPFS evidence storage
- ✅ Transaction tracking

### Week 3
- ✅ Documents generated as PDF
- ✅ Download links working
- ✅ Professional formatting
- ✅ Blockchain QR codes

### Week 4
- ✅ User can submit case
- ✅ Full analysis displayed
- ✅ Documents downloadable
- ✅ Blockchain proof visible

### Week 5
- ✅ Patterns detected across cases
- ✅ Public explorer live
- ✅ Search working
- ✅ Landlord profiles complete

---

## TECH STACK FINAL

```yaml
Frontend:
  - Next.js 14
  - React 18
  - TailwindCSS
  - Shadcn/ui

API:
  - Node.js 18+
  - Express/Fastify
  - Prisma ORM
  - JWT auth

Database:
  - PostgreSQL (cases, users)
  - Pinecone (legal research)
  - Redis (cache, queues)
  - Neo4j (pattern graph)

Blockchain:
  - Ethereum (Sepolia → Mainnet)
  - Hardhat
  - Ethers.js
  - IPFS (web3.storage)

AI:
  - OpenAI GPT-4
  - OpenAI Embeddings
  - Existing 7 agents
  - Legal Intelligence System

Infrastructure:
  - Docker
  - GitHub Actions (CI/CD)
  - Vercel/Railway
```

---

## COST ESTIMATE

### Development (1 month)
- API costs: ~$50
- Blockchain (Sepolia): Free
- IPFS storage: Free tier
- **Total: ~$50**

### Production (per month, 1000 cases)
- OpenAI API: ~$500
- Pinecone: ~$70
- Postgres: ~$50
- IPFS: ~$20
- Hosting: ~$100
- **Total: ~$740/month**

### Revenue (1000 users @ $29/mo)
- **$29,000/month**
- **Profit: $28,260/month**
- **Margin: 97%**

---

## NEXT IMMEDIATE ACTION

**Start with Week 1, Day 1:**

1. Create `platform/api/` directory
2. Initialize Express server
3. Set up Prisma
4. Connect first agent
5. Test with Patterstone case

**Command to run:**
```bash
cd platform
mkdir api
cd api
npm init -y
npm install express prisma @prisma/client
npx prisma init
```

Ready to start building? 🚀
