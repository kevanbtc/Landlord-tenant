# TENANT JUSTICE PLATFORM - AI AGENT SYSTEM

## Overview
This directory contains the 9 specialized AI agents that form the "legal brain" of the platform.

## Agent Architecture

Each agent is a specialized module that:
1. Takes specific inputs
2. Performs focused analysis using LLM + RAG
3. Returns structured outputs
4. Can be called independently or as part of the orchestrated pipeline

## The 9 Agents

### 1. Intake Specialist (`agent_intake.js`)
**Job:** Convert messy tenant stories → clean structured case data
- **Input:** Raw text, voice transcripts, scattered facts
- **Output:** Structured Case object (parties, dates, problems, health impacts)

### 2. Timeline Architect (`agent_timeline.js`)
**Job:** Build forensic-grade chronological timeline
- **Input:** Messages, photos, receipts, events
- **Output:** Chronological timeline with evidence linkage + legal significance tags

### 3. Legal Mapper (`agent_legal_mapper.js`)
**Job:** Map facts → laws, statutes, legal theories
- **Input:** Jurisdiction + fact pattern
- **Output:** Violated statutes, legal theories, required proof elements, case law

### 4. Health & Safety Analyst (`agent_health.js`)
**Job:** Analyze health risks and habitability violations
- **Input:** Photos, descriptions of conditions (mold, leaks, etc.)
- **Output:** Health risk assessment, code violations, severity ratings

### 5. Damages Calculator (`agent_damages.js`)
**Job:** Calculate money owed with legal precision
- **Input:** Rent, duration, conditions, jurisdiction laws
- **Output:** Conservative + aggressive damage estimates with line-item breakdown

### 6. Document Drafter (`agent_document_drafter.js`)
**Job:** Generate all legal documents
- **Input:** Case data, legal analysis, damages
- **Output:** Demand letters, complaints, timelines, evidence indexes

### 7. Defense Simulator (`agent_defense_simulator.js`)
**Job:** Predict landlord's defense arguments
- **Input:** Case facts, evidence, legal claims
- **Output:** Likely defense arguments, weak points, procedural traps

### 8. Rebuttal Engine (`agent_rebuttal.js`)
**Job:** Pre-write responses to defense arguments
- **Input:** Defense predictions, case evidence
- **Output:** Rebuttal paragraphs with evidence citations

### 9. Orchestrator (`agent_orchestrator.js`)
**Job:** Run the full pipeline and ensure consistency
- **Input:** Case ID
- **Output:** Complete case analysis with all documents

## Technology Stack

- **LLM:** OpenAI GPT-4 (primary), Claude (backup)
- **Framework:** LangChain / LangGraph for agent workflows
- **Vector DB:** Pinecone for legal code semantic search
- **RAG:** Retrieve relevant statutes/cases for context
- **Prompt Management:** Centralized templates in `/prompts`

## Data Flow

```
User submits case
    ↓
Intake Agent → Structure data
    ↓
Timeline Agent → Organize events
    ↓
Legal Mapper → Find violated laws
    ↓
Health Analyst → Assess conditions
    ↓
Damages Calc → Calculate money
    ↓
Document Drafter → Generate papers
    ↓
Defense Simulator → Predict attacks
    ↓
Rebuttal Engine → Prepare counter
    ↓
Orchestrator → Quality check & package
    ↓
Case ready for action
```

## Running Agents

### Individual Agent
```javascript
const { IntakeAgent } = require('./agent_intake');

const rawStory = "We moved in June 2024, leak started July...";
const structured = await IntakeAgent.analyze(rawStory);
```

### Full Pipeline
```javascript
const { CaseOrchestrator } = require('./agent_orchestrator');

const caseId = "GA-FULTON-3530-PATTERSTONE-2025";
const result = await CaseOrchestrator.processCase(caseId);
```

## Quality Control

- **Human Review:** Sample 10% of outputs for accuracy
- **Confidence Scores:** Agents return confidence level (0-1)
- **Version Tracking:** Log what AI generated vs. what was edited
- **Feedback Loop:** Outcomes train future runs

## Extending the System

To add a new agent:
1. Create `agent_newname.js`
2. Implement standard interface: `analyze(input)` → `output`
3. Add to orchestrator pipeline
4. Add prompts to `/prompts/newagent/`
5. Test with sample cases
