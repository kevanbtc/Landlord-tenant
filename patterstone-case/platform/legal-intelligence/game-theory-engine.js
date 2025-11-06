t*dd ing CommandEvent*
 * GAME THEORY ENGINE
 * 
 * Apply game theory, decision trees, and Monte Carlo simulation
 * to optimize legal strategy and predict outcomes
 */

import OpenAI from 'openai';
import winston from 'winston';
import { parse } from 'json2csv';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'game-theory-engine.log' })
  ]
});

export class GameTheoryEngine {
  constructor() {
    this.llm = openai;
  }

  validateInputs(caseData, legalAnalysis) {
    if (!caseData || !legalAnalysis || !legalAnalysis.damages) {
      throw new Error('Invalid input data: caseData and legalAnalysis with damages are required');
    }
  }

  async analyzeCase(caseData, legalAnalysis, opponentProfile = null) {
    this.validateInputs(caseData, legalAnalysis);
    logger.info('Running game theory analysis...');
    
    // Rest of the code remains unchanged...
  }

  async runMonteCarloSimulation(caseData, legalAnalysis, opponentProfile, iterations = 10000) {
    // Simulation logic...
  }

  exportResultsToCSV(results) {
    const csv = parse(results);
    fs.writeFileSync('results.csv', csv);
  }

  async getAIRecommendations(caseDetails) {
    const response = await this.llm.createChatCompletion({
      messages: [
        { role: 'user', content: `Given the case details: ${JSON.stringify(caseDetails)}, what strategies should I consider?` }
      ]
    });
    return response.data.choices[0].message.content;
  }

  // Rest of the class implementation...
}

// Export default
export default GameTheoryEngine;
    // Build decision tree of all possible paths
    console.log('🌳 Building decision tree...');
    const decisionTree = this.buildDecisionTree(caseData, legalAnalysis);

    // Calculate expected values for each path
    console.log('💰 Calculating expected values...');
    const expectedValues = this.calculateExpectedValues(
      decisionTree,
      legalAnalysis,
      opponentProfile
    );

    // Find Nash equilibrium strategy
    console.log('⚖️ Finding Nash equilibrium...');
    const nashEquilibrium = this.findNashEquilibrium(
      expectedValues,
      opponentProfile
    );

    // Run Monte Carlo simulation
    console.log('🎰 Running Monte Carlo simulation (10,000 iterations)...');
    const simulations = await this.runMonteCarloSimulation(
      caseData,
      legalAnalysis,
      opponentProfile,
      10000
    );

    // Generate optimal strategy
    console.log('🎯 Generating optimal strategy...');
    const optimalStrategy = this.generateOptimalStrategy({
      decisionTree,
      expectedValues,
      nashEquilibrium,
      simulations
    });

    console.log('✅ Game theory analysis complete\n');

    return {
      decisionTree,
      expectedValues,
      nashEquilibrium,
      simulations,
      optimalStrategy,
      recommendation: this.generateRecommendation(optimalStrategy, simulations)
    };
  }

  // ==========================================================================
  // DECISION TREE
  // ==========================================================================

  /**
   * Build tree of all possible case paths
   */
  buildDecisionTree(caseData, legalAnalysis) {
    const damages = legalAnalysis.damages || {};
    const caseStrength = legalAnalysis.caseStrength || 5;

    return {
      root: {
        action: 'File Complaint',
        cost: 500, // Filing fees
        time: 0,
        children: [
          {
            action: 'Defendant Answers',
            probability: 0.85,
            cost: 0,
            time: 30,
            children: [
              {
                action: 'Discovery Phase',
                cost: 2000,
                time: 120,
                children: [
                  {
                    action: 'Early Settlement (Pre-Discovery)',
                    probability: 0.25,
                    value: damages.conservative * 0.65,
                    cost: 2500,
                    time: 90
                  },
                  {
                    action: 'Motion for Summary Judgment (Us)',
                    probability: caseStrength > 7 ? 0.6 : 0.3,
                    cost: 5000,
                    time: 180,
                    children: [
                      {
                        action: 'MSJ Granted',
                        probability: caseStrength > 7 ? 0.5 : 0.2,
                        value: damages.aggressive,
                        cost: 5000,
                        time: 180
                      },
                      {
                        action: 'MSJ Denied',
                        probability: caseStrength > 7 ? 0.5 : 0.8,
                        cost: 5000,
                        time: 180,
                        children: [
                          {
                            action: 'Settlement (Pre-Trial)',
                            probability: 0.6,
                            value: damages.recommended * 0.80,
                            cost: 8000,
                            time: 270
                          },
                          {
                            action: 'Go to Trial',
                            probability: 0.4,
                            cost: 15000,
                            time: 365
                          }
                        ]
                      }
                    ]
                  },
                  {
                    action: 'Settlement (Post-Discovery)',
                    probability: 0.45,
                    value: damages.recommended * 0.85,
                    cost: 8000,
                    time: 240
                  },
                  {
                    action: 'Trial Preparation',
                    probability: 0.30,
                    cost: 15000,
                    time: 365,
                    children: [
                      {
                        action: 'Trial Win',
                        probability: caseStrength / 10 * 0.75,
                        value: damages.aggressive,
                        cost: 15000,
                        time: 365
                      },
                      {
                        action: 'Trial Loss',
                        probability: (10 - caseStrength) / 10 * 0.25,
                        value: 0,
                        cost: 15000,
                        time: 365
                      },
                      {
                        action: 'Last-Minute Settlement',
                        probability: 0.30,
                        value: damages.recommended * 0.90,
                        cost: 12000,
                        time: 330
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            action: 'Defendant Defaults',
            probability: 0.15,
            value: damages.aggressive,
            cost: 1000,
            time: 60
          }
        ]
      }
    };
  }

  // ==========================================================================
  // EXPECTED VALUE CALCULATIONS
  // ==========================================================================

  /**
   * Calculate expected value for each scenario
   */
  calculateExpectedValues(tree, legalAnalysis, opponentProfile) {
    const damages = legalAnalysis.damages || {};
    const caseStrength = legalAnalysis.caseStrength || 5;

    // Adjust probabilities based on opponent profile
    const settlementBonus = opponentProfile?.caseAnalysis?.settlementRate > 0.6 ? 0.1 : 0;

    const scenarios = [
      {
        path: 'Default Judgment',
        probability: 0.15,
        value: damages.aggressive,
        cost: 1000,
        time: 60,
        description: 'Defendant fails to respond - automatic win'
      },
      {
        path: 'Early Settlement',
        probability: 0.25 + settlementBonus,
        value: damages.conservative * 0.65,
        cost: 2500,
        time: 90,
        description: 'Settle before discovery - quick but cheap'
      },
      {
        path: 'Post-Discovery Settlement',
        probability: 0.35 + settlementBonus,
        value: damages.recommended * 0.85,
        cost: 8000,
        time: 240,
        description: 'Settle after discovery - good value'
      },
      {
        path: 'Pre-Trial Settlement',
        probability: 0.30 + settlementBonus,
        value: damages.recommended * 0.90,
        cost: 12000,
        time: 330,
        description: 'Settle week before trial - near full value'
      },
      {
        path: 'Trial Victory',
        probability: (caseStrength / 10) * 0.65,
        value: damages.aggressive,
        cost: 15000,
        time: 365,
        description: 'Win at trial - full damages + fees'
      },
      {
        path: 'Trial Loss',
        probability: ((10 - caseStrength) / 10) * 0.35,
        value: 0,
        cost: 15000,
        time: 365,
        description: 'Lose at trial - nothing recovered'
      },
      {
        path: 'Summary Judgment Win',
        probability: caseStrength > 7 ? 0.30 : 0.10,
        value: damages.aggressive,
        cost: 5000,
        time: 180,
        description: 'Win on MSJ - quick full victory'
      }
    ];

    // Calculate expected value for each scenario
    scenarios.forEach(scenario => {
      scenario.netValue = scenario.value - scenario.cost;
      scenario.expectedValue = scenario.netValue * scenario.probability;
      scenario.roi = scenario.netValue / scenario.cost;
      scenario.valuePerDay = scenario.netValue / scenario.time;
    });

    // Find optimal scenario
    const optimal = scenarios.reduce((best, current) =>
      current.expectedValue > best.expectedValue ? current : best
    );

    // Calculate weighted averages
    const totalProbability = scenarios.reduce((sum, s) => sum + s.probability, 0);
    const avgExpectedValue = scenarios.reduce((sum, s) => sum + s.expectedValue, 0);
    const avgTime = scenarios.reduce((sum, s) => sum + (s.time * s.probability), 0) / totalProbability;

    return {
      scenarios: scenarios.sort((a, b) => b.expectedValue - a.expectedValue),
      optimal,
      summary: {
        avgExpectedValue: Math.round(avgExpectedValue),
        avgTime: Math.round(avgTime),
        bestROI: scenarios.reduce((best, s) => s.roi > best ? s.roi : best, 0),
        bestValuePerDay: scenarios.reduce((best, s) => s.valuePerDay > best ? s.valuePerDay : best, 0)
      }
    };
  }

  // ==========================================================================
  // NASH EQUILIBRIUM
  // ==========================================================================

  /**
   * Find Nash equilibrium strategy
   */
  findNashEquilibrium(expectedValues, opponentProfile) {
    // Model as 2-player game
    const ourStrategies = [
      'aggressive-litigation',
      'moderate-approach',
      'settlement-focused'
    ];

    const theirStrategies = [
      'fight-to-trial',
      'negotiate',
      'settle-quick'
    ];

    // Build payoff matrix
    const payoffMatrix = this.buildPayoffMatrix(
      ourStrategies,
      theirStrategies,
      expectedValues,
      opponentProfile
    );

    // Find Nash equilibrium (simplified best response)
    const theirLikelyStrategy = this.predictOpponentStrategy(opponentProfile);
    const ourBestResponse = this.findBestResponse(theirLikelyStrategy, payoffMatrix);

    return {
      ourOptimalStrategy: ourBestResponse,
      theirLikelyStrategy,
      reasoning: this.explainEquilibrium(ourBestResponse, theirLikelyStrategy, opponentProfile),
      payoffMatrix
    };
  }

  /**
   * Build game theory payoff matrix
   */
  buildPayoffMatrix(ourStrategies, theirStrategies, expectedValues, opponentProfile) {
    const matrix = {};

    for (const ourStrat of ourStrategies) {
      matrix[ourStrat] = {};
      
      for (const theirStrat of theirStrategies) {
        // Estimate payoffs for each strategy combination
        matrix[ourStrat][theirStrat] = this.estimatePayoff(
          ourStrat,
          theirStrat,
          expectedValues,
          opponentProfile
        );
      }
    }

    return matrix;
  }

  /**
   * Estimate payoff for strategy combination
   */
  estimatePayoff(ourStrategy, theirStrategy, expectedValues, opponentProfile) {
    const optimal = expectedValues.optimal;

    // Simplified payoff estimation
    let payoff = optimal.expectedValue;

    if (ourStrategy === 'aggressive-litigation' && theirStrategy === 'settle-quick') {
      payoff *= 1.2; // They cave, we get more
    } else if (ourStrategy === 'settlement-focused' && theirStrategy === 'fight-to-trial') {
      payoff *= 0.7; // We want to settle but they fight
    } else if (ourStrategy === 'moderate-approach') {
      payoff *= 0.95; // Balanced approach
    }

    return Math.round(payoff);
  }

  /**
   * Predict opponent's most likely strategy
   */
  predictOpponentStrategy(opponentProfile) {
    if (!opponentProfile) return 'negotiate';

    const settlementRate = opponentProfile.caseAnalysis?.settlementRate || '50%';
    const rate = parseFloat(settlementRate) / 100;

    if (rate > 0.7) return 'settle-quick';
    if (rate < 0.3) return 'fight-to-trial';
    return 'negotiate';
  }

  /**
   * Find best response to opponent's strategy
   */
  findBestResponse(theirStrategy, payoffMatrix) {
    const payoffs = Object.keys(payoffMatrix).map(ourStrat => ({
      strategy: ourStrat,
      payoff: payoffMatrix[ourStrat][theirStrategy]
    }));

    const best = payoffs.reduce((max, current) =>
      current.payoff > max.payoff ? current : max
    );

    return best.strategy;
  }

  /**
   * Explain equilibrium reasoning
   */
  explainEquilibrium(ourStrategy, theirStrategy, opponentProfile) {
    const explanations = {
      'aggressive-litigation': {
        'settle-quick': 'Press hard - they cave easily. Maximize settlement value.',
        'negotiate': 'Strong position - they want to talk. Negotiate from strength.',
        'fight-to-trial': 'Prepare for battle - they won\'t back down easily.'
      },
      'moderate-approach': {
        'settle-quick': 'Match their pace - settle quickly but fairly.',
        'negotiate': 'Perfect match - productive negotiations likely.',
        'fight-to-trial': 'Prepare for trial but keep settlement door open.'
      },
      'settlement-focused': {
        'settle-quick': 'Quick resolution - both sides want out.',
        'negotiate': 'We want settlement - negotiate aggressively.',
        'fight-to-trial': 'Mismatch - may need to get more aggressive.'
      }
    };

    return explanations[ourStrategy]?.[theirStrategy] || 'Standard approach recommended.';
  }

  // ==========================================================================
  // MONTE CARLO SIMULATION
  // ==========================================================================

  /**
   * Run Monte Carlo simulation with thousands of iterations
   */
  async runMonteCarloSimulation(caseData, legalAnalysis, opponentProfile, iterations = 10000) {
    const results = {
      defaultJudgments: 0,
      earlySettlements: 0,
      midSettlements: 0,
      lateSettlements: 0,
      trialWins: 0,
      trialLosses: 0,
      summaryJudgmentWins: 0,
      distribution: [],
      timeDistribution: [],
      costDistribution: []
    };

    // Run simulations
    for (let i = 0; i < iterations; i++) {
      const outcome = this.simulateSingleCase(
        caseData,
        legalAnalysis,
        opponentProfile
      );

      // Categorize outcome
      switch (outcome.type) {
        case 'default':
          results.defaultJudgments++;
          break;
        case 'early-settlement':
          results.earlySettlements++;
          break;
        case 'mid-settlement':
          results.midSettlements++;
          break;
        case 'late-settlement':
          results.lateSettlements++;
          break;
        case 'trial-win':
          results.trialWins++;
          break;
        case 'trial-loss':
          results.trialLosses++;
          break;
        case 'summary-judgment':
          results.summaryJudgmentWins++;
          break;
      }

      results.distribution.push(outcome.value);
      results.timeDistribution.push(outcome.time);
      results.costDistribution.push(outcome.cost);
    }

    // Calculate statistics
    results.statistics = {
      mean: this.calculateMean(results.distribution),
      median: this.calculateMedian(results.distribution),
      stdDev: this.calculateStdDev(results.distribution),
      percentile10: this.calculatePercentile(results.distribution, 10),
      percentile25: this.calculatePercentile(results.distribution, 25),
      percentile50: this.calculatePercentile(results.distribution, 50),
      percentile75: this.calculatePercentile(results.distribution, 75),
      percentile90: this.calculatePercentile(results.distribution, 90),
      min: Math.min(...results.distribution),
      max: Math.max(...results.distribution),
      winRate: (results.trialWins + results.summaryJudgmentWins + 
                results.defaultJudgments + results.earlySettlements +
                results.midSettlements + results.lateSettlements) / iterations,
      avgTime: this.calculateMean(results.timeDistribution),
      avgCost: this.calculateMean(results.costDistribution)
    };

    return results;
  }

  /**
   * Simulate a single case outcome
   */
  simulateSingleCase(caseData, legalAnalysis, opponentProfile) {
    const damages = legalAnalysis.damages || {};
    const caseStrength = legalAnalysis.caseStrength || 5;
    const roll = Math.random();

    // 15% chance of default
    if (roll < 0.15) {
      return {
        type: 'default',
        value: this.randomNormal(damages.aggressive, 5000),
        time: this.randomNormal(60, 15),
        cost: this.randomNormal(1000, 200)
      };
    }

    // 25% chance early settlement
    if (roll < 0.40) {
      return {
        type: 'early-settlement',
        value: this.randomNormal(damages.conservative * 0.65, 5000),
        time: this.randomNormal(90, 20),
        cost: this.randomNormal(2500, 500)
      };
    }

    // 35% chance mid settlement
    if (roll < 0.75) {
      return {
        type: 'mid-settlement',
        value: this.randomNormal(damages.recommended * 0.85, 8000),
        time: this.randomNormal(240, 40),
        cost: this.randomNormal(8000, 1500)
      };
    }

    // Case goes to trial or late settlement
    const trialRoll = Math.random();

    // Chance of summary judgment
    if (caseStrength > 7 && trialRoll < 0.3) {
      return {
        type: 'summary-judgment',
        value: this.randomNormal(damages.aggressive, 10000),
        time: this.randomNormal(180, 30),
        cost: this.randomNormal(5000, 1000)
      };
    }

    // Late settlement (30% of remaining)
    if (trialRoll < 0.55) {
      return {
        type: 'late-settlement',
        value: this.randomNormal(damages.recommended * 0.90, 10000),
        time: this.randomNormal(330, 45),
        cost: this.randomNormal(12000, 2000)
      };
    }

    // Goes to trial
    const winProbability = (caseStrength / 10) * 0.75;
    const winRoll = Math.random();

    if (winRoll < winProbability) {
      return {
        type: 'trial-win',
        value: this.randomNormal(damages.aggressive, 15000),
        time: this.randomNormal(365, 60),
        cost: this.randomNormal(15000, 3000)
      };
    } else {
      return {
        type: 'trial-loss',
        value: 0,
        time: this.randomNormal(365, 60),
        cost: this.randomNormal(15000, 3000)
      };
    }
  }

  // ==========================================================================
  // STRATEGY OPTIMIZATION
  // ==========================================================================

  /**
   * Generate optimal strategy based on all analyses
   */
  generateOptimalStrategy({ expectedValues, nashEquilibrium, simulations }) {
    const stats = simulations.statistics;

    return {
      primaryApproach: expectedValues.optimal.path,
      expectedValue: Math.round(expectedValues.optimal.expectedValue),
      winProbability: (stats.winRate * 100).toFixed(1) + '%',
      
      demandStrategy: {
        initialDemand: Math.round(stats.percentile75),
        minAcceptable: Math.round(stats.percentile25),
        targetSettlement: Math.round(stats.median),
        reasoning: 'Demand at 75th percentile, accept above 25th percentile'
      },

      timing: {
        optimalSettlement: this.determineOptimalTiming(expectedValues),
        estimatedDuration: Math.round(stats.avgTime) + ' days',
        estimatedCost: '$' + Math.round(stats.avgCost).toLocaleString()
      },

      tactics: this.generateTactics(nashEquilibrium, simulations),

      riskAssessment: {
        bestCase: '$' + Math.round(stats.percentile90).toLocaleString(),
        worstCase: '$' + Math.round(stats.percentile10).toLocaleString(),
        mostLikely: '$' + Math.round(stats.median).toLocaleString(),
        volatility: stats.stdDev > 20000 ? 'High' : stats.stdDev > 10000 ? 'Medium' : 'Low'
      }
    };
  }

  /**
   * Determine optimal settlement timing
   */
  determineOptimalTiming(expectedValues) {
    const scenarios = expectedValues.scenarios;
    
    // Find scenario with best EV that isn't trial
    const settlements = scenarios.filter(s => s.path.includes('Settlement'));
    const best = settlements[0];

    return best ? best.description : 'Mid-case settlement recommended';
  }

  /**
   * Generate tactical recommendations
   */
  generateTactics(nashEquilibrium, simulations) {
    const tactics = [];

    tactics.push(`Use ${nashEquilibrium.ourOptimalStrategy} approach`);
    tactics.push(`Start high: demand ${Math.round(simulations.statistics.percentile75).toLocaleString()}`);
    tactics.push('Show trial readiness but signal settlement willingness');
    
    if (simulations.statistics.winRate > 0.7) {
      tactics.push('Press hard - high win probability');
    } else {
      tactics.push('Be flexible - moderate win probability');
    }

    tactics.push(`Don't accept below $${Math.round(simulations.statistics.percentile25).toLocaleString()}`);

    return tactics;
  }

  /**
   * Generate final recommendation
   */
  generateRecommendation(strategy, simulations) {
    const stats = simulations.statistics;

    return `
🎯 **OPTIMAL STRATEGY RECOMMENDATION**

**Primary Approach:** ${strategy.primaryApproach}
**Expected Value:** $${strategy.expectedValue.toLocaleString()}
**Win Probability:** ${strategy.winProbability}

**DEMAND STRATEGY:**
• Initial Demand: $${strategy.demandStrategy.initialDemand.toLocaleString()}
• Target Settlement: $${strategy.demandStrategy.targetSettlement.toLocaleString()}
• Minimum Acceptable: $${strategy.demandStrategy.minAcceptable.toLocaleString()}

**TIMING:**
• Optimal Settlement: ${strategy.timing.optimalSettlement}
• Estimated Duration: ${strategy.timing.estimatedDuration}
• Estimated Cost: ${strategy.timing.estimatedCost}

**RISK ASSESSMENT:**
• Best Case (90th %ile): ${strategy.riskAssessment.bestCase}
• Most Likely (Median): ${strategy.riskAssessment.mostLikely}
• Worst Case (10th %ile): ${strategy.riskAssessment.worstCase}
• Volatility: ${strategy.riskAssessment.volatility}

**KEY TACTICS:**
${strategy.tactics.map(t => `• ${t}`).join('\n')}

**SIMULATION RESULTS (10,000 iterations):**
• Default Judgments: ${((simulations.defaultJudgments / 10000) * 100).toFixed(1)}%
• Early Settlements: ${((simulations.earlySettlements / 10000) * 100).toFixed(1)}%
• Mid Settlements: ${((simulations.midSettlements / 10000) * 100).toFixed(1)}%
• Late Settlements: ${((simulations.lateSettlements / 10000) * 100).toFixed(1)}%
• Trial Wins: ${((simulations.trialWins / 10000) * 100).toFixed(1)}%
• Summary Judgment Wins: ${((simulations.summaryJudgmentWins / 10000) * 100).toFixed(1)}%
• Trial Losses: ${((simulations.trialLosses / 10000) * 100).toFixed(1)}%

**BOTTOM LINE:** ${this.generateBottomLine(stats)}
    `.trim();
  }

  /**
   * Generate bottom line assessment
   */
  generateBottomLine(stats) {
    if (stats.winRate > 0.85) {
      return 'Extremely strong case. Press hard and don\'t settle cheap.';
    } else if (stats.winRate > 0.70) {
      return 'Strong case. Negotiate from position of strength.';
    } else if (stats.winRate > 0.55) {
      return 'Moderate case. Balance aggression with settlement flexibility.';
    } else {
      return 'Weaker case. Focus on settlement with reasonable expectations.';
    }
  }

  // ==========================================================================
  // STATISTICAL UTILITIES
  // ==========================================================================

  randomNormal(mean, stdDev) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.max(0, mean + z * stdDev);
  }

  calculateMean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateStdDev(arr) {
    const mean = this.calculateMean(arr);
    const squareDiffs = arr.map(val => Math.pow(val - mean, 2));
    const avgSquareDiff = this.calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  calculatePercentile(arr, percentile) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default GameTheoryEngine;
