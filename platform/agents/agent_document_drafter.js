/**
 * AGENT #6: DOCUMENT DRAFTER
 * 
 * Generates all legal documents needed for tenant cases:
 * - Demand letters
 * - Complaints (lawsuits)
 * - Discovery requests
 * - Motions
 * - Settlement agreements
 * - Evidence indexes
 * - Timeline exhibits
 * 
 * Uses templates, legal precedents, and AI to draft professional documents
 * that maximize recovery and legal impact.
 */

import OpenAI from 'openai';
import { z } from 'zod';

const DocumentSchema = z.object({
  documentType: z.enum([
    'demand_letter',
    'complaint',
    'discovery_interrogatories',
    'discovery_requests_production',
    'discovery_requests_admission',
    'motion_summary_judgment',
    'motion_preliminary_injunction',
    'settlement_agreement',
    'evidence_index',
    'timeline_exhibit',
    'witness_list',
    'expert_disclosure'
  ]),
  title: z.string(),
  content: z.string(),
  formatInstructions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
  legalCitations: z.array(z.string()).optional()
});

export default class DocumentDrafterAgent {
  constructor(openaiApiKey) {
    this.openai = new OpenAI({ apiKey: openaiApiKey || process.env.OPENAI_API_KEY });
    this.model = 'gpt-4-turbo-preview';
  }

  /**
   * Draft demand letter
   */
  async draftDemandLetter(caseData, legalAnalysis, damagesAnalysis, options = {}) {
    console.log('📝 Document Drafter: Creating demand letter...');

    const {
      tone = 'professional', // professional, aggressive, conciliatory
      deadline = 14, // days
      includeStatutoryDamages = true,
      includeAttorneyFees = true
    } = options;

    const prompt = `You are a skilled attorney drafting a demand letter for a tenant.

CASE DATA:
${JSON.stringify(caseData, null, 2)}

LEGAL ANALYSIS:
${JSON.stringify(legalAnalysis, null, 2)}

DAMAGES:
${JSON.stringify(damagesAnalysis, null, 2)}

DEMAND LETTER REQUIREMENTS:
- Tone: ${tone}
- Deadline: ${deadline} days from date of letter
- Include statutory damages: ${includeStatutoryDamages}
- Include attorney fees: ${includeAttorneyFees}

STRUCTURE:
1. Header (From/To/Date/Re:)
2. Opening (establish attorney representation)
3. Facts (chronological narrative of violations)
4. Legal Violations (specific statutes/codes violated)
5. Damages Breakdown (itemized)
6. Demand Amount (clear dollar figure)
7. Deadline (date by which payment/response required)
8. Consequences (what happens if no response - litigation, public filing, etc.)
9. Contact Information
10. Enclosures (evidence list)

TONE GUIDANCE:
- Professional: Firm but courteous, fact-based
- Aggressive: Strong language, emphasis on consequences
- Conciliatory: Open to negotiation, collaborative tone

Make it compelling and legally sound. This often gets cases settled.

Draft the complete demand letter as it would be sent.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an experienced tenant rights attorney drafting demand letters that get results.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    });

    const content = response.choices[0].message.content;

    // Extract legal citations
    const citations = this.extractCitations(content);

    return DocumentSchema.parse({
      documentType: 'demand_letter',
      title: 'Demand Letter - Tenant Rights Violations',
      content,
      formatInstructions: 'Print on attorney letterhead. Send via certified mail, return receipt requested.',
      attachments: [
        'Evidence Index',
        'Timeline of Events',
        'Photos of Violations',
        'Medical Records (if applicable)',
        'Repair Request Documentation'
      ],
      nextSteps: [
        `Wait ${deadline} days for response`,
        'If no response, file complaint in court',
        'If partial response, negotiate settlement',
        'Document all communications'
      ],
      legalCitations: citations
    });
  }

  /**
   * Draft lawsuit complaint
   */
  async draftComplaint(caseData, legalAnalysis, damagesAnalysis, options = {}) {
    console.log('📝 Document Drafter: Creating complaint...');

    const {
      jurisdiction = caseData.jurisdiction || 'Georgia',
      court = options.court || 'Superior Court',
      includeJuryDemand = true,
      includeInjunctiveRelief = false
    } = options;

    const prompt = `You are an attorney drafting a civil complaint for a tenant against a landlord.

CASE DATA:
${JSON.stringify(caseData, null, 2)}

LEGAL ANALYSIS:
${JSON.stringify(legalAnalysis, null, 2)}

DAMAGES:
${JSON.stringify(damagesAnalysis, null, 2)}

JURISDICTION: ${jurisdiction}
COURT: ${court}
JURY DEMAND: ${includeJuryDemand ? 'Yes' : 'No'}
INJUNCTIVE RELIEF: ${includeInjunctiveRelief ? 'Yes' : 'No'}

COMPLAINT STRUCTURE (follow ${jurisdiction} rules):

1. CAPTION
   - Case style (Plaintiff v. Defendant)
   - Court
   - Case number (leave blank)

2. PARTIES
   - Identify plaintiff(s) with addresses
   - Identify defendant(s) with addresses
   - Establish standing

3. JURISDICTION & VENUE
   - Why this court has jurisdiction
   - Why venue is proper

4. FACTUAL ALLEGATIONS (numbered paragraphs)
   - Lease agreement details
   - Landlord's duties
   - Violations (chronological)
   - Notice to landlord
   - Landlord's response (or lack thereof)
   - Resulting damages

5. COUNTS (separate count for each legal theory)
   Count I: Breach of Warranty of Habitability
   Count II: Breach of Contract
   Count III: Negligence
   Count IV: Statutory Violations (cite specific statutes)
   Count V: [Additional as applicable]

6. DAMAGES PRAYER
   - Economic damages (itemized)
   - Non-economic damages
   - Statutory damages
   - Attorney fees and costs
   - Pre/post-judgment interest
   - Injunctive relief (if applicable)

7. JURY DEMAND (if applicable)

8. SIGNATURE BLOCK
   - Attorney name, bar number
   - Firm information
   - Contact details

Draft the complete, file-ready complaint.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are an experienced civil litigator in ${jurisdiction} drafting tenant complaints.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    const citations = this.extractCitations(content);

    return DocumentSchema.parse({
      documentType: 'complaint',
      title: `Complaint for Damages and Injunctive Relief`,
      content,
      formatInstructions: `Format according to ${court} local rules. Include certificate of service. File with appropriate filing fee.`,
      attachments: [
        'Exhibit A: Lease Agreement',
        'Exhibit B: Timeline of Events',
        'Exhibit C: Photos of Violations',
        'Exhibit D: Repair Request Documentation',
        'Exhibit E: Medical Records',
        'Exhibit F: Damages Calculation'
      ],
      nextSteps: [
        'Review and revise complaint',
        'Obtain client signature verification',
        'File with court and pay filing fee',
        'Serve defendant per local rules',
        'Await defendant response (typically 30 days)'
      ],
      legalCitations: citations
    });
  }

  /**
   * Draft discovery interrogatories
   */
  async draftInterrogatories(caseData, legalAnalysis, options = {}) {
    console.log('📝 Document Drafter: Creating interrogatories...');

    const maxQuestions = options.maxQuestions || 30; // Most jurisdictions limit to 30-50

    const prompt = `Draft discovery interrogatories for a tenant lawsuit.

CASE DATA:
${JSON.stringify(caseData, null, 2)}

LEGAL THEORIES:
${JSON.stringify(legalAnalysis.legalTheories || [], null, 2)}

VIOLATIONS:
${JSON.stringify(legalAnalysis.violations || [], null, 2)}

Maximum questions: ${maxQuestions}

CATEGORIES TO COVER:
1. Background (property ownership, management, employees)
2. Lease & Property (terms, condition at move-in, prior complaints)
3. Notice & Knowledge (when landlord learned of issues)
4. Response & Repairs (what actions taken, why delays)
5. Maintenance Records (inspection logs, work orders, contractor info)
6. Prior Tenants (similar complaints, pattern of violations)
7. Financial (rent collected, repair costs, insurance)
8. Communications (all contacts with tenant)
9. Defenses (basis for any defenses claimed)
10. Damages (contention interrogatories on our damages)

Each interrogatory should:
- Be specific and targeted
- Seek admissible information
- Support our legal theories
- Identify weaknesses in their defense
- Discover documentary evidence

Draft ${maxQuestions} interrogatories numbered sequentially.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a skilled discovery attorney drafting interrogatories that uncover key facts.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;

    return DocumentSchema.parse({
      documentType: 'discovery_interrogatories',
      title: "Plaintiff's First Set of Interrogatories to Defendant",
      content,
      formatInstructions: 'Include definitions and instructions section. Serve with certificate of service.',
      nextSteps: [
        'Review and customize interrogatories',
        'Serve on defendant',
        'Defendant has 30 days to respond (typically)',
        'Review responses for inconsistencies',
        'Follow up with requests for production based on answers'
      ]
    });
  }

  /**
   * Draft requests for production of documents
   */
  async draftRequestsForProduction(caseData, legalAnalysis, options = {}) {
    console.log('📝 Document Drafter: Creating document requests...');

    const prompt = `Draft requests for production of documents for a tenant lawsuit.

CASE DATA:
${JSON.stringify(caseData, null, 2)}

LEGAL ANALYSIS:
${JSON.stringify(legalAnalysis, null, 2)}

DOCUMENT CATEGORIES TO REQUEST:

1. PROPERTY OWNERSHIP & MANAGEMENT
   - Deeds, titles
   - Property management agreements
   - Insurance policies

2. LEASE DOCUMENTS
   - Original lease
   - All amendments
   - Renewal agreements
   - Move-in/move-out checklists

3. MAINTENANCE & REPAIRS
   - ALL work orders for the property (past 5 years)
   - Contractor invoices and estimates
   - Inspection reports
   - Maintenance logs
   - Before/after photos of repairs

4. COMMUNICATIONS
   - All emails with tenant
   - Text messages
   - Letters, notices
   - Phone logs/records

5. COMPLAINTS & VIOLATIONS
   - Tenant complaints (this tenant and prior tenants)
   - Housing authority violations
   - Building code violations
   - Health department reports

6. FINANCIAL RECORDS
   - Rent payment ledger
   - Security deposit records
   - Late fee assessments
   - Repair cost records

7. PRIOR TENANTS
   - Complaints from prior tenants
   - Lawsuits by prior tenants
   - Similar habitability issues

8. PERSONNEL
   - Property manager info
   - Maintenance staff info
   - Contractor contact info

Each request should:
- Be specific but broadly worded
- Request "all documents" related to topic
- Define time period (usually 5 years)
- Seek electronic and paper records
- Include metadata for ESI

Draft comprehensive requests for production.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a discovery expert drafting document requests that leave no stone unturned.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;

    return DocumentSchema.parse({
      documentType: 'discovery_requests_production',
      title: "Plaintiff's First Requests for Production of Documents",
      content,
      formatInstructions: 'Include definitions for Document, Communication, etc. Specify production format (native format preferred).',
      nextSteps: [
        'Review and customize requests',
        'Serve on defendant',
        'Defendant has 30 days to respond',
        'Review production for completeness',
        'File motion to compel if inadequate',
        'Organize documents received for trial'
      ]
    });
  }

  /**
   * Draft settlement agreement
   */
  async draftSettlementAgreement(caseData, settlementTerms, options = {}) {
    console.log('📝 Document Drafter: Creating settlement agreement...');

    const prompt = `Draft a settlement agreement for a tenant-landlord dispute.

CASE DATA:
${JSON.stringify(caseData, null, 2)}

SETTLEMENT TERMS:
${JSON.stringify(settlementTerms, null, 2)}

SETTLEMENT AGREEMENT STRUCTURE:

1. RECITALS
   - Parties
   - Dispute description
   - Desire to settle

2. TERMS
   - Payment amount and schedule
   - Any repairs/remediation required
   - Move-out terms (if applicable)
   - Lease termination (if applicable)
   - Return of security deposit
   - Attorney fees allocation

3. RELEASES
   - Mutual general release
   - Scope of release
   - Exceptions (if any)

4. CONFIDENTIALITY (if requested)
   - Non-disclosure terms
   - Permitted disclosures

5. NON-ADMISSION
   - No admission of liability
   - Settlement is compromise

6. MISCELLANEOUS
   - Entire agreement
   - Amendment procedure
   - Governing law
   - Severability
   - Attorney review
   - Counterparts

7. SIGNATURES
   - Both parties
   - Notarization (if required)

Draft a comprehensive, enforceable settlement agreement.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a settlement attorney drafting enforceable agreements that protect your client.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;

    return DocumentSchema.parse({
      documentType: 'settlement_agreement',
      title: 'Settlement Agreement and Mutual Release',
      content,
      formatInstructions: 'Have both parties sign. Consider notarization. File dismissal with court once payment received.',
      nextSteps: [
        'Review terms with client',
        'Negotiate any changes',
        'Execute agreement',
        'Monitor compliance with payment schedule',
        'File dismissal with prejudice once paid',
        'Return case file to client'
      ]
    });
  }

  /**
   * Create evidence index
   */
  async createEvidenceIndex(caseData, evidenceList, options = {}) {
    console.log('📝 Document Drafter: Creating evidence index...');

    const prompt = `Create a professional evidence index for trial or settlement negotiations.

CASE DATA:
${JSON.stringify(caseData, null, 2)}

EVIDENCE ITEMS:
${JSON.stringify(evidenceList, null, 2)}

Create a table with columns:
- Exhibit Number (A, B, C... or 1, 2, 3...)
- Description (brief but clear)
- Date (when created/taken)
- Relevance (what it proves)
- Authentication (who can authenticate it)
- Status (admitted, offered, etc.)

Organize logically:
1. Lease documents
2. Communications (chronological)
3. Photos (chronological)
4. Repair requests
5. Medical records
6. Financial records
7. Expert reports

Format as a professional exhibit list suitable for court filing.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a trial attorney creating organized exhibit lists.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    });

    const content = response.choices[0].message.content;

    return DocumentSchema.parse({
      documentType: 'evidence_index',
      title: 'Plaintiff\'s Exhibit List',
      content,
      formatInstructions: 'Tab and label all exhibits to match this index. Make copies for court, opposing counsel, and file.',
      nextSteps: [
        'Organize physical exhibits to match index',
        'Label each exhibit clearly',
        'Create exhibit binders for trial',
        'Exchange with opposing counsel pre-trial',
        'Have authentication witnesses ready'
      ]
    });
  }

  /**
   * Generate timeline exhibit
   */
  async createTimelineExhibit(timelineAnalysis, options = {}) {
    console.log('📝 Document Drafter: Creating timeline exhibit...');

    const format = options.format || 'table'; // table, narrative, or visual

    if (format === 'narrative') {
      return this.createNarrativeTimeline(timelineAnalysis);
    } else if (format === 'visual') {
      return this.createVisualTimelineDocument(timelineAnalysis);
    } else {
      return this.createTableTimeline(timelineAnalysis);
    }
  }

  /**
   * Create table-format timeline
   */
  async createTableTimeline(timelineAnalysis) {
    const prompt = `Create a professional timeline exhibit in table format.

TIMELINE DATA:
${JSON.stringify(timelineAnalysis, null, 2)}

Create a table with columns:
- Date
- Event
- Evidence
- Significance

Format for trial use. Make it clear, compelling, and easy to follow.
Highlight critical dates and patterns of landlord misconduct.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a trial attorney creating compelling timeline exhibits.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;

    return DocumentSchema.parse({
      documentType: 'timeline_exhibit',
      title: 'Timeline of Events',
      content,
      formatInstructions: 'Print in large format for trial use. Consider color-coding by event type.',
      nextSteps: [
        'Review timeline with client for accuracy',
        'Add exhibit labels to supporting evidence',
        'Prepare to walk jury through timeline',
        'Have enlarged poster version for trial'
      ]
    });
  }

  /**
   * Create narrative timeline
   */
  async createNarrativeTimeline(timelineAnalysis) {
    const content = `TIMELINE OF EVENTS\n\n${timelineAnalysis.narrativeSummary}\n\n` +
                   `DETAILED CHRONOLOGY:\n\n` +
                   timelineAnalysis.events.map((event, i) => 
                     `${i + 1}. ${event.date}: ${event.description}\n   ${event.legalRelevance}`
                   ).join('\n\n');

    return DocumentSchema.parse({
      documentType: 'timeline_exhibit',
      title: 'Chronological Narrative of Events',
      content,
      formatInstructions: 'Use for mediation, settlement negotiations, or opening statement preparation.'
    });
  }

  /**
   * Extract legal citations from document text
   */
  extractCitations(text) {
    const citations = [];
    
    // Pattern for statute citations (e.g., "O.C.G.A. § 44-7-13")
    const statutePattern = /\b([A-Z]\.){1,3}([A-Z]\.[A-Z]\.)?[A-Z]\.\s*§+\s*[\d-]+(\([a-z]\))?/g;
    const statuteMatches = text.match(statutePattern) || [];
    citations.push(...statuteMatches);
    
    // Pattern for case citations (e.g., "Smith v. Jones, 123 Ga. 456 (2020)")
    const casePattern = /\b[A-Z][a-z]+\s+v\.\s+[A-Z][a-z]+,\s+\d+\s+[A-Z][a-z\.]+\s+\d+/g;
    const caseMatches = text.match(casePattern) || [];
    citations.push(...caseMatches);
    
    return [...new Set(citations)]; // Deduplicate
  }

  /**
   * Generate all documents for a case
   */
  async generateAllDocuments(caseData, legalAnalysis, damagesAnalysis, timelineAnalysis, options = {}) {
    console.log('📝 Document Drafter: Generating complete document set...');

    const documents = {};

    // Always generate these
    documents.demandLetter = await this.draftDemandLetter(caseData, legalAnalysis, damagesAnalysis, options);
    documents.evidenceIndex = await this.createEvidenceIndex(caseData, caseData.evidence || [], options);
    
    if (timelineAnalysis) {
      documents.timeline = await this.createTimelineExhibit(timelineAnalysis, options);
    }

    // Optional documents
    if (options.includeComplaint) {
      documents.complaint = await this.draftComplaint(caseData, legalAnalysis, damagesAnalysis, options);
    }

    if (options.includeDiscovery) {
      documents.interrogatories = await this.draftInterrogatories(caseData, legalAnalysis, options);
      documents.requestsForProduction = await this.draftRequestsForProduction(caseData, legalAnalysis, options);
    }

    if (options.settlementTerms) {
      documents.settlementAgreement = await this.draftSettlementAgreement(
        caseData,
        options.settlementTerms,
        options
      );
    }

    console.log(`✅ Generated ${Object.keys(documents).length} documents`);

    return documents;
  }
}
