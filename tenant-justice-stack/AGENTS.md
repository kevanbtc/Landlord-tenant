# Tenant Justice Stack – AI Swarm Agent Specification

**Version:** 0.1  
**Status:** Implementation Ready  
**Language:** Python 3.11+

---

## 1. Agent Base Class

```python
# backend/agents/base.py

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

class Agent(ABC):
    """Base class for all AI agents in the Tenant Justice Stack."""
    
    def __init__(self, name: str, version: str = "0.1", config: Optional[Dict] = None):
        self.name = name
        self.version = version
        self.config = config or {}
        self.logger = logging.getLogger(f"agents.{name}")
    
    @abstractmethod
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main processing method. Must be implemented by subclasses.
        
        Args:
            input_data: Dictionary with agent-specific input
        
        Returns:
            Dictionary with agent output
        """
        pass
    
    def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Validate input before processing. Override in subclasses."""
        return True
    
    def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate output meets quality threshold. Override in subclasses."""
        return True
    
    def add_provenance(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Add metadata about this agent's processing."""
        return {
            **result,
            "_metadata": {
                "agent": self.name,
                "version": self.version,
                "processed_at": datetime.utcnow().isoformat(),
                "confidence": result.get("_confidence", 0.85)
            }
        }
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent with validation and provenance.
        
        Args:
            input_data: Raw input
        
        Returns:
            Processed output with metadata
        
        Raises:
            ValueError: If validation fails
        """
        try:
            # Validate input
            if not self.validate_input(input_data):
                raise ValueError(f"{self.name}: Input validation failed")
            
            # Process
            self.logger.info(f"Processing with {self.name}...")
            output = self.process(input_data)
            
            # Validate output
            if not self.validate_output(output):
                raise ValueError(f"{self.name}: Output validation failed")
            
            # Add provenance
            result = self.add_provenance(output)
            
            self.logger.info(f"{self.name} completed successfully")
            return result
            
        except Exception as e:
            self.logger.error(f"{self.name} failed: {str(e)}")
            raise
```

---

## 2. Intake Bot

```python
# backend/agents/intake.py

from typing import Dict, Any, List, Optional
from .base import Agent
import re

class IntakeBotAgent(Agent):
    """
    Converts unstructured tenant story into structured Case object.
    
    Input: Free-form text description of housing crisis
    Output: Partial Case object with summary, timeline skeleton, parties
    """
    
    def __init__(self, config=None):
        super().__init__(name="IntakeBot", version="0.1", config=config)
        self.issue_keywords = {
            "mold": ["mold", "moldy", "fungus", "spore"],
            "water_leak": ["leak", "water", "flooding", "wet", "damp"],
            "pest": ["rat", "mice", "cockroach", "bed bug", "pest", "vermin"],
            "no_repair": ["don't repair", "won't fix", "refuse", "delayed", "slow"],
            "no_heat": ["cold", "heat", "freezing", "warm", "temperature"],
            "no_water": ["water", "no water", "low pressure", "shower"],
            "unsafe_structure": ["crack", "collapse", "roof", "ceiling", "floor"],
            "electrical": ["electric", "spark", "shock", "outlet", "wire"],
            "gas_leak": ["gas", "smell", "propane", "carbon monoxide"]
        }
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse unstructured story into case structure.
        
        Args:
            input_data: {
                "story": str,  # Free-form description
                "jurisdiction": str,  # "US-GA-Fulton"
                "property_address": str,  # "123 Main St, City, State 12345"
                "tenant_name": str,  # Optional, can be anonymized
                "tenant_email": str,  # Optional
                "contact_method": str  # "email" or "phone"
            }
        
        Returns:
            {
                "case": {
                    "id": "PENDING",
                    "jurisdiction": str,
                    "propertyAddress": {...},
                    "summary": {
                        "mainIssues": [...],
                        "durationMonths": float,
                        "healthImpact": str
                    },
                    "parties": {
                        "tenant": {...},
                        "landlord": {...}
                    }
                },
                "warnings": [...],
                "confidence": 0.75
            }
        """
        story = input_data.get("story", "").lower()
        
        # Extract main issues
        main_issues = self._extract_issues(story)
        
        # Extract duration
        duration_months = self._extract_duration(story)
        
        # Extract health impacts
        health_impact = self._extract_health_impact(story)
        
        # Parse property address
        property_addr = self._parse_address(input_data.get("property_address", ""))
        
        # Compile case structure
        case_object = {
            "id": "PENDING",  # Will be assigned on save
            "jurisdiction": input_data.get("jurisdiction"),
            "propertyAddress": property_addr,
            "openedAt": None,  # Will be set on save
            "status": "active",
            "summary": {
                "mainIssues": main_issues,
                "durationMonths": duration_months,
                "healthImpact": health_impact,
                "occupants": self._extract_occupants(story)
            },
            "parties": {
                "tenant": {
                    "name": input_data.get("tenant_name", "Anonymous Tenant"),
                    "email": input_data.get("tenant_email"),
                    "anonymous": not input_data.get("tenant_name")
                },
                "landlord": {
                    "name": self._extract_landlord_name(story),
                    "entity": self._extract_landlord_type(story)
                }
            },
            "lease": self._extract_lease_info(story),
            "timeline": [],  # Will be populated by Timeline Bot
            "notes": story
        }
        
        warnings = self._generate_warnings(case_object, story)
        
        return {
            "case": case_object,
            "warnings": warnings,
            "_confidence": 0.80 if not warnings else 0.65,
            "completeness": 0.45  # Partial until Timeline/Law bots run
        }
    
    def _extract_issues(self, story: str) -> List[str]:
        """Identify main housing issues from text."""
        issues = []
        for issue_type, keywords in self.issue_keywords.items():
            if any(keyword in story for keyword in keywords):
                issues.append(issue_type)
        return issues or ["habitability_other"]
    
    def _extract_duration(self, story: str) -> float:
        """Extract how long the issue has persisted."""
        # Look for patterns like "5 months", "6 weeks", etc.
        import re
        
        patterns = [
            (r'(\d+)\s*months?', 1),
            (r'(\d+)\s*weeks?', 0.25),
            (r'(\d+)\s*days?', 0.03),
            (r'(\d+)\s*years?', 12)
        ]
        
        for pattern, multiplier in patterns:
            match = re.search(pattern, story)
            if match:
                return float(match.group(1)) * multiplier
        
        return 0.5  # Default: 2+ weeks
    
    def _extract_health_impact(self, story: str) -> str:
        """Identify health impacts mentioned."""
        health_keywords = {
            "respiratory": ["cough", "asthma", "breathing", "respiratory"],
            "skin": ["rash", "itching", "skin"],
            "behavioral": ["mood", "anxiety", "stress"],
            "infectious": ["infection", "illness", "sick"]
        }
        
        for impact, keywords in health_keywords.items():
            if any(kw in story for kw in keywords):
                return impact
        
        return "unknown"
    
    def _parse_address(self, address_str: str) -> Dict[str, str]:
        """Parse property address into components."""
        # Very basic parsing; real implementation would use library like postal
        parts = address_str.split(",")
        return {
            "street": parts[0].strip() if len(parts) > 0 else "",
            "city": parts[1].strip() if len(parts) > 1 else "",
            "state": parts[2].strip()[:2] if len(parts) > 2 else "",
            "zip": parts[-1].strip() if len(parts) > 0 else ""
        }
    
    def _extract_occupants(self, story: str) -> Dict[str, int]:
        """Estimate household composition."""
        occupants = {"adults": 1, "children": 0, "elderly": 0}
        
        # Simple heuristics
        if "child" in story or "kid" in story or "baby" in story:
            occupants["children"] = 1
        if "family" in story and "children" in story:
            occupants["children"] = 2
        
        return occupants
    
    def _extract_landlord_name(self, story: str) -> Optional[str]:
        """Try to extract landlord name from narrative."""
        # This is hard; usually will be filled in by user separately
        return None
    
    def _extract_landlord_type(self, story: str) -> str:
        """Estimate landlord type (individual, LLC, corp, etc.)"""
        if "company" in story or "management" in story:
            return "corporation"
        if "llc" in story:
            return "llc"
        return "individual"
    
    def _extract_lease_info(self, story: str) -> Dict:
        """Extract lease terms if mentioned."""
        # Basic placeholder; would need more parsing
        return {
            "leaseType": "unknown",
            "habitabilityClauseExplicit": False
        }
    
    def _generate_warnings(self, case: Dict, story: str) -> List[str]:
        """Generate warnings for incomplete or concerning info."""
        warnings = []
        
        if case["summary"]["durationMonths"] < 0.5:
            warnings.append("Issue duration < 2 weeks (may not meet statutory threshold)")
        
        if len(case["summary"]["mainIssues"]) == 0:
            warnings.append("No specific housing issues identified; case may be unclear")
        
        if case["parties"]["landlord"]["name"] is None:
            warnings.append("Landlord name not provided; you'll need to fill this in")
        
        return warnings
    
    def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Ensure minimum required fields."""
        return (
            "story" in input_data 
            and len(input_data["story"]) > 50
            and "jurisdiction" in input_data
        )
    
    def validate_output(self, output: Dict[str, Any]) -> bool:
        """Ensure case object has minimum structure."""
        case = output.get("case", {})
        return (
            "summary" in case
            and "mainIssues" in case.get("summary", {})
            and len(case["summary"]["mainIssues"]) > 0
        )
```

---

## 3. Timeline Bot

```python
# backend/agents/timeline.py

from typing import Dict, Any, List
from .base import Agent
from datetime import datetime
import re

class TimelineBotAgent(Agent):
    """
    Orders case events chronologically and links evidence.
    
    Input: Case object with initial notes/story + evidence list
    Output: Populated timeline array with linked evidence
    """
    
    def __init__(self, config=None):
        super().__init__(name="TimelineBot", version="0.1", config=config)
        self.event_keywords = {
            "noticed_issue": ["notice", "saw", "found", "discovered", "spotted"],
            "notified_landlord": ["told", "inform", "notify", "report", "called", "emailed"],
            "contractor_visit": ["contractor", "repair", "worker", "visit", "came"],
            "partial_repair": ["fix", "repair", "partial", "partial repair"],
            "issue_worsened": ["worse", "worsened", "deteriorated", "spread", "expanded"],
            "medical_visit": ["doctor", "hospital", "medical", "health", "clinic"],
            "vacated": ["vacated", "left", "moved out", "abandoned"],
            "case_filed": ["filed", "lawsuit", "court", "complaint"]
        }
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build chronological timeline from case notes and evidence.
        
        Args:
            input_data: {
                "case": Case object (with notes),
                "evidence": [Evidence objects],
                "raw_timeline": optional pre-structured events
            }
        
        Returns:
            {
                "timeline": [...],
                "analysis": {
                    "firstNotice": "2025-05-10",
                    "lastEvent": "2025-11-06",
                    "daysElapsed": 180,
                    "breachStartDate": "2025-05-10",
                    "breachStillActive": true
                }
            }
        """
        case = input_data.get("case", {})
        evidence_list = input_data.get("evidence", [])
        raw_timeline = input_data.get("raw_timeline", [])
        
        # Parse dates from case notes
        extracted_events = self._extract_events_from_narrative(
            case.get("notes", ""), 
            case.get("summary", {})
        )
        
        # Link evidence to events
        timeline_with_evidence = self._link_evidence(extracted_events, evidence_list)
        
        # Sort chronologically
        timeline_sorted = sorted(
            timeline_with_evidence,
            key=lambda e: e.get("date", "9999-12-31")
        )
        
        # Analyze breach timeline
        analysis = self._analyze_timeline(timeline_sorted, case)
        
        return {
            "timeline": timeline_sorted,
            "analysis": analysis,
            "_confidence": 0.70,
            "notes": "Timeline inferred from notes; verify dates with actual documents"
        }
    
    def _extract_events_from_narrative(self, story: str, summary: Dict) -> List[Dict]:
        """Parse narrative for dated events."""
        events = []
        
        # Try to extract specific dates (ISO or text format)
        date_pattern = r'(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+20\d{2})'
        date_matches = re.finditer(date_pattern, story)
        
        for match in date_matches:
            date_str = match.group(1)
            # Get context around this date
            start = max(0, match.start() - 100)
            end = min(len(story), match.end() + 100)
            context = story[start:end]
            
            # Determine event type
            event_type = self._classify_event(context)
            
            events.append({
                "date": self._normalize_date(date_str),
                "actor": "tenant",  # Default
                "action": event_type,
                "description": context.strip(),
                "evidence": []
            })
        
        # If no specific dates, try relative references
        if not events:
            duration = summary.get("durationMonths", 1)
            # Create skeleton timeline
            events = [
                {
                    "date": "APPROX",
                    "actor": "tenant",
                    "action": "noticed_issue",
                    "description": "Housing issue began",
                    "evidence": []
                },
                {
                    "date": "APPROX",
                    "actor": "tenant",
                    "action": "notified_landlord",
                    "description": "Tenant notified landlord",
                    "evidence": []
                }
            ]
        
        return events
    
    def _classify_event(self, text: str) -> str:
        """Classify event type from text context."""
        text_lower = text.lower()
        
        for action, keywords in self.event_keywords.items():
            if any(kw in text_lower for kw in keywords):
                return action
        
        return "timeline"  # Generic fallback
    
    def _normalize_date(self, date_str: str) -> str:
        """Convert various date formats to ISO 8601."""
        # Simple approach; production would use dateparser
        if "-" in date_str and len(date_str) == 10:
            return date_str  # Already ISO
        
        try:
            # Try common formats
            for fmt in ["%B %d, %Y", "%m/%d/%Y", "%d-%m-%Y"]:
                parsed = datetime.strptime(date_str, fmt)
                return parsed.strftime("%Y-%m-%d")
        except:
            pass
        
        return "UNKNOWN"
    
    def _link_evidence(self, events: List[Dict], evidence: List[Dict]) -> List[Dict]:
        """Match evidence to events based on dates and keywords."""
        for event in events:
            matching_evidence = []
            event_date = event.get("date")
            event_action = event.get("action")
            
            for ev in evidence:
                ev_date = ev.get("date", "UNKNOWN")
                ev_id = ev.get("id")
                
                # Match by date
                if event_date != "UNKNOWN" and event_date == ev_date:
                    matching_evidence.append(ev_id)
                
                # Match by type (e.g., "damage" photo for noticed_issue)
                if event_action == "noticed_issue" and ev.get("category") == "damage":
                    matching_evidence.append(ev_id)
                elif event_action == "notified_landlord" and ev.get("category") == "communication":
                    matching_evidence.append(ev_id)
            
            event["evidence"] = list(set(matching_evidence))  # Remove duplicates
        
        return events
    
    def _analyze_timeline(self, timeline: List[Dict], case: Dict) -> Dict:
        """Analyze timeline for legal significance."""
        if not timeline or len(timeline) == 0:
            return {"status": "unknown"}
        
        valid_dates = [e.get("date") for e in timeline if e.get("date") != "UNKNOWN"]
        
        if not valid_dates:
            return {
                "status": "estimated",
                "durationMonths": case.get("summary", {}).get("durationMonths", 1),
                "notes": "Dates estimated from narrative; verify with documents"
            }
        
        try:
            first_date = datetime.fromisoformat(min(valid_dates))
            last_date = datetime.fromisoformat(max(valid_dates))
            elapsed_days = (last_date - first_date).days
            
            return {
                "breachStartDate": min(valid_dates),
                "lastEventDate": max(valid_dates),
                "daysElapsed": elapsed_days,
                "breachStillActive": True,  # Assume active unless "case_filed" is latest
                "breachMetStatutoryThreshold": elapsed_days > 30,  # Most states: 30+ days
                "notes": f"{elapsed_days} days unrepaired exceeds statutory requirements"
            }
        except:
            return {"status": "error", "notes": "Could not parse dates"}
    
    def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Ensure we have at least a case to work from."""
        return "case" in input_data or "raw_timeline" in input_data
    
    def validate_output(self, output: Dict[str, Any]) -> bool:
        """Timeline must have at least 2 events."""
        return len(output.get("timeline", [])) >= 2
```

---

## 4. Law Mapper Bot (Skeleton)

```python
# backend/agents/law_mapper.py

from typing import Dict, Any, List
from .base import Agent

class LawMappingAgent(Agent):
    """
    Maps case facts to applicable statutes, case law, and legal theories.
    
    Input: Case object with populated timeline + jurisdiction
    Output: Applicable statutes, legal theories, anticipated defenses
    """
    
    def __init__(self, law_packs: Dict[str, Any], config=None):
        super().__init__(name="LawMapperBot", version="0.1", config=config)
        self.law_packs = law_packs  # Load from data/law_packs/
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map case facts to law.
        
        Args:
            input_data: {
                "case": Case object,
                "jurisdiction": "US-GA-Fulton"
            }
        
        Returns:
            {
                "applicableStatutes": [...],
                "legalTheories": [...],
                "anticipatedDefenses": [...],
                "precedentCases": [...]
            }
        """
        case = input_data.get("case", {})
        jurisdiction = input_data.get("jurisdiction", case.get("jurisdiction"))
        
        # Load law pack for jurisdiction
        laws = self.law_packs.get(jurisdiction, {})
        
        # Match issues to statutes
        applicable = self._find_applicable_statutes(case, laws)
        
        # Build legal theories
        theories = self._build_legal_theories(case, applicable)
        
        # Anticipate defenses
        defenses = self._anticipate_defenses(case, theories)
        
        return {
            "applicableStatutes": applicable,
            "legalTheories": theories,
            "anticipatedDefenses": defenses,
            "_confidence": 0.75,
            "jurisdiction": jurisdiction
        }
    
    def _find_applicable_statutes(self, case: Dict, law_pack: Dict) -> List[Dict]:
        """Match case issues to statutes in law pack."""
        # Skeleton implementation
        applicable = []
        
        for issue in case.get("summary", {}).get("mainIssues", []):
            # Find matching statutes
            for statute in law_pack.get("statutes", []):
                if issue in statute.get("keywords", []):
                    applicable.append({
                        "citation": statute.get("citation"),
                        "relevance": "direct_violation",
                        "remedies": statute.get("remedies", [])
                    })
        
        return applicable
    
    def _build_legal_theories(self, case: Dict, statutes: List[Dict]) -> List[Dict]:
        """Construct legal theories from applicable law."""
        # Skeleton implementation
        theories = []
        
        if any(s.get("citation", "").startswith("O.C.G.A. § 44-7") for s in statutes):
            theories.append({
                "theory": "breach_of_habitability",
                "strength": "strong",
                "elements": []
            })
        
        return theories
    
    def _anticipate_defenses(self, case: Dict, theories: List[Dict]) -> List[Dict]:
        """Predict likely landlord arguments."""
        # Skeleton implementation
        return [
            {
                "defense": "Landlord didn't know about the problem",
                "likelihood": "likely",
                "rebuttal": "Tenant notified on [DATE]; see evidence"
            }
        ]
    
    def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Require case with timeline and issues."""
        case = input_data.get("case", {})
        issues = case.get("summary", {}).get("mainIssues", [])
        timeline = case.get("timeline", [])
        
        return len(issues) > 0 and len(timeline) >= 2
    
    def validate_output(self, output: Dict[str, Any]) -> bool:
        """Must identify at least one statute."""
        return len(output.get("applicableStatutes", [])) > 0
```

---

## 5. Additional Agent Stubs

```python
# backend/agents/damages.py

class DamagesBotAgent(Agent):
    """Calculate damages: rent abatement, repairs, relocation, medical."""
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        case = input_data.get("case")
        # Calculate: (monthly_rent × percentage_uninhab × months_affected)
        # + repair costs + relocation + medical
        # Returns: damages object with conservative/aggressive figures
        pass

# backend/agents/health_mold.py

class HealthMoldBotAgent(Agent):
    """Provide health context for mold/water/pest issues."""
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Look up: is this issue a known health risk?
        # Return: health_impact, recommended medical tests, expert references
        pass

# backend/agents/drafting.py

class DraftingBotAgent(Agent):
    """Generate demand letter, complaint draft, evidence index."""
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Use Jinja2 templates to generate documents
        # Return: file paths to generated docs
        pass

# backend/agents/defense_sim.py

class DefenseSimBotAgent(Agent):
    """Simulate landlord's likely arguments."""
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Predict defenses and rebuttals based on case facts
        # Return: anticipated defenses with likelihood scores
        pass

# backend/agents/rebuttal.py

class RebuttalBotAgent(Agent):
    """Generate counter-arguments to landlord defenses."""
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # For each anticipated defense, generate rebuttal
        # Return: rebuttal language with supporting citations
        pass
```

---

## 6. Orchestrator

```python
# backend/orchestrator.py

from typing import Dict, Any, List
from agents.intake import IntakeBotAgent
from agents.timeline import TimelineBotAgent
from agents.law_mapper import LawMappingAgent
# ... other agents ...

class CaseOrchestrator:
    """
    Orchestrates the AI swarm: sequences agents, passes data, handles errors.
    
    Flow: Intake → Timeline → Law → Health → Damages → Drafting → Defense → Rebuttal
    """
    
    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.intake_bot = IntakeBotAgent()
        self.timeline_bot = TimelineBotAgent()
        self.law_bot = LawMappingAgent(law_packs=self._load_law_packs())
        # ... initialize other agents ...
        self.history = []  # Track all agent outputs for debugging
    
    def process_case(self, raw_story: Dict[str, Any]) -> Dict[str, Any]:
        """
        End-to-end case processing.
        
        Args:
            raw_story: User input with story, jurisdiction, property, etc.
        
        Returns:
            Complete case object with legal analysis, documents, etc.
        """
        try:
            # Step 1: Intake
            intake_result = self.intake_bot.execute(raw_story)
            case = intake_result["case"]
            self.history.append(("intake", intake_result))
            
            # Step 2: Timeline
            timeline_result = self.timeline_bot.execute({
                "case": case,
                "evidence": raw_story.get("evidence", [])
            })
            case["timeline"] = timeline_result["timeline"]
            self.history.append(("timeline", timeline_result))
            
            # Step 3: Law Mapping
            law_result = self.law_bot.execute({
                "case": case,
                "jurisdiction": case.get("jurisdiction")
            })
            case["legalAnalysis"] = law_result
            self.history.append(("law", law_result))
            
            # Step 4-8: Other agents (simplified for now)
            # Damages, Health, Drafting, DefenseSim, Rebuttal
            # ...
            
            return {
                "success": True,
                "case": case,
                "processingPath": [h[0] for h in self.history],
                "warnings": intake_result.get("warnings", [])
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processingPath": [h[0] for h in self.history],
                "lastValidState": self.history[-1][1] if self.history else None
            }
    
    def _load_law_packs(self) -> Dict[str, Any]:
        """Load all jurisdiction law packs."""
        # In production: read from data/law_packs/ directory
        return {}
```

---

## 7. API Integration

```python
# backend/app.py (Flask/FastAPI)

from flask import Flask, request, jsonify
from orchestrator import CaseOrchestrator

app = Flask(__name__)
orchestrator = CaseOrchestrator()

@app.route("/api/cases", methods=["POST"])
def create_case():
    """
    POST /api/cases
    
    Body: {
        "story": "Water leak for 5 months...",
        "jurisdiction": "US-GA-Fulton",
        "propertyAddress": "3530 Patterstone Drive, Alpharetta, GA 30022",
        "tenantName": "Jane Doe",
        "tenantEmail": "jane@example.com"
    }
    
    Returns: 201 Created with case object
    """
    data = request.json
    
    # Process through swarm
    result = orchestrator.process_case(data)
    
    if result["success"]:
        return jsonify(result["case"]), 201
    else:
        return jsonify({"error": result["error"]}), 400

@app.route("/api/cases/<case_id>/analyze", methods=["POST"])
def trigger_analysis(case_id):
    """Trigger re-analysis of existing case."""
    # Load case from database
    # Re-run swarm
    pass
```

---

## 8. Testing & Fixtures

```python
# backend/tests/fixtures.py

PATTERSTONE_CASE_INPUT = {
    "story": """
    I've been living at 3530 Patterstone Drive for 2 years. In May 2025, I noticed 
    water leaking from the ceiling in the bathroom. I called my landlord on May 11 
    and left a voicemail. He didn't call back for a week. I emailed him again on 
    May 12. On May 15, he sent a contractor who said it was "beyond scope." 
    
    It's now September. The leak got worse, there's mold growing, and I've had 
    respiratory issues. I've paid for a hotel for 2 weeks ($3,000), seen my doctor 
    3 times ($600 total), and bought supplies ($300). My rent is $3,000/month.
    
    The landlord still hasn't fixed it.
    """,
    "jurisdiction": "US-GA-Fulton",
    "propertyAddress": "3530 Patterstone Drive, Alpharetta, GA 30022",
    "tenantName": "Yoda Burns",
    "tenantEmail": "yoda.burns@example.com",
    "monthlyRent": 3000,
    "contact_method": "email"
}

# backend/tests/test_agents.py

import pytest
from agents.intake import IntakeBotAgent
from tests.fixtures import PATTERSTONE_CASE_INPUT

def test_intake_agent():
    agent = IntakeBotAgent()
    result = agent.execute(PATTERSTONE_CASE_INPUT)
    
    assert result["case"]["summary"]["mainIssues"] == ["water_leak", "mold"]
    assert result["case"]["summary"]["durationMonths"] >= 4
    assert result["case"]["summary"]["healthImpact"] == "respiratory"
```

---

**Next Steps:**

1. Implement full agents (intake → drafting)
2. Add LLM integration (use GPT-4 for text understanding)
3. Build law packs for GA, CA, NY
4. Create test fixtures with real cases
5. Build REST API layer
6. Integrate with frontend

**Tech Stack:**
- Python 3.11+
- Flask or FastAPI
- LangChain for LLM integration (optional)
- Jinja2 for templates
- pytest for tests
- Logging for observability
