/**
 * PATTERSTONE CASE - QUICK START SCRIPT
 * 
 * This script processes the Patterstone case through the full AI agent pipeline
 * and demonstrates the platform's capabilities.
 * 
 * Run: node scripts/process-patterstone-case.js
 */

const { IntakeAgent } = require('../agents/agent_intake');
const { LegalMapperAgent } = require('../agents/agent_legal_mapper');
const { DamagesCalculator } = require('../agents/agent_damages');
const fs = require('fs');
const path = require('path');

// Patterstone Case Raw Story
const PATTERSTONE_STORY = `
My name is Kevan and I'm a tenant at 3530 Patterstone Drive in Atlanta, Georgia (Fulton County).

We moved into this property on June 15, 2024. It's a 3-bedroom, 2-bathroom single-family home.
Monthly rent is $3,000. We paid a $3,000 security deposit.
The landlord is Ari Niazi (phone: 404-555-0123).

TIMELINE OF PROBLEMS:

July 10, 2024 - We noticed water leaking from the ceiling in one of the bathrooms. I immediately 
called the landlord and sent him photos via text message.

July 15, 2024 - Landlord sent a handyman to look at it. The handyman said "This is too big for me, 
you need a plumber" and left. I texted the landlord immediately about what the handyman said.

July 20-30, 2024 - I called the landlord 4 more times. Each time he said "I'll take care of it" 
but no one ever came.

August 1, 2024 - The water damage got worse. Black mold started growing on the bathroom walls 
and ceiling. I took photos and sent them to the landlord via email with subject line "URGENT - 
Black Mold in Bathroom".

August 10, 2024 - The bathroom ceiling partially collapsed from the water damage. We can no 
longer use that bathroom at all. I sent certified letter to landlord demanding immediate repair.

August 15, 2024 - My two children (ages 5 and 7) started having respiratory problems - constant 
coughing and wheezing. We believe it's from the mold exposure.

September 1, 2024 - Still no repairs. We've been living without a working bathroom (down to 1 
bathroom for 3-bedroom house) for a month. I sent another certified letter threatening legal action.

September-October 2024 - Landlord continues to ignore us. Occasionally responds with "I'm working 
on it" but no actual repairs are ever done.

November 2024 - It's been 5 months since this started. The mold has spread. My kids are still 
coughing. We're essentially paying $3,000/month for a house that's only 60% usable and actively 
dangerous to our health.

WHAT I WANT:
1. All rent refunded for the months we've dealt with this
2. Security deposit returned
3. Compensation for my kids' health issues and our suffering
4. Permission to break the lease without penalty
5. This landlord exposed publicly so no other family goes through this

EVIDENCE I HAVE:
- Photos of the initial leak (July 2024)
- Photos of black mold growth (August-November 2024)
- Photos of collapsed ceiling
- Text messages to landlord (dozens)
- Emails to landlord
- Two certified letters (with receipts)
- Medical records for my children's respiratory issues
- Handyman's statement ("too big for me")
`;

async function main() {
  console.log('🚀 PROCESSING PATTERSTONE CASE THROUGH TENANT JUSTICE PLATFORM\n');
  console.log('=' .repeat(80));
  
  try {
    // STEP 1: INTAKE AGENT
    console.log('\n📝 STEP 1: INTAKE SPECIALIST - Structuring Case Data...\n');
    
    const intakeAgent = new IntakeAgent(process.env.OPENAI_API_KEY);
    const intakeResult = await intakeAgent.analyze(PATTERSTONE_STORY);
    
    if (!intakeResult.success) {
      throw new Error(`Intake failed: ${intakeResult.error}`);
    }
    
    const caseData = intakeResult.data;
    console.log('✅ Case Data Structured');
    console.log(`   Tenant: ${caseData.tenant.name}`);
    console.log(`   Property: ${caseData.property.address}`);
    console.log(`   Landlord: ${caseData.landlord.name}`);
    console.log(`   Issues: ${caseData.issues.length} problems identified`);
    console.log(`   Duration: ${caseData.timeline.durationDays} days`);
    console.log(`   Children Affected: ${caseData.tenant.hasChildren ? 'Yes' : 'No'}`);
    
    // Save structured case data
    fs.writeFileSync(
      path.join(__dirname, '../output/patterstone_case_data.json'),
      JSON.stringify(caseData, null, 2)
    );
    console.log('\n   💾 Saved to: output/patterstone_case_data.json');
    
    // STEP 2: LEGAL MAPPER AGENT
    console.log('\n⚖️  STEP 2: LEGAL MAPPER - Analyzing Violations & Laws...\n');
    
    const legalMapper = new LegalMapperAgent(process.env.OPENAI_API_KEY);
    const legalResult = await legalMapper.analyze(caseData);
    
    if (!legalResult.success) {
      throw new Error(`Legal analysis failed: ${legalResult.error}`);
    }
    
    const legalAnalysis = legalResult.data;
    console.log('✅ Legal Analysis Complete');
    console.log(`   Violations Found: ${legalAnalysis.violations.length}`);
    console.log(`   Legal Theories: ${legalAnalysis.legalTheories.length}`);
    console.log(`   Case Strength: ${legalAnalysis.strengthAssessment.overallScore}/10`);
    console.log(`   Attorney Fees Available: ${legalAnalysis.attorneyFeesAvailable.available ? 'YES' : 'NO'}`);
    
    console.log('\n   📜 VIOLATIONS:');
    legalAnalysis.violations.forEach((v, i) => {
      console.log(`      ${i + 1}. ${v.statute} - ${v.title}`);
      console.log(`         Strength: ${v.strength}/10`);
    });
    
    console.log('\n   🎯 LEGAL THEORIES:');
    legalAnalysis.legalTheories.forEach((t, i) => {
      console.log(`      ${i + 1}. ${t.theory.replace(/_/g, ' ').toUpperCase()}`);
      console.log(`         Strength: ${t.strength}/10`);
    });
    
    fs.writeFileSync(
      path.join(__dirname, '../output/patterstone_legal_analysis.json'),
      JSON.stringify(legalAnalysis, null, 2)
    );
    console.log('\n   💾 Saved to: output/patterstone_legal_analysis.json');
    
    // STEP 3: DAMAGES CALCULATOR
    console.log('\n💰 STEP 3: DAMAGES CALCULATOR - Calculating Money Owed...\n');
    
    const damagesCalc = new DamagesCalculator();
    const damagesResult = damagesCalc.calculate(caseData, legalAnalysis);
    
    if (!damagesResult.success) {
      throw new Error(`Damages calculation failed: ${damagesResult.error}`);
    }
    
    const damages = damagesResult.data;
    console.log('✅ Damages Calculated');
    console.log(`\n   CONSERVATIVE ESTIMATE: $${damages.conservative.total.toLocaleString()}`);
    console.log('   Breakdown:');
    damages.conservative.breakdown.forEach(item => {
      console.log(`      - ${item.category}: $${item.amount.toLocaleString()}`);
    });
    
    console.log(`\n   AGGRESSIVE ESTIMATE: $${damages.aggressive.total.toLocaleString()}`);
    console.log('   Breakdown:');
    damages.aggressive.breakdown.forEach(item => {
      console.log(`      - ${item.category}: $${item.amount.toLocaleString()}`);
    });
    
    console.log(`\n   💡 RECOMMENDED DEMAND: $${damages.recommended.demandAmount.toLocaleString()}`);
    console.log(`   Settlement Range: $${damages.recommended.settlementRange.low.toLocaleString()} - $${damages.recommended.settlementRange.high.toLocaleString()}`);
    
    fs.writeFileSync(
      path.join(__dirname, '../output/patterstone_damages.json'),
      JSON.stringify(damages, null, 2)
    );
    console.log('\n   💾 Saved to: output/patterstone_damages.json');
    
    // SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 PATTERSTONE CASE SUMMARY\n');
    console.log(`Case ID: GA-FULTON-3530-PATTERSTONE-2025`);
    console.log(`Case Strength: ${legalAnalysis.strengthAssessment.overallScore}/10`);
    console.log(`Violations: ${legalAnalysis.violations.length}`);
    console.log(`Legal Theories: ${legalAnalysis.legalTheories.length}`);
    console.log(`Estimated Value: $${damages.conservative.total.toLocaleString()} - $${damages.aggressive.total.toLocaleString()}`);
    console.log(`Recommended Demand: $${damages.recommended.demandAmount.toLocaleString()}`);
    console.log(`Attorney Fees: ${legalAnalysis.attorneyFeesAvailable.available ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Generate demand letter (agent_document_drafter)');
    console.log('   2. Prepare formal complaint (agent_document_drafter)');
    console.log('   3. Mint evidence to blockchain');
    console.log('   4. Create public case page');
    console.log('   5. Find lawyer or send demand letter directly');
    
    console.log('\n✅ PATTERSTONE CASE PROCESSING COMPLETE');
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
