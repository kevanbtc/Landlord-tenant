/**
 * EVICTION DATA SERVICE
 * 
 * Integrates eviction data sources:
 * - Eviction Lab (Princeton) - national database
 * - Eviction Tracking System - near real-time filings
 * - State/local court data where available
 */

import axios from 'axios';
import NodeCache from 'node-cache';

export class EvictionDataService {
  constructor() {
    // Cache for 6 hours (eviction data changes more frequently than HUD)
    this.cache = new NodeCache({ stdTTL: 21600 });
    
    // Eviction Lab endpoints
    this.endpoints = {
      evictionLabAPI: 'https://data.evictionlab.org/api',
      // Note: Eviction Lab doesn't have a public REST API for all data
      // Much of their data requires downloading bulk files
      // We'll structure this for future API if available
    };
  }

  /**
   * Get eviction statistics for a location
   * @param {string} geoId - Geographic identifier (FIPS code or tract ID)
   * @param {string} geoType - 'states', 'counties', 'cities', 'tracts'
   * @param {number} year - Year for data (2000-2016 for historical, 2020+ for tracking)
   * @returns {Object} Eviction statistics
   */
  async getEvictionStats(geoId, geoType = 'counties', year = 2023) {
    const cacheKey = `eviction_${geoType}_${geoId}_${year}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // In production, this queries Eviction Lab's bulk data loaded into database
      // For now, return structure that matches Eviction Lab format
      
      const result = {
        geoId,
        geoType,
        year,
        name: null, // Location name
        parentLocation: null, // State or county name
        
        // Core eviction metrics
        evictionFilings: null,
        evictionFilingsRate: null, // Per 100 renter households
        evictionJudgments: null,
        evictionJudgmentsRate: null,
        
        // Demographic context
        renterOccupiedHouseholds: null,
        medianGrossRent: null,
        medianHouseholdIncome: null,
        medianPropertyValue: null,
        rentBurden: null, // Percent paying >30% income on rent
        
        // Disparities
        pctRenterBlack: null,
        pctRenterHispanic: null,
        pctRenterWhite: null,
        
        // Comparisons
        stateAvgFilingRate: null,
        nationalAvgFilingRate: 3.7, // 2023 national average per Eviction Lab
        comparisonToNational: null, // 'above', 'at', 'below'
        
        note: 'Eviction data requires seeded database from Eviction Lab bulk downloads'
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching eviction data:', error.message);
      return null;
    }
  }

  /**
   * Get real-time eviction tracking data (2020+)
   * Uses Eviction Lab's Eviction Tracking System
   * @param {string} city - City name or site code
   * @param {string} dateRange - 'week', 'month', 'year'
   * @returns {Object} Recent filing trends
   */
  async getEvictionTrackingData(city, dateRange = 'month') {
    const cacheKey = `eviction_tracking_${city}_${dateRange}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Eviction Tracking System covers ~40 cities with near real-time data
      // Cities include: Phoenix, Austin, Boston, Cincinnati, Cleveland, Columbus, 
      // Connecticut, Delaware, Gainesville, Houston, Indianapolis, Jacksonville, 
      // Kansas City, Las Vegas, Memphis, Milwaukee, Minneapolis, New York, 
      // Philadelphia, Pittsburgh, Richmond, St. Louis, South Bend, etc.
      
      const result = {
        city,
        dateRange,
        lastUpdated: new Date().toISOString(),
        
        // Recent filings
        recentFilings: null,
        filingTrend: null, // 'increasing', 'stable', 'decreasing'
        comparisonToPrevious: null, // Percent change
        
        // Historical baseline
        prePandemicAverage: null,
        percentOfHistorical: null,
        
        // Context
        filingsByWeek: [], // Array of {week, filings}
        
        note: 'Real-time tracking requires integration with Eviction Lab\'s ' +
              'tracking dashboard or scraping their city-specific pages'
      };
      
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching eviction tracking data:', error.message);
      return null;
    }
  }

  /**
   * Calculate eviction risk score for a location
   * @param {Object} locationData - Eviction stats and demographics
   * @returns {Object} Risk assessment
   */
  calculateEvictionRisk(locationData) {
    if (!locationData || !locationData.evictionFilingsRate) {
      return {
        riskScore: null,
        riskLevel: 'unknown',
        factors: [],
        message: 'Insufficient data to calculate risk'
      };
    }

    let riskScore = 0;
    const factors = [];

    // Factor 1: Filing rate vs national average
    const nationalAvg = 3.7; // Per 100 renter households (2023)
    if (locationData.evictionFilingsRate > nationalAvg * 1.5) {
      riskScore += 30;
      factors.push({
        factor: 'High filing rate',
        impact: 'high',
        detail: `Filing rate (${locationData.evictionFilingsRate.toFixed(1)}) ` +
                `is ${((locationData.evictionFilingsRate / nationalAvg - 1) * 100).toFixed(0)}% ` +
                `above national average`
      });
    } else if (locationData.evictionFilingsRate > nationalAvg) {
      riskScore += 15;
      factors.push({
        factor: 'Above-average filing rate',
        impact: 'medium',
        detail: `Filing rate higher than national average`
      });
    }

    // Factor 2: Rent burden
    if (locationData.rentBurden && locationData.rentBurden > 50) {
      riskScore += 25;
      factors.push({
        factor: 'Severe rent burden',
        impact: 'high',
        detail: `${locationData.rentBurden}% of renters pay >30% of income on rent`
      });
    } else if (locationData.rentBurden && locationData.rentBurden > 40) {
      riskScore += 15;
      factors.push({
        factor: 'High rent burden',
        impact: 'medium',
        detail: `${locationData.rentBurden}% of renters pay >30% of income on rent`
      });
    }

    // Factor 3: Racial disparities (Black renters disproportionately affected)
    if (locationData.pctRenterBlack && locationData.pctRenterBlack > 30) {
      riskScore += 20;
      factors.push({
        factor: 'Racial disparity risk',
        impact: 'high',
        detail: `${locationData.pctRenterBlack}% of renters are Black - ` +
                `Eviction Lab data shows Black renters face eviction at 2x rate`
      });
    }

    // Factor 4: Judgment rate (if filings convert to judgments frequently)
    if (locationData.evictionJudgmentsRate && locationData.evictionFilingsRate) {
      const judgmentConversionRate = 
        (locationData.evictionJudgmentsRate / locationData.evictionFilingsRate) * 100;
      
      if (judgmentConversionRate > 60) {
        riskScore += 15;
        factors.push({
          factor: 'High judgment conversion',
          impact: 'medium',
          detail: `${judgmentConversionRate.toFixed(0)}% of filings result in judgments`
        });
      }
    }

    // Determine risk level
    let riskLevel, message;
    if (riskScore >= 70) {
      riskLevel = 'very_high';
      message = 'This area has extremely high eviction risk. ' +
                'Tenants should seek legal help immediately when facing eviction.';
    } else if (riskScore >= 50) {
      riskLevel = 'high';
      message = 'This area has elevated eviction risk. ' +
                'Tenants should know their rights and respond quickly to notices.';
    } else if (riskScore >= 30) {
      riskLevel = 'moderate';
      message = 'This area has moderate eviction risk. ' +
                'Tenants should be aware of eviction procedures and deadlines.';
    } else {
      riskLevel = 'low';
      message = 'This area has below-average eviction risk.';
    }

    return {
      riskScore,
      riskLevel,
      factors,
      message
    };
  }

  /**
   * Generate eviction context report for a case
   * @param {Object} location - { city, county, state, tract }
   * @param {string} geoId - FIPS or tract ID
   * @returns {Object} Complete eviction context
   */
  async generateEvictionContextReport(location, geoId) {
    const report = {
      location,
      evictionStats: null,
      trackingData: null,
      riskAssessment: null,
      recommendations: []
    };

    // Get historical eviction statistics
    if (geoId) {
      report.evictionStats = await this.getEvictionStats(geoId, 'counties', 2023);
      
      if (report.evictionStats) {
        report.riskAssessment = this.calculateEvictionRisk(report.evictionStats);
      }
    }

    // Get real-time tracking data if city is covered
    if (location.city) {
      report.trackingData = await this.getEvictionTrackingData(location.city);
    }

    // Generate recommendations
    if (report.riskAssessment) {
      if (report.riskAssessment.riskLevel === 'very_high' || 
          report.riskAssessment.riskLevel === 'high') {
        report.recommendations.push({
          type: 'urgent_legal_help',
          priority: 'high',
          message: 'Eviction filings in this area are frequent. ' +
                   'Respond to any eviction notice within 5 days. ' +
                   'Seek legal aid immediately.'
        });
      }

      if (report.evictionStats && report.evictionStats.evictionFilingsRate) {
        report.recommendations.push({
          type: 'area_context',
          priority: 'info',
          message: `In ${location.county || location.city}, ` +
                   `${report.evictionStats.evictionFilingsRate.toFixed(1)} eviction cases ` +
                   `are filed per 100 renter households annually. ` +
                   `National average is 3.7.`
        });
      }
    }

    // Add Eviction Lab resources
    report.recommendations.push({
      type: 'resource',
      priority: 'info',
      message: 'Check Eviction Lab\'s tracker for recent trends in your area',
      url: 'https://evictionlab.org/eviction-tracking/'
    });

    return report;
  }
}

export default EvictionDataService;
