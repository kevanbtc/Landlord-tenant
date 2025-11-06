/**
 * COMPREHENSIVE AGENT TEST SUITE
 * 
 * Tests all AI agents individually and as a complete system
 * Uses the Patterstone case as test data
 */

import IntakeAgent from '../agents/agent_intake.js';
import TimelineArchitectAgent from '../agents/agent_timeline.js';
import EnhancedLegalMapperAgent from '../agents/agent_legal_mapper_enhanced.js';
import DamagesCalculatorAgent from '../agents/agent_damages.js';
import HealthImpactAnalyzerAgent from '../agents/agent_health.js';
import DocumentDrafterAgent from '../agents/agent_document_drafter.js';
import MasterOrchestrator from '../agents/agent_orchestrator.js';
import LegalLibrary from '../legal-intelligence/legal-library.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data: Patterstone case
const PATTERSTONE_STORY = `
I'm a tenant at 3530 Patterstone Ln, Atlanta, GA. My landlord is The Wayland Group (represented by Panacea Property Management).

I moved in around April 2024. From day one, there have been serious problems:

WATER LEAKS & MOLD:
- Major water leak from upstairs bathroom started June 2024
- Water comes through ceiling into my bedroom
- Ceiling has huge brown stains and is sagging dangerously
- Black mold is growing on walls and ceiling
- Mold has spread to 3 rooms now
- Bathroom floor is rotting through
- I reported this immediately in June and have sent multiple messages
- They sent someone to "look at it" twice but never fixed anything
- The leak is getting worse
- My kids are getting sick - respiratory problems, coughing, headaches

PLUMBING FAILURES:
- Toilet constantly runs and leaks
- Kitchen sink backs up with sewage
- Garbage disposal broken since July
- Shower has mold and damaged grout
- Reported all of this multiple times - no real repairs

HVAC PROBLEMS:
- Air conditioning broke during summer
- It was 95+ degrees for weeks
- Took them 3 weeks to partially fix it
- Still doesn't cool properly
- My elderly mother lives with us and has heart problems - the heat was dangerous

PEST INFESTATION:
- Roaches everywhere because of the water leaks
- They won't send exterminator regularly
- Roaches in kitchen, bathrooms, bedrooms
- My kids are afraid to sleep in their rooms

ELECTRICAL HAZARDS:
- Outlets sparking in kitchen
- Breaker trips constantly
- They told me to "just reset it" - no electrician sent
- Fire hazard

RETALIATION:
- After I complained multiple times, they sent me a "lease violation" notice
- Threatened eviction for "excessive complaints"
- Tried to raise my rent mid-lease
- Won't respond to my messages anymore

HEALTH IMPACTS:
- My 8-year-old daughter has developed asthma from the mold
- She's missed 10 days of school
- $2,400 in medical bills so far
- My 5-year-old son has constant respiratory infections
- $1,800 in medical bills for him
- My 70-year-old mother had to go to ER for heat exhaustion - $5,200
- I've developed chronic migraines and skin rashes
- Can't sleep because of stress and conditions

FINANCIAL DAMAGES:
- Had to buy 3 portable AC units: $1,200
- Air purifiers to deal with mold: $600
- Hotel stays when conditions were unlivable: $1,800 (4 nights)
- Extra electricity from portable AC units: ~$400
- Ruined furniture from water damage: $3,500
- Ruined clothes and belongings from mold: $1,200
- Medical bills: $9,400 total
- Lost wages from taking kids to doctor: $800

EVIDENCE I HAVE:
- 50+ photos of water damage, mold, and other issues
- Videos of water leaking through ceiling
- 20+ text messages and emails reporting problems
- Medical records for all family members
- Hospital bills and receipts
- Receipts for portable AC units, air purifiers
- Lease agreement
- The lease violation notice they sent (proof of retaliation)
- Witness: My neighbor says they have similar problems

TIMELINE:
- April 2024: Move in
- June 2024: Water leak starts, immediately reported
- June-August: Multiple complaints, minimal response
- August: AC breaks during heat wave
- September: Received retaliation notice
- October: Mold spread to 3 rooms, kids getting very sick
- November 2024: Current situation, still not fixed

I'm paying $1,650/month for this hellhole. I have 2 years left on my lease.

What can I do? I want them to fix everything, pay my medical bills, reimburse me for all 
my expenses, and I want to break my lease without penalty. They're slumlords and this is 
unacceptable. My kids are literally getting sick.
`;

async function runIndividualTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         INDIVIDUAL AGENT TESTS                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const results = {};

  // Test 1: Intake Agent
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: INTAKE AGENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const intakeAgent = new IntakeAgent();
  const startIntake = Date.now();
  results.intake = await intakeAgent.processStory(PATTERSTONE_STORY);
  const intakeTime = Date.now() - startIntake;
  
  console.log(`✅ Intake complete in ${intakeTime}ms`);
  console.log(`   - Confidence: ${results.intake.confidence}`);
  console.log(`   - Completeness: ${results.intake.completeness}/10`);
  console.log(`   - Facts extracted: ${Object.keys(results.intake).length}`);
  console.log(`   - Evidence items: ${results.intake.evidence?.length || 0}\n`);

  // Test 2: Timeline Agent
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: TIMELINE ARCHITECT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const timelineAgent = new TimelineArchitectAgent();
  const startTimeline = Date.now();
  results.timeline = await timelineAgent.buildTimeline(results.intake);
  const timelineTime = Date.now() - startTimeline;
  
  console.log(`✅ Timeline complete in ${timelineTime}ms`);
  console.log(`   - Events identified: ${results.timeline.totalEvents}`);
  console.log(`   - Patterns found: ${results.timeline.patterns.length}`);
  console.log(`   - Causation chains: ${results.timeline.causationChains.length}`);
  console.log(`   - Duration: ${results.timeline.timespan.durationDays} days\n`);

  // Test 3: Legal Mapper (without deep research for speed)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: LEGAL MAPPER (BASE ANALYSIS)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const legalMapper = new EnhancedLegalMapperAgent();
  const startLegal = Date.now();
  results.legal = await legalMapper.analyze(results.intake, { deepResearch: false });
  const legalTime = Date.now() - startLegal;
  
  console.log(`✅ Legal analysis complete in ${legalTime}ms`);
  console.log(`   - Violations identified: ${results.legal.violations.length}`);
  console.log(`   - Legal theories: ${results.legal.legalTheories.length}`);
  console.log(`   - Case strength: ${results.legal.caseStrength}/10`);
  console.log(`   - Attorney fees available: ${results.legal.attorneyFeesAvailable ? 'Yes' : 'No'}\n`);

  // Test 4: Damages Calculator
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: DAMAGES CALCULATOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const damagesCalc = new DamagesCalculatorAgent();
  const startDamages = Date.now();
  results.damages = await damagesCalc.calculateDamages(results.intake, results.legal);
  const damagesTime = Date.now() - startDamages;
  
  console.log(`✅ Damages calculated in ${damagesTime}ms`);
  console.log(`   - Conservative: $${results.damages.totalDamages.conservative.toLocaleString()}`);
  console.log(`   - Recommended: $${results.damages.totalDamages.recommended.toLocaleString()}`);
  console.log(`   - Aggressive: $${results.damages.totalDamages.aggressive.toLocaleString()}`);
  console.log(`   - Categories: ${results.damages.damageCategories.length}\n`);

  // Test 5: Health Impact Analyzer
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 5: HEALTH IMPACT ANALYZER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const healthAnalyzer = new HealthImpactAnalyzerAgent();
  const startHealth = Date.now();
  results.health = await healthAnalyzer.analyze(results.intake, results.timeline);
  const healthTime = Date.now() - startHealth;
  
  console.log(`✅ Health analysis complete in ${healthTime}ms`);
  console.log(`   - Hazards identified: ${results.health.hazards.length}`);
  console.log(`   - Medical impacts: ${results.health.medicalImpacts.length}`);
  console.log(`   - Overall severity: ${results.health.overallSeverity}`);
  console.log(`   - Total medical costs: $${results.health.totalMedicalCosts.total.toLocaleString()}`);
  console.log(`   - Expert witness needed: ${results.health.expertWitnessNeeded ? 'Yes' : 'No'}`);
  console.log(`   - Legal strength: ${results.health.legalStrength}/10\n`);

  // Test 6: Document Drafter
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 6: DOCUMENT DRAFTER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const docDrafter = new DocumentDrafterAgent();
  const startDocs = Date.now();
  
  // Generate demand letter and evidence index
  const demandLetter = await docDrafter.draftDemandLetter(
    results.intake,
    results.legal,
    results.damages,
    { tone: 'professional', deadline: 14 }
  );
  
  const evidenceIndex = await docDrafter.createEvidenceIndex(
    results.intake,
    results.intake.evidence || []
  );
  
  const docsTime = Date.now() - startDocs;
  
  console.log(`✅ Documents generated in ${docsTime}ms`);
  console.log(`   - Demand letter: ${demandLetter.content.length} characters`);
  console.log(`   - Evidence index created`);
  console.log(`   - Legal citations: ${demandLetter.legalCitations?.length || 0}\n`);

  results.documents = { demandLetter, evidenceIndex };

  return results;
}

async function runIntegratedTest() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         INTEGRATED SYSTEM TEST (Master Orchestrator)         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const orchestrator = new MasterOrchestrator();
  await orchestrator.initialize();

  const startIntegrated = Date.now();
  const results = await orchestrator.analyzeCase(PATTERSTONE_STORY, {
    deepResearch: false, // Skip for speed in testing
    opponentFirm: 'Panacea Property Management',
    opponentLawyer: 'Unknown'
  });
  const integratedTime = Date.now() - startIntegrated;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('INTEGRATED TEST RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`⏱️  Total processing time: ${(integratedTime / 1000).toFixed(1)}s\n`);
  console.log(`📊 Quality Score: ${results.qualityAssessment.overallScore}/100\n`);
  
  console.log('EXECUTIVE SUMMARY:\n');
  console.log(results.executiveSummary);

  return results;
}

async function saveResults(individualResults, integratedResults) {
  const outputDir = path.join(__dirname, '../output');
  await fs.mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save individual test results
  await fs.writeFile(
    path.join(outputDir, `individual_tests_${timestamp}.json`),
    JSON.stringify(individualResults, null, 2)
  );

  // Save integrated test results
  await fs.writeFile(
    path.join(outputDir, `integrated_test_${timestamp}.json`),
    JSON.stringify(integratedResults, null, 2)
  );

  // Save executive summary
  if (integratedResults.executiveSummary) {
    await fs.writeFile(
      path.join(outputDir, `executive_summary_${timestamp}.txt`),
      integratedResults.executiveSummary
    );
  }

  // Save demand letter if generated
  if (individualResults.documents?.demandLetter) {
    await fs.writeFile(
      path.join(outputDir, `demand_letter_${timestamp}.txt`),
      individualResults.documents.demandLetter.content
    );
  }

  // Save health report
  if (individualResults.health) {
    const healthAnalyzer = new HealthImpactAnalyzerAgent();
    const healthReport = healthAnalyzer.generateHealthReport(individualResults.health);
    await fs.writeFile(
      path.join(outputDir, `health_report_${timestamp}.txt`),
      healthReport
    );
  }

  // Save timeline
  if (individualResults.timeline) {
    const timelineAgent = new TimelineArchitectAgent();
    const timelineReport = timelineAgent.generateVisualTimeline(individualResults.timeline);
    await fs.writeFile(
      path.join(outputDir, `timeline_${timestamp}.txt`),
      timelineReport
    );
  }

  console.log(`\n✅ All results saved to ${outputDir}/\n`);
}

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║        TENANT JUSTICE PLATFORM - AGENT TEST SUITE            ║');
  console.log('║                                                              ║');
  console.log('║     Testing AI Agents on the Patterstone Case               ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  try {
    // Run individual agent tests
    const individualResults = await runIndividualTests();

    // Run integrated system test
    const integratedResults = await runIntegratedTest();

    // Save all results
    await saveResults(individualResults, integratedResults);

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUITE COMPLETE ✅                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log('📁 Generated files:');
    console.log('   - individual_tests_[timestamp].json');
    console.log('   - integrated_test_[timestamp].json');
    console.log('   - executive_summary_[timestamp].txt');
    console.log('   - demand_letter_[timestamp].txt');
    console.log('   - health_report_[timestamp].txt');
    console.log('   - timeline_[timestamp].txt\n');

    console.log('🎯 Next Steps:');
    console.log('   1. Review generated documents in output/ folder');
    console.log('   2. Build Defense Simulator agent (predicts opponent arguments)');
    console.log('   3. Build Rebuttal Engine agent (pre-writes counter-arguments)');
    console.log('   4. Seed legal database (run legal library scraper)');
    console.log('   5. Build web application interface');
    console.log('   6. Deploy blockchain evidence system\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
