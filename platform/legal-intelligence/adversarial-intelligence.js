/**
 * ADVERSARIAL INTELLIGENCE SYSTEM
 * 
 * Profile opposing lawyers, judges, and law firms
 * Predict their strategies and find weaknesses
 * Generate counter-strategies using AI and game theory
 */

import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

// ============================================================================
// ADVERSARIAL INTELLIGENCE CLASS
// ============================================================================

export class AdversarialIntelligence {
  constructor() {
    this.llm = openai;
  }

  // ==========================================================================
  // LAWYER PROFILING
  // ==========================================================================

  /**
   * Complete profile of opposing counsel
   */
  async profileLawyer(name, firm, options = {}) {
    console.log(`\n🕵️ Profiling Lawyer: ${name} at ${firm}`);

    // Check if profile exists in database
    let profile = await prisma.lawyerProfile.findFirst({
      where: { name, firm }
    });

    // If not found, scrape and create
    if (!profile) {
      console.log('  → Profile not found, scraping...');
      profile = await this.scrapeLawyerProfile(name, firm);
      
      if (profile) {
        profile = await prisma.lawyerProfile.create({ data: profile });
        console.log('  ✓ Profile created');
      } else {
        console.log('  ✗ Could not find lawyer data');
        return null;
      }
    } else {
      console.log('  ✓ Profile found in database');
    }

    // Analyze case history
    console.log('  → Analyzing case history...');
    const caseAnalysis = await this.analyzeCaseHistory(profile);

    // Identify strategy patterns
    console.log('  → Identifying patterns...');
    const patterns = await this.identifyStrategyPatterns(profile);

    // Find weaknesses
    console.log('  → Finding weaknesses...');
    const weaknesses = await this.identifyWeaknesses(profile, patterns);

    // Generate counter-strategy
    console.log('  → Generating counter-strategy...');
    const counterStrategy = await this.generateCounterStrategy({
      profile,
      patterns,
      weaknesses
    });

    console.log('✅ Lawyer profile complete\n');

    return {
      profile,
      caseAnalysis,
      patterns,
      weaknesses,
      counterStrategy,
      confidence: this.calculateProfileConfidence(profile),
      lastUpdated: new Date()
    };
  }

  /**
   * Scrape lawyer profile from multiple sources
   */
  async scrapeLawyerProfile(name, firm) {
    const sources = [];

    // Try Avvo
    try {
      const avvoData = await this.scrapeAvvo(name);
      sources.push(avvoData);
    } catch (error) {
      console.log('  ⚠️ Avvo scraping failed');
    }

    // Try Martindale-Hubbell
    try {
      const martindaleData = await this.scrapeMartindale(name, firm);
      sources.push(martindaleData);
    } catch (error) {
      console.log('  ⚠️ Martindale scraping failed');
    }

    // Try State Bar
    try {
      const barData = await this.scrapeStateBar(name);
      sources.push(barData);
    } catch (error) {
      console.log('  ⚠️ State Bar scraping failed');
    }

    if (sources.length === 0) return null;

    // Merge data from all sources
    return this.mergeProfileData(sources, name, firm);
  }

  /**
   * Scrape Avvo.com
   */
  async scrapeAvvo(name) {
    const searchUrl = `https://www.avvo.com/search/lawyer_search?q=${encodeURIComponent(name)}`;
    
    try {
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Extract profile data (HTML structure may vary)
      const data = {
        source: 'avvo',
        rating: parseFloat($('.rating-number').first().text()) || null,
        reviewCount: parseInt($('.review-count').first().text()) || 0,
        yearsLicensed: parseInt($('.years-licensed').text()) || null,
        specialties: []
      };

      $('.practice-area').each((i, elem) => {
        data.specialties.push($(elem).text().trim());
      });

      return data;
    } catch (error) {
      throw new Error('Avvo scraping failed');
    }
  }

  /**
   * Scrape Martindale-Hubbell
   */
  async scrapeMartindale(name, firm) {
    // Martindale requires more complex scraping
    // Placeholder implementation
    return {
      source: 'martindale',
      rating: null,
      peerRating: null
    };
  }

  /**
   * Scrape State Bar records
   */
  async scrapeStateBar(name) {
    // Each state has different bar website
    // Would need state-specific implementations
    // Placeholder for now
    return {
      source: 'state-bar',
      barNumber: null,
      admittedYear: null,
      discipline: []
    };
  }

  /**
   * Merge profile data from multiple sources
   */
  mergeProfileData(sources, name, firm) {
    const merged = {
      name,
      firm,
      barNumber: null,
      jurisdiction: [],
      rating: null,
      yearsLicensed: null,
      specialties: [],
      discipline: [],
      caseHistory: {
        totalCases: 0,
        wins: 0,
        losses: 0,
        settlements: 0,
        avgSettlement: 0,
        avgTrialDuration: 0
      }
    };

    for (const source of sources) {
      if (source.rating) merged.rating = source.rating;
      if (source.yearsLicensed) merged.yearsLicensed = source.yearsLicensed;
      if (source.specialties) merged.specialties.push(...source.specialties);
      if (source.barNumber) merged.barNumber = source.barNumber;
      if (source.discipline) merged.discipline.push(...source.discipline);
    }

    // Deduplicate specialties
    merged.specialties = [...new Set(merged.specialties)];

    return merged;
  }

  // ==========================================================================
  // CASE HISTORY ANALYSIS
  // ==========================================================================

  /**
   * Analyze lawyer's case history
   */
  async analyzeCaseHistory(profile) {
    const history = profile.caseHistory || {};

    const totalCases = history.totalCases || 0;
    const wins = history.wins || 0;
    const losses = history.losses || 0;
    const settlements = history.settlements || 0;

    const winRate = totalCases > 0 ? wins / totalCases : 0;
    const settlementRate = totalCases > 0 ? settlements / totalCases : 0;

    return {
      summary: {
        totalCases,
        wins,
        losses,
        settlements,
        winRate: (winRate * 100).toFixed(1) + '%',
        settlementRate: (settlementRate * 100).toFixed(1) + '%'
      },
      strengths: this.identifyStrengths(history),
      weaknesses: this.identifyHistoricalWeaknesses(history),
      tendency: settlementRate > 0.6 ? 'settlement-focused' : 
                winRate > 0.7 ? 'aggressive-litigator' : 'moderate'
    };
  }

  /**
   * Identify lawyer's strengths
   */
  identifyStrengths(history) {
    const strengths = [];

    if (history.winRate > 0.7) {
      strengths.push('High win rate - skilled trial attorney');
    }

    if (history.avgTrialDuration < 180) {
      strengths.push('Moves cases quickly - efficient');
    }

    if (history.totalCases > 100) {
      strengths.push('Experienced - handles large volume');
    }

    return strengths;
  }

  /**
   * Identify historical weaknesses
   */
  identifyHistoricalWeaknesses(history) {
    const weaknesses = [];

    if (history.winRate < 0.5) {
      weaknesses.push({
        type: 'low-win-rate',
        severity: 'high',
        description: `Only wins ${(history.winRate * 100).toFixed(1)}% of cases`,
        exploit: 'Press hard - they have weak track record'
      });
    }

    if (history.settlementRate > 0.7) {
      weaknesses.push({
        type: 'settlement-focused',
        severity: 'medium',
        description: 'Settles most cases - avoids trial',
        exploit: 'Threaten trial - they will likely fold'
      });
    }

    if (history.avgTrialDuration > 365) {
      weaknesses.push({
        type: 'slow-mover',
        severity: 'low',
        description: 'Cases drag on average 1+ year',
        exploit: 'Client may tire of legal fees'
      });
    }

    return weaknesses;
  }

  // ==========================================================================
  // STRATEGY PATTERN IDENTIFICATION
  // ==========================================================================

  /**
   * Identify opponent's strategy patterns using AI
   */
  async identifyStrategyPatterns(profile) {
    // Use GPT-4 to analyze profile and identify patterns
    const prompt = `Analyze this lawyer's profile and identify their strategic patterns:

NAME: ${profile.name}
FIRM: ${profile.firm}
EXPERIENCE: ${profile.yearsLicensed || 'Unknown'} years
WIN RATE: ${profile.caseHistory?.wins || 0}/${profile.caseHistory?.totalCases || 0}
SETTLEMENT RATE: ${profile.caseHistory?.settlements || 0}/${profile.caseHistory?.totalCases || 0}
SPECIALTIES: ${profile.specialties?.join(', ') || 'Unknown'}

Based on this data, identify:
1. Their litigation style (aggressive vs. settlement-focused)
2. Likely discovery approach (thorough vs. minimal)
3. Motion practice patterns
4. Negotiation tactics
5. Trial preparation level

Be specific and actionable.`;

    try {
      const response = await this.llm.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      });

      const aiAnalysis = response.choices[0].message.content;

      // Parse AI response into structured data
      return {
        litigationStyle: this.extractPattern(aiAnalysis, 'litigation style'),
        discoveryApproach: this.extractPattern(aiAnalysis, 'discovery'),
        motionPractice: this.extractPattern(aiAnalysis, 'motion'),
        negotiationTactics: this.extractPattern(aiAnalysis, 'negotiation'),
        trialPreparation: this.extractPattern(aiAnalysis, 'trial'),
        aiInsights: aiAnalysis
      };
    } catch (error) {
      console.error('Pattern identification failed:', error.message);
      return {
        litigationStyle: 'unknown',
        aiInsights: 'Analysis failed'
      };
    }
  }

  /**
   * Extract specific pattern from AI analysis
   */
  extractPattern(text, keyword) {
    const lowerText = text.toLowerCase();
    const keywordIndex = lowerText.indexOf(keyword);
    
    if (keywordIndex === -1) return 'unknown';

    // Extract sentence containing keyword
    const start = lowerText.lastIndexOf('.', keywordIndex) + 1;
    const end = lowerText.indexOf('.', keywordIndex) + 1;
    
    return text.substring(start, end).trim();
  }

  // ==========================================================================
  // WEAKNESS IDENTIFICATION
  // ==========================================================================

  /**
   * Identify exploitable weaknesses
   */
  async identifyWeaknesses(profile, patterns) {
    const weaknesses = [];

    // Add historical weaknesses
    weaknesses.push(...this.identifyHistoricalWeaknesses(profile.caseHistory || {}));

    // Use AI to find subtle weaknesses
    const prompt = `As an adversarial strategist, identify weaknesses in this lawyer's approach that we can exploit:

PROFILE:
${JSON.stringify(profile, null, 2)}

PATTERNS:
${JSON.stringify(patterns, null, 2)}

Find specific, actionable weaknesses we can exploit to win the case. Be ruthless but ethical.`;

    try {
      const response = await this.llm.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 2000
      });

      // Parse AI-identified weaknesses
      const aiWeaknesses = this.parseWeaknesses(response.choices[0].message.content);
      weaknesses.push(...aiWeaknesses);

    } catch (error) {
      console.error('AI weakness identification failed:', error.message);
    }

    return weaknesses;
  }

  /**
   * Parse AI response into structured weaknesses
   */
  parseWeaknesses(text) {
    // Simple parsing - looks for bullet points or numbered lists
    const lines = text.split('\n').filter(line => 
      line.trim().match(/^[\d•\-\*]/)
    );

    return lines.map(line => ({
      type: 'ai-identified',
      severity: 'medium',
      description: line.replace(/^[\d•\-\*]\s*/, '').trim(),
      exploit: 'Leverage in strategy'
    }));
  }

  // ==========================================================================
  // COUNTER-STRATEGY GENERATION
  // ==========================================================================

  /**
   * Generate comprehensive counter-strategy
   */
  async generateCounterStrategy({ profile, patterns, weaknesses }) {
    const prompt = `You are a master trial strategist. Generate a comprehensive counter-strategy to defeat this opponent.

OPPONENT: ${profile.name} at ${profile.firm}
WIN RATE: ${profile.caseHistory?.wins || 0}/${profile.caseHistory?.totalCases || 0}

THEIR PATTERNS:
${JSON.stringify(patterns, null, 2)}

THEIR WEAKNESSES:
${JSON.stringify(weaknesses, null, 2)}

Generate a detailed counter-strategy covering:

1. **Pre-Litigation Phase**
   - How to position our demand letter
   - What tone to use (aggressive vs. professional)
   - Which evidence to reveal vs. withhold

2. **Discovery Phase**
   - What document requests will overwhelm them
   - What depositions to prioritize
   - How to exploit their discovery weaknesses

3. **Motion Practice**
   - Which motions to file and when
   - How to counter their likely motions
   - Procedural traps to set

4. **Settlement Negotiation**
   - Optimal timing for offers
   - Starting demand amount
   - Minimum acceptable settlement
   - Negotiation tactics based on their psychology

5. **Trial Preparation**
   - How to exploit their trial weaknesses
   - Witness preparation strategy
   - Exhibit strategy

6. **Contingency Plans**
   - What if they deviate from their patterns?
   - Backup strategies for different scenarios

Be specific, tactical, and ruthless (but ethical). This is chess, not checkers.`;

    try {
      const response = await this.llm.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 4000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Counter-strategy generation failed:', error.message);
      return 'Counter-strategy generation failed. Manual strategy required.';
    }
  }

  // ==========================================================================
  // JUDGE PROFILING
  // ==========================================================================

  /**
   * Profile judge assigned to case
   */
  async profileJudge(name, court, options = {}) {
    console.log(`\n⚖️ Profiling Judge: ${name} at ${court}`);

    // Check database
    let profile = await prisma.judgeProfile.findFirst({
      where: { name, court }
    });

    if (!profile) {
      console.log('  → Profile not found, scraping...');
      profile = await this.scrapeJudgeProfile(name, court);
      
      if (profile) {
        profile = await prisma.judgeProfile.create({ data: profile });
        console.log('  ✓ Profile created');
      }
    } else {
      console.log('  ✓ Profile found');
    }

    // Analyze rulings
    console.log('  → Analyzing ruling patterns...');
    const rulingAnalysis = await this.analyzeJudgeRulings(profile);

    // Predict behavior
    console.log('  → Predicting behavior...');
    const predictions = this.predictJudgeBehavior(profile, rulingAnalysis);

    // Generate appearance strategy
    console.log('  → Generating court strategy...');
    const strategy = await this.generateCourtStrategy(profile, predictions);

    console.log('✅ Judge profile complete\n');

    return {
      profile,
      rulingAnalysis,
      predictions,
      strategy,
      confidence: this.calculateProfileConfidence(profile),
      lastUpdated: new Date()
    };
  }

  /**
   * Scrape judge profile
   */
  async scrapeJudgeProfile(name, court) {
    // Would scrape from:
    // - Court websites
    // - Ballotpedia
    // - Wikipedia
    // - News articles
    
    // Placeholder for now
    return {
      name,
      court,
      appointedBy: 'Unknown',
      appointedDate: null,
      tendencies: {
        proTenant: 0.5,
        proLandlord: 0.5,
        strictOnProcedure: 0.5,
        allowsDiscovery: 0.5,
        settlesEarly: 0.5
      },
      avgCaseDuration: 270, // days
      background: 'Unknown',
      notableRulings: []
    };
  }

  /**
   * Analyze judge's ruling patterns
   */
  async analyzeJudgeRulings(profile) {
    // Would analyze historical rulings
    // For now, return tendencies
    return {
      totalRulings: 0,
      tenantFavorable: 0,
      landlordFavorable: 0,
      commonRulings: [],
      proceduralStrictness: profile.tendencies?.strictOnProcedure || 0.5
    };
  }

  /**
   * Predict judge's behavior in this case
   */
  predictJudgeBehavior(profile, rulingAnalysis) {
    const tendencies = profile.tendencies || {};

    return {
      likelyToGrantMotionToDismiss: tendencies.strictOnProcedure > 0.7,
      likelyToAllowDiscovery: tendencies.allowsDiscovery > 0.6,
      likelyToPressSettlement: tendencies.settlesEarly > 0.7,
      tenantBias: tendencies.proTenant - tendencies.proLandlord,
      estimatedCaseDuration: profile.avgCaseDuration || 270,
      bestTimeToSettle: this.calculateOptimalSettlementTiming(profile),
      courtAppearanceTips: this.generateAppearanceTips(profile)
    };
  }

  /**
   * Calculate optimal settlement timing
   */
  calculateOptimalSettlementTiming(profile) {
    const tendencies = profile.tendencies || {};

    if (tendencies.settlesEarly > 0.7) {
      return 'Early (within 60 days) - judge pushes settlement';
    } else if (tendencies.settlesEarly < 0.3) {
      return 'Late (near trial) - judge lets cases develop';
    } else {
      return 'Mid-case (90-180 days) - after discovery';
    }
  }

  /**
   * Generate court appearance tips
   */
  generateAppearanceTips(profile) {
    const tips = [];

    if (profile.tendencies?.strictOnProcedure > 0.7) {
      tips.push('Be extremely punctual and follow all procedures');
      tips.push('Have all filings perfectly formatted');
    }

    if (profile.tendencies?.allowsDiscovery > 0.6) {
      tips.push('Request aggressive discovery - judge will likely allow');
    }

    if (profile.tendencies?.settlesEarly > 0.7) {
      tips.push('Be prepared to discuss settlement at hearings');
    }

    return tips;
  }

  /**
   * Generate court appearance strategy
   */
  async generateCourtStrategy(profile, predictions) {
    const prompt = `Generate a court appearance strategy for this judge:

JUDGE: ${profile.name}
COURT: ${profile.court}
BACKGROUND: ${profile.background || 'Unknown'}

TENDENCIES:
${JSON.stringify(profile.tendencies, null, 2)}

PREDICTIONS:
${JSON.stringify(predictions, null, 2)}

Provide:
1. How to present arguments to this judge
2. What to emphasize (procedure vs. equity)
3. What to avoid
4. Optimal hearing strategy
5. Settlement conference approach`;

    try {
      const response = await this.llm.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      return response.choices[0].message.content;
    } catch (error) {
      return 'Strategy generation failed. Use general best practices.';
    }
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Calculate confidence in profile
   */
  calculateProfileConfidence(profile) {
    let confidence = 0;

    if (profile.caseHistory?.totalCases > 10) confidence += 0.3;
    if (profile.yearsLicensed > 5) confidence += 0.2;
    if (profile.rating) confidence += 0.2;
    if (profile.specialties?.length > 0) confidence += 0.15;
    if (profile.barNumber) confidence += 0.15;

    return Math.min(confidence, 1.0);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AdversarialIntelligence;
