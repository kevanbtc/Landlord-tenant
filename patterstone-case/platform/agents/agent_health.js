/**
 * AGENT #5: HEALTH IMPACT ANALYZER
 * 
 * Analyzes health and safety impacts from habitability violations.
 * Identifies health hazards, assesses severity, estimates medical costs,
 * connects conditions to symptoms, and strengthens damages claims.
 * 
 * Key capabilities:
 * - Health hazard identification from housing conditions
 * - Medical condition correlation with environmental hazards
 * - Severity assessment (life-threatening to minor)
 * - Medical cost estimation
 * - Expert testimony recommendations
 * - Causation establishment for health damages
 * - Vulnerable population analysis (children, elderly, pregnant)
 */

import OpenAI from 'openai';
import { z } from 'zod';

// Health hazard schema
const HealthHazardSchema = z.object({
  hazardType: z.enum([
    'mold',
    'lead_paint',
    'asbestos',
    'carbon_monoxide',
    'vermin',
    'sewage',
    'chemical_exposure',
    'extreme_temperature',
    'structural_danger',
    'electrical_hazard',
    'water_contamination',
    'inadequate_ventilation',
    'fire_hazard',
    'other'
  ]),
  description: z.string(),
  location: z.string().describe('Where in the property'),
  severity: z.enum(['life_threatening', 'serious', 'moderate', 'minor']),
  exposureDuration: z.string().describe('How long exposed'),
  knownHealthRisks: z.array(z.string()).describe('Medical conditions this causes'),
  regulatoryViolations: z.array(z.string()).describe('What codes/laws violated'),
  remediationRequired: z.string(),
  estimatedRemediationCost: z.number().optional()
});

const MedicalImpactSchema = z.object({
  condition: z.string().describe('Medical condition/symptom'),
  affectedPerson: z.string().describe('Who is affected'),
  ageGroup: z.enum(['child', 'adult', 'elderly', 'pregnant']).optional(),
  vulnerabilityFactors: z.array(z.string()).optional().describe('Pre-existing conditions, age, etc.'),
  symptoms: z.array(z.string()),
  diagnosisDate: z.string().optional(),
  medicalTreatment: z.array(z.string()).optional(),
  ongoingCare: z.boolean().default(false),
  linkedHazards: z.array(z.string()).describe('Which hazards caused this'),
  causationStrength: z.enum(['definite', 'probable', 'possible', 'unrelated']),
  medicalCosts: z.object({
    pastCosts: z.number(),
    estimatedFutureCosts: z.number(),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.number()
    }))
  }),
  disability: z.object({
    temporary: z.boolean(),
    permanent: z.boolean(),
    impactOnDaily Life: z.string()
  }).optional(),
  documentationAvailable: z.array(z.string()).describe('Medical records, bills, etc.')
});

const HealthAnalysisSchema = z.object({
  hazards: z.array(HealthHazardSchema),
  medicalImpacts: z.array(MedicalImpactSchema),
  overallSeverity: z.enum(['extreme', 'high', 'moderate', 'low']),
  vulnerablePopulations: z.array(z.string()).describe('Children, elderly, pregnant people affected'),
  totalMedicalCosts: z.object({
    past: z.number(),
    future: z.number(),
    total: z.number()
  }),
  expertWitnessNeeded: z.boolean(),
  recommendedExperts: z.array(z.string()).describe('Types of experts needed'),
  causationAnalysis: z.string().describe('How hazards caused health impacts'),
  legalStrength: z.number().min(0).max(10),
  recommendations: z.array(z.string()),
  urgencyLevel: z.enum(['immediate', 'high', 'moderate', 'low'])
});

export default class HealthImpactAnalyzerAgent {
  constructor(openaiApiKey) {
    this.openai = new OpenAI({ apiKey: openaiApiKey || process.env.OPENAI_API_KEY });
    this.model = 'gpt-4-turbo-preview';
    
    // Medical knowledge base
    this.hazardHealthImpacts = {
      mold: [
        'Respiratory infections',
        'Asthma exacerbation',
        'Allergic reactions',
        'Chronic cough',
        'Eye irritation',
        'Skin rashes',
        'Headaches',
        'Fatigue'
      ],
      lead_paint: [
        'Developmental delays in children',
        'Learning disabilities',
        'Behavioral problems',
        'Anemia',
        'Kidney damage',
        'Nervous system damage'
      ],
      carbon_monoxide: [
        'Headaches',
        'Dizziness',
        'Nausea',
        'Confusion',
        'Death (in severe cases)',
        'Brain damage',
        'Heart problems'
      ],
      vermin: [
        'Allergies',
        'Asthma',
        'Disease transmission',
        'Bites and infections',
        'Psychological distress'
      ],
      sewage: [
        'Gastrointestinal illness',
        'Hepatitis A',
        'E. coli infection',
        'Respiratory infections',
        'Skin infections'
      ]
    };
  }

  /**
   * Analyze health impacts from case
   */
  async analyze(caseData, timelineAnalysis = null, options = {}) {
    console.log('🏥 Health Impact Analyzer: Assessing health and safety impacts...');

    // Identify hazards
    const hazards = await this.identifyHazards(caseData);
    
    // Analyze medical impacts
    const medicalImpacts = await this.analyzeMedicalImpacts(caseData, hazards);
    
    // Calculate medical costs
    const totalMedicalCosts = this.calculateTotalMedicalCosts(medicalImpacts);
    
    // Assess overall severity
    const overallSeverity = this.assessOverallSeverity(hazards, medicalImpacts);
    
    // Identify vulnerable populations
    const vulnerablePopulations = this.identifyVulnerablePopulations(caseData, medicalImpacts);
    
    // Determine expert needs
    const { expertWitnessNeeded, recommendedExperts } = this.determineExpertNeeds(
      hazards,
      medicalImpacts
    );
    
    // Generate causation analysis
    const causationAnalysis = await this.generateCausationAnalysis(
      hazards,
      medicalImpacts,
      timelineAnalysis
    );
    
    // Assess legal strength
    const legalStrength = this.assessLegalStrength(hazards, medicalImpacts, causationAnalysis);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      hazards,
      medicalImpacts,
      overallSeverity
    );
    
    // Determine urgency
    const urgencyLevel = this.determineUrgency(hazards, medicalImpacts, overallSeverity);

    const analysis = {
      hazards,
      medicalImpacts,
      overallSeverity,
      vulnerablePopulations,
      totalMedicalCosts,
      expertWitnessNeeded,
      recommendedExperts,
      causationAnalysis,
      legalStrength,
      recommendations,
      urgencyLevel
    };

    // Validate with Zod
    const validated = HealthAnalysisSchema.parse(analysis);

    console.log(`✅ Health analysis complete: ${hazards.length} hazards, ${medicalImpacts.length} medical impacts`);
    
    return validated;
  }

  /**
   * Identify health hazards from case conditions
   */
  async identifyHazards(caseData) {
    const prompt = `You are a health and safety expert analyzing a tenant's living conditions.

CASE FACTS:
${JSON.stringify(caseData, null, 2)}

TASK: Identify ALL health and safety hazards in this property.

For each hazard:
1. Type (mold, lead_paint, vermin, sewage, etc.)
2. Description (what is the hazard)
3. Location (where in the property)
4. Severity (life_threatening, serious, moderate, minor)
5. Exposure duration (how long the tenant has been exposed)
6. Known health risks (what medical conditions this causes)
7. Regulatory violations (building codes, health codes violated)
8. Remediation required (what must be done to fix it)
9. Estimated cost to remediate

Consider:
- Mold and water damage
- Pest infestations (rats, roaches, bedbugs)
- Lead paint (especially if children present)
- Carbon monoxide risks
- Sewage problems
- Electrical hazards
- Structural dangers
- Temperature extremes (no heat/AC)
- Inadequate ventilation
- Fire hazards

Be thorough. Every hazard strengthens the case.

Return as JSON with array of hazards.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a certified health and safety inspector with expertise in housing conditions.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.hazards || [];
  }

  /**
   * Analyze medical impacts on residents
   */
  async analyzeMedicalImpacts(caseData, hazards) {
    const prompt = `You are a medical expert analyzing health impacts from housing conditions.

CASE FACTS:
${JSON.stringify(caseData, null, 2)}

IDENTIFIED HAZARDS:
${JSON.stringify(hazards, null, 2)}

TASK: Analyze ALL medical impacts on the residents.

For each medical condition/symptom:
1. Condition (what is the health problem)
2. Affected person (who has this condition)
3. Age group and vulnerability factors
4. Symptoms
5. Diagnosis date (if known)
6. Medical treatment received
7. Ongoing care needed
8. Linked hazards (which hazards caused this)
9. Causation strength (definite/probable/possible/unrelated)
10. Medical costs (past and estimated future)
11. Any disability (temporary or permanent)
12. Available documentation

Pay special attention to:
- Children (more vulnerable to lead, mold, vermin)
- Elderly (respiratory issues, temperature)
- Pregnant women (all hazards)
- Pre-existing conditions (asthma, allergies)

Establish clear causation between hazards and health impacts.

Return as JSON with array of medicalImpacts.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a medical doctor specializing in environmental health impacts.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.medicalImpacts || [];
  }

  /**
   * Calculate total medical costs
   */
  calculateTotalMedicalCosts(medicalImpacts) {
    let pastTotal = 0;
    let futureTotal = 0;

    for (const impact of medicalImpacts) {
      pastTotal += impact.medicalCosts.pastCosts || 0;
      futureTotal += impact.medicalCosts.estimatedFutureCosts || 0;
    }

    return {
      past: pastTotal,
      future: futureTotal,
      total: pastTotal + futureTotal
    };
  }

  /**
   * Assess overall severity
   */
  assessOverallSeverity(hazards, medicalImpacts) {
    // Check for life-threatening conditions
    const hasLifeThreatening = hazards.some(h => h.severity === 'life_threatening') ||
                               medicalImpacts.some(m => m.causationStrength === 'definite' && 
                                                       m.symptoms.some(s => s.toLowerCase().includes('death') || 
                                                                           s.toLowerCase().includes('poisoning')));
    if (hasLifeThreatening) return 'extreme';

    // Check for serious conditions
    const seriousHazards = hazards.filter(h => h.severity === 'serious').length;
    const definiteCausation = medicalImpacts.filter(m => m.causationStrength === 'definite').length;
    
    if (seriousHazards >= 2 || definiteCausation >= 2) return 'high';
    if (seriousHazards >= 1 || definiteCausation >= 1) return 'moderate';
    
    return 'low';
  }

  /**
   * Identify vulnerable populations affected
   */
  identifyVulnerablePopulations(caseData, medicalImpacts) {
    const vulnerable = [];

    for (const impact of medicalImpacts) {
      if (impact.ageGroup === 'child') {
        vulnerable.push(`${impact.affectedPerson} (child)`);
      } else if (impact.ageGroup === 'elderly') {
        vulnerable.push(`${impact.affectedPerson} (elderly)`);
      } else if (impact.ageGroup === 'pregnant') {
        vulnerable.push(`${impact.affectedPerson} (pregnant)`);
      }

      if (impact.vulnerabilityFactors && impact.vulnerabilityFactors.length > 0) {
        vulnerable.push(`${impact.affectedPerson} (${impact.vulnerabilityFactors.join(', ')})`);
      }
    }

    // Deduplicate
    return [...new Set(vulnerable)];
  }

  /**
   * Determine if expert witnesses are needed
   */
  determineExpertNeeds(hazards, medicalImpacts) {
    const experts = new Set();
    
    // Complex hazards need experts
    if (hazards.some(h => h.hazardType === 'mold')) {
      experts.add('Certified Mold Inspector');
      experts.add('Indoor Air Quality Specialist');
    }
    
    if (hazards.some(h => h.hazardType === 'lead_paint')) {
      experts.add('Lead Paint Inspector');
      experts.add('Pediatric Toxicologist');
    }
    
    if (hazards.some(h => h.hazardType === 'carbon_monoxide')) {
      experts.add('HVAC Specialist');
      experts.add('Emergency Medicine Physician');
    }
    
    if (hazards.some(h => h.hazardType === 'structural_danger')) {
      experts.add('Structural Engineer');
    }
    
    // Medical impacts need doctors
    if (medicalImpacts.length > 0) {
      experts.add('Treating Physician');
    }
    
    if (medicalImpacts.some(m => m.condition.toLowerCase().includes('respiratory'))) {
      experts.add('Pulmonologist');
    }
    
    if (medicalImpacts.some(m => m.ageGroup === 'child')) {
      experts.add('Pediatrician');
    }
    
    // High-value cases need experts
    const totalCosts = medicalImpacts.reduce((sum, m) => 
      sum + m.medicalCosts.pastCosts + m.medicalCosts.estimatedFutureCosts, 0
    );
    
    const expertWitnessNeeded = experts.size > 0 || totalCosts > 10000;
    
    return {
      expertWitnessNeeded,
      recommendedExperts: Array.from(experts)
    };
  }

  /**
   * Generate causation analysis linking hazards to health impacts
   */
  async generateCausationAnalysis(hazards, medicalImpacts, timelineAnalysis) {
    const prompt = `You are a medical-legal expert establishing causation.

HAZARDS:
${JSON.stringify(hazards, null, 2)}

MEDICAL IMPACTS:
${JSON.stringify(medicalImpacts, null, 2)}

${timelineAnalysis ? `TIMELINE:\n${JSON.stringify(timelineAnalysis, null, 2)}` : ''}

TASK: Write a clear causation analysis explaining how the housing conditions 
directly caused the health problems.

This analysis will be used in legal documents to prove liability and damages.

Structure:
1. Introduction (overview of hazardous conditions)
2. Specific causation chains (Hazard X → Symptom Y → Diagnosis Z)
3. Medical literature support (standard medical knowledge)
4. Timeline correlation (when exposure started vs when symptoms appeared)
5. Conclusion (clear statement of causation)

Make it scientifically sound and legally compelling.

Write 3-5 paragraphs.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a medical expert witness writing causation analysis for legal cases.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Assess legal strength of health claims
   */
  assessLegalStrength(hazards, medicalImpacts, causationAnalysis) {
    let score = 0;

    // Base score from number of hazards
    score += Math.min(hazards.length * 1, 3);

    // Severity bonus
    if (hazards.some(h => h.severity === 'life_threatening')) score += 3;
    else if (hazards.some(h => h.severity === 'serious')) score += 2;

    // Medical impacts with definite causation
    const definiteCausation = medicalImpacts.filter(m => m.causationStrength === 'definite').length;
    score += definiteCausation * 1.5;

    // Vulnerable populations
    const hasChildren = medicalImpacts.some(m => m.ageGroup === 'child');
    const hasElderly = medicalImpacts.some(m => m.ageGroup === 'elderly');
    if (hasChildren || hasElderly) score += 1;

    // Documentation
    const hasDocumentation = medicalImpacts.some(m => m.documentationAvailable.length > 0);
    if (hasDocumentation) score += 1.5;

    // Regulatory violations
    const hasViolations = hazards.some(h => h.regulatoryViolations.length > 0);
    if (hasViolations) score += 1;

    return Math.min(Math.round(score), 10);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(hazards, medicalImpacts, overallSeverity) {
    const recommendations = [];

    // Immediate action for severe cases
    if (overallSeverity === 'extreme' || overallSeverity === 'high') {
      recommendations.push('IMMEDIATE ACTION: Consider emergency housing relocation');
      recommendations.push('Document all conditions with professional inspection');
      recommendations.push('Obtain medical evaluations for all residents');
    }

    // Expert recommendations
    if (hazards.some(h => h.hazardType === 'mold')) {
      recommendations.push('Obtain certified mold inspection and air quality testing');
    }

    if (hazards.some(h => h.hazardType === 'lead_paint') && 
        medicalImpacts.some(m => m.ageGroup === 'child')) {
      recommendations.push('URGENT: Blood lead level testing for all children');
    }

    // Medical documentation
    if (medicalImpacts.length > 0) {
      recommendations.push('Collect all medical records, bills, and prescriptions');
      recommendations.push('Obtain written statements from treating physicians linking conditions to housing');
    }

    // Legal strategy
    recommendations.push('Include health impacts prominently in demand letter and complaint');
    recommendations.push('Request damages for past and future medical costs');
    
    if (medicalImpacts.some(m => m.disability && m.disability.permanent)) {
      recommendations.push('Claim permanent disability damages');
    }

    // Evidence
    recommendations.push('Photograph all hazardous conditions');
    recommendations.push('Keep daily symptom journal correlating symptoms with exposure');

    return recommendations;
  }

  /**
   * Determine urgency level
   */
  determineUrgency(hazards, medicalImpacts, overallSeverity) {
    // Life-threatening = immediate
    if (hazards.some(h => h.severity === 'life_threatening')) {
      return 'immediate';
    }

    // Carbon monoxide, lead with children = immediate
    if (hazards.some(h => h.hazardType === 'carbon_monoxide') ||
        (hazards.some(h => h.hazardType === 'lead_paint') && 
         medicalImpacts.some(m => m.ageGroup === 'child'))) {
      return 'immediate';
    }

    // Severe ongoing medical impacts = high
    if (overallSeverity === 'extreme' || overallSeverity === 'high') {
      return 'high';
    }

    // Multiple serious hazards = high
    if (hazards.filter(h => h.severity === 'serious').length >= 2) {
      return 'high';
    }

    // Everything else moderate or low
    return overallSeverity === 'moderate' ? 'moderate' : 'low';
  }

  /**
   * Generate health report for legal documents
   */
  generateHealthReport(healthAnalysis, format = 'text') {
    if (format === 'text') {
      return this.generateTextReport(healthAnalysis);
    } else if (format === 'json') {
      return healthAnalysis;
    }
  }

  /**
   * Generate formatted text report
   */
  generateTextReport(analysis) {
    let report = '\n';
    report += '═══════════════════════════════════════════════════════════════════\n';
    report += '                HEALTH & SAFETY IMPACT ANALYSIS                     \n';
    report += '═══════════════════════════════════════════════════════════════════\n\n';

    report += `Overall Severity: ${analysis.overallSeverity.toUpperCase()}\n`;
    report += `Urgency Level: ${analysis.urgencyLevel.toUpperCase()}\n`;
    report += `Legal Strength: ${analysis.legalStrength}/10\n`;
    report += `Total Medical Costs: $${analysis.totalMedicalCosts.total.toLocaleString()}\n\n`;

    if (analysis.vulnerablePopulations.length > 0) {
      report += '⚠️  VULNERABLE POPULATIONS AFFECTED:\n';
      analysis.vulnerablePopulations.forEach(p => {
        report += `   • ${p}\n`;
      });
      report += '\n';
    }

    report += '───────────────────────────────────────────────────────────────────\n';
    report += `  HEALTH HAZARDS IDENTIFIED (${analysis.hazards.length})\n`;
    report += '───────────────────────────────────────────────────────────────────\n\n';

    analysis.hazards.forEach((hazard, i) => {
      const severityIcon = {
        life_threatening: '🔴',
        serious: '🟠',
        moderate: '🟡',
        minor: '⚪'
      }[hazard.severity];

      report += `${i + 1}. ${severityIcon} ${hazard.hazardType.toUpperCase()} - ${hazard.severity}\n`;
      report += `   Location: ${hazard.location}\n`;
      report += `   ${hazard.description}\n`;
      report += `   Exposure: ${hazard.exposureDuration}\n`;
      report += `   Health Risks: ${hazard.knownHealthRisks.join(', ')}\n`;
      if (hazard.regulatoryViolations.length > 0) {
        report += `   Violations: ${hazard.regulatoryViolations.join(', ')}\n`;
      }
      report += `   Remediation: ${hazard.remediationRequired}\n`;
      if (hazard.estimatedRemediationCost) {
        report += `   Cost to Fix: $${hazard.estimatedRemediationCost.toLocaleString()}\n`;
      }
      report += '\n';
    });

    report += '───────────────────────────────────────────────────────────────────\n';
    report += `  MEDICAL IMPACTS (${analysis.medicalImpacts.length})\n`;
    report += '───────────────────────────────────────────────────────────────────\n\n';

    analysis.medicalImpacts.forEach((impact, i) => {
      const causationIcon = {
        definite: '✅',
        probable: '🟢',
        possible: '🟡',
        unrelated: '⚪'
      }[impact.causationStrength];

      report += `${i + 1}. ${causationIcon} ${impact.condition} - ${impact.affectedPerson}\n`;
      if (impact.ageGroup) {
        report += `   Age Group: ${impact.ageGroup}\n`;
      }
      report += `   Symptoms: ${impact.symptoms.join(', ')}\n`;
      report += `   Causation: ${impact.causationStrength} - Linked to: ${impact.linkedHazards.join(', ')}\n`;
      report += `   Medical Costs: $${(impact.medicalCosts.pastCosts + impact.medicalCosts.estimatedFutureCosts).toLocaleString()}\n`;
      report += `     Past: $${impact.medicalCosts.pastCosts.toLocaleString()}, Future: $${impact.medicalCosts.estimatedFutureCosts.toLocaleString()}\n`;
      if (impact.disability) {
        report += `   Disability: ${impact.disability.temporary ? 'Temporary' : ''} ${impact.disability.permanent ? 'Permanent' : ''}\n`;
        report += `   Impact: ${impact.disability.impactOnDailyLife}\n`;
      }
      if (impact.documentationAvailable.length > 0) {
        report += `   Documentation: ${impact.documentationAvailable.join(', ')}\n`;
      }
      report += '\n';
    });

    report += '───────────────────────────────────────────────────────────────────\n';
    report += '  CAUSATION ANALYSIS\n';
    report += '───────────────────────────────────────────────────────────────────\n\n';
    report += analysis.causationAnalysis + '\n\n';

    if (analysis.expertWitnessNeeded) {
      report += '───────────────────────────────────────────────────────────────────\n';
      report += '  RECOMMENDED EXPERT WITNESSES\n';
      report += '───────────────────────────────────────────────────────────────────\n\n';
      analysis.recommendedExperts.forEach(expert => {
        report += `   • ${expert}\n`;
      });
      report += '\n';
    }

    report += '───────────────────────────────────────────────────────────────────\n';
    report += '  RECOMMENDATIONS\n';
    report += '───────────────────────────────────────────────────────────────────\n\n';
    analysis.recommendations.forEach((rec, i) => {
      report += `${i + 1}. ${rec}\n`;
    });
    report += '\n';

    report += '═══════════════════════════════════════════════════════════════════\n';

    return report;
  }
}
