/**
 * DAMAGES CALCULATOR AGENT
 * 
 * Job: Calculate monetary damages with legal precision
 * 
 * This agent turns facts + legal analysis into dollar amounts.
 * It considers:
 * - Rent abatement (loss of use)
 * - Repair/remediation costs
 * - Security deposit return
 * - Relocation expenses
 * - Emotional distress
 * - Punitive damages (bad faith)
 * - Attorney fees
 */

const { z } = require('zod');

const DamagesSchema = z.object({
  conservative: z.object({
    total: z.number(),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.number(),
      calculation: z.string(),
      explanation: z.string(),
    })),
  }),
  
  aggressive: z.object({
    total: z.number(),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.number(),
      calculation: z.string(),
      explanation: z.string(),
    })),
  }),
  
  recommended: z.object({
    demandAmount: z.number(),
    settlementRange: z.object({
      low: z.number(),
      high: z.number(),
    }),
    rationale: z.string(),
  }),
  
  categories: z.object({
    rentAbatement: z.object({
      conservative: z.number(),
      aggressive: z.number(),
      calculation: z.string(),
      monthsAffected: z.number(),
      percentUninhabitable: z.number(),
    }),
    
    securityDeposit: z.object({
      amount: z.number(),
      returnable: z.boolean(),
      explanation: z.string(),
    }),
    
    repairCosts: z.object({
      conservative: z.number(),
      aggressive: z.number(),
      items: z.array(z.object({
        item: z.string(),
        estimatedCost: z.number(),
        source: z.string(), // market rate, quote, etc.
      })),
    }),
    
    relocationCosts: z.object({
      moving: z.number(),
      storageFees: z.number(),
      temporaryHousing: z.number(),
      total: z.number(),
    }).optional(),
    
    lossOfUse: z.object({
      conservative: z.number(),
      aggressive: z.number(),
      explanation: z.string(),
    }).optional(),
    
    emotionalDistress: z.object({
      conservative: z.number(),
      aggressive: z.number(),
      factors: z.array(z.string()),
      explanation: z.string(),
    }).optional(),
    
    punitiveRange: z.object({
      min: z.number(),
      max: z.number(),
      available: z.boolean(),
      basisForClaim: z.string(),
    }).optional(),
    
    attorneyFees: z.object({
      estimated: z.number(),
      availableUnderStatute: z.boolean(),
      statute: z.string().optional(),
      explanation: z.string(),
    }),
  }),
  
  metadata: z.object({
    calculationDate: z.string(),
    assumptions: z.array(z.string()),
    uncertainties: z.array(z.string()),
    agent: z.string(),
  }),
});

class DamagesCalculator {
  constructor() {
    this.version = '1.0';
  }

  /**
   * Main calculation function
   * @param {object} caseData - From IntakeAgent
   * @param {object} legalAnalysis - From LegalMapperAgent
   * @returns {object} Damages calculation
   */
  calculate(caseData, legalAnalysis) {
    try {
      // Calculate each category
      const rentAbatement = this.calculateRentAbatement(caseData);
      const securityDeposit = this.calculateSecurityDeposit(caseData);
      const repairCosts = this.calculateRepairCosts(caseData);
      const relocationCosts = this.calculateRelocationCosts(caseData);
      const lossOfUse = this.calculateLossOfUse(caseData);
      const emotionalDistress = this.calculateEmotionalDistress(caseData, legalAnalysis);
      const punitiveRange = this.calculatePunitiveDamages(caseData, legalAnalysis);
      const attorneyFees = this.calculateAttorneyFees(caseData, legalAnalysis);

      // Build conservative estimate
      const conservative = this.buildConservativeEstimate({
        rentAbatement,
        securityDeposit,
        repairCosts,
        relocationCosts,
        lossOfUse,
        emotionalDistress,
        punitiveRange,
        attorneyFees,
      });

      // Build aggressive estimate
      const aggressive = this.buildAggressiveEstimate({
        rentAbatement,
        securityDeposit,
        repairCosts,
        relocationCosts,
        lossOfUse,
        emotionalDistress,
        punitiveRange,
        attorneyFees,
      });

      // Recommended demand/settlement
      const recommended = this.calculateRecommendation(conservative, aggressive, legalAnalysis);

      const result = {
        conservative,
        aggressive,
        recommended,
        categories: {
          rentAbatement,
          securityDeposit,
          repairCosts,
          relocationCosts,
          lossOfUse,
          emotionalDistress,
          punitiveRange,
          attorneyFees,
        },
        metadata: {
          calculationDate: new Date().toISOString(),
          assumptions: this.getAssumptions(caseData),
          uncertainties: this.getUncertainties(caseData),
          agent: 'DamagesCalculator',
        },
      };

      // Validate
      const validated = DamagesSchema.parse(result);

      return {
        success: true,
        data: validated,
      };

    } catch (error) {
      console.error('DamagesCalculator error:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * RENT ABATEMENT CALCULATION
   * Formula: (% of home uninhabitable) × (months affected) × (monthly rent)
   */
  calculateRentAbatement(caseData) {
    const monthlyRent = caseData.lease.monthlyRent;
    const durationDays = caseData.timeline.durationDays || 0;
    const monthsAffected = durationDays / 30;

    // Determine % uninhabitable based on issues
    const percentUninhabitable = this.assessUninhabitablePercent(caseData);

    const conservative = monthlyRent * monthsAffected * (percentUninhabitable - 0.1); // Reduce by 10%
    const aggressive = monthlyRent * monthsAffected * percentUninhabitable;

    return {
      conservative: Math.round(conservative),
      aggressive: Math.round(aggressive),
      calculation: `${Math.round(percentUninhabitable * 100)}% × ${monthsAffected.toFixed(1)} months × $${monthlyRent}/month`,
      monthsAffected: monthsAffected,
      percentUninhabitable: percentUninhabitable,
    };
  }

  assessUninhabitablePercent(caseData) {
    let percent = 0;

    for (const issue of caseData.issues) {
      const severity = issue.severity;
      const category = issue.category;

      // Major habitability issues
      if (category === 'water_leak' || category === 'mold') {
        if (severity === 'uninhabitable') percent += 0.40;
        else if (severity === 'severe') percent += 0.30;
        else if (severity === 'major') percent += 0.20;
        else percent += 0.10;
      }

      // Lost bathroom
      if (category === 'plumbing_failure' && issue.description.includes('bathroom')) {
        if (severity === 'uninhabitable' || severity === 'severe') {
          // Lost 1 bathroom in 3BR house = significant loss
          percent += 0.25;
        }
      }

      // No heat/AC
      if (category === 'no_heat' || category === 'no_ac') {
        if (severity === 'severe' || severity === 'uninhabitable') percent += 0.30;
        else percent += 0.15;
      }

      // No water
      if (category === 'no_water' || category === 'no_hot_water') {
        if (severity === 'uninhabitable') percent += 0.50;
        else percent += 0.25;
      }

      // Pest infestation
      if (category === 'pest_infestation') {
        if (severity === 'severe') percent += 0.20;
        else percent += 0.10;
      }

      // Structural
      if (category === 'structural_damage') {
        percent += 0.30;
      }
    }

    // Cap at 100%
    return Math.min(percent, 1.0);
  }

  /**
   * SECURITY DEPOSIT
   */
  calculateSecurityDeposit(caseData) {
    const amount = caseData.lease.securityDeposit || 0;
    
    // If tenant is moving out or breaking lease, deposit should be returned
    const returnable = caseData.desiredOutcome?.breakLease || amount > 0;

    return {
      amount,
      returnable,
      explanation: returnable 
        ? 'Security deposit should be returned in full given landlord\'s failure to maintain property.'
        : 'Security deposit not yet owed.',
    };
  }

  /**
   * REPAIR COSTS
   */
  calculateRepairCosts(caseData) {
    const items = [];
    let conservativeTotal = 0;
    let aggressiveTotal = 0;

    for (const issue of caseData.issues) {
      const costs = this.getRepairCostEstimate(issue);
      items.push(costs);
      conservativeTotal += costs.estimatedCost * 0.8; // Conservative = 80%
      aggressiveTotal += costs.estimatedCost * 1.2; // Aggressive = 120%
    }

    return {
      conservative: Math.round(conservativeTotal),
      aggressive: Math.round(aggressiveTotal),
      items,
    };
  }

  getRepairCostEstimate(issue) {
    // Market rate estimates (2024-2025)
    const costMap = {
      water_leak: { item: 'Roof/plumbing leak repair', cost: 3500, source: 'Industry average' },
      mold: { item: 'Professional mold remediation', cost: 5000, source: 'EPA guidelines' },
      plumbing_failure: { item: 'Plumbing system repair', cost: 2500, source: 'Plumber estimate' },
      no_heat: { item: 'HVAC repair/replacement', cost: 4000, source: 'HVAC contractor' },
      no_ac: { item: 'AC repair/replacement', cost: 3500, source: 'HVAC contractor' },
      structural_damage: { item: 'Structural repairs', cost: 8000, source: 'Contractor estimate' },
      pest_infestation: { item: 'Pest remediation', cost: 1500, source: 'Exterminator' },
      electrical_hazard: { item: 'Electrical repairs', cost: 2000, source: 'Electrician' },
      roof_leak: { item: 'Roof repair', cost: 4500, source: 'Roofing contractor' },
    };

    const estimate = costMap[issue.category] || { item: 'Repair costs', cost: 1000, source: 'Estimate' };
    
    // Adjust for severity
    let multiplier = 1.0;
    if (issue.severity === 'uninhabitable') multiplier = 1.5;
    else if (issue.severity === 'severe') multiplier = 1.3;
    else if (issue.severity === 'major') multiplier = 1.1;

    return {
      item: estimate.item,
      estimatedCost: Math.round(estimate.cost * multiplier),
      source: estimate.source,
    };
  }

  /**
   * RELOCATION COSTS
   */
  calculateRelocationCosts(caseData) {
    if (!caseData.desiredOutcome?.breakLease) {
      return undefined; // Not seeking relocation
    }

    // Standard relocation cost estimates
    const moving = 1500; // Moving company
    const storageFees = 500; // 2-3 months storage
    const temporaryHousing = 0; // If they stayed elsewhere, calculate

    return {
      moving,
      storageFees,
      temporaryHousing,
      total: moving + storageFees + temporaryHousing,
    };
  }

  /**
   * LOSS OF USE (beyond rent abatement)
   * E.g., couldn't host family, lost guest room, etc.
   */
  calculateLossOfUse(caseData) {
    const durationMonths = (caseData.timeline.durationDays || 0) / 30;
    
    // Estimate value of lost amenities
    const conservative = durationMonths * 200; // $200/month
    const aggressive = durationMonths * 500; // $500/month

    return {
      conservative: Math.round(conservative),
      aggressive: Math.round(aggressive),
      explanation: 'Loss of full use and enjoyment of property, inability to host guests, lost amenity value.',
    };
  }

  /**
   * EMOTIONAL DISTRESS
   * Based on severity, health impact, children
   */
  calculateEmotionalDistress(caseData, legalAnalysis) {
    const factors = [];
    let multiplier = 1.0;

    // Health issues
    if (caseData.healthImpact?.hasHealthIssues) {
      factors.push('Documented health issues from conditions');
      multiplier += 0.5;
    }

    // Children affected
    if (caseData.tenant.hasChildren) {
      factors.push('Children exposed to unsafe conditions');
      multiplier += 0.5;
    }

    // Duration
    const durationMonths = (caseData.timeline.durationDays || 0) / 30;
    if (durationMonths > 3) {
      factors.push('Extended duration of unsafe living conditions');
      multiplier += 0.3;
    }

    // Severity
    const hasUninhabitable = caseData.issues.some(i => i.severity === 'uninhabitable');
    if (hasUninhabitable) {
      factors.push('Uninhabitable conditions');
      multiplier += 0.5;
    }

    // Bad faith
    const hasBadFaith = legalAnalysis?.legalTheories?.some(t => t.theory === 'bad_faith');
    if (hasBadFaith) {
      factors.push('Landlord acted in bad faith');
      multiplier += 0.4;
    }

    // Base amount
    const baseAmount = 5000;
    const conservative = baseAmount * multiplier * 0.6;
    const aggressive = baseAmount * multiplier * 1.4;

    return {
      conservative: Math.round(conservative),
      aggressive: Math.round(aggressive),
      factors,
      explanation: 'Mental anguish, stress, anxiety from living in unsafe conditions and landlord\'s refusal to repair.',
    };
  }

  /**
   * PUNITIVE DAMAGES
   * Available if bad faith / willful conduct
   */
  calculatePunitiveDamages(caseData, legalAnalysis) {
    // Check if bad faith applies
    const hasBadFaith = legalAnalysis?.legalTheories?.some(t => t.theory === 'bad_faith');
    const badFaithStatute = legalAnalysis?.attorneyFeesAvailable?.available;

    if (!hasBadFaith && !badFaithStatute) {
      return {
        min: 0,
        max: 0,
        available: false,
        basisForClaim: 'No basis for punitive damages identified.',
      };
    }

    // In Georgia, punitive damages can be substantial for willful/wanton conduct
    // Typically 1x-3x compensatory damages
    
    // Estimate compensatory (excluding punitive)
    const estimatedCompensatory = 30000; // Rough estimate

    return {
      min: estimatedCompensatory * 0.5,
      max: estimatedCompensatory * 2.0,
      available: true,
      basisForClaim: 'Landlord\'s willful and wanton disregard for tenant safety, bad faith failure to repair despite repeated notice.',
    };
  }

  /**
   * ATTORNEY FEES
   */
  calculateAttorneyFees(caseData, legalAnalysis) {
    const available = legalAnalysis?.attorneyFeesAvailable?.available || false;
    const statute = legalAnalysis?.attorneyFeesAvailable?.statute;

    // Estimate attorney fees if case goes to litigation
    const estimatedHours = 40; // Pre-trial + trial
    const hourlyRate = 350; // Market rate for tenant attorney
    const estimated = estimatedHours * hourlyRate;

    return {
      estimated,
      availableUnderStatute: available,
      statute,
      explanation: available 
        ? `Attorney fees likely recoverable under ${statute} if case proceeds and tenant prevails.`
        : 'Attorney fees may not be recoverable unless landlord acts in bad faith.',
    };
  }

  /**
   * BUILD ESTIMATES
   */
  buildConservativeEstimate(categories) {
    const breakdown = [
      {
        category: 'Rent Abatement',
        amount: categories.rentAbatement.conservative,
        calculation: categories.rentAbatement.calculation,
        explanation: 'Reduced rent value for period property was not fully habitable',
      },
      {
        category: 'Security Deposit Return',
        amount: categories.securityDeposit.returnable ? categories.securityDeposit.amount : 0,
        calculation: `$${categories.securityDeposit.amount}`,
        explanation: categories.securityDeposit.explanation,
      },
      {
        category: 'Repair Costs',
        amount: categories.repairCosts.conservative,
        calculation: 'Professional remediation estimates',
        explanation: 'Cost to bring property to habitable standard',
      },
    ];

    if (categories.relocationCosts) {
      breakdown.push({
        category: 'Relocation Costs',
        amount: categories.relocationCosts.total,
        calculation: 'Moving + storage + temporary housing',
        explanation: 'Costs to relocate due to uninhabitable conditions',
      });
    }

    if (categories.lossOfUse) {
      breakdown.push({
        category: 'Loss of Use',
        amount: categories.lossOfUse.conservative,
        calculation: categories.lossOfUse.explanation,
        explanation: 'Diminished value and enjoyment',
      });
    }

    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

    return { total, breakdown };
  }

  buildAggressiveEstimate(categories) {
    const breakdown = [
      {
        category: 'Rent Abatement',
        amount: categories.rentAbatement.aggressive,
        calculation: categories.rentAbatement.calculation,
        explanation: 'Full rent value for uninhabitable period',
      },
      {
        category: 'Security Deposit Return',
        amount: categories.securityDeposit.returnable ? categories.securityDeposit.amount : 0,
        calculation: `$${categories.securityDeposit.amount}`,
        explanation: categories.securityDeposit.explanation,
      },
      {
        category: 'Repair/Remediation Costs',
        amount: categories.repairCosts.aggressive,
        calculation: 'Full professional estimates',
        explanation: 'Complete remediation and repair',
      },
    ];

    if (categories.relocationCosts) {
      breakdown.push({
        category: 'Relocation Costs',
        amount: categories.relocationCosts.total,
        calculation: 'All moving expenses',
        explanation: 'Forced relocation costs',
      });
    }

    if (categories.lossOfUse) {
      breakdown.push({
        category: 'Loss of Use',
        amount: categories.lossOfUse.aggressive,
        calculation: categories.lossOfUse.explanation,
        explanation: 'Full loss of enjoyment value',
      });
    }

    if (categories.emotionalDistress) {
      breakdown.push({
        category: 'Emotional Distress',
        amount: categories.emotionalDistress.aggressive,
        calculation: categories.emotionalDistress.explanation,
        explanation: 'Mental anguish and suffering',
      });
    }

    if (categories.punitiveRange && categories.punitiveRange.available) {
      breakdown.push({
        category: 'Punitive Damages',
        amount: categories.punitiveRange.min, // Use min for aggressive total
        calculation: categories.punitiveRange.basisForClaim,
        explanation: 'Punitive for willful/wanton conduct',
      });
    }

    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

    return { total, breakdown };
  }

  calculateRecommendation(conservative, aggressive, legalAnalysis) {
    // Recommended demand: split between conservative and aggressive
    const demandAmount = Math.round((conservative.total + aggressive.total) / 2);

    // Settlement range: 60-80% of demand
    const settlementLow = Math.round(demandAmount * 0.60);
    const settlementHigh = Math.round(demandAmount * 0.80);

    const strength = legalAnalysis?.strengthAssessment?.overallScore || 5;
    
    let rationale = `Based on case strength (${strength}/10), recommend demanding $${demandAmount.toLocaleString()}. `;
    rationale += `Reasonable settlement range: $${settlementLow.toLocaleString()} - $${settlementHigh.toLocaleString()}. `;
    
    if (strength >= 7) {
      rationale += 'Strong case supports higher demand.';
    } else if (strength >= 5) {
      rationale += 'Moderate case; settlement likely.';
    } else {
      rationale += 'Weaker case; be flexible on settlement.';
    }

    return {
      demandAmount,
      settlementRange: { low: settlementLow, high: settlementHigh },
      rationale,
    };
  }

  getAssumptions(caseData) {
    return [
      'Market rate repair costs (2024-2025 prices)',
      'Tenant followed proper notice procedures',
      'Evidence substantiates claims',
      'Jurisdiction allows claimed damages',
      'No tenant-caused damage',
    ];
  }

  getUncertainties(caseData) {
    const uncertainties = [];
    
    if (!caseData.timeline.firstNotificationToLandlord) {
      uncertainties.push('Date of first landlord notification unclear');
    }
    
    if (!caseData.healthImpact?.medicalDocumentation) {
      uncertainties.push('No medical documentation for health claims');
    }
    
    if (caseData.timeline.durationDays < 30) {
      uncertainties.push('Short duration may limit damages');
    }
    
    return uncertainties;
  }
}

module.exports = { DamagesCalculator, DamagesSchema };

// Example usage:
/*
const calculator = new DamagesCalculator();

// Assuming you have caseData and legalAnalysis from previous agents
const damages = calculator.calculate(caseData, legalAnalysis);

console.log('Conservative Total:', damages.data.conservative.total);
console.log('Aggressive Total:', damages.data.aggressive.total);
console.log('Recommended Demand:', damages.data.recommended.demandAmount);
console.log('Settlement Range:', damages.data.recommended.settlementRange);
*/
