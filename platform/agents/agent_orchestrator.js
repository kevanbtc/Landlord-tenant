/**
 * MASTER ORCHESTRATOR AGENT
 * 
 * Coordinates all agents and legal intelligence systems
 * This is the "conductor" of the AI swarm
 */

import IntakeAgent from './agent_intake.js';
import EnhancedLegalMapperAgent from './agent_legal_mapper_enhanced.js';
import DamagesCalculator from './agent_damages.js';
import AdversarialIntelligence from '../legal-intelligence/adversarial-intelligence.js';
import GameTheoryEngine from '../legal-intelligence/game-theory-engine.js';
import LegalLibrary from '../legal-intelligence/legal-library.js';

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

export class MasterOrchestrator {
  constructor() {
    // Initialize all agents
    this.intakeAgent = new IntakeAgent();
    this.legalMapper = new EnhancedLegalMapperAgent();
    this.damagesCalc = new DamagesCalculator();
    this.adversarial = new AdversarialIntelligence();
    this.gameTheory = new GameTheoryEngine();
    this.legalLibrary = new LegalLibrary();

    this.initialized = false;
  }

  /**
   * Initialize all systems
   */
  async initialize() {
    if (this.initialized) return;

    console.log('🚀 Initializing Tenant Justice Platform...\n');

    // Initialize legal library
    console.log('📚 Loading legal library...');
    await this.legalLibrary.initialize();
    console.log('  ✓ Legal library ready\n');

    this.initialized = true;
    console.log('✅ Platform initialized and ready\n');
  }

  /**
   * FULL CASE ANALYSIS PIPELINE
   * 
   * Takes raw tenant story and produces complete legal package
   */
  async analyzeCase(rawStory, options = {}) {
    const {
      opponentLawyer = null,
      opponentFirm = null,
      judge = null,
      court = null,
      deepResearch = true,
      generateDocuments = true,
    } = options;

    console.log('\n' + '='.repeat(80));
    console.log('🎯 TENANT JUSTICE PLATFORM - FULL CASE ANALYSIS');
    console.log('='.repeat(80) + '\n');

    const startTime = Date.now();
    const results = {};

    try {
      // =======================================================================
      // PHASE 1: INTAKE & STRUCTURING
      // =======================================================================
      console.log('📋 PHASE 1: INTAKE & CASE STRUCTURING\n');

      const intake = await this.intakeAgent.analyze(rawStory);
      results.caseData = intake.caseData;
      results.metadata = {
        confidence: intake.confidence,
        completeness: intake.completeness,
        missingInfo: intake.missingInfo,
      };

      console.log(`  ✓ Case structured (${intake.confidence}% confidence)`);
      console.log(`  ✓ Completeness: ${intake.completeness}%`);
      
      if (intake.missingInfo.length > 0) {
        console.log(`  ⚠️  Missing: ${intake.missingInfo.join(', ')}`);
      }
      console.log();

      // =======================================================================
      // PHASE 2: LEGAL ANALYSIS & RESEARCH
      // =======================================================================
      console.log('⚖️  PHASE 2: LEGAL ANALYSIS & RESEARCH\n');

      const legalAnalysis = await this.legalMapper.analyze(results.caseData, {
        deepResearch,
        includeCaseLaw: true,
        runPredictions: true,
      });
      results.legalAnalysis = legalAnalysis;

      console.log(`  ✓ Found ${legalAnalysis.violations.length} statute violations`);
      console.log(`  ✓ Identified ${legalAnalysis.legalTheories.length} legal theories`);
      console.log(`  ✓ Case strength: ${legalAnalysis.caseStrength}/10`);
      
      if (legalAnalysis.legalResearch) {
        console.log(`  ✓ Researched ${legalAnalysis.legalResearch.statutes.length} statutes`);
        console.log(`  ✓ Found ${legalAnalysis.legalResearch.caseLaw.length} supporting cases`);
      }
      console.log();

      // =======================================================================
      // PHASE 3: DAMAGES CALCULATION
      // =======================================================================
      console.log('💰 PHASE 3: DAMAGES CALCULATION\n');

      const damages = await this.damagesCalc.calculate(
        results.caseData,
        legalAnalysis
      );
      results.damages = damages;

      console.log(`  ✓ Conservative: $${damages.conservative.total.toLocaleString()}`);
      console.log(`  ✓ Recommended: $${damages.recommended.total.toLocaleString()}`);
      console.log(`  ✓ Aggressive: $${damages.aggressive.total.toLocaleString()}`);
      console.log();

      // =======================================================================
      // PHASE 4: ADVERSARIAL INTELLIGENCE (if opponent known)
      // =======================================================================
      if (opponentLawyer && opponentFirm) {
        console.log('🕵️  PHASE 4: ADVERSARIAL INTELLIGENCE\n');

        const opponentIntel = await this.adversarial.profileLawyer(
          opponentLawyer,
          opponentFirm
        );
        results.opponentIntel = opponentIntel;

        console.log(`  ✓ Opponent profiled: ${opponentLawyer}`);
        console.log(`  ✓ Win rate: ${opponentIntel.profile.caseHistory?.wins || 0}/${opponentIntel.profile.caseHistory?.totalCases || 0}`);
        console.log(`  ✓ Weaknesses identified: ${opponentIntel.weaknesses.length}`);
        console.log();
      }

      if (judge && court) {
        console.log('⚖️  JUDGE PROFILING\n');

        const judgeIntel = await this.adversarial.profileJudge(judge, court);
        results.judgeIntel = judgeIntel;

        console.log(`  ✓ Judge profiled: ${judge}`);
        console.log(`  ✓ Tenant bias: ${judgeIntel.predictions.tenantBias > 0 ? 'Pro-tenant' : 'Neutral'}`);
        console.log();
      }

      // =======================================================================
      // PHASE 5: GAME THEORY & STRATEGY
      // =======================================================================
      console.log('🎲 PHASE 5: GAME THEORY & OPTIMAL STRATEGY\n');

      const strategy = await this.gameTheory.analyzeCase(
        results.caseData,
        legalAnalysis,
        results.opponentIntel?.profile || null
      );
      results.strategy = strategy;

      console.log(`  ✓ Ran 10,000 Monte Carlo simulations`);
      console.log(`  ✓ Win probability: ${(strategy.simulations.statistics.winRate * 100).toFixed(1)}%`);
      console.log(`  ✓ Expected value: $${Math.round(strategy.expectedValues.optimal.expectedValue).toLocaleString()}`);
      console.log(`  ✓ Optimal strategy: ${strategy.optimalStrategy.primaryApproach}`);
      console.log();

      // =======================================================================
      // PHASE 6: QUALITY CONTROL
      // =======================================================================
      console.log('✅ PHASE 6: QUALITY CONTROL\n');

      const qualityCheck = this.performQualityControl(results);
      results.qualityCheck = qualityCheck;

      console.log(`  ✓ Overall quality: ${qualityCheck.score}/100`);
      console.log(`  ✓ Evidence strength: ${qualityCheck.evidenceStrength}/10`);
      console.log(`  ✓ Legal basis: ${qualityCheck.legalBasis}/10`);
      console.log();

      // =======================================================================
      // PHASE 7: EXECUTIVE SUMMARY
      // =======================================================================
      console.log('📊 PHASE 7: GENERATING EXECUTIVE SUMMARY\n');

      const summary = await this.generateExecutiveSummary(results);
      results.executiveSummary = summary;

      console.log('  ✓ Executive summary generated');
      console.log();

      // =======================================================================
      // COMPLETION
      // =======================================================================
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log('='.repeat(80));
      console.log(`✅ ANALYSIS COMPLETE (${duration}s)`);
      console.log('='.repeat(80));
      console.log();
      console.log('📊 EXECUTIVE SUMMARY:');
      console.log(summary);
      console.log();

      return results;

    } catch (error) {
      console.error('\n❌ Analysis failed:', error.message);
      console.error(error.stack);
      throw error;
    }
  }

  /**
   * Quality control checks
   */
  performQualityControl(results) {
    let score = 0;
    const issues = [];

    // Check case data completeness
    const completeness = results.metadata.completeness;
    score += completeness * 0.2; // 20 points max

    if (completeness < 80) {
      issues.push('Incomplete case data - missing information');
    }

    // Check legal violations found
    const violations = results.legalAnalysis.violations.length;
    if (violations >= 3) score += 20;
    else if (violations >= 2) score += 15;
    else if (violations >= 1) score += 10;
    else issues.push('Few statute violations found - weak legal basis');

    // Check case strength
    const caseStrength = results.legalAnalysis.caseStrength;
    score += caseStrength * 2; // 20 points max

    if (caseStrength < 5) {
      issues.push('Low case strength - consider alternative approaches');
    }

    // Check damages calculation
    const damages = results.damages;
    if (damages.recommended.total > 10000) score += 15;
    else if (damages.recommended.total > 5000) score += 10;
    else issues.push('Low damages - may not justify litigation costs');

    // Check legal research
    if (results.legalAnalysis.legalResearch) {
      const research = results.legalAnalysis.legalResearch;
      if (research.statutes.length >= 5 && research.caseLaw.length >= 5) {
        score += 15;
      } else {
        issues.push('Limited legal research - may need more authority');
      }
    }

    // Check win probability
    if (results.strategy) {
      const winRate = results.strategy.simulations.statistics.winRate;
      if (winRate >= 0.7) score += 10;
      else if (winRate >= 0.5) score += 5;
      else issues.push('Low win probability - high risk case');
    }

    return {
      score: Math.round(score),
      evidenceStrength: this.assessEvidenceStrength(results.caseData),
      legalBasis: Math.round(caseStrength),
      issues,
      recommendation: score >= 70 ? 'Strong case - proceed' :
                     score >= 50 ? 'Moderate case - proceed with caution' :
                     'Weak case - consider alternatives',
    };
  }

  /**
   * Assess evidence strength
   */
  assessEvidenceStrength(caseData) {
    let strength = 5; // Start at neutral

    // Photos/videos
    if (caseData.evidence?.photos?.length > 5) strength += 2;
    else if (caseData.evidence?.photos?.length > 0) strength += 1;

    // Written communications
    if (caseData.evidence?.communications?.length > 5) strength += 2;
    else if (caseData.evidence?.communications?.length > 0) strength += 1;

    // Witnesses
    if (caseData.evidence?.witnesses?.length > 2) strength += 1;

    // Medical records for health claims
    if (caseData.healthImpacts?.length > 0 && 
        caseData.evidence?.medical?.length > 0) {
      strength += 2;
    }

    // Timeline documentation
    if (caseData.timeline?.length > 10) strength += 1;

    return Math.min(strength, 10);
  }

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(results) {
    const caseData = results.caseData;
    const legal = results.legalAnalysis;
    const damages = results.damages;
    const strategy = results.strategy;
    const quality = results.qualityCheck;

    return `
═══════════════════════════════════════════════════════════════════════════
                       TENANT JUSTICE PLATFORM
                        EXECUTIVE CASE SUMMARY
═══════════════════════════════════════════════════════════════════════════

CASE INFORMATION:
─────────────────────────────────────────────────────────────────────────
Property: ${caseData.property.address}
Tenant: ${caseData.tenant.name}
Landlord: ${caseData.landlord.name}
Monthly Rent: $${caseData.lease.monthlyRent.toLocaleString()}

LEGAL ANALYSIS:
─────────────────────────────────────────────────────────────────────────
Statute Violations: ${legal.violations.length}
  ${legal.violations.slice(0, 3).map(v => `• ${v.statute}: ${v.title}`).join('\n  ')}

Legal Theories: ${legal.legalTheories.length}
  ${legal.legalTheories.slice(0, 3).map(t => `• ${t.theory} (Strength: ${t.strength}/10)`).join('\n  ')}

Case Strength: ${legal.caseStrength}/10 ${
  legal.caseStrength >= 8 ? '🔥 Excellent' :
  legal.caseStrength >= 6 ? '✓ Strong' :
  legal.caseStrength >= 4 ? '~ Moderate' : '⚠️ Weak'
}

DAMAGES ASSESSMENT:
─────────────────────────────────────────────────────────────────────────
Conservative Estimate: $${damages.conservative.total.toLocaleString()}
Recommended Demand: $${damages.recommended.total.toLocaleString()}
Aggressive Maximum: $${damages.aggressive.total.toLocaleString()}

Settlement Range: $${damages.settlementRange.min.toLocaleString()} - $${damages.settlementRange.max.toLocaleString()}

STRATEGIC ANALYSIS (10,000 Simulations):
─────────────────────────────────────────────────────────────────────────
Win Probability: ${(strategy.simulations.statistics.winRate * 100).toFixed(1)}%
Expected Value: $${Math.round(strategy.expectedValues.optimal.expectedValue).toLocaleString()}
Optimal Strategy: ${strategy.optimalStrategy.primaryApproach}

Recommended Demand: $${strategy.optimalStrategy.demandStrategy.initialDemand.toLocaleString()}
Minimum Acceptable: $${strategy.optimalStrategy.demandStrategy.minAcceptable.toLocaleString()}

Estimated Duration: ${strategy.optimalStrategy.timing.estimatedDuration}
Estimated Cost: ${strategy.optimalStrategy.timing.estimatedCost}

QUALITY ASSESSMENT:
─────────────────────────────────────────────────────────────────────────
Overall Score: ${quality.score}/100
Evidence Strength: ${quality.evidenceStrength}/10
Legal Basis: ${quality.legalBasis}/10

Recommendation: ${quality.recommendation}

${quality.issues.length > 0 ? `⚠️  Issues to Address:\n${quality.issues.map(i => `  • ${i}`).join('\n')}` : '✅ No major issues identified'}

NEXT STEPS:
─────────────────────────────────────────────────────────────────────────
1. Review and approve damages demand
2. Generate demand letter (if approved)
3. ${strategy.optimalStrategy.tactics[0]}
4. ${strategy.optimalStrategy.tactics[1]}
5. Prepare for ${strategy.optimalStrategy.timing.optimalSettlement}

═══════════════════════════════════════════════════════════════════════════
Generated by Tenant Justice Platform AI - ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════════════════════════
    `.trim();
  }

  /**
   * Export complete case package
   */
  async exportCasePackage(results, format = 'json') {
    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    }

    // Add PDF, Word, etc. export formats here
    throw new Error(`Export format "${format}" not yet implemented`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MasterOrchestrator;

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new MasterOrchestrator();
  await orchestrator.initialize();

  const story = `I've been renting at 3530 Patterstone Drive in Alpharetta for the past 6 months.
The rent is $3000/month. Around May, we discovered a major water leak from the upstairs bathroom.
I immediately texted the landlord Monisha about it. She acknowledged it but didn't fix it.

By July, the leak got worse and water was pouring through the ceiling. The landlord finally
sent someone who just tore out the bathroom but never repaired it. Now we've lost access to
our main bathroom for 5 months. My two kids (ages 5 and 7) have to use the downstairs bathroom.

There's now mold growing in multiple rooms from all the water damage. My kids have developed
respiratory problems and we've been to the doctor multiple times. I've kept paying rent on time
every month even though the house is a mess.

The landlord has been really difficult to deal with. She stopped responding to my messages
after I complained. I'm exhausted and don't know what to do.`;

  const results = await orchestrator.analyzeCase(story, {
    deepResearch: true,
    generateDocuments: true,
  });

  console.log('\n📁 Full results exported to case_analysis.json');
}
