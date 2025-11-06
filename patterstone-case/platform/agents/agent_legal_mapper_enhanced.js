/**
 * ENHANCED LEGAL MAPPER AGENT
 * 
 * NOW WITH LEGAL INTELLIGENCE:
 * - Live legal research from 50 states
 * - Real case law citations
 * - Vector search for relevant statutes
 * - Predictive outcome modeling
 */

import OpenAI from 'openai';
import { z } from 'zod';
import LegalLibrary from '../legal-intelligence/legal-library.js';
import GameTheoryEngine from '../legal-intelligence/game-theory-engine.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const legalLibrary = new LegalLibrary();
const gameTheory = new GameTheoryEngine();

// Initialize legal library
await legalLibrary.initialize();

// Output schema (enhanced)
const LegalAnalysisSchema = z.object({
  jurisdiction: z.object({
    state: z.string(),
    county: z.string().optional(),
    city: z.string().optional(),
    court: z.string().optional(),
  }),
  
  violations: z.array(z.object({
    statute: z.string(),
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
    fullText: z.string(),
    violated: z.boolean(),
    facts: z.array(z.string()),
    strength: z.number(),
    elements: z.object({
      required: z.array(z.string()),
      satisfied: z.array(z.string()),
      missing: z.array(z.string()),
    }),
    remedy: z.string(),
    relevanceScore: z.number().optional(), // From vector search
  })),

  legalTheories: z.array(z.object({
    theory: z.string(),
    description: z.string(),
    strength: z.number(),
    requirements: z.array(z.string()),
    supportingFacts: z.array(z.string()),
    damages: z.array(z.string()),
  })),

  caseStrength: z.number(),
  
  // NEW: Legal research results
  legalResearch: z.object({
    statutes: z.array(z.object({
      code: z.string(),
      title: z.string(),
      relevance: z.number(),
      fullText: z.string().optional(),
    })),
    caseLaw: z.array(z.object({
      citation: z.string(),
      year: z.number(),
      holding: z.string(),
      outcome: z.string(),
      relevance: z.number(),
      citeCount: z.number(),
    })),
    researchMemo: z.string(),
    confidence: z.number(),
  }).optional(),

  // NEW: Predictive analysis
  predictions: z.object({
    winProbability: z.number(),
    settlementRange: z.object({
      low: z.number(),
      mid: z.number(),
      high: z.number(),
    }),
    estimatedDuration: z.string(),
    recommendedStrategy: z.string(),
  }).optional(),

  attorneyFeesAvailable: z.boolean(),
  notes: z.string().optional(),
});

// ============================================================================
// ENHANCED LEGAL MAPPER CLASS
// ============================================================================

export class EnhancedLegalMapperAgent {
  constructor() {
    this.openai = openai;
    this.legalLibrary = legalLibrary;
    this.gameTheory = gameTheory;
  }

  /**
   * MAIN ANALYSIS METHOD (Enhanced)
   */
  async analyze(caseData, options = {}) {
    const {
      deepResearch = true,
      includeCaseLaw = true,
      runPredictions = true,
    } = options;

    console.log('\n🧠 ENHANCED Legal Mapping Analysis\n');

    // STEP 1: Base legal analysis (existing logic)
    console.log('📋 Step 1: Base legal analysis...');
    const baseAnalysis = await this.performBaseLegalAnalysis(caseData);

    // STEP 2: Deep legal research (NEW)
    if (deepResearch) {
      console.log('🔍 Step 2: Deep legal research...');
      baseAnalysis.legalResearch = await this.performDeepResearch(
        caseData,
        baseAnalysis,
        { includeCaseLaw }
      );
    }

    // STEP 3: Predictive modeling (NEW)
    if (runPredictions) {
      console.log('🎲 Step 3: Predictive modeling...');
      baseAnalysis.predictions = await this.generatePredictions(
        caseData,
        baseAnalysis
      );
    }

    // Validate final output
    const validated = LegalAnalysisSchema.parse(baseAnalysis);

    console.log('✅ Enhanced legal analysis complete\n');
    return validated;
  }

  /**
   * Base legal analysis (original logic preserved)
   */
  async performBaseLegalAnalysis(caseData) {
    const jurisdiction = {
      state: caseData.property.state,
      county: caseData.property.county || undefined,
      city: caseData.property.city || undefined,
    };

    // Build comprehensive prompt
    const prompt = this.buildLegalAnalysisPrompt(caseData, jurisdiction);

    // Call GPT-4 for analysis
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: this.getLegalMapperSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 4000,
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    return {
      jurisdiction,
      violations: analysis.violations || [],
      legalTheories: analysis.legalTheories || [],
      caseStrength: analysis.caseStrength || 5,
      attorneyFeesAvailable: analysis.attorneyFeesAvailable || false,
      notes: analysis.notes,
    };
  }

  /**
   * DEEP LEGAL RESEARCH (NEW)
   */
  async performDeepResearch(caseData, baseAnalysis, options) {
    const { includeCaseLaw = true } = options;

    // Build research query from case facts
    const query = this.buildResearchQuery(caseData, baseAnalysis);

    console.log(`  → Searching legal database for: "${query}"`);

    // Search for relevant statutes
    const statutes = await this.legalLibrary.searchStatutes(
      query,
      caseData.property.state,
      { topK: 15, includeFullText: true }
    );

    console.log(`  ✓ Found ${statutes.length} relevant statutes`);

    // Search for supporting case law
    let cases = [];
    if (includeCaseLaw) {
      cases = await this.legalLibrary.searchCaseLaw(
        query,
        caseData.property.state,
        {
          topK: 20,
          minYear: 2000,
          minCitations: 5,
        }
      );

      console.log(`  ✓ Found ${cases.length} supporting cases`);
    }

    // Generate research memo with AI
    const memo = await this.generateResearchMemo({
      query,
      caseData,
      baseAnalysis,
      statutes,
      cases,
    });

    return {
      statutes: statutes.slice(0, 10).map((s) => ({
        code: s.code,
        title: s.title,
        relevance: s.relevanceScore,
        fullText: s.fullText?.substring(0, 1000),
      })),
      caseLaw: cases.slice(0, 10).map((c) => ({
        citation: c.citation,
        year: c.year,
        holding: c.holdingText?.substring(0, 500),
        outcome: c.outcome,
        relevance: c.relevanceScore,
        citeCount: c.citeCount,
      })),
      researchMemo: memo,
      confidence: this.calculateResearchConfidence(statutes, cases),
    };
  }

  /**
   * Build research query from case facts
   */
  buildResearchQuery(caseData, baseAnalysis) {
    const issues = caseData.issues?.map((i) => i.type).join(' ') || '';
    const theories = baseAnalysis.legalTheories?.map((t) => t.theory).join(' ') || '';

    return `tenant landlord ${issues} ${theories} habitability repair duty`.trim();
  }

  /**
   * Generate research memo using AI
   */
  async generateResearchMemo({ query, caseData, baseAnalysis, statutes, cases }) {
    const prompt = `You are a senior legal researcher. Generate a comprehensive research memo.

QUERY: ${query}

CASE FACTS:
- Property: ${caseData.property.address}
- Issues: ${caseData.issues?.map((i) => i.type).join(', ')}
- Duration: ${caseData.timeline?.length || 0} events

RELEVANT STATUTES FOUND:
${statutes.slice(0, 5).map((s) => `- ${s.code}: ${s.title}\n  Relevance: ${(s.relevanceScore * 100).toFixed(1)}%`).join('\n')}

SUPPORTING CASE LAW:
${cases.slice(0, 5).map((c) => `- ${c.citation} (${c.year}) - ${c.outcome}\n  Cited ${c.citeCount} times\n  Holding: ${c.holdingText?.substring(0, 200)}...`).join('\n\n')}

Generate a memo with:
1. **Issue Statement** - What legal questions are presented?
2. **Brief Answer** - Do we have a strong case?
3. **Applicable Law** - Key statutes and their requirements
4. **Analysis** - How do the facts satisfy the law?
5. **Supporting Case Law** - Precedents that support our position
6. **Conclusion** - Overall assessment and recommendations

Be thorough but concise. Cite specific statutes and cases.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      return 'Research memo generation failed. Manual review required.';
    }
  }

  /**
   * Calculate research confidence score
   */
  calculateResearchConfidence(statutes, cases) {
    let confidence = 0;

    // More relevant statutes = higher confidence
    if (statutes.length >= 5) confidence += 0.3;
    else confidence += statutes.length * 0.06;

    // High-quality case law = higher confidence
    const highQualityCases = cases.filter((c) => c.citeCount >= 10);
    if (highQualityCases.length >= 3) confidence += 0.4;
    else confidence += highQualityCases.length * 0.13;

    // Recent cases = more confidence
    const recentCases = cases.filter((c) => c.year >= 2020);
    if (recentCases.length >= 2) confidence += 0.3;
    else confidence += recentCases.length * 0.15;

    return Math.min(confidence, 1.0);
  }

  /**
   * PREDICTIVE MODELING (NEW)
   */
  async generatePredictions(caseData, baseAnalysis) {
    console.log('  → Running game theory analysis...');

    // Run full game theory analysis
    const gameTheoryAnalysis = await this.gameTheory.analyzeCase(
      caseData,
      baseAnalysis,
      null // No opponent profile yet
    );

    const stats = gameTheoryAnalysis.simulations.statistics;

    return {
      winProbability: parseFloat((stats.winRate * 100).toFixed(1)),
      settlementRange: {
        low: Math.round(stats.percentile25),
        mid: Math.round(stats.median),
        high: Math.round(stats.percentile75),
      },
      estimatedDuration: `${Math.round(stats.avgTime)} days`,
      recommendedStrategy: gameTheoryAnalysis.optimalStrategy.primaryApproach,
    };
  }

  /**
   * Build legal analysis prompt
   */
  buildLegalAnalysisPrompt(caseData, jurisdiction) {
    return `Analyze this landlord-tenant case under ${jurisdiction.state} law.

TENANT: ${caseData.tenant?.name || 'Unknown'}
LANDLORD: ${caseData.landlord?.name || 'Unknown'}
PROPERTY: ${caseData.property?.address || 'Unknown'}

LEASE:
- Monthly Rent: $${caseData.lease?.monthlyRent || 0}
- Start Date: ${caseData.lease?.startDate || 'Unknown'}
- Type: ${caseData.lease?.type || 'Unknown'}

ISSUES:
${caseData.issues?.map((issue, i) => `${i + 1}. ${issue.type}
   - Severity: ${issue.severity}
   - Reported: ${issue.dateReported || 'Unknown'}
   - Description: ${issue.description}
   - Landlord Notified: ${issue.landlordNotified ? 'Yes' : 'No'}`).join('\n\n') || 'No issues documented'}

TIMELINE:
${caseData.timeline?.slice(0, 10).map((event, i) => `${i + 1}. ${event.date}: ${event.description}`).join('\n') || 'No timeline available'}

HEALTH IMPACTS:
${caseData.healthImpacts?.map((h) => `- ${h.type}: ${h.description}`).join('\n') || 'None reported'}

TASK: Identify ALL violated statutes, legal theories, and assess case strength.
Return JSON with violations, legalTheories, caseStrength (1-10), and attorneyFeesAvailable.`;
  }

  /**
   * System prompt for legal mapper
   */
  getLegalMapperSystemPrompt() {
    return `You are an expert tenant rights attorney with 20+ years of experience.

Your job: Analyze fact patterns and identify:
1. Which statutes were violated
2. Which legal theories apply
3. What must be proven
4. Case strength (1-10 scale)
5. Whether attorney fees are available

Be thorough but realistic. Consider:
- Statute of limitations
- Notice requirements
- Landlord's potential defenses
- Evidence quality
- Damages availability

Focus on tenant protection laws:
- Implied warranty of habitability
- Duty to repair
- Constructive eviction
- Retaliation
- Security deposit violations
- Bad faith claims

Return detailed JSON analysis.`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EnhancedLegalMapperAgent;

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new EnhancedLegalMapperAgent();

  const testCase = {
    tenant: { name: 'Test Tenant' },
    landlord: { name: 'Test Landlord' },
    property: {
      address: '123 Test St',
      city: 'Atlanta',
      state: 'GA',
      county: 'Fulton',
    },
    lease: {
      monthlyRent: 3000,
      startDate: '2024-05-01',
      type: 'fixed-term',
    },
    issues: [
      {
        type: 'water_leak',
        severity: 'severe',
        dateReported: '2024-05-15',
        description: 'Major leak from upstairs bathroom',
        landlordNotified: true,
      },
      {
        type: 'mold',
        severity: 'moderate',
        dateReported: '2024-06-01',
        description: 'Mold growth in multiple rooms',
        landlordNotified: true,
      },
    ],
    timeline: [
      { date: '2024-05-15', description: 'Leak discovered' },
      { date: '2024-05-16', description: 'Landlord notified via text' },
      { date: '2024-07-15', description: 'Bathroom torn out, no repairs made' },
    ],
    healthImpacts: [
      {
        type: 'respiratory',
        description: 'Children developed respiratory issues from mold',
      },
    ],
  };

  const analysis = await agent.analyze(testCase, {
    deepResearch: true,
    includeCaseLaw: true,
    runPredictions: true,
  });

  console.log('\n📊 ENHANCED LEGAL ANALYSIS:');
  console.log(JSON.stringify(analysis, null, 2));
}
