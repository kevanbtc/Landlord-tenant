# Phase 0: Full Stack Infrastructure & Integration Plan

**Status:** 🚀 READY TO EXECUTE  
**Estimated Duration:** Week 1 (Parallel Tracks)  
**Complexity:** High - Multiple integrations happening simultaneously  
**Team:** 2 Backend Devs + 1 DevOps + 1 Blockchain Dev

---

## 📋 Overview: From Documentation to Running System

This phase integrates:
1. **Python Backend** (FastAPI) with AI agents
2. **Blockchain** (Hardhat/Solidity) with smart contracts
3. **GitHub CI/CD** automation
4. **Docker** local development environment
5. **Web3 domains** (.law, .tenant, .legal subdomains)
6. **Automated website** deployment

**Outcome:** By end of Phase 0, you'll have:
- ✅ Running FastAPI server with AI agent framework
- ✅ Smart contract compiled and testnet-ready
- ✅ GitHub repository with auto-deploy pipeline
- ✅ Docker development environment
- ✅ Subdomain structure ready for deployment
- ✅ Automated website builds

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TENANT JUSTICE STACK v1.0                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Public     │  │   Legal      │  │   Tenant     │          │
│  │   Landing    │  │   Portal     │  │   Portal     │          │
│  │   .law       │  │   .law       │  │   .tenant    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                  │                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │  GitHub Pages + Netlify + Vercel (Auto-Deploy)   │           │
│  └──────────────────────────────────────────────────┘           │
│                       │                                         │
│  ┌──────────────────────────────────────────────────┐           │
│  │         FastAPI Backend (Python 3.11)            │           │
│  │  ┌────────────────────────────────────────────┐  │           │
│  │  │    AI Agent Swarm (8 Agents)               │  │           │
│  │  │  - IntakeBotAgent                          │  │           │
│  │  │  - TimelineBotAgent                        │  │           │
│  │  │  - LawMappingAgent                         │  │           │
│  │  │  - DamagesBotAgent                         │  │           │
│  │  │  - DraftingBotAgent                        │  │           │
│  │  │  - DefenseSimBotAgent                      │  │           │
│  │  │  - RebuttalBotAgent                        │  │           │
│  │  │  - HealthMoldBotAgent                      │  │           │
│  │  └────────────────────────────────────────────┘  │           │
│  └──────────────────────────────────────────────────┘           │
│                       │                                         │
│  ┌──────────────────────────────────────────────────┐           │
│  │      Blockchain Layer (Solidity + Hardhat)       │           │
│  │  ┌────────────────────────────────────────────┐  │           │
│  │  │   TenantCaseRegistry Smart Contract        │  │           │
│  │  │   Deployments:                             │  │           │
│  │  │   - Sepolia (testnet)                      │  │           │
│  │  │   - Polygon (production)                   │  │           │
│  │  │   - Arbitrum, Optimism (redundancy)        │  │           │
│  │  └────────────────────────────────────────────┘  │           │
│  └──────────────────────────────────────────────────┘           │
│                       │                                         │
│  ┌──────────────────────────────────────────────────┐           │
│  │         Data & Storage Layer                      │           │
│  │  ┌────────────────────────────────────────────┐  │           │
│  │  │  - PostgreSQL (case data)                  │  │           │
│  │  │  - IPFS/Pinata (evidence files)            │  │           │
│  │  │  - JSON Law Packs (statutes)               │  │           │
│  │  │  - GitHub (source of truth)                │  │           │
│  │  └────────────────────────────────────────────┘  │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Phase 0: Parallel Execution Tracks

### Track A: Python Backend + AI Integration (2 Devs, 3 days)

**Goal:** Running FastAPI server with AI agent framework integrated with OpenAI/Claude

#### A1: Setup Python Project (Day 1 - 4 hours)

```bash
# Create project structure
mkdir -p backend/{agents,models,services,tests}
cd backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
openai==1.3.0
anthropic==0.7.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
jinja2==3.1.2
web3==6.11.0
python-dotenv==1.0.0
pytest==7.4.3
httpx==0.25.1
EOF

# Install dependencies
pip install -r requirements.txt
```

**Files to Create:**

1. **backend/main.py** - FastAPI application
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agents.orchestrator import CaseOrchestrator
import os

app = FastAPI(
    title="Tenant Justice Stack API",
    description="AI-powered tenant legal assistant",
    version="0.1.0"
)

# CORS for web3 subdomains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://tenant.law",
        "https://legal.law",
        "https://api.law"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = CaseOrchestrator()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/v1/cases")
async def create_case(case_input: dict):
    """Create new case from tenant intake"""
    result = orchestrator.process_case_intake(case_input)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

2. **backend/.env** - Configuration (user fills this)
```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=postgresql://user:password@localhost/tenant_justice
POLYGON_PRIVATE_KEY=your_key_here
POLYGON_RPC_URL=https://polygon-rpc.com
IPFS_API_URL=https://api.pinata.cloud
```

3. **backend/agents/__init__.py** - Agent framework
```python
from .base_agent import Agent
from .intake_bot import IntakeBotAgent
from .timeline_bot import TimelineBotAgent
from .law_mapping import LawMappingAgent
from .orchestrator import CaseOrchestrator

__all__ = [
    "Agent",
    "IntakeBotAgent",
    "TimelineBotAgent",
    "LawMappingAgent",
    "CaseOrchestrator"
]
```

#### A2: Implement AI Agent Base Class (Day 1 - 4 hours)

**backend/agents/base_agent.py:**
```python
from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime
from enum import Enum

class AgentType(str, Enum):
    INTAKE = "intake"
    TIMELINE = "timeline"
    LAW_MAPPING = "law_mapping"
    DAMAGES = "damages"
    DRAFTING = "drafting"
    DEFENSE_SIM = "defense_sim"
    REBUTTAL = "rebuttal"
    HEALTH_MOLD = "health_mold"

class Agent(ABC):
    """Base class for all AI agents in the swarm"""
    
    def __init__(self, agent_type: AgentType):
        self.agent_type = agent_type
        self.execution_log = []
        self.llm_provider = "openai"  # Can be overridden
    
    @abstractmethod
    def process(self, input_data: Dict) -> Dict:
        """Main processing logic - implemented by subclasses"""
        pass
    
    def validate_input(self, input_data: Dict) -> bool:
        """Validate input data structure"""
        if not isinstance(input_data, dict):
            return False
        return True
    
    def validate_output(self, output_data: Dict) -> bool:
        """Validate output data structure"""
        if not isinstance(output_data, dict):
            return False
        if "status" not in output_data:
            return False
        return True
    
    def add_provenance(self, data: Dict) -> Dict:
        """Add audit trail to outputs"""
        return {
            **data,
            "provenance": {
                "agent": self.agent_type,
                "timestamp": datetime.utcnow().isoformat(),
                "model": self.llm_provider
            }
        }
    
    def execute(self, input_data: Dict) -> Dict:
        """Execute agent with validation and provenance tracking"""
        try:
            # Validate input
            if not self.validate_input(input_data):
                raise ValueError(f"Invalid input for {self.agent_type}")
            
            # Execute processing
            output = self.process(input_data)
            
            # Validate output
            if not self.validate_output(output):
                raise ValueError(f"Invalid output from {self.agent_type}")
            
            # Add provenance
            return self.add_provenance(output)
        
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "agent": self.agent_type
            }
```

#### A3: Implement IntakeBotAgent (Day 2 - 4 hours)

**backend/agents/intake_bot.py:**
```python
from .base_agent import Agent, AgentType
from typing import Dict
import os
from openai import OpenAI

class IntakeBotAgent(Agent):
    """Parses tenant's free-form story into structured case data"""
    
    def __init__(self):
        super().__init__(AgentType.INTAKE)
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.system_prompt = """You are a legal intake specialist for tenant rights.
        
Parse the tenant's story and extract:
1. Property address
2. Tenant name and contact
3. Landlord/Property Manager name
4. Lease start date
5. Key issues (mold, no heat, no water, pest infestation, etc.)
6. When issues started
7. How tenant reported it
8. Current status

Return ONLY valid JSON matching this structure:
{
    "property_address": "...",
    "tenant_name": "...",
    "tenant_email": "...",
    "tenant_phone": "...",
    "landlord_name": "...",
    "lease_start_date": "YYYY-MM-DD",
    "issues": ["issue1", "issue2"],
    "issue_start_date": "YYYY-MM-DD",
    "reported_to_landlord": boolean,
    "report_method": "email|phone|written|in-person",
    "days_unresolved": number
}"""
    
    def process(self, input_data: Dict) -> Dict:
        """Process tenant's story"""
        story = input_data.get("story", "")
        
        if not story:
            return {
                "status": "error",
                "error": "No story provided"
            }
        
        # Call OpenAI to extract structure
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": story}
            ],
            temperature=0
        )
        
        try:
            import json
            extracted = json.loads(response.choices[0].message.content)
            return {
                "status": "success",
                "extracted_case": extracted,
                "summary": f"Case for {extracted.get('tenant_name', 'Unknown')} at {extracted.get('property_address', 'Unknown')}"
            }
        except json.JSONDecodeError:
            return {
                "status": "error",
                "error": "Failed to parse AI response",
                "raw_response": response.choices[0].message.content
            }
```

#### A4: Create Docker Compose (Day 2 - 2 hours)

**docker-compose.yml** (in project root):
```yaml
version: '3.8'

services:
  # Python FastAPI backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=postgresql://postgres:password@db:5432/tenant_justice
      - POLYGON_RPC_URL=${POLYGON_RPC_URL}
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  # PostgreSQL database
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=tenant_justice
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis for caching
  redis:
    image: redis:7
    ports:
      - "6379:6379"

  # Hardhat blockchain (local testing)
  blockchain:
    build:
      context: ./blockchain
      dockerfile: Dockerfile
    ports:
      - "8545:8545"
    command: npx hardhat node

volumes:
  postgres_data:
```

**backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Track B: Blockchain Setup (1 Blockchain Dev, 2 days)

**Goal:** Smart contract ready for Sepolia + Polygon deployment

#### B1: Create Hardhat Project (Day 1 - 2 hours)

```bash
# Initialize Hardhat
cd blockchain
npx hardhat init

# Install dependencies
npm install --save-dev \
  @nomicfoundation/hardhat-ethers \
  ethers@6.0.0 \
  @openzeppelin/contracts \
  hardhat-gas-reporter \
  solidity-coverage \
  dotenv

npm install pinata-web3
```

#### B2: Create Generalized Smart Contract (Day 1 - 4 hours)

**blockchain/contracts/TenantCaseRegistry.sol:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TenantCaseRegistry
 * @dev Immutable registry for tenant rights cases across all jurisdictions
 * Stores case metadata, evidence hashes, and verification proof
 */
contract TenantCaseRegistry is Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private caseCounter;
    
    struct Case {
        uint256 caseId;
        string jurisdiction;
        address tenantAddress;
        string propertyAddress;
        uint256 caseStartDate;
        string ipfsHash;  // Points to full case data on IPFS
        bytes32[] evidenceHashes;
        uint256 registrationDate;
        bool isActive;
    }
    
    struct Evidence {
        uint256 caseId;
        bytes32 hash;
        string ipfsHash;
        string evidenceType;  // "photo", "email", "document", "medical", "receipt"
        uint256 dateAdded;
    }
    
    mapping(uint256 => Case) public cases;
    mapping(uint256 => Evidence[]) public caseEvidence;
    mapping(address => uint256[]) public tenantCases;
    mapping(bytes32 => bool) public evidenceRegistry;
    
    event CaseRegistered(
        uint256 indexed caseId,
        address indexed tenantAddress,
        string jurisdiction,
        string propertyAddress
    );
    
    event EvidenceAdded(
        uint256 indexed caseId,
        bytes32 indexed evidenceHash,
        string evidenceType
    );
    
    event CaseVerified(uint256 indexed caseId, address indexed verifier);
    
    /**
     * @dev Register a new tenant case on-chain
     */
    function registerCase(
        string memory jurisdiction,
        address tenantAddress,
        string memory propertyAddress,
        string memory ipfsHash
    ) public returns (uint256) {
        require(tenantAddress != address(0), "Invalid tenant address");
        require(bytes(propertyAddress).length > 0, "Property address required");
        
        uint256 caseId = caseCounter.current();
        caseCounter.increment();
        
        Case storage newCase = cases[caseId];
        newCase.caseId = caseId;
        newCase.jurisdiction = jurisdiction;
        newCase.tenantAddress = tenantAddress;
        newCase.propertyAddress = propertyAddress;
        newCase.caseStartDate = block.timestamp;
        newCase.ipfsHash = ipfsHash;
        newCase.registrationDate = block.timestamp;
        newCase.isActive = true;
        
        tenantCases[tenantAddress].push(caseId);
        
        emit CaseRegistered(caseId, tenantAddress, jurisdiction, propertyAddress);
        
        return caseId;
    }
    
    /**
     * @dev Add evidence to a case
     */
    function addEvidence(
        uint256 caseId,
        bytes32 evidenceHash,
        string memory ipfsHash,
        string memory evidenceType
    ) public {
        require(cases[caseId].isActive, "Case not found or inactive");
        require(cases[caseId].tenantAddress == msg.sender || msg.sender == owner(), 
                "Only case owner or admin can add evidence");
        
        Evidence memory newEvidence = Evidence({
            caseId: caseId,
            hash: evidenceHash,
            ipfsHash: ipfsHash,
            evidenceType: evidenceType,
            dateAdded: block.timestamp
        });
        
        caseEvidence[caseId].push(newEvidence);
        evidenceRegistry[evidenceHash] = true;
        cases[caseId].evidenceHashes.push(evidenceHash);
        
        emit EvidenceAdded(caseId, evidenceHash, evidenceType);
    }
    
    /**
     * @dev Get all cases for a tenant
     */
    function getTenantCases(address tenantAddress) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return tenantCases[tenantAddress];
    }
    
    /**
     * @dev Get case details (public - readable by anyone)
     */
    function getCase(uint256 caseId) 
        public 
        view 
        returns (Case memory) 
    {
        require(cases[caseId].isActive, "Case not found");
        return cases[caseId];
    }
    
    /**
     * @dev Get evidence for a case
     */
    function getCaseEvidence(uint256 caseId) 
        public 
        view 
        returns (Evidence[] memory) 
    {
        return caseEvidence[caseId];
    }
    
    /**
     * @dev Close a case
     */
    function closeCase(uint256 caseId) public {
        require(cases[caseId].tenantAddress == msg.sender || msg.sender == owner(),
                "Only case owner or admin can close");
        cases[caseId].isActive = false;
    }
    
    /**
     * @dev Get total case count
     */
    function getTotalCases() public view returns (uint256) {
        return caseCounter.current();
    }
}
```

#### B3: Create Deployment Scripts (Day 2 - 3 hours)

**blockchain/scripts/deploy.js:**
```javascript
const hre = require("hardhat");

async function main() {
    console.log("Deploying TenantCaseRegistry...");
    
    const TenantCaseRegistry = await hre.ethers.getContractFactory("TenantCaseRegistry");
    const registry = await TenantCaseRegistry.deploy();
    
    await registry.deployed();
    
    console.log(`TenantCaseRegistry deployed to: ${registry.address}`);
    console.log(`Network: ${hre.network.name}`);
    
    // Save deployment info
    const fs = require("fs");
    const deployment = {
        network: hre.network.name,
        address: registry.address,
        timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
        `deployments/${hre.network.name}.json`,
        JSON.stringify(deployment, null, 2)
    );
    
    console.log("Deployment info saved!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

**blockchain/hardhat.config.js:**
```javascript
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
    solidity: "0.8.20",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        },
        polygon: {
            url: process.env.POLYGON_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        },
        arbitrum: {
            url: "https://arb1.arbitrum.io/rpc",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        },
        optimism: {
            url: "https://mainnet.optimism.io",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    }
};
```

---

### Track C: GitHub Repository & CI/CD Setup (1 DevOps Dev, 2 days)

**Goal:** Full auto-deploy pipeline for all components

#### C1: Create GitHub Repository Structure (Day 1 - 2 hours)

```bash
# Create repo folders
mkdir -p .github/workflows
mkdir -p docs
mkdir -p scripts
mkdir -p .husky

# Create main directory structure
├── backend/                    # FastAPI Python
│   ├── agents/
│   ├── models/
│   ├── services/
│   ├── tests/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── blockchain/                 # Solidity & Hardhat
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   ├── hardhat.config.js
│   └── package.json
├── website/                    # Astro static site
│   ├── src/
│   ├── public/
│   └── astro.config.mjs
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

#### C2: GitHub Actions Workflows (Day 1 - 4 hours)

**.github/workflows/ci-cd.yml:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Backend Testing
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd backend
          pytest tests/ -v --cov
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml

  # Blockchain Testing & Compilation
  blockchain-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd blockchain
          npm install
      
      - name: Compile contracts
        run: |
          cd blockchain
          npx hardhat compile
      
      - name: Run tests
        run: |
          cd blockchain
          npx hardhat test

  # Website Build
  website-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd website
          npm install
      
      - name: Build
        run: |
          cd website
          npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: 'website/dist'

  # Deploy to Staging (on PR merge to develop)
  deploy-staging:
    needs: [backend-test, blockchain-test, website-build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy backend to staging
        run: |
          echo "Deploying backend to staging environment..."
          # Add your deployment script here
      
      - name: Deploy website to staging
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./website/dist
          destination_dir: staging

  # Deploy to Production (on PR merge to main)
  deploy-production:
    needs: [backend-test, blockchain-test, website-build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy backend to production
        run: |
          echo "Deploying backend to production..."
          # Add your deployment script here
      
      - name: Deploy website to production
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./website/dist
          cname: law
```

**.github/workflows/auto-deploy-docs.yml:**
```yaml
name: Auto-Deploy Documentation

on:
  push:
    branches: [main]
    paths:
      - 'backend/agents/**'
      - 'blockchain/contracts/**'
      - 'docs/**'

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Generate API documentation
        run: |
          # Generate Swagger docs from FastAPI
          python -m pytest backend/tests/ --docs
      
      - name: Update API reference
        run: |
          # Auto-update docs from code
          npx typedoc
      
      - name: Commit changes
        run: |
          git add -A
          git commit -m "Auto-update documentation [skip ci]"
          git push
```

---

### Track D: Website Foundation (1 Web Dev, 2 days)

**Goal:** Auto-deploying static site with subdomain routing

#### D1: Create Astro Website (Day 1 - 3 hours)

```bash
npm create astro@latest website -- --template blog

cd website
npm install
```

**website/astro.config.mjs:**
```javascript
import { defineConfig } from 'astro/config';
import vue from 'astro/integrations/vue';

export default defineConfig({
    integrations: [vue()],
    site: 'https://law/',
    output: 'static',
    build: {
        assets: '_assets'
    }
});
```

**website/src/pages/index.astro:**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Tenant Justice Stack">
    <main>
        <h1>Tenant Justice Stack</h1>
        <p>Free, AI-powered legal assistance for tenant rights</p>
        
        <div class="portals">
            <a href="https://tenant.law" class="portal-card">
                <h2>👨‍👩‍👧‍👦 For Tenants</h2>
                <p>Get legal help for your housing situation</p>
            </a>
            
            <a href="https://legal.law" class="portal-card">
                <h2>⚖️ For Legal Professionals</h2>
                <p>View cases and manage pro-bono work</p>
            </a>
            
            <a href="https://docs.law" class="portal-card">
                <h2>📚 API & Documentation</h2>
                <p>Integrate Tenant Justice Stack into your platform</p>
            </a>
        </div>
    </main>
</BaseLayout>

<style>
    .portals {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 3rem;
    }
    
    .portal-card {
        padding: 2rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-decoration: none;
        transition: all 0.3s ease;
    }
    
    .portal-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
</style>
```

---

## 🌐 Phase 0b: Web3 Domain Architecture

**Domains to Register:**

1. **law** (primary TLD)
   - `app.law` → Tenant intake portal (Vue.js)
   - `legal.law` → Legal professional portal
   - `api.law` → Backend API
   - `docs.law` → API docs + guides
   - `verify.law` → Blockchain verification
   - `admin.law` → Case management

2. **tenant** (subdomain for clients)
   - `tenant.law` → Tenant-facing portal
   - `tenant.law/intake` → Case intake wizard
   - `tenant.law/cases` → My cases dashboard
   - `tenant.law/documents` → Generated documents

3. **legal** (subdomain for lawyers)
   - `legal.law` → Lawyer portal
   - `legal.law/cases` → Case management
   - `legal.law/templates` → Document templates
   - `legal.law/research` → Legal research tools

**DNS Configuration (at registrar):**

```dns
; Root domain
law                  A    <your_web_server_ip>
law                  MX   10 mail.law
law                  TXT  "v=spf1 include:sendgrid.net ~all"

; Subdomains
app                  CNAME <netlify_domain>
tenant               CNAME <vercel_domain>
legal                CNAME <github_pages_domain>
api                  CNAME <backend_server>
docs                 CNAME <github_pages_domain>
verify               CNAME <blockchain_gateway>
admin                CNAME <internal_server>

; SSL (Let's Encrypt)
_acme-challenge     TXT    <acme_token>
_acme-challenge.app TXT    <acme_token>
```

---

## 📦 Deliverables Checklist - Phase 0

### By End of Week 1:

- [x] GitHub repository created with proper structure
- [ ] Docker Compose file with all services running locally
- [ ] FastAPI backend running on `http://localhost:8000`
- [ ] IntakeBotAgent implemented and tested
- [ ] Smart contract compiled (TenantCaseRegistry.sol)
- [ ] Deployment scripts ready for Sepolia/Polygon
- [ ] GitHub Actions CI/CD pipeline working (tests + builds)
- [ ] Website building and deploying to GitHub Pages
- [ ] Domains registered (.law, .tenant, .legal)
- [ ] DNS configured for all subdomains
- [ ] SSL certificates provisioned (Let's Encrypt)
- [ ] Local dev environment fully working (`docker-compose up`)

### Success Criteria:

```bash
✅ Backend API responding on http://localhost:8000
✅ Tests passing: pytest backend/tests/ -v
✅ Smart contract compiling: npx hardhat compile
✅ Website building: npm run build
✅ GitHub Actions: All workflows passing
✅ Domains resolving: nslookup app.law
✅ SSL working: curl https://app.law (valid cert)
✅ Full stack locally: docker-compose up (all services running)
```

---

## 🚦 Next Steps After Phase 0

**Immediate (Day 1-2):**
1. Clone repository and verify local environment
2. Run `docker-compose up` and confirm all services start
3. Test API: `curl http://localhost:8000/health`
4. Verify smart contract compiles

**Short-term (Week 2):**
1. Deploy Patterstone case to Sepolia testnet
2. Implement remaining 7 AI agents
3. Set up law pack JSON files

**Medium-term (Weeks 3-4):**
1. Build Georgia law pack
2. Create document templates
3. Implement DraftingBotAgent

**By MVP (Week 8):**
1. Full frontend UI (Vue.js)
2. Production deployment to Polygon
3. Public launch of tenant.law

---

## 💡 Key Automation Benefits

| Aspect | Automation | Benefit |
|--------|-----------|---------|
| **Testing** | GitHub Actions auto-runs tests on every PR | 100% test coverage enforced |
| **Deployment** | Auto-deploy on merge to main | Zero downtime deployments |
| **Documentation** | Auto-generated from code | Always in sync |
| **Smart Contracts** | Auto-compile and test | Prevent broken contracts |
| **Website** | Auto-build and deploy | Update on every push |
| **Law Packs** | JSON auto-validated | Prevent corruption |
| **API Docs** | Swagger auto-generated | Self-documenting API |
| **Certificates** | Let's Encrypt auto-renewal | No manual certificate work |

---

## 📞 Support & Escalation

- **Issue with Python setup?** → See `backend/SETUP.md`
- **Blockchain deployment failing?** → See `blockchain/DEPLOYMENT.md`
- **DNS not resolving?** → See `DNS_SETUP.md`
- **GitHub Actions failing?** → Check `.github/workflows/` logs
- **Docker issues?** → Run `docker-compose logs -f`

---

**Status:** READY FOR EXECUTION  
**Start Date:** Today  
**Estimated Completion:** End of Week 1  
**Team Size:** 4 people (parallel tracks)  
**Budget:** $0 (all open-source tools + free tier services)
