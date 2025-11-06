# ⚡ QUICK START GUIDE

Get the Tenant Justice Platform running in 5 minutes.

---

## 🎯 Prerequisites

- **Node.js** 18+ installed
- **OpenAI API Key** (get from platform.openai.com)
- **Pinecone API Key** (optional for full features, get from pinecone.io)

---

## 🚀 Setup (First Time)

### 1. Install Dependencies

```powershell
cd c:\Users\Kevan\Desktop\patterstone-case\platform
npm install
```

This installs all required packages (~2-3 minutes).

### 2. Configure Environment

Create `.env` file in the `platform` directory:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (for full features)
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_NAME=legal-library
PINECONE_ENVIRONMENT=us-east-1

# Database (optional for now)
DATABASE_URL=postgresql://user:password@localhost:5432/tenant_justice

# CourtListener (optional)
COURTLISTENER_API_KEY=your_key_here
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Pinecone: https://www.pinecone.io/ (free tier available)

---

## 🧪 Run Your First Test

### Test All Agents (Recommended)

```powershell
node scripts/test-all-agents.js
```

**What this does:**
1. Tests each AI agent individually
2. Tests the complete integrated system
3. Analyzes the Patterstone case end-to-end
4. Generates 6 output files in `output/` folder

**Expected runtime:** 2-3 minutes

**Output files:**
```
output/
├── individual_tests_[timestamp].json      # Each agent's results
├── integrated_test_[timestamp].json       # Full system results
├── executive_summary_[timestamp].txt      # Case summary
├── demand_letter_[timestamp].txt          # Generated demand letter
├── health_report_[timestamp].txt          # Health analysis
└── timeline_[timestamp].txt               # Visual timeline
```

### Test Complete Platform (Alternative)

```powershell
node scripts/test-complete-platform.js
```

This runs the Master Orchestrator with deep research enabled (takes longer, ~5 minutes).

---

## 📖 Review Results

### 1. Executive Summary
```powershell
# View the executive summary
notepad output\executive_summary_[latest].txt
```

This shows:
- Case overview
- Violations identified
- Damages calculated
- Strategic recommendations
- Next steps

### 2. Demand Letter
```powershell
# View generated demand letter
notepad output\demand_letter_[latest].txt
```

Professional legal document ready to send to landlord.

### 3. Health Report
```powershell
# View health impact analysis
notepad output\health_report_[latest].txt
```

Complete analysis of health hazards and medical impacts.

### 4. Timeline
```powershell
# View forensic timeline
notepad output\timeline_[latest].txt
```

Visual timeline of all events with patterns identified.

---

## 🎮 Use Individual Agents

### Analyze a New Case

```javascript
// Create a file: test-my-case.js

import MasterOrchestrator from './agents/agent_orchestrator.js';

const orchestrator = new MasterOrchestrator();
await orchestrator.initialize();

const story = `
Your tenant story here...
Include:
- Property address
- Landlord name
- Problems (water leaks, mold, etc.)
- Timeline
- Evidence
- Health impacts
`;

const results = await orchestrator.analyzeCase(story, {
  deepResearch: true,  // Enable legal research
  opponentLawyer: 'John Smith',
  opponentFirm: 'Smith Properties'
});

console.log(results.executiveSummary);
```

Run it:
```powershell
node test-my-case.js
```

### Generate Just a Demand Letter

```javascript
// demand-only.js

import DocumentDrafterAgent from './agents/agent_document_drafter.js';
import IntakeAgent from './agents/agent_intake.js';
import EnhancedLegalMapperAgent from './agents/agent_legal_mapper_enhanced.js';
import DamagesCalculatorAgent from './agents/agent_damages.js';

// 1. Process story
const intake = new IntakeAgent();
const caseData = await intake.processStory(yourStory);

// 2. Analyze law
const legal = new EnhancedLegalMapperAgent();
const legalAnalysis = await legal.analyze(caseData, { deepResearch: false });

// 3. Calculate damages
const damages = new DamagesCalculatorAgent();
const damagesAnalysis = await damages.calculateDamages(caseData, legalAnalysis);

// 4. Draft letter
const drafter = new DocumentDrafterAgent();
const letter = await drafter.draftDemandLetter(
  caseData,
  legalAnalysis,
  damagesAnalysis,
  {
    tone: 'professional',  // or 'aggressive' or 'conciliatory'
    deadline: 14  // days
  }
);

console.log(letter.content);
```

---

## 🔧 Troubleshooting

### "Cannot find module"
```powershell
npm install
```

### "OpenAI API Error"
- Check your API key in `.env`
- Verify you have credits at platform.openai.com
- Make sure `.env` is in the correct directory

### "Pinecone Error"
- Pinecone is optional for basic testing
- Tests will skip legal research if not configured
- Set `deepResearch: false` in test options

### "Memory Error"
- Node.js out of memory
- Run with more memory:
```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"; node scripts/test-all-agents.js
```

---

## 📚 What Each Agent Does

| Agent | Function | Output |
|-------|----------|--------|
| **Intake** | Extracts structured data from story | Organized case data |
| **Timeline** | Builds forensic timeline | Chronological events + patterns |
| **Legal Mapper** | Identifies violations & theories | Statute citations + win probability |
| **Damages** | Calculates all damages | Conservative/Recommended/Aggressive amounts |
| **Health** | Analyzes health impacts | Hazards + medical causation + expert needs |
| **Document Drafter** | Generates legal docs | Demand letters, complaints, discovery |
| **Orchestrator** | Coordinates everything | Complete case analysis |

---

## 🎯 Next Steps After Testing

### If Tests Pass ✅

1. **Review outputs** - Check quality of generated documents
2. **Test with your own cases** - Try real tenant stories
3. **Build remaining agents** - Defense Simulator, Rebuttal Engine
4. **Seed legal database** - Run full 50-state scraper
5. **Build web interface** - Next.js application

### If Tests Fail ❌

1. Check error message
2. Verify API keys in `.env`
3. Ensure all dependencies installed (`npm install`)
4. Check Node.js version (`node --version` should be 18+)
5. Review console output for specific errors

---

## 💰 Cost Estimate

**Per case analysis:**
- OpenAI API calls: ~$0.30 - $0.50
- Pinecone searches: ~$0.01
- **Total: ~$0.50 per complete case**

**Monthly (100 cases):**
- API costs: ~$50
- Pinecone: ~$70 (free tier available)
- **Total: ~$120/month**

---

## 🚀 Ready to Go?

```powershell
# Run the comprehensive test
node scripts/test-all-agents.js

# Then review your results
cd output
dir
```

**The platform will analyze the Patterstone case and generate all documents.**

**Time to complete:** 2-3 minutes  
**Expected cost:** ~$0.50  
**Output files:** 6

---

## 📞 Need Help?

1. Check `BUILD_STATUS.md` - Overall project status
2. Check `SESSION_PROGRESS.md` - What was built today
3. Check `legal-intelligence/README.md` - Legal system docs
4. Review agent code in `agents/` folder
5. Check test output for specific errors

---

**Let's see this AI law firm in action! 🚀**
