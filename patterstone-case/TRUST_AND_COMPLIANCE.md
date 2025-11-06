# TRUST & COMPLIANCE FRAMEWORK

## Legal Positioning, Data Privacy, Emergency Resources, and User Safety

---

## 1. Legal Disclaimers & UPL Compliance

### Primary Disclaimer (Display on All Pages)

```
┌─────────────────────────────────────────────────────────────────┐
│ LEGAL INFORMATION, NOT LEGAL ADVICE                            │
│                                                                 │
│ The Tenant Justice Platform is NOT a law firm and does not     │
│ provide legal advice. We provide legal information,            │
│ self-help tools, and document automation software.             │
│                                                                 │
│ Using this platform does NOT create an attorney-client         │
│ relationship. Information you enter is for generating          │
│ documents and organizing your case, not for individualized     │
│ legal advice.                                                   │
│                                                                 │
│ We STRONGLY recommend consulting a licensed attorney for       │
│ complex situations, court representation, or case strategy.    │
│                                                                 │
│ [ ] I understand this is NOT legal advice                      │
└─────────────────────────────────────────────────────────────────┘
```

**Placement**: 
- Footer of every page
- Mandatory checkbox before first case submission
- Intake form header
- Document download page

### Detailed Legal Notice

**Location**: `/legal/disclaimer` page linked from footer

```markdown
## What We Are

The Tenant Justice Platform is a **legal information and document automation service**. We provide:
- Educational resources about tenant rights
- Software tools to organize evidence and timeline
- Document templates based on standard legal forms
- AI-powered analysis of fact patterns based on publicly available law

## What We Are NOT

We are NOT:
- A law firm or legal practice
- Your attorney or legal representative
- A substitute for individualized legal advice
- Authorized to represent you in court
- Able to provide legal strategy for your specific situation

## No Attorney-Client Relationship

Using our platform, creating an account, or generating documents does NOT create an attorney-client relationship. Any information you provide is:
- Used solely for document generation and case organization
- NOT reviewed by an attorney (unless you separately hire one)
- NOT covered by attorney-client privilege
- NOT confidential legal communication

## When You MUST Consult an Attorney

You should consult a licensed attorney if:
- Your case involves complex legal issues
- You need representation in court
- You face an immediate deadline (eviction hearing, etc.)
- Your landlord has hired an attorney
- You're unsure about legal strategy or your rights
- The platform recommends "high complexity" or "attorney required"

## State-Specific Rules

Tenant-landlord law varies significantly by state. Our platform provides:
- General information about common tenant rights
- Templates based on typical state requirements
- State-specific law references (where available)

However, you are responsible for:
- Verifying information applies to your jurisdiction
- Understanding local court rules and procedures
- Filing documents correctly with your local court
- Meeting all legal deadlines

## Limitation of Liability

To the maximum extent permitted by law:
- We provide information "AS IS" without warranties
- We are not liable for outcomes of your case
- We are not liable for errors in AI-generated content
- You are responsible for reviewing and editing all documents
- You are responsible for verifying legal accuracy

## Unauthorized Practice of Law (UPL) Compliance

We comply with all state UPL rules by:
- NOT providing individualized legal advice
- NOT representing clients in legal proceedings
- NOT interpreting law for specific factual situations
- Clearly identifying as a technology platform, not law firm
- Encouraging users to consult attorneys for legal advice

If you are a lawyer or judge reviewing this platform: We take UPL compliance seriously. Please contact legal@tenantjustice.ai with any concerns.
```

---

## 2. Data Privacy & Security Framework

### Privacy Policy Summary (User-Facing)

**Location**: Displayed during account creation, `/privacy` page

```markdown
## Your Evidence, Your Control

### What We Store
- **Your case facts**: Stored encrypted in our database
- **Your documents**: Stored encrypted on secure servers (AWS S3)
- **Your photos/evidence**: Encrypted, only you and those you share with can access
- **Blockchain fingerprints**: Only cryptographic hashes (NOT your actual data)

### What Goes On Blockchain
The blockchain stores:
- ✅ SHA-256 hash of your evidence files (proves they existed at a time)
- ✅ Case registration timestamp
- ✅ Document version hashes

The blockchain does NOT store:
- ❌ Your name or personal information
- ❌ Your address or landlord's name
- ❌ Actual photos or documents
- ❌ Anything that could identify you

Think of blockchain like a notary stamp: it proves "this document existed on this date" without revealing what's in it.

### Who Can See Your Data

| Data Type | You | Lawyers You Hire | Public | Landlord | Platform |
|-----------|-----|------------------|--------|----------|----------|
| Personal info (name, address) | ✅ | ✅ (if you share) | ❌ | ❌ (unless you send demand letter) | ✅ (encrypted) |
| Case facts and timeline | ✅ | ✅ (if you share) | ❌ | ❌ | ✅ (encrypted) |
| Photos and documents | ✅ | ✅ (if you share) | ❌ | ❌ | ✅ (encrypted) |
| Blockchain hashes | ✅ | ✅ | ✅ (public chain) | ✅ (public chain) | ✅ |
| AI analysis results | ✅ | ✅ (if you share) | ❌ | ❌ | ✅ (for improvement) |

### Public Case Explorer

Our Public Case Explorer shows **anonymized, aggregated data**:
- Building addresses with violation counts (from public records)
- Landlord portfolios with violation patterns (from public records)
- Anonymized case outcomes (no names, addresses changed, photos removed)
- Statistical trends (eviction rates, violation types, settlement amounts)

You control whether your case appears:
- Default: Your case stays 100% private
- Opt-in: You can publish an anonymized version to help other tenants
- You can unpublish anytime

### Data Security Measures

- 🔒 **Encryption at rest**: AES-256 encryption for all stored data
- 🔒 **Encryption in transit**: TLS 1.3 for all connections
- 🔒 **Access controls**: Role-based access, 2FA for accounts
- 🔒 **Regular audits**: Third-party security audits annually
- 🔒 **GDPR/CCPA compliant**: Right to access, delete, and export your data

### Law Enforcement / Court Orders

We comply with valid legal process (subpoenas, court orders). However:
- We will notify you unless prohibited by law
- We only provide data specified in the order
- We do not voluntarily cooperate with law enforcement without legal process
- We challenge overbroad or unlawful requests

### Your Rights

You can always:
- **Access**: Download all your data in JSON/PDF format
- **Delete**: Permanently delete your account and all data (blockchain hashes remain public but contain no personal info)
- **Export**: Transfer your data to another service
- **Correct**: Update any incorrect information
- **Restrict**: Limit how we use your data (e.g., opt out of AI training)

Contact privacy@tenantjustice.ai to exercise these rights.
```

### Technical Privacy Architecture

**File**: `/docs/PRIVACY_ARCHITECTURE.md`

```markdown
## Data Flow and Privacy Controls

### Tier 1: Highly Sensitive (PII)
- Full name, SSN, DOB
- Contact info (email, phone)
- Financial info (bank accounts, credit cards)

**Storage**: 
- PostgreSQL with column-level encryption (Vault + AWS KMS)
- Never logged or sent to AI APIs
- Purged on account deletion

### Tier 2: Sensitive (Case Details)
- Address (tenant and landlord)
- Lease terms and rent amounts
- Medical records
- Children's information

**Storage**:
- PostgreSQL with table-level encryption
- Anonymized before sending to OpenAI (addresses become "Address A", names become "Tenant 1")
- Redacted in public exports

### Tier 3: Evidence Files
- Photos of conditions
- Documents (leases, letters, receipts)
- Videos and audio

**Storage**:
- AWS S3 with server-side encryption (SSE-KMS)
- Signed URLs with expiration (15 min)
- EXIF data stripped from photos
- Facial recognition blur option for photos with people

### Tier 4: Blockchain Anchors
- SHA-256 hash of evidence
- Timestamp
- Case ID (UUID, not linked to identity)

**Storage**:
- Ethereum Sepolia testnet (dev)
- Ethereum Mainnet or Polygon (production)
- IPFS for encrypted metadata only (not actual files)

### AI API Safety

When sending data to OpenAI:
- **Anonymize**: Replace all names/addresses/dates
- **Minimize**: Only send necessary context
- **Monitor**: Log all API calls for audit
- **Opt-out**: Users can opt out of AI analysis entirely (gets basic templates only)
- **Retention**: OpenAI API data retention = 30 days max (per enterprise agreement)
```

---

## 3. Emergency Resources & Safety

### Emergency Warning Panel

**Location**: Homepage, intake form, case dashboard

```html
<div class="emergency-warning">
  <div class="icon">⚠️</div>
  <div class="content">
    <h3>In Immediate Danger?</h3>
    <p><strong>Call 911 if you are being threatened, assaulted, or in physical danger.</strong></p>
    
    <p>This platform is for <strong>building your legal case</strong>, not for emergency protection. If you're experiencing:</p>
    
    <ul>
      <li>🚨 <strong>Illegal lockout in progress</strong> (landlord changing locks right now)</li>
      <li>🚨 <strong>Utilities shut off</strong> (no heat, water, or electricity)</li>
      <li>🚨 <strong>Domestic violence or threats</strong> from landlord or others</li>
      <li>🚨 <strong>Immediate eviction</strong> (sheriff at door)</li>
    </ul>
    
    <p><strong>Contact immediately:</strong></p>
    <ul>
      <li>🆘 <strong>Police</strong>: 911 for immediate danger</li>
      <li>📞 <strong>Local Tenant Hotline</strong>: <a href="/resources/hotlines">[Find by state]</a></li>
      <li>⚖️ <strong>Legal Aid Emergency Line</strong>: <a href="/resources/legal-aid">[Find by state]</a></li>
      <li>🏠 <strong>Emergency Shelter</strong>: 1-800-799-SAFE (domestic violence)</li>
    </ul>
    
    <p>After you're safe, come back here to document everything and build your case.</p>
  </div>
</div>
```

### State-by-State Emergency Resources

**File**: `/platform/data/emergency-resources.json`

```json
{
  "NY": {
    "state": "New York",
    "emergencyHotline": {
      "name": "NYC Tenant Helpline",
      "phone": "311",
      "hours": "24/7",
      "description": "Report illegal lockouts, no heat/hot water, harassment"
    },
    "legalAid": {
      "name": "Legal Aid Society",
      "phone": "(212) 577-3300",
      "website": "https://legalaidnyc.org",
      "emergencyIntake": true
    },
    "tenantUnions": [
      {
        "name": "Met Council on Housing",
        "phone": "(212) 979-0611",
        "website": "https://metcouncilonhousing.org"
      }
    ],
    "policeDept": {
      "lockoutEnforcement": true,
      "notes": "NYPD can enforce illegal lockout laws 24/7. Call 911 if locked out."
    },
    "courtInfo": {
      "name": "NYC Housing Court",
      "emergencyOrders": true,
      "notes": "Can file Order to Show Cause for emergency repairs or illegal lockout"
    }
  },
  "CA": {
    "state": "California",
    "emergencyHotline": {
      "name": "CA Tenants: A Guide to Residential Tenants' and Landlords' Rights and Responsibilities",
      "phone": "(800) 952-5225",
      "hours": "M-F 9am-5pm PT",
      "website": "https://www.dca.ca.gov/publications/landlordbook/"
    },
    "legalAid": {
      "name": "Legal Aid Foundation of Los Angeles",
      "phone": "(800) 399-4529",
      "website": "https://lafla.org"
    }
  }
  // ... all 50 states + DC
}
```

### Safety Planning Tool

**Feature**: Built into case intake

```markdown
## Personal Safety Assessment

For cases involving:
- Domestic violence
- Landlord harassment or threats
- Retaliation concerns
- Immigration status issues

We provide a **Safety Planning Checklist**:

### Digital Safety
- [ ] Document landlord communications, but use caution if abusive partner has access
- [ ] Consider separate email account for legal communications
- [ ] Use device your abuser doesn't have access to
- [ ] Clear browser history after using this site (or use incognito mode)

### Evidence Collection Safety
- [ ] Take photos when landlord is not present (if they're the threat)
- [ ] Have trusted friend hold copies of evidence
- [ ] Store evidence in cloud account only you can access
- [ ] Don't take photos that reveal security vulnerabilities or private areas

### Communication Safety
- [ ] Use platform's messaging system (creates audit trail)
- [ ] Don't meet landlord alone if they've been threatening
- [ ] Request repairs in writing only (no in-person confrontations)
- [ ] Consider having witness present for inspections or conversations

### Eviction Safety
- [ ] Know your state's eviction timeline
- [ ] Have emergency housing plan (family, shelter, etc.)
- [ ] Keep essential documents and valuables ready to move quickly
- [ ] Know your rights (landlord cannot forcibly remove you without court order)

### If You Have Children
- [ ] Document how conditions affect children
- [ ] Keep school/medical records showing health impacts
- [ ] Consider notifying school if housing is unstable
- [ ] Know children's rights (cannot be locked out, must have heat/water)
```

---

## 4. "When You MUST Call a Lawyer" Intelligence

### Complexity Scoring System

Every case gets automatic complexity score (0-100):

```javascript
function calculateComplexityScore(caseData, legalAnalysis) {
  let score = 0;
  
  // Base complexity factors
  if (caseData.evictionFiled) score += 30; // Eviction = urgent + complex
  if (caseData.damagesAmount > 50000) score += 20; // High stakes
  if (caseData.landlordHasAttorney) score += 25; // Uneven playing field
  if (legalAnalysis.violations.length > 5) score += 10; // Many legal issues
  if (caseData.criminalCharges) score += 40; // Criminal aspect
  if (caseData.childrenAffected) score += 10; // Vulnerable parties
  if (caseData.disabilityAccommodation) score += 15; // ADA complexity
  if (caseData.publicHousing) score += 10; // Federal rules
  
  // Timeline urgency
  if (caseData.daysUntilDeadline < 10) score += 20;
  if (caseData.daysUntilDeadline < 3) score += 30;
  
  // Evidence issues
  if (caseData.evidenceQuality === 'weak') score += 15;
  if (caseData.witnessesAvailable === false) score += 10;
  
  return Math.min(score, 100);
}
```

### Attorney Recommendation Trigger

```markdown
## When Platform Recommends Attorney

| Complexity Score | Recommendation | Action |
|------------------|----------------|--------|
| 0-30 | **Self-help appropriate** | "You can likely handle this with our tools" |
| 31-60 | **Consider attorney** | "An attorney would help, but not required. We'll give you strong documents." |
| 61-80 | **Attorney strongly recommended** | "Your case is complex. We'll help prepare, but get attorney for court." |
| 81-100 | **Attorney required** | "This is too complex/urgent for self-help. Find attorney immediately. We'll help organize for them." |

### Specific Attorney-Required Scenarios

Auto-triggered alerts:

1. **Eviction Filed + Hearing < 7 days**
   - "⚠️ URGENT: You have an eviction hearing in [X] days. You need attorney representation NOW."
   - Shows local legal aid links with "Emergency Intake" flag

2. **Landlord Has Attorney**
   - "⚖️ Your landlord has hired a lawyer. You should too. Representing yourself against attorney is very difficult."
   - Offers "Attorney Match" service

3. **Criminal Allegations**
   - "🚨 Your landlord alleges criminal activity. This is beyond civil tenant law. You need criminal defense attorney."
   - Links to public defender / criminal legal aid

4. **Child Protective Services (CPS) Involved**
   - "⚠️ CPS involvement changes this significantly. You need family law attorney + housing attorney."
   - Dual referral system

5. **Wrongful Eviction Suit (Tenant Suing Landlord)**
   - "💼 Filing a lawsuit requires legal expertise. We'll draft complaint, but attorney should file and represent."
   - "Contingency fee" attorney referral (they get % of damages)

6. **Disability Discrimination / Reasonable Accommodation Denial**
   - "♿ Disability law is federal + complex. Fair housing attorney recommended."
   - Links to HUD fair housing offices

7. **Immigration Issues**
   - "🛂 Immigration concerns require specialized attorney. Housing case could affect status."
   - Links to immigration legal services

### Attorney Referral Network

**File**: `/platform/services/attorney-referral.js`

```javascript
class AttorneyReferralService {
  /**
   * Find attorneys based on case complexity and location
   */
  async findAttorneys(caseData, filters = {}) {
    const attorneys = [];
    
    // Priority 1: Legal aid (free/low-cost)
    if (caseData.income < this.legalAidThreshold(caseData.state)) {
      const legalAid = await this.findLegalAid(caseData.zip, caseData.issueTypes);
      attorneys.push(...legalAid.map(org => ({
        type: 'legal_aid',
        cost: 'Free',
        ...org
      })));
    }
    
    // Priority 2: Law school clinics
    const clinics = await this.findLawSchoolClinics(caseData.state);
    attorneys.push(...clinics.map(clinic => ({
      type: 'clinic',
      cost: 'Free',
      ...clinic
    })));
    
    // Priority 3: Pro bono through bar association
    const proBono = await this.findProBonoPrograms(caseData.state, caseData.county);
    attorneys.push(...proBono.map(program => ({
      type: 'pro_bono',
      cost: 'Free (if eligible)',
      ...program
    })));
    
    // Priority 4: Contingency fee attorneys (for damages cases)
    if (caseData.damagesAmount > 10000) {
      const contingency = await this.findContingencyAttorneys(caseData.state);
      attorneys.push(...contingency.map(atty => ({
        type: 'contingency',
        cost: 'No upfront cost (% of winnings)',
        ...atty
      })));
    }
    
    // Priority 5: Flat-fee tenant attorneys
    const flatFee = await this.findFlatFeeAttorneys(caseData.state);
    attorneys.push(...flatFee.map(atty => ({
      type: 'flat_fee',
      cost: '$500-$2000 (varies)',
      ...atty
    })));
    
    return attorneys;
  }
  
  /**
   * "Attorney Prep Package" - export case for attorney
   */
  async generateAttorneyPackage(caseId) {
    const caseData = await this.getCaseData(caseId);
    const analysis = await this.getAIAnalysis(caseId);
    
    return {
      coverLetter: this.generateCoverLetter(caseData, analysis),
      timeline: this.exportTimeline(caseId, format='pdf'),
      evidence: this.exportEvidence(caseId, organized=true),
      legalIssues: analysis.violations,
      damages: analysis.damagesCalculation,
      documentDrafts: this.getDrafts(caseId),
      blockchainProof: this.getBlockchainCertificate(caseId)
    };
  }
}
```

---

## 5. Scope and Boundaries

### "Who This Is For" Page

**Location**: `/about/who-this-is-for`

```markdown
## Who This Platform Is For

### ✅ Perfect For

**Residential Tenants** dealing with:
- Habitability violations (mold, leaks, pests, lack of heat/water)
- Security deposit disputes
- Illegal rent increases
- Retaliation or harassment
- Section 8 / housing voucher issues
- Discrimination or failure to accommodate disability
- Lease violations or wrongful eviction threats
- Organizing evidence and timeline before hiring attorney

**Self-Represented Litigants** who:
- Can't afford attorney upfront
- Want to try negotiating before court
- Need professional documents and evidence organization
- Are comfortable reviewing and editing AI-generated content
- Have time to learn about their rights

**Attorneys and Legal Aid** who:
- Want clients to arrive organized with evidence
- Need efficient intake and case assessment
- Want blockchain-verified evidence for court
- Represent low-income tenants pro bono

### ⚠️ Use With Caution

These cases work with our platform BUT strongly benefit from attorney:
- Active eviction lawsuit (< 30 days to hearing)
- Landlord has hired attorney
- Case involves > $50,000 in damages
- You're suing landlord (not just defending)
- Complex multi-party disputes
- Commercial lease (not residential)

### ❌ Not For

**This platform is NOT designed for:**

- **Landlords or property managers** (we're tenant-first; our tools are advocacy for tenants)
- **Homeowners with mortgage/HOA issues** (different laws; we're rental-focused)
- **Commercial tenants** (business leases have different rules; we focus on residential)
- **Immediate emergencies** (illegal lockout happening NOW → call 911, not us)
- **Criminal defense** (if landlord alleges crime, get criminal attorney)
- **Family law** (divorce, custody, etc. even if related to housing)
- **Immigration cases** (though housing issues can affect immigration; get specialized attorney)

If you're unsure, start a case. Our AI will tell you if it's outside our scope.

---

## Jurisdiction Coverage

### Currently Supported: All 50 U.S. States + DC

We have:
- ✅ **Federal law database**: Fair Housing Act, ADA, HUD regulations
- ✅ **State-level laws**: Landlord-tenant statutes for all 50 states + DC
- ✅ **Major city ordinances**: NYC, LA, SF, Chicago, Boston, Seattle, DC (expanding)
- ✅ **County-specific rules**: Where available in our database

### What "Supported" Means

- **Law library**: We have state statutes and major case law
- **Document templates**: Generic templates + state-specific where we have data
- **Court forms**: Where available from state courts (varies widely)

### What "Supported" Does NOT Mean

- We don't have every local ordinance (e.g., small town rent control)
- We don't have real-time updates on brand-new laws (updated quarterly)
- We can't account for hyper-local judge preferences or court customs

**Your responsibility**: Verify generated documents match your local rules. When in doubt, consult local legal aid or attorney.

### International (Coming Soon)

- 🇬🇧 **UK (England & Wales)**: Waitlist open
- 🇨🇦 **Canada (Ontario, BC)**: Waitlist open
- 🇦🇺 **Australia**: Waitlist open

[Join International Waitlist →]
```

---

## 6. Implementation Checklist

### Phase 1: Critical Trust Elements (Week 1)
- [ ] Add legal disclaimer to footer (all pages)
- [ ] Create `/legal/disclaimer` page
- [ ] Add mandatory disclaimer checkbox to account creation
- [ ] Add emergency warning panel to homepage and intake
- [ ] Create state-by-state emergency resources database
- [ ] Add "Attorney Recommended" scoring to case analysis
- [ ] Create `/about/who-this-is-for` page

### Phase 2: Privacy & Security (Week 2)
- [ ] Write comprehensive privacy policy
- [ ] Create privacy architecture documentation
- [ ] Implement data encryption (at-rest and in-transit)
- [ ] Add blockchain privacy explainer ("what goes on-chain")
- [ ] Create user data export tool (GDPR/CCPA compliance)
- [ ] Add "Delete my account" feature with data purge
- [ ] Implement photo EXIF stripping and face blur option

### Phase 3: Attorney Integration (Week 3)
- [ ] Build attorney referral database (legal aid, pro bono, private)
- [ ] Create "Attorney Prep Package" export feature
- [ ] Add "Find Attorney" button to high-complexity cases
- [ ] Build attorney partner portal (for attorneys who want referrals)
- [ ] Create contingency fee attorney matching (for damages cases > $10k)

### Phase 4: Safety Features (Week 4)
- [ ] Add safety planning checklist to intake
- [ ] Create "Clear History" button for at-risk users
- [ ] Add option to use pseudonym internally (case shown as "Case #12345" in dashboard)
- [ ] Build "Export for Safe Storage" feature (encrypted USB / cloud backup)
- [ ] Add DV/harassment detection triggers (auto-suggests safety resources)

---

## Summary: Trust Architecture

**The Goal**: Transform from "cool AI tech" to "serious legal product that judges, lawyers, and tenants can trust."

**The Additions**:
1. **Legal compliance**: Clear disclaimers, UPL positioning, scope boundaries
2. **Data privacy**: Transparent about what's stored, what's on-chain, who sees what
3. **Emergency safety**: Resources for immediate danger, not just long-term cases
4. **Attorney collaboration**: When to get lawyer, how to prep for them, referral network
5. **Honest boundaries**: Who this is for, what it can't do, when to stop and get help

**The Outcome**: Platform that empowers self-help where appropriate, escalates to professional help when necessary, and never misleads users about what AI + software can achieve vs what requires human legal expertise.

**Next Step**: Push all this to GitHub with comprehensive README so repo shows "serious, legally-sound, ethically-built platform" from day one.
