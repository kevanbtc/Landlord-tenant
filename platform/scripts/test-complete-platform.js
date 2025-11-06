/**
 * COMPLETE PLATFORM TEST
 * 
 * Tests the full Tenant Justice Platform with legal intelligence
 */

import MasterOrchestrator from '../agents/agent_orchestrator.js';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// TEST CASE: Patterstone Drive
// ============================================================================

const PATTERSTONE_STORY = `
I'm Yoda Burns and I need help with a serious housing situation.

I've been renting a house at 3530 Patterstone Drive in Alpharetta, Georgia (Fulton County) 
from my landlord Monisha for about 6 months now. The monthly rent is $3,000 and I signed 
a one-year lease that started in late November 2024.

Around mid-May 2024, we discovered a significant water leak coming from the upstairs bathroom. 
Water was literally dripping through the ceiling into the rooms below. I immediately notified 
Monisha via text message. She acknowledged the problem but didn't send anyone to fix it.

For the next two months, the leak continued and actually got worse. By mid-July, water was 
pouring through the ceiling and causing serious damage to the walls and floors. The landlord 
finally sent a contractor who tore out the entire upstairs bathroom - walls, fixtures, 
everything - but then never came back to repair it.

So now we've completely lost access to the upstairs children's bathroom, which was the main 
bathroom for my two kids (ages 5 and 7). They have to go all the way downstairs to use the 
guest bathroom. This has been the situation for over 4 months now.

The water damage from those months of leaking has caused mold to grow in multiple rooms - 
the hallway, two bedrooms, and even in the walls. You can see it and smell it. Both of my 
children have developed respiratory problems since this started. We've been to the pediatrician 
three times for breathing issues, coughing, and wheezing. The doctor said it could be related 
to mold exposure.

I've documented everything with photos and videos. I have texts and emails to the landlord 
showing that I reported these problems immediately and repeatedly. I've kept every receipt 
from doctor visits.

Despite all this, I've paid my rent on time every single month because I'm afraid of being 
evicted. I can't afford to move right now and I need a place for my kids to live.

The landlord has become increasingly difficult to deal with. After I started complaining 
more forcefully about the repairs, she stopped responding to most of my messages. When she 
does respond, she's dismissive and blames me for "not maintaining the property properly" 
which makes no sense - this is a plumbing issue in her house.

I'm exhausted, frustrated, and worried about my children's health. I don't know what my 
legal rights are or what I should do next. Can you help me understand my options?
`;

// ============================================================================
// RUN COMPLETE ANALYSIS
// ============================================================================

async function runCompleteTest() {
  console.log('\n' + '═'.repeat(100));
  console.log('🚀 TENANT JUSTICE PLATFORM - COMPLETE SYSTEM TEST');
  console.log('═'.repeat(100) + '\n');

  try {
    // Initialize orchestrator
    const orchestrator = new MasterOrchestrator();
    await orchestrator.initialize();

    // Run full analysis
    console.log('📝 Processing Patterstone case...\n');

    const results = await orchestrator.analyzeCase(PATTERSTONE_STORY, {
      deepResearch: true,
      includeCaseLaw: true,
      runPredictions: true,
      generateDocuments: false, // Not implemented yet
    });

    // Save results
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

    // Save complete results
    const completeFile = path.join(outputDir, `complete_analysis_${timestamp}.json`);
    await fs.writeFile(completeFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Complete results saved: ${completeFile}`);

    // Save executive summary
    const summaryFile = path.join(outputDir, `executive_summary_${timestamp}.txt`);
    await fs.writeFile(summaryFile, results.executiveSummary);
    console.log(`💾 Executive summary saved: ${summaryFile}`);

    // Save research memo
    if (results.legalAnalysis.legalResearch) {
      const memoFile = path.join(outputDir, `research_memo_${timestamp}.txt`);
      await fs.writeFile(memoFile, results.legalAnalysis.legalResearch.researchMemo);
      console.log(`💾 Research memo saved: ${memoFile}`);
    }

    // Save strategy analysis
    if (results.strategy) {
      const strategyFile = path.join(outputDir, `strategy_analysis_${timestamp}.txt`);
      await fs.writeFile(strategyFile, results.strategy.optimalStrategy.recommendation || results.strategy.recommendation);
      console.log(`💾 Strategy analysis saved: ${strategyFile}`);
    }

    // Generate detailed report
    console.log('\n' + '═'.repeat(100));
    console.log('📊 DETAILED TEST RESULTS');
    console.log('═'.repeat(100) + '\n');

    console.log('1️⃣  CASE INTAKE:');
    console.log(`   ✓ Confidence: ${results.metadata.confidence}%`);
    console.log(`   ✓ Completeness: ${results.metadata.completeness}%`);
    console.log(`   ✓ Missing info: ${results.metadata.missingInfo.length} items\n`);

    console.log('2️⃣  LEGAL ANALYSIS:');
    console.log(`   ✓ Violations found: ${results.legalAnalysis.violations.length}`);
    results.legalAnalysis.violations.forEach(v => {
      console.log(`     - ${v.statute}: ${v.title} (Strength: ${v.strength}/10)`);
    });
    console.log(`   ✓ Legal theories: ${results.legalAnalysis.legalTheories.length}`);
    results.legalAnalysis.legalTheories.forEach(t => {
      console.log(`     - ${t.theory} (Strength: ${t.strength}/10)`);
    });
    console.log(`   ✓ Case strength: ${results.legalAnalysis.caseStrength}/10\n`);

    if (results.legalAnalysis.legalResearch) {
      console.log('3️⃣  LEGAL RESEARCH:');
      console.log(`   ✓ Statutes researched: ${results.legalAnalysis.legalResearch.statutes.length}`);
      console.log(`   ✓ Case law found: ${results.legalAnalysis.legalResearch.caseLaw.length}`);
      console.log(`   ✓ Research confidence: ${(results.legalAnalysis.legalResearch.confidence * 100).toFixed(1)}%\n`);
    }

    console.log('4️⃣  DAMAGES CALCULATION:');
    console.log(`   ✓ Conservative: $${results.damages.conservative.total.toLocaleString()}`);
    console.log(`   ✓ Recommended: $${results.damages.recommended.total.toLocaleString()}`);
    console.log(`   ✓ Aggressive: $${results.damages.aggressive.total.toLocaleString()}`);
    console.log(`   ✓ Settlement range: $${results.damages.settlementRange.min.toLocaleString()} - $${results.damages.settlementRange.max.toLocaleString()}\n`);

    if (results.strategy) {
      console.log('5️⃣  GAME THEORY ANALYSIS:');
      const stats = results.strategy.simulations.statistics;
      console.log(`   ✓ Simulations run: 10,000`);
      console.log(`   ✓ Win probability: ${(stats.winRate * 100).toFixed(1)}%`);
      console.log(`   ✓ Expected value: $${Math.round(stats.mean).toLocaleString()}`);
      console.log(`   ✓ Median outcome: $${Math.round(stats.median).toLocaleString()}`);
      console.log(`   ✓ Best case (90th %ile): $${Math.round(stats.percentile90).toLocaleString()}`);
      console.log(`   ✓ Worst case (10th %ile): $${Math.round(stats.percentile10).toLocaleString()}`);
      console.log(`   ✓ Optimal strategy: ${results.strategy.optimalStrategy.primaryApproach}\n`);
    }

    console.log('6️⃣  QUALITY ASSESSMENT:');
    console.log(`   ✓ Overall score: ${results.qualityCheck.score}/100`);
    console.log(`   ✓ Evidence strength: ${results.qualityCheck.evidenceStrength}/10`);
    console.log(`   ✓ Legal basis: ${results.qualityCheck.legalBasis}/10`);
    console.log(`   ✓ Recommendation: ${results.qualityCheck.recommendation}\n`);

    if (results.qualityCheck.issues.length > 0) {
      console.log('   ⚠️  Issues identified:');
      results.qualityCheck.issues.forEach(issue => {
        console.log(`     - ${issue}`);
      });
      console.log();
    }

    console.log('═'.repeat(100));
    console.log('✅ COMPLETE PLATFORM TEST SUCCESSFUL');
    console.log('═'.repeat(100) + '\n');

    // Performance metrics
    console.log('⚡ PERFORMANCE METRICS:\n');
    console.log(`   Processing time: ${((Date.now() - global.startTime) / 1000).toFixed(1)}s`);
    console.log(`   AI calls made: ~${results.legalAnalysis.violations.length + 3} (estimated)`);
    console.log(`   Legal research: ${results.legalAnalysis.legalResearch?.statutes.length || 0} statutes, ${results.legalAnalysis.legalResearch?.caseLaw.length || 0} cases`);
    console.log(`   Simulations: 10,000 Monte Carlo iterations\n`);

    console.log('🎯 NEXT STEPS:\n');
    console.log('   1. Review executive summary in output/ directory');
    console.log('   2. Review research memo for legal authorities');
    console.log('   3. Review strategy analysis for recommended approach');
    console.log('   4. Generate demand letter (coming soon)');
    console.log('   5. Prepare for negotiation using game theory insights\n');

    return results;

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================================================
// RUN TEST
// ============================================================================

global.startTime = Date.now();
runCompleteTest().then(() => {
  console.log('✅ All done!\n');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
