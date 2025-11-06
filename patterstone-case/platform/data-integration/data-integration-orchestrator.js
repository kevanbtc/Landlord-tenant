/**
 * DATA INTEGRATION ORCHESTRATOR
 * 
 * Master service that combines HUD, eviction, and landlord data
 * with AI swarm analysis to create complete case context
 */

import HUDDataService from './hud-data-service.js';
import EvictionDataService from './eviction-data-service.js';
import LandlordDataService from './landlord-data-service.js';
import { matchScenariosToCase, getScenario } from './rental-scenarios.js';

export class DataIntegrationOrchestrator {
  constructor() {
    this.hudService = new HUDDataService();
    this.evictionService = new EvictionDataService();
    this.landlordService = new LandlordDataService();
  }

  /**
   * Generate complete data context for a case
   * This is the master function called by AI agents
   * 
   * @param {Object} caseData - Case information from intake
   * @returns {Object} Complete data context with all overlays
   */
  async generateCompleteContext(caseData) {
    console.log('🔍 Data Integration: Generating complete context...');
    
    const context = {
      caseId: caseData.id || null,
      timestamp: new Date().toISOString(),
      location: this.extractLocation(caseData),
      scenarios: [],
      hudContext: null,
      evictionContext: null,
      buildingContext: null,
      landlordContext: null,
      dataQuality: {
        hudDataAvailable: false,
        evictionDataAvailable: false,
        buildingDataAvailable: false,
        completenessScore: 0
      },
      recommendations: [],
      mapLayers: []
    };

    // Match case to scenarios
    context.scenarios = matchScenariosToCase(caseData);
    console.log(`   Matched ${context.scenarios.length} potential scenarios`);

    // Run all data services in parallel
    const dataPromises = [];

    // HUD data (if location available)
    if (context.location.tractId || context.location.zip) {
      dataPromises.push(
        this.hudService.generateHUDContextReport(
          context.location,
          context.location.tractId
        ).then(result => {
          context.hudContext = result;
          context.dataQuality.hudDataAvailable = true;
        }).catch(err => {
          console.error('HUD data error:', err.message);
          context.hudContext = { error: err.message };
        })
      );
    }

    // Eviction data
    if (context.location.county || context.location.city) {
      dataPromises.push(
        this.evictionService.generateEvictionContextReport(
          context.location,
          context.location.countyFIPS
        ).then(result => {
          context.evictionContext = result;
          context.dataQuality.evictionDataAvailable = true;
        }).catch(err => {
          console.error('Eviction data error:', err.message);
          context.evictionContext = { error: err.message };
        })
      );
    }

    // Building/landlord data (if building ID available)
    if (context.location.buildingId) {
      dataPromises.push(
        this.landlordService.analyzeBuildingAndLandlord(
          context.location.buildingId
        ).then(result => {
          context.buildingContext = result;
          context.dataQuality.buildingDataAvailable = true;
        }).catch(err => {
          console.error('Building data error:', err.message);
          context.buildingContext = { error: err.message };
        })
      );
    }

    // Landlord portfolio search (if landlord name known)
    if (caseData.landlord && caseData.landlord.name) {
      dataPromises.push(
        this.landlordService.searchLandlordPortfolio(
          caseData.landlord.name
        ).then(result => {
          context.landlordContext = result;
        }).catch(err => {
          console.error('Landlord portfolio error:', err.message);
          context.landlordContext = { error: err.message };
        })
      );
    }

    // Wait for all data to be fetched
    await Promise.all(dataPromises);

    // Calculate data completeness
    context.dataQuality.completenessScore = this.calculateCompletenessScore(context);

    // Generate integrated recommendations
    context.recommendations = this.generateIntegratedRecommendations(context);

    // Generate map layers
    context.mapLayers = this.generateMapLayers(context);

    console.log(`✅ Data Integration: Complete (${context.dataQuality.completenessScore}% data coverage)`);
    
    return context;
  }

  /**
   * Extract and normalize location from case data
   */
  extractLocation(caseData) {
    const location = {
      address: caseData.propertyAddress || caseData.address || null,
      city: caseData.city || null,
      state: caseData.state || null,
      zip: caseData.zipCode || caseData.zip || null,
      county: caseData.county || null,
      lat: caseData.latitude || caseData.lat || null,
      lng: caseData.longitude || caseData.lng || null,
      
      // IDs for data lookups
      tractId: caseData.censusTract || null, // 11-digit GEOID
      countyFIPS: caseData.countyFIPS || null, // 5-digit FIPS
      buildingId: caseData.buildingId || caseData.bin || null // NYC BIN or equivalent
    };

    return location;
  }

  /**
   * Calculate data completeness score (0-100)
   */
  calculateCompletenessScore(context) {
    let score = 0;
    let maxScore = 0;

    // HUD data (25 points)
    maxScore += 25;
    if (context.hudContext && !context.hudContext.error) {
      if (context.hudContext.voucherData) score += 10;
      if (context.hudContext.nearbyVouchers.length > 0) score += 5;
      if (context.hudContext.fairMarketRent) score += 5;
      if (context.hudContext.hudResources.length > 0) score += 5;
    }

    // Eviction data (25 points)
    maxScore += 25;
    if (context.evictionContext && !context.evictionContext.error) {
      if (context.evictionContext.evictionStats) score += 15;
      if (context.evictionContext.riskAssessment) score += 10;
    }

    // Building data (30 points)
    maxScore += 30;
    if (context.buildingContext && !context.buildingContext.error) {
      if (context.buildingContext.violations.length > 0) score += 10;
      if (context.buildingContext.complaints.length > 0) score += 10;
      if (context.buildingContext.analysis) score += 10;
    }

    // Landlord data (20 points)
    maxScore += 20;
    if (context.landlordContext && !context.landlordContext.error) {
      if (context.landlordContext.totalBuildings > 0) score += 10;
      if (context.landlordContext.aggregate) score += 10;
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Generate integrated recommendations combining all data sources
   */
  generateIntegratedRecommendations(context) {
    const recommendations = [];

    // Combine recommendations from all sources
    if (context.hudContext && context.hudContext.analysis) {
      recommendations.push(...context.hudContext.analysis.recommendations);
    }

    if (context.evictionContext && context.evictionContext.recommendations) {
      recommendations.push(...context.evictionContext.recommendations);
    }

    if (context.buildingContext && context.buildingContext.analysis) {
      recommendations.push(...context.buildingContext.analysis.recommendations);
    }

    // Add cross-source insights
    const crossInsights = this.generateCrossSourceInsights(context);
    recommendations.push(...crossInsights);

    // Deduplicate and sort by priority
    const unique = this.deduplicateRecommendations(recommendations);
    unique.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, info: 3 };
      return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
    });

    return unique;
  }

  /**
   * Generate insights from combining multiple data sources
   */
  generateCrossSourceInsights(context) {
    const insights = [];

    // High evictions + high violations = systemic landlord problem
    if (context.evictionContext?.riskAssessment?.riskLevel === 'very_high' &&
        context.buildingContext?.analysis?.riskLevel === 'very_high') {
      insights.push({
        type: 'systemic_problem',
        priority: 'urgent',
        message: 'CRITICAL: This area has both high eviction rates AND this building ' +
                 'has severe violations. This suggests systemic landlord abuse. ' +
                 'Consider organizing with other tenants and contacting local tenant unions.'
      });
    }

    // High voucher area + building violations + HQS risk
    if (context.hudContext?.analysis?.isHighVoucherArea &&
        context.buildingContext?.analysis?.totalOpenViolations > 10 &&
        context.scenarios.some(s => s.id === 'VOUCHER_HQS_FAILURE')) {
      insights.push({
        type: 'voucher_hqs_risk',
        priority: 'high',
        message: 'HIGH RISK: High-voucher area with building violations. ' +
                 'If tenant has Section 8, violations could trigger HQS failure. ' +
                 'Notify PHA immediately and request inspection.'
      });
    }

    // Landlord portfolio + multiple bad buildings
    if (context.landlordContext && 
        context.landlordContext.aggregate?.buildingsHighRisk > 3) {
      insights.push({
        type: 'serial_bad_landlord',
        priority: 'high',
        message: `PATTERN: This landlord owns ${context.landlordContext.aggregate.buildingsHighRisk} ` +
                 `high-risk buildings with violations. This is a repeat offender. ` +
                 `Consider filing complaints with city housing authority and organizing across properties.`
      });
    }

    // Rent vs FMR + eviction risk
    if (context.hudContext?.fairMarketRent?.comparison === 'above' &&
        context.evictionContext?.riskAssessment?.riskLevel === 'high') {
      insights.push({
        type: 'affordability_crisis',
        priority: 'high',
        message: 'Rent is above Fair Market Rent in a high-eviction area. ' +
                 'Tenant may be at risk of displacement. Explore voucher programs or rent subsidy.'
      });
    }

    return insights;
  }

  /**
   * Deduplicate recommendations by type and message similarity
   */
  deduplicateRecommendations(recommendations) {
    const seen = new Set();
    const unique = [];

    for (const rec of recommendations) {
      // Create simple hash of type + first 50 chars of message
      const hash = `${rec.type}_${rec.message.substring(0, 50)}`;
      
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(rec);
      }
    }

    return unique;
  }

  /**
   * Generate map layer configurations for visualization
   */
  generateMapLayers(context) {
    const layers = [];

    // Voucher density layer
    if (context.hudContext?.nearbyVouchers.length > 0) {
      layers.push({
        id: 'voucher_density',
        name: 'Housing Choice Voucher Density',
        type: 'heatmap',
        data: context.hudContext.nearbyVouchers.map(v => ({
          lat: v.lat || context.location.lat,
          lng: v.lng || context.location.lng,
          value: v.totalVouchers,
          label: `${v.geography.tract}: ${v.totalVouchers} vouchers`
        })),
        legend: {
          low: 'Low voucher concentration',
          high: 'High voucher concentration'
        }
      });
    }

    // Eviction filing rate layer
    if (context.evictionContext?.evictionStats) {
      layers.push({
        id: 'eviction_risk',
        name: 'Eviction Filing Risk',
        type: 'choropleth',
        data: {
          rate: context.evictionContext.evictionStats.evictionFilingsRate,
          level: context.evictionContext.riskAssessment?.riskLevel,
          nationalAvg: 3.7
        },
        legend: {
          low: 'Below national average',
          moderate: 'Near national average',
          high: 'Above national average',
          very_high: 'Well above national average'
        }
      });
    }

    // Building violations layer (point marker)
    if (context.buildingContext) {
      layers.push({
        id: 'building_violations',
        name: 'Building Violations',
        type: 'marker',
        data: {
          lat: context.location.lat,
          lng: context.location.lng,
          violations: context.buildingContext.analysis.totalOpenViolations,
          classCViolations: context.buildingContext.analysis.classCViolations,
          riskLevel: context.buildingContext.analysis.riskLevel,
          icon: this.getViolationIcon(context.buildingContext.analysis.riskLevel)
        },
        popup: {
          title: context.location.address,
          content: `${context.buildingContext.analysis.totalOpenViolations} open violations ` +
                   `(${context.buildingContext.analysis.classCViolations} immediately hazardous)`
        }
      });
    }

    // FMR overlay
    if (context.hudContext?.fairMarketRent?.fmr) {
      layers.push({
        id: 'fair_market_rent',
        name: 'Fair Market Rent Standard',
        type: 'overlay',
        data: {
          fmr: context.hudContext.fairMarketRent.fmr,
          actualRent: context.caseData?.rent || null,
          comparison: context.hudContext.fairMarketRent.comparison
        }
      });
    }

    return layers;
  }

  /**
   * Helper: Get icon name for violation risk level
   */
  getViolationIcon(riskLevel) {
    const icons = {
      'very_high': 'warning-red',
      'high': 'warning-orange',
      'moderate': 'warning-yellow',
      'low': 'check-green',
      'unknown': 'question-gray'
    };
    return icons[riskLevel] || 'question-gray';
  }

  /**
   * Format data context for AI swarm agents
   * Converts data context into narrative text for GPT-4
   */
  formatForAIAgents(dataContext) {
    let narrative = '=== DATA CONTEXT FROM PUBLIC RECORDS ===\n\n';

    // Location
    narrative += `LOCATION:\n`;
    narrative += `Address: ${dataContext.location.address}\n`;
    narrative += `City: ${dataContext.location.city}, ${dataContext.location.state} ${dataContext.location.zip}\n\n`;

    // HUD Context
    if (dataContext.hudContext && dataContext.hudContext.voucherData) {
      narrative += `HUD / SECTION 8 CONTEXT:\n`;
      narrative += `- Census tract has ${dataContext.hudContext.voucherData.totalVouchers} voucher holders\n`;
      narrative += `- Voucher penetration rate: ${dataContext.hudContext.voucherData.voucherPenetrationRate.toFixed(1)}%\n`;
      if (dataContext.hudContext.analysis.isHighVoucherArea) {
        narrative += `- ⚠️ HIGH VOUCHER AREA - Watch for source-of-income discrimination\n`;
      }
      narrative += `\n`;
    }

    // Eviction Context
    if (dataContext.evictionContext && dataContext.evictionContext.evictionStats) {
      narrative += `EVICTION RISK CONTEXT:\n`;
      narrative += `- Eviction filing rate: ${dataContext.evictionContext.evictionStats.evictionFilingsRate} per 100 renter households\n`;
      narrative += `- National average: ${dataContext.evictionContext.evictionStats.nationalAvgFilingRate}\n`;
      narrative += `- Risk level: ${dataContext.evictionContext.riskAssessment.riskLevel.toUpperCase()}\n`;
      narrative += `- ${dataContext.evictionContext.riskAssessment.message}\n\n`;
    }

    // Building Context
    if (dataContext.buildingContext && dataContext.buildingContext.analysis) {
      narrative += `BUILDING VIOLATION HISTORY:\n`;
      narrative += `- Total open violations: ${dataContext.buildingContext.analysis.totalOpenViolations}\n`;
      narrative += `- Class C (immediately hazardous): ${dataContext.buildingContext.analysis.classCViolations}\n`;
      narrative += `- Class B (hazardous): ${dataContext.buildingContext.analysis.classBViolations}\n`;
      narrative += `- Class A (non-hazardous): ${dataContext.buildingContext.analysis.classAViolations}\n`;
      
      if (dataContext.buildingContext.analysis.oldestOpenViolation) {
        narrative += `- Oldest open violation: ${dataContext.buildingContext.analysis.oldestOpenViolation.daysOpen} days ` +
                     `(${dataContext.buildingContext.analysis.oldestOpenViolation.description})\n`;
      }
      
      narrative += `- Building risk level: ${dataContext.buildingContext.analysis.riskLevel.toUpperCase()}\n`;
      
      const violationCategories = Object.entries(dataContext.buildingContext.analysis.violationsByCategory);
      if (violationCategories.length > 0) {
        narrative += `- Violation breakdown:\n`;
        violationCategories.forEach(([category, count]) => {
          narrative += `  * ${category}: ${count}\n`;
        });
      }
      narrative += `\n`;
    }

    // Landlord Context
    if (dataContext.landlordContext && dataContext.landlordContext.aggregate) {
      narrative += `LANDLORD PORTFOLIO ANALYSIS:\n`;
      narrative += `- Total buildings owned: ${dataContext.landlordContext.totalBuildings}\n`;
      narrative += `- Buildings analyzed: ${dataContext.landlordContext.buildingsSampled}\n`;
      narrative += `- Total open violations across portfolio: ${dataContext.landlordContext.aggregate.totalOpenViolations}\n`;
      narrative += `- High-risk buildings: ${dataContext.landlordContext.aggregate.buildingsHighRisk}\n`;
      narrative += `- Average risk score: ${dataContext.landlordContext.aggregate.averageRiskScore.toFixed(1)}/100\n`;
      narrative += `- ⚠️ This landlord has a pattern of violations across multiple properties\n\n`;
    }

    // Key Recommendations
    if (dataContext.recommendations.length > 0) {
      narrative += `KEY INSIGHTS FROM DATA:\n`;
      dataContext.recommendations.slice(0, 5).forEach((rec, i) => {
        narrative += `${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}\n`;
      });
      narrative += `\n`;
    }

    // Matched Scenarios
    if (dataContext.scenarios.length > 0) {
      narrative += `LIKELY LEGAL SCENARIOS (based on case facts):\n`;
      dataContext.scenarios.slice(0, 3).forEach((match, i) => {
        narrative += `${i + 1}. ${match.scenario.name} (${match.scenario.category})\n`;
      });
      narrative += `\n`;
    }

    narrative += `Data completeness: ${dataContext.dataQuality.completenessScore}%\n`;
    narrative += `=== END DATA CONTEXT ===\n`;

    return narrative;
  }
}

export default DataIntegrationOrchestrator;
