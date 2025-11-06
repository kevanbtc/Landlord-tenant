/**
 * INTAKE SPECIALIST AGENT
 * 
 * Job: Convert messy tenant stories into clean, structured case data
 * 
 * Input: Raw text, voice transcripts, scattered facts
 * Output: Structured Case object with all key data points
 */

const OpenAI = require('openai');
const { z } = require('zod');

// Output schema for structured case data
const CaseDataSchema = z.object({
  // Parties
  tenant: z.object({
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
    hasChildren: z.boolean(),
    childrenAges: z.array(z.number()).optional(),
    hasDisabilities: z.boolean().optional(),
  }),
  
  landlord: z.object({
    name: z.string(),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  }),
  
  propertyManager: z.object({
    name: z.string().optional(),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  
  // Property
  property: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    county: z.string().optional(),
    propertyType: z.enum(['single_family', 'duplex', 'apartment', 'condo', 'townhouse']),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
  }),
  
  // Lease Info
  lease: z.object({
    moveInDate: z.string(), // ISO date
    leaseType: z.enum(['fixed_term', 'month_to_month']),
    monthlyRent: z.number(),
    securityDeposit: z.number().optional(),
    leaseEndDate: z.string().optional(), // ISO date
  }),
  
  // Problems
  issues: z.array(z.object({
    category: z.enum([
      'water_leak',
      'mold',
      'no_heat',
      'no_ac',
      'no_hot_water',
      'plumbing_failure',
      'electrical_hazard',
      'structural_damage',
      'pest_infestation',
      'broken_appliances',
      'no_water',
      'sewage_backup',
      'roof_leak',
      'windows_broken',
      'doors_broken',
      'fire_hazard',
      'carbon_monoxide',
      'lead_paint',
      'asbestos',
      'harassment',
      'illegal_entry',
      'retaliation',
      'other'
    ]),
    description: z.string(),
    severity: z.enum(['minor', 'major', 'severe', 'uninhabitable']),
    firstOccurred: z.string().optional(), // ISO date
    isOngoing: z.boolean(),
  })),
  
  // Timeline Markers
  timeline: z.object({
    firstIssueDate: z.string(), // ISO date
    firstNotificationToLandlord: z.string().optional(), // ISO date
    landlordResponseDate: z.string().optional(), // ISO date
    repairAttemptDates: z.array(z.string()).optional(), // ISO dates
    durationDays: z.number().optional(),
  }),
  
  // Health & Safety Impact
  healthImpact: z.object({
    hasHealthIssues: z.boolean(),
    conditions: z.array(z.enum([
      'respiratory_problems',
      'allergies',
      'asthma',
      'skin_rash',
      'headaches',
      'nausea',
      'anxiety',
      'stress',
      'sleep_disruption',
      'hospitalization',
      'emergency_room_visit',
      'other'
    ])).optional(),
    affectedPeople: z.array(z.enum(['tenant', 'children', 'spouse', 'other_occupant'])).optional(),
    medicalDocumentation: z.boolean().optional(),
  }),
  
  // What Tenant Wants
  desiredOutcome: z.object({
    repairCompleted: z.boolean(),
    rentRefund: z.boolean(),
    breakLease: z.boolean(),
    monetaryDamages: z.boolean(),
    exposeLandlord: z.boolean(),
    securityDepositReturn: z.boolean(),
  }),
  
  // Metadata
  metadata: z.object({
    confidenceScore: z.number(), // 0-1
    missingInformation: z.array(z.string()),
    clarificationNeeded: z.array(z.string()),
  }),
});

class IntakeAgent {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.model = 'gpt-4-turbo-preview';
  }

  /**
   * Main analysis function
   * @param {string} rawStory - The tenant's unstructured story
   * @param {object} options - Additional options (prefilledData, etc.)
   * @returns {Promise<object>} Structured case data
   */
  async analyze(rawStory, options = {}) {
    try {
      const prompt = this.buildPrompt(rawStory, options);
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower temp for more consistent extraction
      });

      const content = response.choices[0].message.content;
      const structured = JSON.parse(content);
      
      // Validate against schema
      const validated = CaseDataSchema.parse(structured);
      
      // Add processing metadata
      validated.metadata.processingDate = new Date().toISOString();
      validated.metadata.agent = 'IntakeAgent';
      validated.metadata.version = '1.0';
      
      return {
        success: true,
        data: validated,
        rawResponse: content,
      };
      
    } catch (error) {
      console.error('IntakeAgent error:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  getSystemPrompt() {
    return `You are an expert legal intake specialist for a tenant rights platform.

Your job is to extract structured information from messy tenant stories about housing problems.

Key responsibilities:
1. Identify all parties (tenant, landlord, property manager)
2. Extract property details and lease information
3. Categorize problems/issues accurately
4. Build a basic timeline of events
5. Assess health and safety impacts
6. Identify what the tenant wants

Be thorough but conservative:
- Only include information explicitly stated or clearly implied
- Mark confidence level for extracted data
- Flag missing critical information
- Request clarification for ambiguous points

Output must be valid JSON matching the required schema.`;
  }

  buildPrompt(rawStory, options = {}) {
    let prompt = `Extract structured case information from this tenant's story:\n\n`;
    prompt += `TENANT'S STORY:\n${rawStory}\n\n`;
    
    if (options.prefilledData) {
      prompt += `PREFILLED DATA (from intake form):\n`;
      prompt += JSON.stringify(options.prefilledData, null, 2);
      prompt += `\n\n`;
    }
    
    prompt += `INSTRUCTIONS:\n`;
    prompt += `1. Parse all relevant information\n`;
    prompt += `2. Categorize issues correctly (water_leak, mold, etc.)\n`;
    prompt += `3. Extract dates in ISO format (YYYY-MM-DD)\n`;
    prompt += `4. Assess severity of each issue (minor/major/severe/uninhabitable)\n`;
    prompt += `5. Flag any missing critical information\n`;
    prompt += `6. Provide confidence score (0-1) for overall extraction quality\n\n`;
    
    prompt += `Return structured JSON matching the case data schema.`;
    
    return prompt;
  }

  /**
   * Interactive clarification - ask follow-up questions
   */
  async clarify(caseData, additionalInfo) {
    const missingInfo = caseData.metadata?.missingInformation || [];
    const clarifications = caseData.metadata?.clarificationNeeded || [];
    
    if (missingInfo.length === 0 && clarifications.length === 0) {
      return { needsClarification: false };
    }
    
    // Generate follow-up questions
    const questions = [];
    
    for (const field of missingInfo) {
      questions.push(this.generateQuestionFor(field));
    }
    
    for (const clarification of clarifications) {
      questions.push(clarification);
    }
    
    return {
      needsClarification: true,
      questions,
      completionPercentage: this.calculateCompleteness(caseData),
    };
  }

  generateQuestionFor(field) {
    const questionMap = {
      'property.address': 'What is the full street address of the property?',
      'lease.moveInDate': 'When did you move into the property?',
      'lease.monthlyRent': 'How much is your monthly rent?',
      'timeline.firstIssueDate': 'When did the problem first start?',
      'timeline.firstNotificationToLandlord': 'When did you first notify the landlord about this problem?',
      'landlord.name': 'What is your landlord\'s name?',
      'tenant.hasChildren': 'Do you have children living in the home?',
    };
    
    return questionMap[field] || `Please provide: ${field}`;
  }

  calculateCompleteness(caseData) {
    const criticalFields = [
      'property.address',
      'lease.moveInDate',
      'lease.monthlyRent',
      'landlord.name',
      'timeline.firstIssueDate',
      'issues.length > 0',
    ];
    
    let complete = 0;
    let total = criticalFields.length;
    
    for (const field of criticalFields) {
      if (this.fieldExists(caseData, field)) {
        complete++;
      }
    }
    
    return Math.round((complete / total) * 100);
  }

  fieldExists(obj, path) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (key.includes('>')) {
        // Special check like "issues.length > 0"
        const [field, operator, value] = key.split(/\s+/);
        return eval(`current.${field} ${operator} ${value}`);
      }
      
      if (current[key] === undefined || current[key] === null) {
        return false;
      }
      current = current[key];
    }
    
    return true;
  }
}

module.exports = { IntakeAgent, CaseDataSchema };

// Example usage:
/*
const agent = new IntakeAgent(process.env.OPENAI_API_KEY);

const rawStory = `
My name is Maria and I live at 3530 Patterstone Drive in Atlanta, Georgia.
We moved in June 2024 and started paying $3,000/month rent to Ari Niazi.

In July, we noticed a leak in the ceiling. I called the landlord multiple times.
He sent a handyman once who said it was "too big for him" and he needed a plumber.
But no plumber ever came.

By August, there was black mold growing on the walls. My two kids (ages 5 and 7) 
started coughing all the time. The bathroom ceiling actually fell in. We couldn't 
use that bathroom anymore.

I sent certified letters, texts, everything. The landlord kept saying "I'll take 
care of it" but never did. We've been living like this for 5 months now. 
My kids are suffering.

I want my rent refunded, I want to break the lease, and I want this landlord exposed.
`;

const result = await agent.analyze(rawStory);
console.log(JSON.stringify(result.data, null, 2));

// Check if clarification needed
const clarification = await agent.clarify(result.data);
if (clarification.needsClarification) {
  console.log('Questions for tenant:');
  clarification.questions.forEach(q => console.log(`- ${q}`));
}
*/
