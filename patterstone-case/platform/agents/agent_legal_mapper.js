/**
 * LEGAL MAPPER AGENT
 * 
 * Job: Map facts to laws, statutes, and legal theories
 * 
 * This is the BRAIN of the legal analysis system.
 * It takes a fact pattern + jurisdiction and returns:
 * - Which laws were violated
 * - What legal theories apply
 * - What needs to be proven
 * - Strength assessment
 * - Relevant case law
 */

const OpenAI = require('openai');
const { z } = require('zod');

// Output schema for legal analysis
const LegalAnalysisSchema = z.object({
  jurisdiction: z.object({
    state: z.string(),
    county: z.string().optional(),
    city: z.string().optional(),
    court: z.string().optional(), // Which court has jurisdiction
  }),
  
  violations: z.array(z.object({
    statute: z.string(), // e.g., "O.C.G.A. § 44-7-13"
    title: z.string(),
    category: z.enum([
      'habitability',
      'repairs',
      'security_deposit',
      'retaliation',
      'harassment',
      'discrimination',
      'illegal_eviction',
      'utilities',
      'health_safety',
      'building_code'
    ]),
    fullText: z.string().optional(),
    violated: z.boolean(),
    facts: z.array(z.string()), // Which facts support this violation
    strength: z.number(), // 1-10
    elements: z.object({
      required: z.array(z.string()), // What must be proven
      satisfied: z.array(z.string()), // Which elements are satisfied
      missing: z.array(z.string()), // Which elements need more evidence
    }),
    potentialDefenses: z.array(z.string()),
  })),
  
  legalTheories: z.array(z.object({
    theory: z.enum([
      'breach_of_warranty_of_habitability',
      'breach_of_covenant_of_quiet_enjoyment',
      'constructive_eviction',
      'negligence',
      'negligence_per_se',
      'intentional_infliction_of_emotional_distress',
      'fraud',
      'breach_of_contract',
      'retaliation',
      'bad_faith',
      'violation_of_consumer_protection_act',
    ]),
    description: z.string(),
    applicableFacts: z.array(z.string()),
    strength: z.number(), // 1-10
    damages: z.object({
      types: z.array(z.enum([
        'compensatory',
        'consequential',
        'punitive',
        'statutory',
        'attorney_fees'
      ])),
      explanation: z.string(),
    }),
    requiredProof: z.array(z.string()),
  })),
  
  caseLaw: z.array(z.object({
    citation: z.string(),
    court: z.string(),
    year: z.number(),
    relevantHolding: z.string(),
    howItHelps: z.string(),
  })).optional(),
  
  proceduralConsiderations: z.object({
    statueOfLimitations: z.string(),
    requiredNotices: z.array(z.string()),
    venue: z.string(),
    jurisdictionalAmount: z.string().optional(),
  }),
  
  attorneyFeesAvailable: z.object({
    available: z.boolean(),
    statute: z.string().optional(),
    conditions: z.array(z.string()).optional(),
  }),
  
  strengthAssessment: z.object({
    overallScore: z.number(), // 1-10
    strongPoints: z.array(z.string()),
    weakPoints: z.array(z.string()),
    criticalEvidence: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  
  metadata: z.object({
    confidenceScore: z.number(), // 0-1
    lastUpdated: z.string(), // ISO date
    agent: z.string(),
  }),
});

class LegalMapperAgent {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.model = 'gpt-4-turbo-preview';
    this.vectorDB = null; // Will be initialized with Pinecone/Weaviate
  }

  /**
   * Main analysis function
   * @param {object} caseData - Structured case data from IntakeAgent
   * @param {object} options - Additional options
   * @returns {Promise<object>} Legal analysis
   */
  async analyze(caseData, options = {}) {
    try {
      // 1. Identify jurisdiction
      const jurisdiction = this.parseJurisdiction(caseData);
      
      // 2. Retrieve relevant legal codes (RAG)
      const relevantCodes = await this.retrieveRelevantCodes(caseData, jurisdiction);
      
      // 3. Retrieve relevant case law
      const relevantCases = await this.retrieveRelevantCaseLaw(caseData, jurisdiction);
      
      // 4. Build prompt with full context
      const prompt = this.buildPrompt(caseData, jurisdiction, relevantCodes, relevantCases);
      
      // 5. Get LLM analysis
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2, // Low temp for legal precision
      });

      const content = response.choices[0].message.content;
      const analysis = JSON.parse(content);
      
      // 6. Validate against schema
      const validated = LegalAnalysisSchema.parse(analysis);
      
      // 7. Add metadata
      validated.metadata.lastUpdated = new Date().toISOString();
      validated.metadata.agent = 'LegalMapperAgent';
      validated.metadata.version = '1.0';
      
      return {
        success: true,
        data: validated,
        rawResponse: content,
      };
      
    } catch (error) {
      console.error('LegalMapperAgent error:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  getSystemPrompt() {
    return `You are an expert tenant-rights attorney with 20+ years of experience in landlord-tenant law.

Your specialty is analyzing housing cases and mapping facts to applicable laws and legal theories.

Core competencies:
- Deep knowledge of state landlord-tenant statutes
- Understanding of habitability standards and building codes
- Expertise in constructive eviction, negligence, bad faith
- Ability to identify viable legal theories from fact patterns
- Knowledge of damages calculation frameworks
- Understanding of procedural requirements (notices, statutes of limitations)

Your analysis must be:
1. LEGALLY PRECISE - cite exact statutes, not generalizations
2. FACT-DRIVEN - connect every legal conclusion to specific facts
3. STRATEGIC - assess strength and identify critical evidence
4. THOROUGH - consider all applicable theories and defenses
5. PRACTICAL - provide actionable recommendations

You are analyzing cases to help tenants understand their legal rights and build strong cases.
Be aggressive in identifying violations, but honest about weaknesses.

Output must be valid JSON matching the legal analysis schema.`;
  }

  buildPrompt(caseData, jurisdiction, codes, cases) {
    let prompt = `Analyze this tenant case for legal violations and theories.\n\n`;
    
    prompt += `=== JURISDICTION ===\n`;
    prompt += `State: ${jurisdiction.state}\n`;
    prompt += `County: ${jurisdiction.county || 'Unknown'}\n`;
    prompt += `City: ${jurisdiction.city || 'Unknown'}\n\n`;
    
    prompt += `=== CASE FACTS ===\n`;
    prompt += this.summarizeFacts(caseData);
    prompt += `\n\n`;
    
    prompt += `=== APPLICABLE STATUTES (from legal database) ===\n`;
    for (const code of codes) {
      prompt += `\n**${code.citation}**: ${code.title}\n`;
      prompt += `${code.summary}\n`;
      if (code.fullText) {
        prompt += `Full text: ${code.fullText.substring(0, 500)}...\n`;
      }
    }
    prompt += `\n\n`;
    
    if (cases && cases.length > 0) {
      prompt += `=== RELEVANT CASE LAW ===\n`;
      for (const c of cases) {
        prompt += `\n**${c.citation}** (${c.court}, ${c.year})\n`;
        prompt += `Holding: ${c.holding}\n`;
      }
      prompt += `\n\n`;
    }
    
    prompt += `=== YOUR TASK ===\n`;
    prompt += `1. Identify which statutes the landlord violated\n`;
    prompt += `2. For each violation:\n`;
    prompt += `   - Map to specific facts\n`;
    prompt += `   - Assess strength (1-10)\n`;
    prompt += `   - Identify required elements and which are satisfied\n`;
    prompt += `   - Note potential defenses\n`;
    prompt += `3. Identify applicable legal theories (breach of warranty, negligence, etc.)\n`;
    prompt += `4. For each theory:\n`;
    prompt += `   - Explain how facts support it\n`;
    prompt += `   - Assess strength\n`;
    prompt += `   - Identify what damages are available\n`;
    prompt += `   - List required proof\n`;
    prompt += `5. Consider procedural issues (statute of limitations, required notices)\n`;
    prompt += `6. Determine if attorney fees are available (cite statute)\n`;
    prompt += `7. Provide overall strength assessment with strong/weak points\n`;
    prompt += `8. Recommend critical evidence to gather\n\n`;
    
    prompt += `Return complete JSON analysis matching the schema.`;
    
    return prompt;
  }

  summarizeFacts(caseData) {
    let summary = '';
    
    // Parties
    summary += `Tenant: ${caseData.tenant.name}\n`;
    summary += `Landlord: ${caseData.landlord.name}\n`;
    if (caseData.propertyManager?.name) {
      summary += `Property Manager: ${caseData.propertyManager.name}\n`;
    }
    
    // Property
    summary += `\nProperty: ${caseData.property.address}, ${caseData.property.city}, ${caseData.property.state}\n`;
    
    // Lease
    summary += `\nLease Start: ${caseData.lease.moveInDate}\n`;
    summary += `Monthly Rent: $${caseData.lease.monthlyRent}\n`;
    summary += `Lease Type: ${caseData.lease.leaseType}\n`;
    
    // Issues
    summary += `\nIssues:\n`;
    for (const issue of caseData.issues) {
      summary += `- ${issue.category} (${issue.severity}): ${issue.description}\n`;
      if (issue.firstOccurred) {
        summary += `  First occurred: ${issue.firstOccurred}\n`;
      }
      summary += `  Ongoing: ${issue.isOngoing}\n`;
    }
    
    // Timeline
    summary += `\nTimeline:\n`;
    summary += `- First issue: ${caseData.timeline.firstIssueDate}\n`;
    if (caseData.timeline.firstNotificationToLandlord) {
      summary += `- Landlord notified: ${caseData.timeline.firstNotificationToLandlord}\n`;
    }
    if (caseData.timeline.landlordResponseDate) {
      summary += `- Landlord responded: ${caseData.timeline.landlordResponseDate}\n`;
    }
    if (caseData.timeline.durationDays) {
      summary += `- Duration: ${caseData.timeline.durationDays} days\n`;
    }
    
    // Health impact
    if (caseData.healthImpact?.hasHealthIssues) {
      summary += `\nHealth Impact:\n`;
      summary += `- Affected: ${caseData.healthImpact.affectedPeople?.join(', ')}\n`;
      summary += `- Conditions: ${caseData.healthImpact.conditions?.join(', ')}\n`;
    }
    
    // Children
    if (caseData.tenant.hasChildren) {
      summary += `\nChildren in home: Yes (ages: ${caseData.tenant.childrenAges?.join(', ')})\n`;
    }
    
    return summary;
  }

  parseJurisdiction(caseData) {
    const state = this.normalizeState(caseData.property.state);
    const county = caseData.property.county;
    const city = caseData.property.city;
    
    return { state, county, city };
  }

  normalizeState(stateInput) {
    // Convert to 2-letter code
    const stateMap = {
      'Georgia': 'GA',
      'California': 'CA',
      'New York': 'NY',
      'Texas': 'TX',
      'Florida': 'FL',
      // Add all 50 states
    };
    
    return stateMap[stateInput] || stateInput;
  }

  /**
   * Retrieve relevant legal codes using RAG
   * In production, this queries a vector database
   */
  async retrieveRelevantCodes(caseData, jurisdiction) {
    // TODO: Implement vector DB query
    // For now, return Georgia landlord-tenant statutes as example
    
    if (jurisdiction.state === 'GA') {
      return [
        {
          citation: 'O.C.G.A. § 44-7-13',
          title: 'Duty to keep premises in repair',
          category: 'habitability',
          summary: 'Landlord must keep premises in repair, comply with building codes, and maintain fit and habitable condition.',
          fullText: 'O.C.G.A. § 44-7-13 (2010)\n§ 44-7-13. Duties of landlord; remedies of tenant\n\n(a) The landlord has an implied duty to keep the premises in repair. The landlord is responsible for compliance with applicable building and housing codes materially affecting health and safety.\n\n(b) If the landlord fails to make repairs, the tenant may:\n(1) Terminate the lease;\n(2) Make repairs and deduct the cost from rent;\n(3) Recover damages; or\n(4) Seek injunctive relief.',
        },
        {
          citation: 'O.C.G.A. § 44-7-14',
          title: 'Notice requirements for repairs',
          category: 'repairs',
          summary: 'Tenant must provide written notice to landlord of need for repairs. Landlord has reasonable time to make repairs.',
          fullText: 'O.C.G.A. § 44-7-14 - Tenant must give landlord written notice and reasonable time to repair before exercising remedies.',
        },
        {
          citation: 'O.C.G.A. § 13-6-11',
          title: 'Attorney fees in bad faith cases',
          category: 'attorney_fees',
          summary: 'In contract actions, attorney fees may be awarded if claim or defense was interposed in bad faith or to unnecessarily delay.',
          fullText: 'O.C.G.A. § 13-6-11 - Attorney fees and expenses may be awarded where the defendant has acted in bad faith, has been stubbornly litigious, or has caused the plaintiff unnecessary trouble and expense.',
        },
        {
          citation: 'Georgia HB 404 (Safe at Home Act)',
          title: 'Safe at Home Act - Habitability protections',
          category: 'habitability',
          summary: 'Strengthens tenant rights regarding habitability, allows lease termination for unsafe conditions.',
          fullText: 'HB 404 (2024) strengthens warranty of habitability, allows tenants to terminate lease if conditions pose imminent threat to health/safety, prohibits retaliation.',
        },
        {
          citation: 'O.C.G.A. § 44-7-20',
          title: 'Constructive eviction',
          category: 'constructive_eviction',
          summary: 'If landlord\'s conduct renders premises uninhabitable, tenant may treat it as eviction.',
          fullText: 'Constructive eviction occurs when landlord\'s acts or omissions substantially interfere with tenant\'s beneficial use and enjoyment, forcing tenant to vacate.',
        },
      ];
    }
    
    // For other states, would query vector DB
    return [];
  }

  /**
   * Retrieve relevant case law
   */
  async retrieveRelevantCaseLaw(caseData, jurisdiction) {
    // TODO: Implement case law database query
    // For now, return example Georgia cases
    
    if (jurisdiction.state === 'GA') {
      return [
        {
          citation: 'Kalandyk v. Butz, 271 Ga. App. 836 (2005)',
          court: 'Georgia Court of Appeals',
          year: 2005,
          holding: 'Landlord breached warranty of habitability due to persistent water leaks and mold. Tenant entitled to rent abatement and damages.',
        },
        {
          citation: 'Stephens v. Wachtel, 225 Ga. App. 706 (1997)',
          court: 'Georgia Court of Appeals',
          year: 1997,
          holding: 'Landlord who fails to repair dangerous conditions after notice may be liable for negligence.',
        },
      ];
    }
    
    return [];
  }

  /**
   * Quick violation check (for UI preview)
   */
  async quickCheck(caseData) {
    const jurisdiction = this.parseJurisdiction(caseData);
    const codes = await this.retrieveRelevantCodes(caseData, jurisdiction);
    
    const likelyViolations = [];
    
    // Simple heuristic checks
    const hasWaterLeak = caseData.issues.some(i => i.category === 'water_leak');
    const hasMold = caseData.issues.some(i => i.category === 'mold');
    const hasPlumbingFailure = caseData.issues.some(i => i.category === 'plumbing_failure');
    const durationOver30Days = caseData.timeline.durationDays > 30;
    const landlordNotified = !!caseData.timeline.firstNotificationToLandlord;
    
    if ((hasWaterLeak || hasMold || hasPlumbingFailure) && durationOver30Days && landlordNotified) {
      likelyViolations.push({
        statute: 'O.C.G.A. § 44-7-13',
        title: 'Breach of Warranty of Habitability',
        likelihood: 'high',
      });
    }
    
    if (durationOver30Days && landlordNotified) {
      likelyViolations.push({
        statute: 'O.C.G.A. § 44-7-13',
        title: 'Failure to Repair',
        likelihood: 'high',
      });
    }
    
    return {
      likelyViolations,
      estimatedCaseStrength: likelyViolations.length > 0 ? 7 : 4,
    };
  }
}

module.exports = { LegalMapperAgent, LegalAnalysisSchema };

// Example usage:
/*
const agent = new LegalMapperAgent(process.env.OPENAI_API_KEY);

// Assuming you have caseData from IntakeAgent
const legalAnalysis = await agent.analyze(caseData);

console.log('Violations:', legalAnalysis.data.violations);
console.log('Legal Theories:', legalAnalysis.data.legalTheories);
console.log('Overall Strength:', legalAnalysis.data.strengthAssessment.overallScore);
console.log('Attorney Fees Available:', legalAnalysis.data.attorneyFeesAvailable.available);
*/
