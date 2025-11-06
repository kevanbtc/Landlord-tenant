/**
 * HUD DATA SERVICE
 * 
 * Integrates federal HUD data sources:
 * - Housing Choice Vouchers by Census Tract
 * - Picture of Subsidized Households (PSH)
 * - Fair Market Rents (FMR) / Small Area FMR
 * - Section 8 / PHA inventory
 * - HUD Resource Locator
 */

import axios from 'axios';
import NodeCache from 'node-cache';

export class HUDDataService {
  constructor() {
    // Cache data for 24 hours (HUD data doesn't change frequently)
    this.cache = new NodeCache({ stdTTL: 86400 });
    
    // HUD ArcGIS REST API endpoints
    this.endpoints = {
      vouchersByTract: 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Housing_Choice_Vouchers_by_Tract/FeatureServer/0',
      publicHousing: 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Public_Housing_Buildings/FeatureServer/0',
      hudResourceLocator: 'https://resources.hud.gov/ResourceLocator/api/search'
    };
    
    // HUD USER datasets (flat file downloads, updated quarterly)
    this.hudUserDatasets = {
      fmr: 'https://www.huduser.gov/portal/datasets/fmr.html',
      safmr: 'https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html',
      psh: 'https://www.huduser.gov/portal/datasets/assthsg.html'
    };
  }

  /**
   * Get Housing Choice Voucher data for a specific census tract
   * @param {string} tractId - Full GEOID (state+county+tract, 11 digits)
   * @returns {Object} Voucher data including count, percent, demographics
   */
  async getVoucherDataByTract(tractId) {
    const cacheKey = `voucher_${tractId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.endpoints.vouchersByTract + '/query', {
        params: {
          where: `GEOID='${tractId}'`,
          outFields: '*',
          f: 'json'
        }
      });

      if (response.data.features && response.data.features.length > 0) {
        const data = response.data.features[0].attributes;
        const result = {
          tractId: data.GEOID,
          totalVouchers: data.total_voucher_units || 0,
          totalRenterHouseholds: data.total_renter_occupied || 0,
          voucherPenetrationRate: data.voucher_penetration_rate || 0,
          medianIncome: data.median_household_income || null,
          demographics: {
            black_percent: data.black_pct || 0,
            hispanic_percent: data.hispanic_pct || 0,
            poverty_rate: data.poverty_rate || 0
          },
          geography: {
            state: data.state_name,
            county: data.county_name,
            tract: data.tract_name
          }
        };
        
        this.cache.set(cacheKey, result);
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error fetching voucher data:', error.message);
      return null;
    }
  }

  /**
   * Get all vouchers within a radius of a lat/lng point
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusMiles - Search radius in miles (default 5)
   * @returns {Array} Array of tract-level voucher data
   */
  async getVouchersNearLocation(lat, lng, radiusMiles = 5) {
    const cacheKey = `voucher_near_${lat}_${lng}_${radiusMiles}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Convert miles to meters for ArcGIS
      const radiusMeters = radiusMiles * 1609.34;
      
      const response = await axios.get(this.endpoints.vouchersByTract + '/query', {
        params: {
          geometry: `${lng},${lat}`,
          geometryType: 'esriGeometryPoint',
          distance: radiusMeters,
          units: 'esriSRUnit_Meter',
          spatialRel: 'esriSpatialRelIntersects',
          outFields: '*',
          f: 'json'
        }
      });

      if (response.data.features) {
        const results = response.data.features.map(f => ({
          tractId: f.attributes.GEOID,
          totalVouchers: f.attributes.total_voucher_units || 0,
          voucherPenetrationRate: f.attributes.voucher_penetration_rate || 0,
          geography: {
            state: f.attributes.state_name,
            county: f.attributes.county_name,
            tract: f.attributes.tract_name
          }
        }));
        
        this.cache.set(cacheKey, results);
        return results;
      }

      return [];
    } catch (error) {
      console.error('Error fetching nearby voucher data:', error.message);
      return [];
    }
  }

  /**
   * Get Fair Market Rent for a location
   * Uses HUD FMR dataset (typically loaded from static file or API)
   * @param {string} zipCode - ZIP code
   * @param {number} bedrooms - Number of bedrooms (0-4)
   * @returns {Object} FMR data
   */
  async getFairMarketRent(zipCode, bedrooms = 2) {
    const cacheKey = `fmr_${zipCode}_${bedrooms}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // In production, this would query a database seeded from HUD USER FMR files
    // For now, return structure that matches HUD FMR format
    try {
      // TODO: Implement actual FMR lookup from database
      // This requires downloading and parsing HUD's quarterly FMR Excel files
      
      const result = {
        zipCode,
        bedrooms,
        fmr: null, // Dollar amount
        safmr: null, // Small Area FMR if available
        metroArea: null,
        county: null,
        state: null,
        effectiveDate: null,
        note: 'FMR lookup requires seeded database from HUD USER quarterly files'
      };
      
      return result;
    } catch (error) {
      console.error('Error fetching FMR:', error.message);
      return null;
    }
  }

  /**
   * Find HUD resources near a location (housing counselors, PHAs, etc.)
   * @param {string} zipCode - ZIP code
   * @param {Array<string>} services - Service types to search for
   * @returns {Array} Array of HUD resources
   */
  async findHUDResources(zipCode, services = ['hc', 'pha']) {
    const cacheKey = `hud_resources_${zipCode}_${services.join('_')}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // HUD Resource Locator API
      // Services: 'hc' = housing counseling, 'pha' = public housing authority
      const results = [];
      
      for (const service of services) {
        const response = await axios.get(this.endpoints.hudResourceLocator, {
          params: {
            zip: zipCode,
            service: service,
            distance: 25 // miles
          }
        });
        
        if (response.data && response.data.results) {
          results.push(...response.data.results);
        }
      }
      
      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error fetching HUD resources:', error.message);
      return [];
    }
  }

  /**
   * Generate HUD context report for a case
   * Combines voucher data, FMR, and available resources
   * @param {Object} location - { address, city, state, zip, lat, lng }
   * @param {string} tractId - Census tract GEOID (if known)
   * @returns {Object} Complete HUD context
   */
  async generateHUDContextReport(location, tractId = null) {
    const report = {
      location: location,
      voucherData: null,
      nearbyVouchers: [],
      fairMarketRent: null,
      hudResources: [],
      analysis: {
        isHighVoucherArea: false,
        rentVsFMR: null, // 'below', 'at', 'above'
        voucherRisks: [],
        recommendations: []
      }
    };

    // Get voucher data for this tract
    if (tractId) {
      report.voucherData = await this.getVoucherDataByTract(tractId);
      
      if (report.voucherData) {
        // Flag high-voucher areas (>20% penetration)
        report.analysis.isHighVoucherArea = 
          report.voucherData.voucherPenetrationRate > 20;
        
        if (report.analysis.isHighVoucherArea) {
          report.analysis.voucherRisks.push(
            'High concentration of voucher holders in area - watch for source-of-income discrimination'
          );
        }
      }
    }

    // Get nearby voucher data if lat/lng provided
    if (location.lat && location.lng) {
      report.nearbyVouchers = await this.getVouchersNearLocation(
        location.lat, 
        location.lng, 
        5
      );
    }

    // Get FMR data
    if (location.zip) {
      report.fairMarketRent = await this.getFairMarketRent(location.zip, 2);
      report.hudResources = await this.findHUDResources(location.zip);
    }

    // Generate recommendations
    if (report.voucherData) {
      report.analysis.recommendations.push({
        type: 'voucher_context',
        message: `This census tract has ${report.voucherData.totalVouchers} voucher holders ` +
                 `(${report.voucherData.voucherPenetrationRate.toFixed(1)}% of renters). ` +
                 `Be alert for voucher discrimination and HQS retaliation.`
      });
    }

    if (report.hudResources.length > 0) {
      const phas = report.hudResources.filter(r => r.service === 'pha');
      if (phas.length > 0) {
        report.analysis.recommendations.push({
          type: 'pha_contact',
          message: `${phas.length} Public Housing Authority offices nearby. ` +
                   `If tenant has voucher, PHA should be notified of habitability issues.`,
          resources: phas.map(p => ({
            name: p.name,
            phone: p.phone,
            address: p.address
          }))
        });
      }
    }

    return report;
  }

  /**
   * Check if rent amount is above/below FMR
   * @param {number} rentAmount - Monthly rent
   * @param {string} zipCode - ZIP code
   * @param {number} bedrooms - Number of bedrooms
   * @returns {Object} Comparison analysis
   */
  async compareRentToFMR(rentAmount, zipCode, bedrooms) {
    const fmr = await this.getFairMarketRent(zipCode, bedrooms);
    
    if (!fmr || !fmr.fmr) {
      return {
        rentAmount,
        fmr: null,
        comparison: 'unknown',
        message: 'FMR data not available for this location'
      };
    }

    const percentOfFMR = (rentAmount / fmr.fmr) * 100;
    let comparison, message;

    if (percentOfFMR < 95) {
      comparison = 'below';
      message = `Rent is ${(100 - percentOfFMR).toFixed(0)}% below FMR. ` +
                `May indicate lower quality or landlord issues.`;
    } else if (percentOfFMR <= 105) {
      comparison = 'at';
      message = `Rent is at FMR (${percentOfFMR.toFixed(0)}% of standard).`;
    } else {
      comparison = 'above';
      message = `Rent is ${(percentOfFMR - 100).toFixed(0)}% above FMR. ` +
                `May be unaffordable for voucher holders or overpriced.`;
    }

    return {
      rentAmount,
      fmr: fmr.fmr,
      percentOfFMR: percentOfFMR.toFixed(1),
      comparison,
      message
    };
  }
}

export default HUDDataService;
