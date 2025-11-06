/**
 * LANDLORD & BUILDING DATA SERVICE
 * 
 * Integrates local violation, complaint, and building inspection data:
 * - NYC HPD (template model for other cities)
 * - Local open data APIs (where available)
 * - Building violation tracking
 * - Landlord watchlists
 */

import axios from 'axios';
import NodeCache from 'node-cache';

export class LandlordDataService {
  constructor() {
    // Cache for 12 hours (violations data changes regularly)
    this.cache = new NodeCache({ stdTTL: 43200 });
    
    // NYC HPD Open Data endpoints
    this.nycEndpoints = {
      violations: 'https://data.cityofnewyork.us/resource/wvxf-dwi5.json',
      complaints: 'https://data.cityofnewyork.us/resource/uwyv-629c.json',
      buildings: 'https://data.cityofnewyork.us/resource/qdq3-9eqn.json',
      registrations: 'https://data.cityofnewyork.us/resource/tesw-yqqr.json'
    };
    
    // Violation classifications (NYC HPD model)
    this.violationClasses = {
      'A': {
        name: 'Non-Hazardous',
        description: 'Non-hazardous conditions that should be corrected',
        typicalTime: '90 days',
        severity: 'low'
      },
      'B': {
        name: 'Hazardous',
        description: 'Hazardous conditions that affect health and safety',
        typicalTime: '30 days',
        severity: 'medium'
      },
      'C': {
        name: 'Immediately Hazardous',
        description: 'Immediately hazardous conditions requiring urgent correction',
        typicalTime: '24 hours',
        severity: 'high'
      },
      'I': {
        name: 'Lead Paint',
        description: 'Lead-based paint hazards',
        typicalTime: 'Immediate',
        severity: 'high'
      }
    };
    
    // Common violation types across jurisdictions
    this.violationTypes = {
      // Structure
      'MOLD': { category: 'Health', typical_class: 'B', keywords: ['mold', 'mildew', 'fungus'] },
      'LEAD': { category: 'Health', typical_class: 'I', keywords: ['lead', 'paint'] },
      'VERMIN': { category: 'Health', typical_class: 'B', keywords: ['roach', 'rat', 'mice', 'vermin', 'pest'] },
      'PLUMBING': { category: 'Systems', typical_class: 'B', keywords: ['leak', 'plumbing', 'water', 'pipe', 'drain'] },
      'HEAT': { category: 'Systems', typical_class: 'B', keywords: ['heat', 'heating', 'boiler', 'radiator'] },
      'ELECTRIC': { category: 'Systems', typical_class: 'B', keywords: ['electric', 'wiring', 'outlet'] },
      'STRUCTURAL': { category: 'Structure', typical_class: 'B', keywords: ['wall', 'ceiling', 'floor', 'crack', 'hole'] },
      'DOOR_WINDOW': { category: 'Structure', typical_class: 'A', keywords: ['door', 'window', 'lock'] },
      'VENTILATION': { category: 'Systems', typical_class: 'B', keywords: ['ventilation', 'air', 'carbon monoxide'] },
      'SANITATION': { category: 'Health', typical_class: 'B', keywords: ['garbage', 'sewage', 'sanitation', 'toilet'] }
    };
  }

  /**
   * Get building violations (NYC model)
   * @param {string} buildingId - Building ID (BIN for NYC)
   * @param {Object} options - { status: 'open'/'all', class: 'A'/'B'/'C' }
   * @returns {Array} Array of violations
   */
  async getBuildingViolations(buildingId, options = {}) {
    const cacheKey = `violations_${buildingId}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Build query parameters
      const params = {
        bin: buildingId,
        $limit: 1000
      };
      
      if (options.status === 'open') {
        params.violationstatus = 'Open';
      }
      
      if (options.class) {
        params.class = options.class;
      }

      const response = await axios.get(this.nycEndpoints.violations, { params });
      
      if (response.data && response.data.length > 0) {
        const violations = response.data.map(v => ({
          violationId: v.violationid,
          buildingId: v.bin,
          class: v.class,
          inspectionDate: v.inspectiondate,
          originalCertifyByDate: v.originalcertifybydate,
          status: v.violationstatus,
          description: v.novdescription,
          orderNumber: v.ordernumber,
          apartment: v.apartment || null,
          story: v.story || null,
          severity: this.violationClasses[v.class]?.severity || 'unknown',
          daysOpen: this.calculateDaysOpen(v.inspectiondate, v.violationstatus)
        }));
        
        this.cache.set(cacheKey, violations);
        return violations;
      }

      return [];
    } catch (error) {
      console.error('Error fetching building violations:', error.message);
      return [];
    }
  }

  /**
   * Get building complaints (311 complaints)
   * @param {string} buildingId - Building ID
   * @param {Object} options - { status: 'open'/'all', limit: number }
   * @returns {Array} Array of complaints
   */
  async getBuildingComplaints(buildingId, options = {}) {
    const cacheKey = `complaints_${buildingId}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const params = {
        bin: buildingId,
        $limit: options.limit || 500
      };
      
      if (options.status === 'open') {
        params.status = 'OPEN';
      }

      const response = await axios.get(this.nycEndpoints.complaints, { params });
      
      if (response.data && response.data.length > 0) {
        const complaints = response.data.map(c => ({
          complaintId: c.complaintid,
          buildingId: c.bin,
          receivedDate: c.receiveddate,
          status: c.status,
          type: c.type,
          majorCategory: c.majorcategory,
          minorCategory: c.minorcategory,
          apartment: c.apartment || null,
          communityBoard: c.communityboard || null
        }));
        
        this.cache.set(cacheKey, complaints);
        return complaints;
      }

      return [];
    } catch (error) {
      console.error('Error fetching building complaints:', error.message);
      return [];
    }
  }

  /**
   * Get landlord/owner information
   * @param {string} buildingId - Building ID
   * @returns {Object} Owner registration info
   */
  async getLandlordInfo(buildingId) {
    const cacheKey = `landlord_${buildingId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.nycEndpoints.registrations, {
        params: {
          bin: buildingId,
          $limit: 1
        }
      });
      
      if (response.data && response.data.length > 0) {
        const reg = response.data[0];
        const info = {
          buildingId: reg.bin,
          ownerName: reg.ownername || null,
          ownerBusinessName: reg.corporationname || null,
          ownerAddress: {
            street: reg.owneraddress || null,
            city: reg.ownercity || null,
            state: reg.ownerstate || null,
            zip: reg.ownerzip || null
          },
          managementCompany: reg.registrationcontactname || null,
          managementPhone: reg.registrationcontacttel || null,
          registrationId: reg.registrationid || null,
          lastRegistrationDate: reg.lastregistrationdate || null
        };
        
        this.cache.set(cacheKey, info);
        return info;
      }

      return null;
    } catch (error) {
      console.error('Error fetching landlord info:', error.message);
      return null;
    }
  }

  /**
   * Analyze building and landlord for risk/quality
   * @param {string} buildingId - Building ID
   * @returns {Object} Complete building profile with risk assessment
   */
  async analyzeBuildingAndLandlord(buildingId) {
    const profile = {
      buildingId,
      violations: [],
      complaints: [],
      landlordInfo: null,
      analysis: {
        totalOpenViolations: 0,
        classCViolations: 0,
        classBViolations: 0,
        classAViolations: 0,
        oldestOpenViolation: null,
        totalComplaints: 0,
        openComplaints: 0,
        violationsByCategory: {},
        riskScore: 0,
        riskLevel: 'unknown',
        riskFactors: [],
        recommendations: []
      }
    };

    // Fetch all data in parallel
    const [violations, complaints, landlordInfo] = await Promise.all([
      this.getBuildingViolations(buildingId, { status: 'all' }),
      this.getBuildingComplaints(buildingId, { status: 'all' }),
      this.getLandlordInfo(buildingId)
    ]);

    profile.violations = violations;
    profile.complaints = complaints;
    profile.landlordInfo = landlordInfo;

    // Analyze violations
    const openViolations = violations.filter(v => v.status === 'Open');
    profile.analysis.totalOpenViolations = openViolations.length;
    profile.analysis.classCViolations = openViolations.filter(v => v.class === 'C').length;
    profile.analysis.classBViolations = openViolations.filter(v => v.class === 'B').length;
    profile.analysis.classAViolations = openViolations.filter(v => v.class === 'A').length;

    // Find oldest open violation
    if (openViolations.length > 0) {
      const oldest = openViolations.reduce((prev, current) => 
        current.daysOpen > prev.daysOpen ? current : prev
      );
      profile.analysis.oldestOpenViolation = {
        violationId: oldest.violationId,
        class: oldest.class,
        description: oldest.description,
        daysOpen: oldest.daysOpen
      };
    }

    // Categorize violations
    for (const violation of violations) {
      const category = this.categorizeViolation(violation.description);
      if (!profile.analysis.violationsByCategory[category]) {
        profile.analysis.violationsByCategory[category] = 0;
      }
      profile.analysis.violationsByCategory[category]++;
    }

    // Analyze complaints
    const openComplaints = complaints.filter(c => c.status === 'OPEN');
    profile.analysis.totalComplaints = complaints.length;
    profile.analysis.openComplaints = openComplaints.length;

    // Calculate risk score
    let riskScore = 0;
    const factors = [];

    // Factor 1: Number of open violations
    if (profile.analysis.totalOpenViolations > 20) {
      riskScore += 30;
      factors.push({
        factor: 'Excessive open violations',
        impact: 'high',
        detail: `${profile.analysis.totalOpenViolations} open violations`
      });
    } else if (profile.analysis.totalOpenViolations > 10) {
      riskScore += 15;
      factors.push({
        factor: 'Multiple open violations',
        impact: 'medium',
        detail: `${profile.analysis.totalOpenViolations} open violations`
      });
    }

    // Factor 2: Class C violations (immediately hazardous)
    if (profile.analysis.classCViolations > 0) {
      riskScore += 25;
      factors.push({
        factor: 'Immediately hazardous violations',
        impact: 'high',
        detail: `${profile.analysis.classCViolations} Class C violations (requires 24-hour correction)`
      });
    }

    // Factor 3: Old violations (landlord not fixing)
    if (profile.analysis.oldestOpenViolation && 
        profile.analysis.oldestOpenViolation.daysOpen > 365) {
      riskScore += 20;
      factors.push({
        factor: 'Chronic neglect',
        impact: 'high',
        detail: `Oldest violation open for ${profile.analysis.oldestOpenViolation.daysOpen} days`
      });
    } else if (profile.analysis.oldestOpenViolation && 
               profile.analysis.oldestOpenViolation.daysOpen > 180) {
      riskScore += 10;
      factors.push({
        factor: 'Delayed repairs',
        impact: 'medium',
        detail: `Oldest violation open for ${profile.analysis.oldestOpenViolation.daysOpen} days`
      });
    }

    // Factor 4: Health hazards (mold, lead, vermin)
    const healthViolations = Object.keys(profile.analysis.violationsByCategory)
      .filter(cat => ['MOLD', 'LEAD', 'VERMIN', 'SANITATION'].includes(cat))
      .reduce((sum, cat) => sum + profile.analysis.violationsByCategory[cat], 0);
    
    if (healthViolations > 5) {
      riskScore += 20;
      factors.push({
        factor: 'Multiple health hazards',
        impact: 'high',
        detail: `${healthViolations} mold/lead/vermin/sanitation violations`
      });
    } else if (healthViolations > 0) {
      riskScore += 10;
      factors.push({
        factor: 'Health hazards present',
        impact: 'medium',
        detail: `${healthViolations} health-related violations`
      });
    }

    // Factor 5: High complaint volume
    if (profile.analysis.openComplaints > 15) {
      riskScore += 15;
      factors.push({
        factor: 'Excessive tenant complaints',
        impact: 'medium',
        detail: `${profile.analysis.openComplaints} open 311 complaints`
      });
    }

    // Determine risk level
    let riskLevel, message;
    if (riskScore >= 70) {
      riskLevel = 'very_high';
      message = 'This building has severe violations and chronic neglect. ' +
                'Immediate legal action may be warranted.';
    } else if (riskScore >= 50) {
      riskLevel = 'high';
      message = 'This building has significant violations. ' +
                'Document all conditions and pursue repairs aggressively.';
    } else if (riskScore >= 30) {
      riskLevel = 'moderate';
      message = 'This building has some violations. ' +
                'Monitor for timely repairs and escalate if needed.';
    } else {
      riskLevel = 'low';
      message = 'This building has few or no violations.';
    }

    profile.analysis.riskScore = riskScore;
    profile.analysis.riskLevel = riskLevel;
    profile.analysis.riskFactors = factors;

    // Generate recommendations
    if (profile.analysis.classCViolations > 0) {
      profile.analysis.recommendations.push({
        type: 'urgent',
        priority: 'high',
        message: 'Building has Class C (immediately hazardous) violations. ' +
                 'File HP action immediately to compel repairs.'
      });
    }

    if (profile.analysis.oldestOpenViolation && 
        profile.analysis.oldestOpenViolation.daysOpen > 180) {
      profile.analysis.recommendations.push({
        type: 'legal_action',
        priority: 'high',
        message: 'Violations open for 6+ months indicate chronic neglect. ' +
                 'Consider rent abatement claim or HP action.'
      });
    }

    if (healthViolations > 0) {
      profile.analysis.recommendations.push({
        type: 'health',
        priority: 'high',
        message: 'Document health hazards with photos and medical records. ' +
                 'Report to health department and consider personal injury claim.'
      });
    }

    if (landlordInfo) {
      profile.analysis.recommendations.push({
        type: 'info',
        priority: 'info',
        message: `Landlord: ${landlordInfo.ownerName || landlordInfo.ownerBusinessName}. ` +
                 `All legal notices should be sent to: ${landlordInfo.ownerAddress.street}, ` +
                 `${landlordInfo.ownerAddress.city}, ${landlordInfo.ownerAddress.state} ` +
                 `${landlordInfo.ownerAddress.zip}`
      });
    }

    return profile;
  }

  /**
   * Helper: Categorize violation by description text
   * @param {string} description - Violation description
   * @returns {string} Category code
   */
  categorizeViolation(description) {
    const desc = description.toLowerCase();
    
    for (const [code, type] of Object.entries(this.violationTypes)) {
      if (type.keywords.some(keyword => desc.includes(keyword))) {
        return code;
      }
    }
    
    return 'OTHER';
  }

  /**
   * Helper: Calculate days a violation has been open
   * @param {string} inspectionDate - Date violation was issued
   * @param {string} status - Current status
   * @returns {number} Days open (0 if closed)
   */
  calculateDaysOpen(inspectionDate, status) {
    if (status !== 'Open') return 0;
    
    const inspection = new Date(inspectionDate);
    const now = new Date();
    const diffTime = Math.abs(now - inspection);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Search for landlord across multiple buildings (create landlord profile)
   * @param {string} landlordName - Landlord or company name
   * @returns {Object} Multi-building landlord profile
   */
  async searchLandlordPortfolio(landlordName) {
    try {
      const response = await axios.get(this.nycEndpoints.registrations, {
        params: {
          $where: `upper(ownername) like upper('%${landlordName}%') OR ` +
                  `upper(corporationname) like upper('%${landlordName}%')`,
          $limit: 100
        }
      });
      
      if (response.data && response.data.length > 0) {
        const buildings = response.data.map(r => ({
          buildingId: r.bin,
          address: r.buildingaddress || null,
          borough: r.borough || null
        }));
        
        // For each building, get violation count
        const buildingProfiles = await Promise.all(
          buildings.slice(0, 10).map(b => this.analyzeBuildingAndLandlord(b.buildingId))
        );
        
        // Aggregate statistics
        const portfolio = {
          landlordName,
          totalBuildings: buildings.length,
          buildingsSampled: buildingProfiles.length,
          buildings: buildingProfiles,
          aggregate: {
            totalOpenViolations: 0,
            totalClassCViolations: 0,
            averageRiskScore: 0,
            buildingsHighRisk: 0,
            buildingsModerateRisk: 0,
            buildingsLowRisk: 0
          }
        };
        
        for (const profile of buildingProfiles) {
          portfolio.aggregate.totalOpenViolations += profile.analysis.totalOpenViolations;
          portfolio.aggregate.totalClassCViolations += profile.analysis.classCViolations;
          portfolio.aggregate.averageRiskScore += profile.analysis.riskScore;
          
          if (profile.analysis.riskLevel === 'very_high' || 
              profile.analysis.riskLevel === 'high') {
            portfolio.aggregate.buildingsHighRisk++;
          } else if (profile.analysis.riskLevel === 'moderate') {
            portfolio.aggregate.buildingsModerateRisk++;
          } else {
            portfolio.aggregate.buildingsLowRisk++;
          }
        }
        
        portfolio.aggregate.averageRiskScore /= buildingProfiles.length;
        
        return portfolio;
      }
      
      return null;
    } catch (error) {
      console.error('Error searching landlord portfolio:', error.message);
      return null;
    }
  }
}

export default LandlordDataService;
