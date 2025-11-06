/**
 * RENTAL SCENARIO TAXONOMY
 * 
 * Defines major lease & rental scenarios for AI swarm routing
 * Each scenario = bundle of legal issues, fact patterns, evidence types, and data overlays
 */

export const RENTAL_SCENARIOS = {
  // ========================================
  // 1. VOUCHER / SECTION 8 SCENARIOS
  // ========================================
  
  VOUCHER_DISCRIMINATION: {
    id: 'voucher_discrimination',
    category: 'Section 8 / Voucher',
    name: 'Landlord Refuses to Accept Voucher',
    
    legalIssues: [
      'Source-of-income discrimination (where illegal)',
      'Fair Housing Act violation',
      'State/local fair housing law violation'
    ],
    
    typicalFactPattern: [
      'Tenant contacts landlord about rental',
      'Tenant discloses voucher/Section 8',
      'Landlord says "we don\'t accept Section 8"',
      'Landlord refuses to process application',
      'May use coded language: "must show 3x income", "credit requirements"'
    ],
    
    evidenceTypes: [
      'Email/text showing refusal',
      'Recorded phone calls (if legal in state)',
      'Advertisement if it says "no Section 8"',
      'PHA voucher documentation',
      'Tester evidence (if available)'
    ],
    
    dataOverlays: [
      'HUD voucher density map - show if area has high voucher concentration',
      'State source-of-income protection laws',
      'Local fair housing ordinances',
      'Landlord\'s other properties - pattern of discrimination?'
    ],
    
    hudRules: [
      'Fair Housing Act - prohibits discrimination',
      'State/local source-of-income laws (where applicable)',
      'HUD guidance on voucher discrimination'
    ],
    
    damages: [
      'Lost opportunity damages',
      'Emotional distress',
      'Cost of alternative housing',
      'Statutory damages (if applicable)',
      'Attorney\'s fees'
    ],
    
    urgency: 'high',
    typicalTimeframe: 'File complaint within 1 year of discrimination'
  },

  VOUCHER_HQS_FAILURE: {
    id: 'voucher_hqs_failure',
    category: 'Section 8 / Voucher',
    name: 'Landlord Fails HQS Inspection - Tenant Risks Losing Voucher',
    
    legalIssues: [
      'Breach of warranty of habitability',
      'Landlord failure to maintain property',
      'Retaliation risk if tenant complains',
      'Voucher termination risk'
    ],
    
    typicalFactPattern: [
      'PHA schedules HQS inspection',
      'Unit fails inspection (health/safety issues)',
      'Landlord given time to correct',
      'Landlord delays or refuses repairs',
      'PHA threatens to terminate voucher',
      'Tenant forced to move or lose subsidy'
    ],
    
    evidenceTypes: [
      'HQS inspection report from PHA',
      'Photos of failed items',
      'Repair requests to landlord',
      'Landlord refusal communications',
      'PHA correspondence re: voucher termination',
      'Alternative housing costs'
    ],
    
    dataOverlays: [
      'Building violation history - show landlord pattern',
      'HQS standards checklist',
      'Local code violation records',
      'Voucher payment standard for area'
    ],
    
    hudRules: [
      'HUD HQS standards (24 CFR Part 982.401)',
      'Landlord obligation to maintain HQS compliance',
      'Tenant protection from voucher loss due to landlord failure',
      'State habitability laws'
    ],
    
    damages: [
      'Cost of moving',
      'Cost of storage',
      'Rent differential if forced to higher-cost unit',
      'Emotional distress',
      'Lost time/wages dealing with crisis'
    ],
    
    urgency: 'immediate',
    typicalTimeframe: 'Must act within PHA\'s correction period (often 30 days)'
  },

  VOUCHER_PHA_ERRORS: {
    id: 'voucher_pha_errors',
    category: 'Section 8 / Voucher',
    name: 'PHA Delays, Errors, or Miscalculations',
    
    legalIssues: [
      'Administrative errors by PHA',
      'Payment calculation errors',
      'Delayed payments causing eviction risk',
      'Wrongful termination of voucher'
    ],
    
    typicalFactPattern: [
      'PHA miscalculates tenant portion',
      'PHA delays payments to landlord',
      'Landlord threatens eviction',
      'PHA fails to respond to requests',
      'PHA terminates voucher without proper hearing'
    ],
    
    evidenceTypes: [
      'Voucher documents showing calculations',
      'Income verification documents',
      'Correspondence with PHA',
      'Payment records',
      'Eviction notice from landlord',
      'Hearing requests and results'
    ],
    
    dataOverlays: [
      'HUD Resource Locator - find housing counselors',
      'PHA performance data',
      'Fair hearing procedures'
    ],
    
    hudRules: [
      'HCV program regulations (24 CFR Part 982)',
      'Fair hearing rights (24 CFR 982.555)',
      'Payment standards (24 CFR 982.503)',
      'Income determination rules (24 CFR 5.609)'
    ],
    
    damages: [
      'Overpayment of rent (if tenant paid too much)',
      'Late fees from landlord',
      'Risk of eviction',
      'Cost of appeals/hearings'
    ],
    
    urgency: 'high',
    typicalTimeframe: 'Request fair hearing within 10-15 days of adverse action'
  },

  VOUCHER_RETALIATION: {
    id: 'voucher_retaliation',
    category: 'Section 8 / Voucher',
    name: 'Landlord Harassment/Retaliation After Voucher Complaint',
    
    legalIssues: [
      'Retaliation for HQS complaint',
      'Retaliation for PHA involvement',
      'Constructive eviction',
      'Harassment'
    ],
    
    typicalFactPattern: [
      'Tenant requests repairs or reports to PHA',
      'HQS inspection finds violations',
      'Landlord becomes hostile',
      'Landlord refuses lease renewal',
      'Landlord files eviction for pretextual reason',
      'Landlord makes living conditions intolerable'
    ],
    
    evidenceTypes: [
      'Timeline of complaint → retaliation',
      'Communications showing hostility',
      'Witness statements',
      'HQS reports',
      'Eviction notice',
      'Proof of selective enforcement'
    ],
    
    dataOverlays: [
      'Eviction Lab data - area filing rates',
      'Building violation history',
      'Landlord pattern across properties'
    ],
    
    hudRules: [
      'Anti-retaliation protections (federal + state)',
      'Fair Housing Act retaliation prohibition',
      'HCV program protections',
      'State tenant protection laws'
    ],
    
    damages: [
      'Emotional distress',
      'Moving costs',
      'Rent differential',
      'Punitive damages (if egregious)',
      'Attorney\'s fees'
    ],
    
    urgency: 'immediate',
    typicalTimeframe: 'Document retaliation immediately; file complaint within 1 year'
  },

  // ========================================
  // 2. PRIVATE MARKET RENTERS (NON-SUBSIDIZED)
  // ========================================

  FAILURE_TO_REPAIR: {
    id: 'failure_to_repair',
    category: 'Private Market',
    name: 'Failure to Repair Dangerous Conditions',
    
    legalIssues: [
      'Breach of warranty of habitability',
      'Breach of quiet enjoyment',
      'Negligence',
      'Building code violations'
    ],
    
    typicalFactPattern: [
      'Dangerous condition exists (mold, leaks, broken systems)',
      'Tenant notifies landlord in writing',
      'Landlord ignores or delays',
      'Condition worsens',
      'Tenant\'s health affected or property damaged'
    ],
    
    evidenceTypes: [
      'Photos/videos with timestamps',
      'Written repair requests',
      'Text messages/emails',
      'Medical records',
      'Building inspector reports',
      'Receipts for damaged property'
    ],
    
    dataOverlays: [
      'Building violation database - show landlord\'s record',
      'Local housing code checklist',
      'Complaint history for building',
      'Health department records'
    ],
    
    damages: [
      'Rent abatement (habitability reduction)',
      'Property damage',
      'Medical expenses',
      'Temporary housing costs',
      'Emotional distress',
      'Punitive damages (if willful)'
    ],
    
    urgency: 'high',
    typicalTimeframe: 'Give landlord 7-30 days to repair (varies by condition severity)'
  },

  ILLEGAL_LOCKOUT: {
    id: 'illegal_lockout',
    category: 'Private Market',
    name: 'Illegal Lockout / Self-Help Eviction',
    
    legalIssues: [
      'Illegal self-help eviction',
      'Wrongful eviction',
      'Conversion (if belongings taken)',
      'Intentional infliction of emotional distress'
    ],
    
    typicalFactPattern: [
      'No court order for eviction',
      'Landlord changes locks',
      'Landlord removes tenant\'s belongings',
      'Landlord shuts off utilities',
      'Landlord threatens physical removal'
    ],
    
    evidenceTypes: [
      'Photos of changed locks',
      'Witness statements',
      'Police report',
      'Text/email threats',
      'Video of landlord blocking entry',
      'Inventory of removed/damaged property'
    ],
    
    dataOverlays: [
      'State self-help eviction laws',
      'Statutory damages available',
      'Emergency housing resources'
    ],
    
    damages: [
      'Statutory damages (often 2-3x rent)',
      'Cost of emergency housing',
      'Property damage/loss',
      'Lost wages',
      'Emotional distress',
      'Punitive damages',
      'Attorney\'s fees'
    ],
    
    urgency: 'immediate',
    typicalTimeframe: 'File emergency court order same day; police report immediately'
  },

  ILLEGAL_RENT_INCREASE: {
    id: 'illegal_rent_increase',
    category: 'Private Market',
    name: 'Rent Increase Violating Rent Control/Stabilization',
    
    legalIssues: [
      'Violation of rent control ordinance',
      'Violation of rent stabilization law',
      'Breach of lease',
      'Retaliation (if after complaint)'
    ],
    
    typicalFactPattern: [
      'Rent-controlled/stabilized unit',
      'Landlord raises rent above legal limit',
      'Landlord doesn\'t provide required notice',
      'Landlord threatens eviction if tenant doesn\'t pay',
      'May be retaliation for complaint'
    ],
    
    evidenceTypes: [
      'Rent history',
      'Lease documents',
      'Rent increase notice',
      'Rent registration documents',
      'Rent board guidelines',
      'Payment records'
    ],
    
    dataOverlays: [
      'Local rent control ordinances',
      'Rent board databases',
      'Building registration status',
      'Allowable increase percentages by year'
    ],
    
    damages: [
      'Refund of overcharged rent',
      'Triple damages (in some jurisdictions)',
      'Civil penalties',
      'Attorney\'s fees'
    ],
    
    urgency: 'medium',
    typicalTimeframe: 'File complaint within statute of limitations (often 4 years)'
  },

  SECURITY_DEPOSIT: {
    id: 'security_deposit',
    category: 'Private Market',
    name: 'Security Deposit Not Returned or Improperly Withheld',
    
    legalIssues: [
      'Violation of security deposit law',
      'Wrongful withholding',
      'Failure to provide itemized statement',
      'Failure to pay interest (where required)'
    ],
    
    typicalFactPattern: [
      'Tenant moves out and provides forwarding address',
      'Landlord doesn\'t return deposit within statutory period',
      'Landlord doesn\'t provide itemization',
      'Landlord withholds for normal wear and tear',
      'Landlord claims damages tenant didn\'t cause'
    ],
    
    evidenceTypes: [
      'Move-in inspection report',
      'Move-out inspection report',
      'Photos at move-in and move-out',
      'Lease document',
      'Written requests for return',
      'Receipts for deposit payment'
    ],
    
    dataOverlays: [
      'State security deposit laws',
      'Required timeframes by state',
      'Statutory damages multipliers',
      'Normal wear and tear definitions'
    ],
    
    damages: [
      'Return of deposit',
      'Statutory damages (often 2-3x deposit)',
      'Attorney\'s fees',
      'Interest (where required)'
    ],
    
    urgency: 'medium',
    typicalTimeframe: 'Demand return immediately; file suit after statutory deadline'
  },

  // ========================================
  // 3. PUBLIC HOUSING / PROJECT-BASED SUBSIDIZED
  // ========================================

  PUBLIC_HOUSING_CONDITIONS: {
    id: 'public_housing_conditions',
    category: 'Public/Subsidized Housing',
    name: 'Unsafe Conditions in Public Housing',
    
    legalIssues: [
      'Breach of warranty of habitability',
      'PHA negligence',
      'Building code violations',
      'Fair Housing Act (if disparate conditions)'
    ],
    
    typicalFactPattern: [
      'Public housing unit has dangerous conditions',
      'Tenant reports to PHA',
      'PHA fails to repair',
      'Conditions affect health/safety',
      'Pattern across multiple units in development'
    ],
    
    evidenceTypes: [
      'Work order requests',
      'Photos/videos',
      'Health department reports',
      'Medical records',
      'Witness statements from other tenants',
      'PHA inspection reports'
    ],
    
    dataOverlays: [
      'REAC inspection scores for property',
      'PHA violation history',
      'HUD oversight reports',
      'Other tenant complaints'
    ],
    
    damages: [
      'Rent abatement',
      'Medical expenses',
      'Property damage',
      'Emotional distress',
      'Injunctive relief (force repairs)'
    ],
    
    urgency: 'high',
    typicalTimeframe: 'Exhaust administrative grievance; then file suit'
  },

  GRIEVANCE_DENIAL: {
    id: 'grievance_denial',
    category: 'Public/Subsidized Housing',
    name: 'Wrongful Denial of Grievance/Transfer',
    
    legalIssues: [
      'Violation of PHA grievance procedures',
      'Denial of reasonable accommodation',
      'Retaliation',
      'Due process violation'
    ],
    
    typicalFactPattern: [
      'Tenant files grievance or transfer request',
      'PHA denies without proper hearing',
      'PHA doesn\'t follow own procedures',
      'Denial is discriminatory or retaliatory'
    ],
    
    evidenceTypes: [
      'Grievance filing documents',
      'PHA policies',
      'Hearing transcripts',
      'Decision letters',
      'Medical documentation (if accommodation)',
      'Correspondence'
    ],
    
    dataOverlays: [
      'PHA grievance procedures',
      'HUD reasonable accommodation guidance',
      'Fair Housing Act requirements'
    ],
    
    damages: [
      'Order PHA to provide hearing',
      'Order transfer',
      'Emotional distress',
      'Attorney\'s fees'
    ],
    
    urgency: 'medium',
    typicalTimeframe: 'Appeal within administrative process; then judicial review'
  },

  // ========================================
  // 4. EVICTION PATHWAYS
  // ========================================

  NONPAYMENT_EVICTION: {
    id: 'nonpayment_eviction',
    category: 'Eviction',
    name: 'Eviction for Nonpayment of Rent',
    
    legalIssues: [
      'Nonpayment eviction',
      'Rent withholding defense',
      'Warranty of habitability counterclaim',
      'Retaliation defense'
    ],
    
    typicalFactPattern: [
      'Tenant withholds rent due to conditions',
      'Landlord serves eviction notice',
      'Landlord files eviction lawsuit',
      'Tenant has defenses (habitability, retaliation, rent abatement)'
    ],
    
    evidenceTypes: [
      'Eviction notice',
      'Rent payment history',
      'Photos of conditions',
      'Repair requests',
      'Code violations',
      'Lease document'
    ],
    
    dataOverlays: [
      'Eviction Lab filing rates for area',
      'Building violation history',
      'Local eviction defense resources',
      'Rent abatement calculations'
    ],
    
    damages: [
      'Rent abatement (reduces amount owed)',
      'Dismissal of eviction',
      'Attorney\'s fees',
      'Counterclaims for habitability breaches'
    ],
    
    urgency: 'immediate',
    typicalTimeframe: 'Answer eviction within 5-10 days (varies by state)'
  },

  RETALIATORY_EVICTION: {
    id: 'retaliatory_eviction',
    category: 'Eviction',
    name: 'Retaliatory Eviction / Non-Renewal',
    
    legalIssues: [
      'Retaliation for complaint',
      'Retaliation for organizing',
      'Discriminatory eviction',
      'Bad faith non-renewal'
    ],
    
    typicalFactPattern: [
      'Tenant exercises legal right (repair request, complaint, etc.)',
      'Shortly after, landlord serves eviction or non-renewal',
      'Landlord uses pretextual reason',
      'Timeline shows causation'
    ],
    
    evidenceTypes: [
      'Timeline: complaint → eviction',
      'Protected activity documentation',
      'Landlord\'s stated reason',
      'Selective enforcement evidence',
      'Communications showing hostility',
      'Witness statements'
    ],
    
    dataOverlays: [
      'State retaliation statutes',
      'Presumption periods (e.g., 90 days in many states)',
      'Landlord pattern data'
    ],
    
    damages: [
      'Dismissal of eviction',
      'Statutory damages',
      'Emotional distress',
      'Attorney\'s fees',
      'Punitive damages (if available)'
    ],
    
    urgency: 'immediate',
    typicalTimeframe: 'Raise retaliation defense in eviction answer'
  },

  LEASE_VIOLATION_EVICTION: {
    id: 'lease_violation_eviction',
    category: 'Eviction',
    name: 'Eviction for Lease Violations',
    
    legalIssues: [
      'Cure or quit notice',
      'Lease interpretation',
      'Waiver defense',
      'Retaliation defense'
    ],
    
    typicalFactPattern: [
      'Landlord alleges lease violation (guests, noise, pets, etc.)',
      'Notice to cure or quit',
      'Tenant cures or disputes',
      'Landlord files eviction anyway',
      'May be pretext for discrimination/retaliation'
    ],
    
    evidenceTypes: [
      'Lease document',
      'Notice to cure',
      'Proof of cure',
      'Prior acceptance evidence (waiver)',
      'Selective enforcement evidence',
      'Witness statements'
    ],
    
    dataOverlays: [
      'Lease interpretation standards by state',
      'Waiver doctrines',
      'Retaliation timing analysis'
    ],
    
    damages: [
      'Dismissal of eviction',
      'Attorney\'s fees if landlord loses',
      'Counterclaims if retaliatory/discriminatory'
    ],
    
    urgency: 'immediate',
    typicalTimeframe: 'Cure within notice period; answer eviction within 5-10 days'
  },

  // ========================================
  // 5. FAIR HOUSING / DISCRIMINATION
  // ========================================

  DISCRIMINATION: {
    id: 'discrimination',
    category: 'Fair Housing',
    name: 'Discrimination Based on Protected Class',
    
    legalIssues: [
      'Fair Housing Act violation',
      'State/local fair housing law violation',
      'Disparate treatment',
      'Disparate impact'
    ],
    
    typicalFactPattern: [
      'Landlord treats tenant differently',
      'Reason is protected class (race, family status, disability, etc.)',
      'Comparators treated better',
      'Pattern across multiple tenants'
    ],
    
    evidenceTypes: [
      'Direct evidence (statements)',
      'Comparator evidence',
      'Statistical evidence',
      'Tester evidence',
      'Pattern evidence',
      'Communications'
    ],
    
    dataOverlays: [
      'Demographics of building/area',
      'Landlord\'s rental patterns',
      'HUD enforcement actions',
      'Local fair housing complaints'
    ],
    
    damages: [
      'Actual damages',
      'Emotional distress',
      'Punitive damages',
      'Injunctive relief',
      'Civil penalties',
      'Attorney\'s fees'
    ],
    
    urgency: 'high',
    typicalTimeframe: 'File HUD complaint within 1 year; lawsuit within 2 years'
  },

  REASONABLE_ACCOMMODATION: {
    id: 'reasonable_accommodation',
    category: 'Fair Housing',
    name: 'Failure to Provide Reasonable Accommodation',
    
    legalIssues: [
      'Fair Housing Act violation (disability discrimination)',
      'ADA violation',
      'Failure to accommodate',
      'Retaliation for requesting accommodation'
    ],
    
    typicalFactPattern: [
      'Tenant has disability',
      'Tenant requests accommodation (ESA, ramp, parking, etc.)',
      'Request is reasonable and necessary',
      'Landlord denies or ignores',
      'Landlord may retaliate'
    ],
    
    evidenceTypes: [
      'Medical documentation of disability',
      'Accommodation request letter',
      'Doctor letter explaining need',
      'Landlord\'s denial',
      'Interactive process documentation',
      'Comparator evidence'
    ],
    
    dataOverlays: [
      'HUD reasonable accommodation guidance',
      'ESA vs service animal rules',
      'Undue hardship standards',
      'State disability laws'
    ],
    
    damages: [
      'Order accommodation',
      'Actual damages',
      'Emotional distress',
      'Civil penalties',
      'Attorney\'s fees'
    ],
    
    urgency: 'high',
    typicalTimeframe: 'File complaint within 1 year; lawsuit within 2 years'
  }
};

/**
 * Get scenario by ID
 */
export function getScenario(scenarioId) {
  return RENTAL_SCENARIOS[scenarioId.toUpperCase()] || null;
}

/**
 * Get all scenarios by category
 */
export function getScenariosByCategory(category) {
  return Object.values(RENTAL_SCENARIOS)
    .filter(s => s.category === category);
}

/**
 * Get all scenario categories
 */
export function getCategories() {
  const categories = new Set();
  Object.values(RENTAL_SCENARIOS).forEach(s => categories.add(s.category));
  return Array.from(categories);
}

/**
 * Match case facts to likely scenarios
 * @param {Object} caseData - Case facts
 * @returns {Array} Ranked array of matching scenarios
 */
export function matchScenariosToCase(caseData) {
  const matches = [];
  
  // Simple keyword matching (in production, use AI/ML)
  const caseText = JSON.stringify(caseData).toLowerCase();
  
  for (const [id, scenario] of Object.entries(RENTAL_SCENARIOS)) {
    let score = 0;
    
    // Check for scenario-specific keywords
    if (id.includes('VOUCHER') && (caseText.includes('voucher') || caseText.includes('section 8'))) {
      score += 20;
    }
    
    if (id.includes('EVICTION') && caseText.includes('evict')) {
      score += 20;
    }
    
    if (id.includes('REPAIR') && (caseText.includes('repair') || caseText.includes('mold') || caseText.includes('leak'))) {
      score += 15;
    }
    
    if (id.includes('DISCRIMINATION') && (caseText.includes('discrimin') || caseText.includes('fair housing'))) {
      score += 20;
    }
    
    if (id.includes('RETALIATION') && caseText.includes('retaliat')) {
      score += 20;
    }
    
    if (score > 0) {
      matches.push({
        scenario: scenario,
        score: score,
        id: id
      });
    }
  }
  
  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  
  return matches;
}

export default RENTAL_SCENARIOS;
