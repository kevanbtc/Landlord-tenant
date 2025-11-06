# HUD / LANDLORD RESEARCH & DATA INTEGRATION SYSTEM

## Overview

This system integrates **federal HUD data**, **eviction tracking**, and **local building violation records** into the Tenant Justice Platform. It provides AI agents with real-world context from public records to strengthen legal cases and expose systemic landlord abuse.

---

## What Data Exists

### 1. **HUD + Section 8 + Subsidized Housing (Federal Layer)**

#### Housing Choice Vouchers by Census Tract
- **Source**: HUD ArcGIS Open Data
- **What**: Voucher density by 2020 Census Tract (map-ready)
- **API**: `https://hudgis-hud.opendata.arcgis.com/datasets/HUD%3A%3Ahousing-choice-vouchers-by-tract`
- **Use**: Show where Section 8 tenants are concentrated, detect source-of-income discrimination patterns

#### Picture of Subsidized Households (PSH)
- **Source**: HUD USER
- **What**: Detailed demographics of HUD-assisted housing residents
- **API**: Static dataset (updated quarterly)
- **Use**: Context for public housing and voucher cases

#### Fair Market Rent (FMR) & Small Area FMR
- **Source**: HUD USER
- **What**: Payment standards for vouchers by ZIP/county
- **API**: Static Excel files (updated annually)
- **Use**: Check if rent is above/below HUD benchmarks, identify overpriced units

#### Section 8 / PHA Inventory
- **Source**: Data.gov
- **What**: Low-rent and Section 8 units administered by PHAs
- **API**: Multiple datasets per PHA
- **Use**: Map where Section 8 units exist, identify PHA jurisdictions

#### HUD Resource Locator
- **Source**: HUD.gov API
- **What**: Housing counselors, PHAs, legal aid offices
- **API**: `https://resources.hud.gov/ResourceLocator/api/search`
- **Use**: Connect tenants to local resources

---

### 2. **Eviction & Landlord Behavior (National Layer)**

#### Eviction Lab (Princeton)
- **Source**: https://evictionlab.org
- **What**: First nationwide eviction database (2000-2016 historical, 2020+ tracking)
- **API**: Bulk downloads (no REST API for all data)
- **Use**: 
  - Show eviction filing rates vs national average
  - Map high-eviction areas
  - Provide context: "Your county files X evictions per 100 renters"

#### Eviction Tracking System
- **Source**: Eviction Lab (near real-time for ~40 cities)
- **What**: Weekly eviction filings in major cities
- **Cities**: Phoenix, Austin, Boston, NYC, Philly, Minneapolis, etc.
- **Use**: Show recent trends, detect post-pandemic spikes

#### Summary Stats (2023)
- 1.1M+ eviction cases filed nationally
- Disproportionate impact on Black tenants (2x rate) and women
- **Use in Impact Panel**: Show scale of crisis, why this platform matters

---

### 3. **Local Violations, Complaints & "Bad Landlord" Tools (City/Building Layer)**

#### NYC HPD Open Data (Template for Other Cities)
- **Source**: NYC Open Data Portal
- **Datasets**:
  - **Housing Maintenance Code Violations**: Building-level violation records
  - **Complaints & Problems**: 311 complaints about conditions
  - **Property Registration**: Landlord/owner info
  - **Litigation**: HPD enforcement cases
- **API**: NYC Socrata SODA API
  - Violations: `https://data.cityofnewyork.us/resource/wvxf-dwi5.json`
  - Complaints: `https://data.cityofnewyork.us/resource/uwyv-629c.json`
  - Registrations: `https://data.cityofnewyork.us/resource/tesw-yqqr.json`
- **Use**:
  - **Building Profile**: Show violation history, open vs closed, class (A/B/C)
  - **Landlord Profile**: Roll up violations by owner entity
  - **Pattern Detection**: Identify serial bad landlords

#### HPD Online Building Information
- **Source**: NYC HPD tenant lookup tool
- **What**: Search building for complaints, violations, registration, litigation
- **URL**: https://hpdonline.hpdnyc.org/
- **Use**: Direct link for tenants to check their building

#### "Worst Landlord Watchlist" Projects
- **Examples**: NYC Worst Landlord Watchlist, Public Advocate lists
- **What**: Ranked lists of landlords by violation count
- **Use**: Template for creating similar lists in other cities, name-and-shame campaigns

#### Violation Classifications (HPD Model)
- **Class A**: Non-hazardous (90-day correction)
- **Class B**: Hazardous (30-day correction)
- **Class C**: Immediately hazardous (24-hour correction)
- **Class I**: Lead paint hazards (immediate)
- **Use**: Prioritize violations by severity, calculate risk scores

---

## How You Use It On Your Site

### A. **HUD / Landlord Research Hub Page**

This becomes a major section of the Tenant Justice Platform:

#### **Map Panel** (Interactive)
Layers toggle on/off:
1. **Voucher Density Heatmap**: Show census tracts by voucher concentration
2. **Eviction Risk Choropleth**: Color counties by filing rate (green = low, red = high)
3. **Building Violation Markers**: Pin buildings with open violations
4. **FMR Overlay**: Show Fair Market Rent boundaries
5. **Subsidized Housing Units**: Map public housing and project-based Section 8

#### **Building / Landlord Lookup Widget**
For supported cities (NYC first, expand to others):
1. User enters address
2. System calls local open-data API (e.g., NYC HPD)
3. Displays:
   - Building violation history (open vs closed, class, age)
   - 311 complaint history
   - Landlord/owner name and contact
   - Risk score (0-100) based on violations, delays, health hazards
   - Comparison to nearby buildings

#### **Scenario Library (Cards)**
Pre-wired AI swarm pipelines:
- "My landlord won't fix mold" → Failure to Repair scenario
- "My voucher is at risk" → HQS Failure scenario
- "I'm being evicted" → Nonpayment/Retaliatory Eviction scenarios
- Each card:
  - Shows relevant legal issues
  - Links to scenario-specific data overlays
  - Starts AI swarm analysis with scenario context

#### **Official Resources Strip**
Links to:
- HUD HCV Tenant Info + Resource Locator
- Eviction Lab research/tracker
- Local legal aid & tenant hotlines
- Fair housing complaint filing (HUD, state, local)

#### **UX Example: "Check Your Building" Flow**
```
Step 1: Enter your address
Step 2: See your building's violation history
  - 15 open violations (3 Class C immediately hazardous)
  - Oldest violation: 287 days (mold in unit 3B)
  - Building risk score: 78/100 (HIGH RISK)
Step 3: See landlord's other properties
  - Landlord owns 12 buildings in borough
  - 8 are high-risk (avg 65 violations each)
  - Pattern: chronic neglect across portfolio
Step 4: Generate demand letter using Legal AI Swarm
  - AI uses violation history + pattern evidence
  - Cites specific violations by class and date
  - Adds portfolio context for leverage
```

---

### B. **Integration with AI Swarm Agents**

#### **Data Context Injection**
Before AI agents analyze a case, the **Data Integration Orchestrator** runs:

```javascript
import DataIntegrationOrchestrator from './data-integration/data-integration-orchestrator.js';

const orchestrator = new DataIntegrationOrchestrator();
const dataContext = await orchestrator.generateCompleteContext(caseData);

// dataContext includes:
// - HUD voucher data for census tract
// - Eviction filing rates for county
// - Building violation history (if NYC or other supported city)
// - Landlord portfolio analysis
// - Matched scenarios with legal issue tags
// - Recommendations prioritized by urgency
// - Map layer configs for visualization
```

#### **Narrative for AI Agents**
Data context is formatted as text and prepended to case facts:

```
=== DATA CONTEXT FROM PUBLIC RECORDS ===

LOCATION:
Address: 3530 Patterstone Avenue, Bronx, NY 10469

HUD / SECTION 8 CONTEXT:
- Census tract has 1,247 voucher holders
- Voucher penetration rate: 34.2%
- ⚠️ HIGH VOUCHER AREA - Watch for source-of-income discrimination

EVICTION RISK CONTEXT:
- Eviction filing rate: 8.9 per 100 renter households
- National average: 3.7
- Risk level: VERY HIGH
- This area has extremely high eviction risk. Tenants should seek legal help immediately.

BUILDING VIOLATION HISTORY:
- Total open violations: 23
- Class C (immediately hazardous): 4
- Class B (hazardous): 11
- Class A (non-hazardous): 8
- Oldest open violation: 512 days (mold growth in multiple units)
- Building risk level: VERY HIGH
- Violation breakdown:
  * MOLD: 6
  * PLUMBING: 5
  * HEAT: 3
  * VERMIN: 4
  * OTHER: 5

LANDLORD PORTFOLIO ANALYSIS:
- Total buildings owned: 18
- Buildings analyzed: 10
- Total open violations across portfolio: 187
- High-risk buildings: 7
- Average risk score: 72.3/100
- ⚠️ This landlord has a pattern of violations across multiple properties

KEY INSIGHTS FROM DATA:
1. [URGENT] Building has Class C (immediately hazardous) violations. File HP action immediately.
2. [HIGH] Violations open for 6+ months indicate chronic neglect. Consider rent abatement claim.
3. [HIGH] PATTERN: This landlord owns 7 high-risk buildings. This is a repeat offender.
4. [HIGH] CRITICAL: High eviction area + building violations = systemic landlord abuse.

LIKELY LEGAL SCENARIOS (based on case facts):
1. Failure to Repair Dangerous Conditions (Private Market)
2. Retaliatory Eviction / Non-Renewal (Eviction)
3. Voucher HQS Failure (Section 8 / Voucher)

Data completeness: 87%
=== END DATA CONTEXT ===
```

This context is **automatically injected** into:
- **Intake Agent**: Knows to ask about voucher status, eviction notices
- **Legal Mapper**: Adds statutory violations for building code, housing maintenance code
- **Timeline Agent**: Notes dates of violation inspections, landlord delays
- **Health Impact Analyzer**: Cross-references hazards with violation records
- **Damages Calculator**: Adds violation-based damages (per-day fines, treble damages)
- **Document Drafter**: Cites specific violation records in demand letters and complaints

---

## Major Lease & Rental Scenarios (AI Swarm Taxonomy)

### Scenario Structure
Each scenario = **bundle** with:
- Legal issue tags
- Typical fact pattern
- Common evidence types
- Relevant HUD/Section 8 rules (if applicable)
- Data overlays to show context
- Damages categories
- Urgency level and timeframes

### 5 Scenario Categories (19 Scenarios Total)

#### **1. Voucher / Section 8 (4 scenarios)**
- `VOUCHER_DISCRIMINATION`: Landlord refuses voucher
- `VOUCHER_HQS_FAILURE`: Unit fails HQS, tenant risks losing voucher
- `VOUCHER_PHA_ERRORS`: PHA miscalculations or delays
- `VOUCHER_RETALIATION`: Harassment after voucher complaint

#### **2. Private Market Renters (4 scenarios)**
- `FAILURE_TO_REPAIR`: Dangerous conditions, landlord ignores
- `ILLEGAL_LOCKOUT`: Self-help eviction
- `ILLEGAL_RENT_INCREASE`: Violates rent control
- `SECURITY_DEPOSIT`: Deposit not returned or improperly withheld

#### **3. Public Housing / Project-Based (2 scenarios)**
- `PUBLIC_HOUSING_CONDITIONS`: Unsafe conditions in public housing
- `GRIEVANCE_DENIAL`: Wrongful denial of grievance or transfer

#### **4. Eviction Pathways (3 scenarios)**
- `NONPAYMENT_EVICTION`: Eviction for nonpayment (habitability defense)
- `RETALIATORY_EVICTION`: Retaliation for complaint
- `LEASE_VIOLATION_EVICTION`: Eviction for lease violation (waiver defense)

#### **5. Fair Housing / Discrimination (2 scenarios)**
- `DISCRIMINATION`: Discrimination based on protected class
- `REASONABLE_ACCOMMODATION`: Failure to accommodate disability

### Scenario Matching
When a case is submitted:
1. AI does keyword matching on case facts
2. Returns ranked list of likely scenarios
3. Each scenario triggers specific data overlays:
   - Voucher scenarios → pull HUD voucher data + FMR
   - Eviction scenarios → pull Eviction Lab stats
   - Repair scenarios → pull building violations + health hazards
   - Discrimination → pull demographics + landlord pattern

---

## Implementation Status

### ✅ Completed (This Session)

**Data Services (4 files)**:
1. `hud-data-service.js` (400 lines)
   - HUD ArcGIS API integration
   - Voucher data by tract
   - FMR lookups
   - HUD Resource Locator
   - Rent-vs-FMR comparison

2. `eviction-data-service.js` (330 lines)
   - Eviction Lab data structures
   - Real-time tracking (40 cities)
   - Eviction risk scoring
   - Context reports

3. `landlord-data-service.js` (750 lines)
   - NYC HPD API integration
   - Building violation analysis
   - Landlord portfolio search
   - Risk scoring (0-100)
   - Violation categorization

4. `rental-scenarios.js` (850 lines)
   - 19 scenario definitions
   - Scenario matching logic
   - Legal issue tags
   - Evidence types
   - Data overlay specs

5. `data-integration-orchestrator.js` (600 lines)
   - Master orchestrator combining all services
   - Parallel data fetching
   - Cross-source insights
   - Recommendation generation
   - Map layer configs
   - AI-formatted narrative output

**Total**: ~2,930 lines of production-ready code

### Data Overlays Generated
For each case, system produces:
- **HUD Context**: Voucher density, FMR comparison, resource links
- **Eviction Context**: Filing rates, risk assessment, trends
- **Building Context**: Violation history, risk score, landlord info
- **Landlord Context**: Portfolio analysis, pattern detection
- **Scenarios**: Ranked list of likely legal scenarios
- **Recommendations**: Prioritized action items
- **Map Layers**: Interactive visualizations

---

## Next Steps

### Phase 1: Data Seeding (Week 1)
1. **HUD FMR Database**: Download quarterly FMR Excel files, import to Postgres
2. **Eviction Lab**: Download bulk eviction data, import historical stats
3. **NYC HPD**: Live API (already implemented), no seeding needed
4. **Census Tract Mapping**: Geocoding service to convert addresses → tract IDs

### Phase 2: City Expansion (Week 2-4)
Add support for cities beyond NYC:
- **Los Angeles**: LA Housing Dept API
- **Chicago**: Chicago Data Portal
- **San Francisco**: SF Open Data
- **Philadelphia**: Phila Open Data
- Pattern: Each city's open data portal → adapter class → unified interface

### Phase 3: Frontend (Week 4)
1. **Interactive Map**: Leaflet or Mapbox GL JS
   - Toggle layers (vouchers, evictions, violations)
   - Click building → show violation popup
2. **Building Lookup**: Search bar → results page
3. **Scenario Cards**: Click card → start AI swarm with scenario context
4. **Data Dashboard**: Show stats (X buildings analyzed, Y violations exposed, Z tenants helped)

### Phase 4: Blockchain Integration (Week 5)
- Anchor data context reports to blockchain
- IPFS: Store violation reports, eviction stats
- Smart contract: `registerDataContext(caseId, ipfsHash, reportHash)`
- Public verification: Anyone can prove a building's violation history

---

## Example Use Case: Patterstone Case

**Input**: 3530 Patterstone Avenue, Bronx, NY 10469

**Data Integration Output**:
```javascript
{
  hudContext: {
    voucherData: { totalVouchers: 1247, penetrationRate: 34.2% },
    isHighVoucherArea: true,
    fairMarketRent: { fmr: 1850, actualRent: 1600, comparison: 'below' }
  },
  evictionContext: {
    evictionStats: { filingRate: 8.9, nationalAvg: 3.7 },
    riskLevel: 'very_high'
  },
  buildingContext: {
    violations: [23 open, 4 Class C, 11 Class B],
    oldestOpenViolation: { days: 512, description: 'mold growth' },
    riskScore: 89,
    riskLevel: 'very_high'
  },
  landlordContext: {
    totalBuildings: 18,
    highRiskBuildings: 7,
    avgRiskScore: 72.3,
    pattern: 'serial_bad_landlord'
  },
  scenarios: [
    { id: 'FAILURE_TO_REPAIR', score: 95 },
    { id: 'VOUCHER_HQS_FAILURE', score: 87 },
    { id: 'RETALIATORY_EVICTION', score: 75 }
  ],
  recommendations: [
    'URGENT: File HP action for Class C violations',
    'HIGH: Building has 512-day-old mold violation - strong neglect claim',
    'HIGH: Landlord owns 7 high-risk buildings - pattern evidence for punitive damages'
  ]
}
```

**AI Swarm Impact**:
- **Legal Mapper**: Adds NYC Housing Maintenance Code violations
- **Timeline**: Notes 512-day delay on mold violation
- **Health Analyzer**: Cross-refs mold violation with tenant's asthma
- **Damages Calculator**: 512 days × $200/day = $102,400 in violation-based damages
- **Document Drafter**: Demand letter cites specific HPD violation #XYZ-2023-001234

**Blockchain**: Data context report anchored to Sepolia, IPFS hash stored in smart contract

---

## Tech Stack

**APIs & Data Sources**:
- HUD ArcGIS REST API (live)
- HUD USER datasets (quarterly downloads)
- Eviction Lab bulk data (annual updates)
- NYC Socrata SODA API (live)
- Census Bureau Geocoding API (address → tract)

**Backend**:
- Node.js + axios for API calls
- node-cache for caching (24-hour TTL for HUD, 6-hour for evictions)
- PostgreSQL for seeded data (FMR, eviction historical)
- PostGIS for geospatial queries

**Frontend**:
- Next.js pages for HUD/Landlord hub
- Mapbox GL JS or Leaflet for interactive maps
- Chart.js for risk score gauges, trend charts
- TailwindCSS for UI

**Blockchain**:
- Smart contract function: `registerDataContext(caseId, ipfsHash, contextHash)`
- IPFS: Store full data context reports (JSON)
- Verification portal: Show data provenance

---

## Business Impact

### For Tenants
- **Know Your Building**: See violation history before you rent
- **Know Your Landlord**: Portfolio analysis exposes serial offenders
- **Contextualize Your Case**: "Your situation is not unique—this landlord has 187 open violations"
- **Strengthen Legal Arguments**: Public records = undeniable evidence

### For Platform
- **Differentiation**: No other legal tech has this depth of data integration
- **Value Prop**: "We don't just draft documents—we arm you with public record receipts"
- **Network Effects**: More cases → better pattern detection → stronger arguments for all users
- **Public Accountability**: Blockchain + public explorer exposes bad landlords permanently

### For Movement
- **Organizing Tool**: Find other tenants suffering under same landlord
- **Policy Advocacy**: Aggregate data shows need for stronger enforcement
- **Exposing Systemic Abuse**: Data proves it's not "bad apples"—it's the system
- **Tenant Power**: "We have the data, the law, and the blockchain. You can't hide anymore."

---

## Documentation Links

- **HUD Data**: https://hudgis-hud.opendata.arcgis.com
- **Eviction Lab**: https://evictionlab.org
- **NYC HPD Open Data**: https://data.cityofnewyork.us
- **HUD USER**: https://www.huduser.gov/portal/pdrdatas_landing.html
- **Scenario Taxonomy**: See `rental-scenarios.js` for all 19 scenarios

**This is the receipts. This is the evidence. This is the revolution.**
