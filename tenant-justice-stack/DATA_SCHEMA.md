# Tenant Justice Stack – Data Schema

**Version:** 0.1  
**Last Updated:** November 6, 2025  
**Purpose:** Complete JSON schema definitions for all platform data structures

---

## 1. Core Schema Definitions

### 1.1 Case Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Tenant Case",
  "type": "object",
  "required": ["id", "jurisdiction", "parties", "timeline", "openedAt"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[A-Z]{2}-[A-Z0-9]{2,}-[0-9]{4}-[0-9]{3,}$",
      "description": "Unique case ID format: STATE-COUNTY-YEAR-SEQUENCE (e.g., GA-FULTON-2025-001)",
      "examples": ["GA-FULTON-2025-001", "CA-LA-2025-042"]
    },
    "tenantWallet": {
      "type": "string",
      "pattern": "^0x[a-fA-F0-9]{40}$",
      "description": "Optional: Ethereum wallet address for blockchain registration",
      "examples": ["0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"]
    },
    "jurisdiction": {
      "type": "string",
      "pattern": "^US-[A-Z]{2}-[A-Za-z]+$",
      "description": "Jurisdiction identifier: COUNTRY-STATE-COUNTY",
      "examples": ["US-GA-Fulton", "US-CA-LosAngeles", "US-NY-NewYork"]
    },
    "propertyAddress": {
      "type": "object",
      "required": ["street", "city", "state", "zip"],
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string", "minLength": 2, "maxLength": 2 },
        "zip": { "type": "string", "pattern": "^[0-9]{5}(-[0-9]{4})?$" },
        "coordinates": {
          "type": "object",
          "properties": {
            "lat": { "type": "number", "minimum": -90, "maximum": 90 },
            "lng": { "type": "number", "minimum": -180, "maximum": 180 }
          }
        }
      },
      "examples": [{
        "street": "3530 Patterstone Drive",
        "city": "Alpharetta",
        "state": "GA",
        "zip": "30022",
        "coordinates": { "lat": 33.9, "lng": -84.1 }
      }]
    },
    "openedAt": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp when case was created"
    },
    "status": {
      "type": "string",
      "enum": ["active", "resolved", "archived", "settled"],
      "default": "active"
    },
    "summary": {
      "type": "object",
      "required": ["mainIssues", "durationMonths"],
      "properties": {
        "mainIssues": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["mold", "water_leak", "pest", "no_repair", "no_heat", "no_water", "unsafe_structure", "electrical", "gas_leak", "habitability_other"]
          },
          "description": "Primary habitability issues"
        },
        "durationMonths": {
          "type": "number",
          "minimum": 0,
          "description": "How long the issue has persisted"
        },
        "healthImpact": {
          "type": "string",
          "enum": ["respiratory", "skin", "behavioral", "infectious", "none", "unknown"],
          "description": "Primary health impact if any"
        },
        "occupants": {
          "type": "object",
          "properties": {
            "adults": { "type": "integer", "minimum": 0 },
            "children": { "type": "integer", "minimum": 0 },
            "elderly": { "type": "integer", "minimum": 0 },
            "disabled": { "type": "integer", "minimum": 0 }
          }
        }
      }
    },
    "parties": {
      "type": "object",
      "required": ["tenant", "landlord"],
      "properties": {
        "tenant": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "email": { "type": "string", "format": "email" },
            "phone": { "type": "string", "pattern": "^[0-9]{3}-[0-9]{3}-[0-9]{4}$" },
            "anonymous": { "type": "boolean", "default": false }
          }
        },
        "landlord": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "entity": {
              "type": "string",
              "enum": ["individual", "llc", "corporation", "trust", "government", "unknown"]
            },
            "entityName": { "type": "string", "description": "If LLC/corp, the official name" },
            "address": { "type": "string" },
            "email": { "type": "string", "format": "email" },
            "phone": { "type": "string" }
          }
        },
        "propertyManager": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "company": { "type": "string" },
            "contact": { "type": "string" }
          }
        }
      }
    },
    "lease": {
      "type": "object",
      "properties": {
        "startDate": { "type": "string", "format": "date" },
        "endDate": { "type": "string", "format": "date" },
        "monthlyRent": { "type": "number", "minimum": 0 },
        "securityDeposit": { "type": "number", "minimum": 0 },
        "leaseType": {
          "type": "string",
          "enum": ["fixed_term", "month_to_month", "oral", "unknown"]
        },
        "habitabilityClauseExplicit": { "type": "boolean" },
        "repairResponsibility": {
          "type": "string",
          "enum": ["landlord", "tenant", "split", "unclear"]
        }
      }
    },
    "timeline": {
      "type": "array",
      "description": "Chronological sequence of events",
      "items": {
        "$ref": "#/definitions/TimelineEvent"
      }
    },
    "documents": {
      "type": "object",
      "properties": {
        "lease": {
          "type": "object",
          "properties": {
            "fileId": { "type": "string" },
            "ipfsCID": { "type": "string" },
            "uploadedAt": { "type": "string", "format": "date-time" }
          }
        },
        "photos": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string", "pattern": "^EXH-[A-Z]-[0-9]{2}$" },
              "date": { "type": "string", "format": "date" },
              "description": { "type": "string" },
              "location": { "type": "string" },
              "ipfsCID": { "type": "string" }
            }
          }
        },
        "messages": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "date": { "type": "string", "format": "date-time" },
              "type": { "type": "string", "enum": ["email", "text", "voicemail", "in_person", "letter"] },
              "from": { "type": "string" },
              "to": { "type": "string" },
              "content": { "type": "string" },
              "ipfsCID": { "type": "string" }
            }
          }
        },
        "medicalReports": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "date": { "type": "string", "format": "date" },
              "provider": { "type": "string" },
              "diagnosis": { "type": "string" },
              "relatedToHousing": { "type": "boolean" },
              "anonymized": { "type": "boolean", "default": true },
              "ipfsCID": { "type": "string" }
            }
          }
        }
      }
    },
    "legalAnalysis": {
      "type": "object",
      "properties": {
        "applicableStatutes": {
          "type": "array",
          "items": { "$ref": "#/definitions/ApplicableStatute" }
        },
        "legalTheories": {
          "type": "array",
          "items": { "$ref": "#/definitions/LegalTheory" }
        },
        "anticipatedDefenses": {
          "type": "array",
          "items": { "$ref": "#/definitions/AnticipatedDefense" }
        }
      }
    },
    "damages": {
      "type": "object",
      "properties": {
        "rentAbatement": {
          "type": "object",
          "properties": {
            "monthlyRent": { "type": "number" },
            "percentageUninhab": { "type": "number", "minimum": 0, "maximum": 100 },
            "monthsAffected": { "type": "number" },
            "subtotal": { "type": "number" }
          }
        },
        "repairCosts": {
          "type": "object",
          "additionalProperties": { "type": "number" }
        },
        "relocation": {
          "type": "object",
          "properties": {
            "hotelNights": { "type": "number" },
            "costPerNight": { "type": "number" },
            "subtotal": { "type": "number" }
          }
        },
        "medical": {
          "type": "object",
          "properties": {
            "doctorVisits": { "type": "number" },
            "costPerVisit": { "type": "number" },
            "prescriptions": { "type": "number" },
            "subtotal": { "type": "number" }
          }
        },
        "securityDeposit": { "type": "number" },
        "total": {
          "type": "object",
          "properties": {
            "conservative": { "type": "number" },
            "aggressive": { "type": "number" },
            "punitivePotential": { "type": "number" }
          }
        }
      }
    },
    "blockchainAnchors": {
      "type": "array",
      "description": "Records of blockchain registration",
      "items": {
        "type": "object",
        "properties": {
          "network": {
            "type": "string",
            "enum": ["sepolia", "ethereum", "polygon", "arbitrum", "optimism", "base"]
          },
          "contractAddress": { "type": "string", "pattern": "^0x[a-fA-F0-9]{40}$" },
          "caseRegistryTxn": { "type": "string", "pattern": "^0x[a-fA-F0-9]{64}$" },
          "blockNumber": { "type": "integer" },
          "timestamp": { "type": "string", "format": "date-time" },
          "summaryIPFS": { "type": "string", "pattern": "^Qm[a-zA-Z0-9]{44}$" },
          "status": {
            "type": "string",
            "enum": ["pending", "registered", "finalized", "failed"]
          }
        }
      }
    },
    "publicVerificationKey": {
      "type": "string",
      "description": "Unique token for public verification link"
    },
    "notes": {
      "type": "string",
      "description": "Internal case notes (not public)"
    }
  }
}
```

---

### 1.2 Timeline Event Schema

```json
{
  "definitions": {
    "TimelineEvent": {
      "type": "object",
      "required": ["date", "actor", "action", "description"],
      "properties": {
        "date": {
          "type": "string",
          "format": "date",
          "description": "Event date"
        },
        "time": {
          "type": "string",
          "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$",
          "description": "Optional time in HH:MM format"
        },
        "actor": {
          "type": "string",
          "enum": ["tenant", "landlord", "manager", "contractor", "third_party", "court"]
        },
        "action": {
          "type": "string",
          "enum": [
            "noticed_issue",
            "notified_landlord",
            "sent_email",
            "left_voicemail",
            "in_person_notice",
            "sent_certified_letter",
            "contractor_visit",
            "partial_repair",
            "issue_worsened",
            "tenant_incurred_expense",
            "medical_visit",
            "vacated_space",
            "case_filed",
            "demand_sent",
            "response_received",
            "settlement_reached",
            "court_date"
          ]
        },
        "description": {
          "type": "string",
          "minLength": 10,
          "description": "What happened (plain English)"
        },
        "evidence": {
          "type": "array",
          "items": { "type": "string", "pattern": "^EXH-[A-Z]-[0-9]{2}$" },
          "description": "References to supporting evidence (EXH-A-01, EXH-B-02, etc.)"
        },
        "notificationMethod": {
          "type": "string",
          "enum": ["email", "text", "phone", "voicemail", "in_person", "certified_letter", "registered_mail", "none"]
        },
        "witnessTo": {
          "type": "string",
          "description": "If multiple parties present, who witnessed this"
        },
        "legalSignificance": {
          "type": "string",
          "description": "Why this event matters legally"
        },
        "costIncurred": {
          "type": "number",
          "minimum": 0,
          "description": "Any expenses associated with this event"
        }
      }
    }
  }
}
```

---

### 1.3 Evidence Schema

```json
{
  "definitions": {
    "Evidence": {
      "type": "object",
      "required": ["id", "caseId", "type", "description"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^EXH-[A-Z]-[0-9]{2}$",
          "description": "Unique evidence ID (EXH-A-01, EXH-B-02, etc.)",
          "examples": ["EXH-A-01", "EXH-B-05", "EXH-M-03"]
        },
        "caseId": {
          "type": "string",
          "pattern": "^[A-Z]{2}-[A-Z0-9]{2,}-[0-9]{4}-[0-9]{3,}$"
        },
        "type": {
          "type": "string",
          "enum": ["photo", "message", "document", "medical", "receipt", "audio", "video", "other"]
        },
        "category": {
          "type": "string",
          "enum": [
            "damage",
            "communication",
            "lease",
            "proof_of_notice",
            "medical",
            "financial",
            "timeline",
            "code_violation",
            "insurance",
            "repair_estimate"
          ]
        },
        "description": {
          "type": "string",
          "minLength": 20,
          "description": "What this evidence shows"
        },
        "date": {
          "type": "string",
          "format": "date",
          "description": "Date the evidence was created/captured"
        },
        "uploadedAt": {
          "type": "string",
          "format": "date-time"
        },
        "submittedBy": {
          "type": "string",
          "enum": ["tenant", "landlord", "third_party"]
        },
        "file": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "mimeType": { "type": "string" },
            "sizeBytes": { "type": "integer" },
            "ipfsCID": { "type": "string", "pattern": "^Qm[a-zA-Z0-9]{44}$" },
            "arweaveID": { "type": "string" }
          }
        },
        "metadata": {
          "type": "object",
          "properties": {
            "location": { "type": "string", "description": "Where in property (e.g., 'bathroom, main floor')" },
            "timestamp": { "type": "string", "format": "date-time" },
            "relevantToLegalTheories": {
              "type": "array",
              "items": { "type": "string" }
            },
            "rebuttsDefense": { "type": "string", "description": "Which landlord argument does this counter?" }
          }
        },
        "anonymization": {
          "type": "object",
          "properties": {
            "requiresRedaction": { "type": "boolean" },
            "sensitiveData": { "type": "array", "items": { "type": "string" } },
            "redactedVersion": { "type": "string", "description": "IPFS CID of redacted version" }
          }
        },
        "blockchainReference": {
          "type": "object",
          "properties": {
            "registeredOn": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": ["sepolia", "ethereum", "polygon", "arbitrum", "optimism", "base"]
              }
            },
            "txnHashes": {
              "type": "array",
              "items": { "type": "string", "pattern": "^0x[a-fA-F0-9]{64}$" }
            },
            "timestamp": { "type": "string", "format": "date-time" }
          }
        }
      }
    }
  }
}
```

---

### 1.4 Applicable Statute Schema

```json
{
  "definitions": {
    "ApplicableStatute": {
      "type": "object",
      "required": ["citation", "summary"],
      "properties": {
        "citation": {
          "type": "string",
          "description": "Legal citation (e.g., O.C.G.A. § 44-7-13)",
          "examples": ["O.C.G.A. § 44-7-13", "Cal. Civil Code § 1941", "N.Y. Real Prop. Law § 235-a"]
        },
        "shortName": {
          "type": "string",
          "description": "Human-readable name"
        },
        "fullText": {
          "type": "string",
          "description": "Complete statute text"
        },
        "summary": {
          "type": "string",
          "minLength": 50,
          "description": "What it says in plain English"
        },
        "relevance": {
          "type": "string",
          "enum": ["direct_violation", "supporting", "contextual", "indirect"]
        },
        "evidence": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Evidence IDs that satisfy this statute"
        },
        "remedies": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["rent_abatement", "specific_performance", "damages", "treble_damages", "attorney_fees", "court_costs"]
          }
        },
        "statute_year": {
          "type": "string",
          "description": "Year statute was enacted/last amended"
        },
        "jurisdiction": {
          "type": "string",
          "description": "Where this statute applies"
        }
      }
    }
  }
}
```

---

### 1.5 Legal Theory Schema

```json
{
  "definitions": {
    "LegalTheory": {
      "type": "object",
      "required": ["theory", "elements"],
      "properties": {
        "theory": {
          "type": "string",
          "enum": [
            "breach_of_habitability",
            "constructive_eviction",
            "negligence",
            "gross_negligence",
            "premises_liability",
            "breach_of_implied_warranty",
            "bad_faith_failure_to_repair",
            "intentional_infliction_emotional_distress",
            "fraud_misrepresentation",
            "unjust_enrichment"
          ]
        },
        "strength": {
          "type": "string",
          "enum": ["weak", "moderate", "strong", "very_strong"]
        },
        "elements": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "element": { "type": "string" },
              "satisfied": { "type": "boolean" },
              "evidence": { "type": "array", "items": { "type": "string" } },
              "explanation": { "type": "string" }
            }
          }
        },
        "applicableStatutes": {
          "type": "array",
          "items": { "type": "string", "description": "Citations" }
        },
        "precedentCases": {
          "type": "array",
          "items": { "type": "string", "description": "Case citations supporting this theory" }
        },
        "potentialDamages": {
          "type": "object",
          "properties": {
            "compensatory": { "type": "number" },
            "treble": { "type": "number" },
            "punitive": { "type": "number" }
          }
        }
      }
    }
  }
}
```

---

### 1.6 Anticipated Defense Schema

```json
{
  "definitions": {
    "AnticipatedDefense": {
      "type": "object",
      "required": ["defense", "likelihood"],
      "properties": {
        "defense": {
          "type": "string",
          "description": "The argument landlord will make",
          "examples": ["We didn't know about the problem", "Tenant caused the damage", "We were working on repair when case filed"]
        },
        "likelihood": {
          "type": "string",
          "enum": ["rare", "unlikely", "moderate", "likely", "very_likely"]
        },
        "rebuttal": {
          "type": "string",
          "minLength": 50,
          "description": "Your counter-argument (cite to evidence)"
        },
        "strengthOfRebuttal": {
          "type": "string",
          "enum": ["weak", "moderate", "strong"]
        },
        "evidence": {
          "type": "array",
          "items": { "type": "string", "description": "Evidence IDs that defeat this defense" }
        },
        "counterargument": {
          "type": "string",
          "description": "Legal theory that makes this defense irrelevant"
        }
      }
    }
  }
}
```

---

## 2. Database Queries (Examples)

### Find all cases in Georgia

```python
cases = db.query(Case).filter_by(jurisdiction="US-GA-*").all()
```

### Find unresolved mold cases

```python
cases = db.query(Case)
  .filter_by(status="active")
  .filter(Case.summary["mainIssues"].contains("mold"))
  .all()
```

### Get evidence for a specific theory

```python
evidence = db.query(Evidence)
  .join(Case)
  .filter(Case.id == case_id)
  .filter(Evidence.metadata["relevantToLegalTheories"].contains("breach_of_habitability"))
  .all()
```

### Cases ready for blockchain registration

```python
cases = db.query(Case)
  .filter_by(status="active")
  .filter(Case.legalAnalysis["legalTheories"] != None)
  .filter(~Case.blockchainAnchors.any())
  .all()
```

---

## 3. API Endpoints

### POST /api/cases

**Create new case**

```
Request:
{
  "jurisdiction": "US-GA-Fulton",
  "propertyAddress": { "street": "...", "city": "...", "state": "GA", "zip": "30022" },
  "summary": {
    "mainIssues": ["mold", "water_leak"],
    "durationMonths": 5
  },
  "parties": { ... }
}

Response: 201 Created
{
  "id": "GA-FULTON-2025-001",
  "status": "active",
  "createdAt": "2025-11-06T14:00:00Z"
}
```

### GET /api/cases/{caseId}

**Retrieve full case (authenticated)**

```
Response: 200 OK
{ ... full case object ... }
```

### POST /api/cases/{caseId}/evidence

**Upload evidence**

```
Request: multipart/form-data
  file: (binary)
  type: "photo"
  category: "damage"
  description: "Water damage in bathroom"
  date: "2025-05-15"

Response: 201 Created
{
  "id": "EXH-A-01",
  "ipfsCID": "QmXxxx...",
  "uploadedAt": "2025-11-06T14:05:00Z"
}
```

### POST /api/cases/{caseId}/analyze

**Trigger AI swarm analysis**

```
Response: 202 Accepted (async processing)
{
  "jobId": "job-12345",
  "status": "processing"
}
```

### GET /api/cases/{caseId}/analysis

**Get AI analysis results**

```
Response: 200 OK
{
  "applicableStatutes": [...],
  "legalTheories": [...],
  "anticipatedDefenses": [...],
  "damages": { ... }
}
```

### POST /api/cases/{caseId}/blockchain/register

**Register case on blockchain**

```
Request:
{
  "networks": ["polygon", "ethereum"],
  "tenantWallet": "0x..."
}

Response: 202 Accepted
{
  "registrationJob": "reg-12345",
  "estimatedCost": "$5.50",
  "networks": ["polygon", "ethereum"]
}
```

### GET /api/verify/{caseId}

**Public verification endpoint (unauthenticated)**

```
Response: 200 OK
{
  "caseId": "GA-FULTON-2025-001",
  "propertyAddress": "3530 Patterstone Drive, Alpharetta GA 30022",
  "openedAt": "2025-11-06T14:00:00Z",
  "status": "active",
  "blockchainAnchors": [
    { "network": "polygon", "contractAddress": "0x...", "txn": "0x..." }
  ],
  "summary": { "mainIssues": ["mold", "water_leak"], "durationMonths": 5 }
}
```

---

## 4. Validation Rules

### Case Validation

- ✅ `jurisdiction` must match known law pack
- ✅ `timeline` must have at least 3 events
- ✅ `timeline` events must be in chronological order
- ✅ `durationMonths` ≥ 0.5 (2+ weeks counts)
- ✅ `mainIssues` must have ≥ 1 item
- ✅ `monthlyRent` > 0 (if damages calculated)
- ✅ Each evidence item must have supporting evidence

### Evidence Validation

- ✅ File size ≤ 100MB
- ✅ Mime type must be whitelisted (jpg, pdf, txt, msg, etc.)
- ✅ File virus scanned before IPFS upload
- ✅ Evidence `date` must be within case timeline
- ✅ At least one photo for "damage" category

### Timeline Validation

- ✅ ≥ 3 events minimum
- ✅ Events in chronological order
- ✅ Each event has supporting evidence or explanation
- ✅ Key events present:
  - ✅ Landlord notified (when? how?)
  - ✅ Issue persisted (proof of duration)
  - ✅ Tenant incurred costs (if claiming damages)

---

## 5. Consent & Privacy

### Tenant Consent (Required before blockchain registration)

```
DO YOU CONSENT?

This case and all evidence will be registered on public blockchain networks 
(Polygon, Ethereum, Arbitrum, Optimism, Base). 

Anyone can view:
✓ Case ID, property address, issue type, timeline
✓ Evidence (photos, medical reports—anonymized by default)
✓ Legal theories and damages
✓ Your Ethereum wallet address

Visible to: WORLD, PERMANENT, IMPOSSIBLE TO DELETE

If you have safety concerns or privacy issues, DO NOT REGISTER.

☐ I consent to public blockchain registration
☐ I understand this is permanent and irreversible
☐ I have removed/anonymized sensitive personal data
```

### Data Minimization

- ✅ Tenant name optional (case shows as "Tenant v. [Landlord]")
- ✅ Medical reports redact patient names, doc identifiers
- ✅ Photos strip EXIF metadata
- ✅ Messages redact phone numbers, email addresses

---

## 6. Migration Checklist

- ✅ Case schema locked
- ✅ Evidence schema locked
- ✅ Timeline schema locked
- ✅ Legal theory schema locked
- 🔄 Database constraints (indexes, foreign keys)
- 🔄 API validation layer
- 🔄 Data sanitization (remove PII)
- 🔄 Audit logging (who accessed what, when)
- 🔄 Backup procedures (export to JSON)
- 🔄 GDPR/privacy compliance review

---

**Next steps:**
1. Frontend team builds intake form matching these schemas
2. Backend team builds API validation layer
3. AI team builds agents that output these schemas
4. QA team builds test fixtures using this schema
