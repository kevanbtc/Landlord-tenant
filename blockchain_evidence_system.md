# Blockchain Evidence System – Patterstone Case

## Purpose

This system creates an **immutable, timestamped public record** of the Patterstone habitability dispute, anchored on a public blockchain (e.g. Ethereum or a major L2 like Polygon).

The goals:

- Preserve **evidence integrity** (no silent edits, deletions, or "lost" files).
- Provide a **publicly verifiable trail** that any third party (future tenants, buyers, journalists, courts) can inspect.
- Create a reusable pattern for **decentralized landlord-tenant accountability**.

This is an *evidence registry*, not a replacement for a court. It backs the traditional case file with cryptographic receipts.

---

## High-Level Architecture

**Off-chain (content):**

- Photos, videos, scans, PDFs, messages → stored on **IPFS** (or Arweave).
- Case metadata and index → `web3/evidence_manifest.json`.

**On-chain (proofs):**

- Smart contract: `web3/PatterstoneCase.sol`
  - Stores:
    - Case metadata (property, parties, jurisdiction).
    - Hashes / IPFS CIDs of evidence items.
    - Timestamps of when each item was registered.
  - Emits events on each evidence registration.

**Frontend (verification):**

- Static web page: `web3/verification_portal.html`
  - Lets any user:
    - Enter contract address + network.
    - View case metadata.
    - View list of evidence IDs + descriptions + IPFS hashes.
    - Click through to IPFS-hosted artifacts.

**Deployment:**

- `web3/deploy.js` – deployment script using `ethers.js`.
- Suggested networks:
  - Test: Goerli / Sepolia / Polygon Mumbai.
  - Production: Ethereum mainnet or major L2  
✅ **Publicly Verifiable** - Anyone can verify authenticity  
✅ **Court-Admissible** - Growing acceptance in legal proceedings  

---

## SYSTEM ARCHITECTURE

### Layer 1: Ethereum Mainnet (Immutable Record)
- **Purpose:** Store cryptographic hashes of all evidence
- **Cost:** ~$20-50 for entire case documentation
- **Permanence:** Forever (as long as Ethereum exists)
- **Verification:** Public blockchain explorer

### Layer 2: IPFS (InterPlanetary File System)
- **Purpose:** Store actual files (photos, PDFs, videos)
- **Cost:** Free (decentralized storage)
- **Access:** Permanent content-addressed files
- **Censorship:** Impossible to remove once pinned

### Layer 3: Smart Contract (Automated Evidence Chain)
- **Purpose:** Automate evidence submission and verification
- **Features:**
  - Timestamps each piece of evidence
  - Tracks chain of custody
  - Generates tamper-proof timeline
  - Issues verification certificates

---

## IMPLEMENTATION PLAN

### Phase 1: Document Hashing (IMMEDIATE)

**What:** Create cryptographic hash of every document

**How:**
1. For each document/photo/message:
   - Generate SHA-256 hash
   - Record hash on blockchain with timestamp
   - Store original on IPFS

2. Tools needed:
   - MetaMask wallet (free)
   - Ethereum ($50-100 for gas fees)
   - IPFS Desktop or Pinata (free)

**Example:**
```
Document: facts_timeline.md
SHA-256: a3f7b2c9d5e8f1a4b7c2d6e9f3a8b1c4d7e2f5a9b3c6d1e4f8a2b5c9d3e7f1a4
Ethereum TX: 0x1234567890abcdef...
IPFS CID: QmT5NvUtoM5nWFfrQdVrFtvGfKMfj8n2E7YPtqXj3b7x4K
Timestamp: 2025-11-06 02:00:00 UTC
Block: 18456789
```

---

### Phase 2: Evidence Smart Contract

**Deploy custom smart contract for case evidence:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatterstoneCase {
    struct Evidence {
        string evidenceType;      // "photo", "text", "document", etc.
        string description;       // Brief description
        string ipfsHash;          // IPFS content ID
        bytes32 sha256Hash;       // SHA-256 of original file
        uint256 timestamp;        // Block timestamp
        uint256 blockNumber;      // Block number
        address submitter;        // Who submitted (your address)
        bool verified;            // Verification status
    }
    
    struct TimelineEvent {
        string date;              // Event date (e.g., "2025-05-15")
        string description;       // Event description
        uint256 evidenceCount;    // Number of evidence items
        bytes32[] evidenceHashes; // Linked evidence
        uint256 timestamp;        // When added to blockchain
    }
    
    // Case metadata
    string public caseId = "YodaBurns-v-Monisha-2025";
    address public plaintiff;
    string public property = "3530 Patterstone Dr, Alpharetta, GA";
    uint256 public monthlyRent = 3000;
    
    // Storage
    Evidence[] public evidenceChain;
    TimelineEvent[] public timeline;
    mapping(bytes32 => uint256) public hashToEvidenceId;
    
    // Events
    event EvidenceSubmitted(
        uint256 indexed evidenceId,
        string evidenceType,
        bytes32 sha256Hash,
        uint256 timestamp
    );
    
    event TimelineEventAdded(
        uint256 indexed eventId,
        string date,
        string description,
        uint256 timestamp
    );
    
    constructor() {
        plaintiff = msg.sender;
    }
    
    // Submit evidence
    function submitEvidence(
        string memory _type,
        string memory _description,
        string memory _ipfsHash,
        bytes32 _sha256Hash
    ) public returns (uint256) {
        require(msg.sender == plaintiff, "Only plaintiff can submit");
        
        uint256 evidenceId = evidenceChain.length;
        
        evidenceChain.push(Evidence({
            evidenceType: _type,
            description: _description,
            ipfsHash: _ipfsHash,
            sha256Hash: _sha256Hash,
            timestamp: block.timestamp,
            blockNumber: block.number,
            submitter: msg.sender,
            verified: true
        }));
        
        hashToEvidenceId[_sha256Hash] = evidenceId;
        
        emit EvidenceSubmitted(evidenceId, _type, _sha256Hash, block.timestamp);
        
        return evidenceId;
    }
    
    // Add timeline event
    function addTimelineEvent(
        string memory _date,
        string memory _description,
        bytes32[] memory _evidenceHashes
    ) public returns (uint256) {
        require(msg.sender == plaintiff, "Only plaintiff can add");
        
        uint256 eventId = timeline.length;
        
        timeline.push(TimelineEvent({
            date: _date,
            description: _description,
            evidenceCount: _evidenceHashes.length,
            evidenceHashes: _evidenceHashes,
            timestamp: block.timestamp
        }));
        
        emit TimelineEventAdded(eventId, _date, _description, block.timestamp);
        
        return eventId;
    }
    
    // Verify evidence authenticity
    function verifyEvidence(bytes32 _hash) public view returns (
        bool exists,
        uint256 evidenceId,
        uint256 timestamp,
        string memory ipfsHash
    ) {
        evidenceId = hashToEvidenceId[_hash];
        
        if (evidenceId < evidenceChain.length) {
            Evidence memory ev = evidenceChain[evidenceId];
            if (ev.sha256Hash == _hash) {
                return (true, evidenceId, ev.timestamp, ev.ipfsHash);
            }
        }
        
        return (false, 0, 0, "");
    }
    
    // Get total evidence count
    function getEvidenceCount() public view returns (uint256) {
        return evidenceChain.length;
    }
    
    // Get timeline event count
    function getTimelineCount() public view returns (uint256) {
        return timeline.length;
    }
}
```

---

### Phase 3: IPFS Storage Structure

**Directory structure on IPFS:**

```
/patterstone-case/
  /evidence/
    /photos/
      - downstairs_bathroom_damage_001.jpg
      - downstairs_bathroom_damage_002.jpg
      - upstairs_bathroom_leak_001.jpg
      - mold_suspected_001.jpg
      - [50+ photos]
    /messages/
      - 2025-05-20_first_leak_notice.png
      - 2025-06-01_handyman_visit.png
      - 2025-07-15_tearout_no_repair.png
      - [all text/email screenshots]
    /documents/
      - lease_agreement.pdf
      - rent_payment_records.pdf
      - contractor_estimate_plumber_1.pdf
      - contractor_estimate_mold_1.pdf
      - [all official docs]
  /legal/
    - complaint_draft.pdf
    - demand_letter.pdf
    - facts_timeline.pdf
    - law_violations.pdf
  /metadata/
    - case_summary.json
    - evidence_manifest.json
    - timeline.json
```

---

### Phase 4: Evidence Manifest (JSON)

**Create master evidence file:**

```json
{
  "case": {
    "id": "YodaBurns-v-Monisha-2025",
    "title": "Yoda Burns v. Monisha [Last Name]",
    "property": "3530 Patterstone Dr, Alpharetta, GA 30022",
    "lease_term": "2024-11 to 2025-11",
    "monthly_rent": 3000,
    "ethereum_contract": "0x[contract_address]",
    "ipfs_root": "Qm[root_hash]"
  },
  
  "timeline": [
    {
      "id": "T01",
      "date": "2024-11-20",
      "event": "Lease commenced, moved into property",
      "evidence_ids": ["E001", "E002"],
      "blockchain_tx": "0x...",
      "timestamp": 1700438400
    },
    {
      "id": "T02",
      "date": "2025-05-15",
      "event": "Leak develops in upstairs children's bathroom",
      "evidence_ids": ["E010", "E011"],
      "blockchain_tx": "0x...",
      "timestamp": 1715788800
    },
    {
      "id": "T03",
      "date": "2025-05-25",
      "event": "First written notice to landlord via text",
      "evidence_ids": ["E012", "E013", "E014"],
      "blockchain_tx": "0x...",
      "timestamp": 1716652800,
      "critical": true,
      "bad_faith_event": true
    },
    {
      "id": "T04",
      "date": "2025-06-02",
      "event": "Handyman visit - stated not qualified, needs plumber",
      "evidence_ids": ["E015", "E016"],
      "blockchain_tx": "0x...",
      "timestamp": 1717286400,
      "critical": true
    },
    {
      "id": "T05",
      "date": "2025-06-05",
      "event": "Second written notice - bathrooms becoming unusable",
      "evidence_ids": ["E017", "E018"],
      "blockchain_tx": "0x...",
      "timestamp": 1717545600,
      "bad_faith_event": true
    },
    {
      "id": "T06",
      "date": "2025-07-15",
      "event": "Tear-out of ceiling without repair",
      "evidence_ids": ["E025", "E026", "E027", "E028"],
      "blockchain_tx": "0x...",
      "timestamp": 1721001600,
      "critical": true
    },
    {
      "id": "T07",
      "date": "2025-07-20",
      "event": "Two bathrooms completely unusable - family of 4 using 1 bathroom",
      "evidence_ids": ["E030", "E031"],
      "blockchain_tx": "0x...",
      "timestamp": 1721433600
    },
    {
      "id": "T08",
      "date": "2025-08-15",
      "event": "Suspected black mold reported, no response from landlord",
      "evidence_ids": ["E040", "E041", "E042"],
      "blockchain_tx": "0x...",
      "timestamp": 1723680000,
      "bad_faith_event": true
    },
    {
      "id": "T09",
      "date": "2025-09-01",
      "event": "Beginning of month message - NO RESPONSE from landlord",
      "evidence_ids": ["E050"],
      "blockchain_tx": "0x...",
      "timestamp": 1725148800,
      "critical": true,
      "bad_faith_event": true
    }
  ],
  
  "evidence": [
    {
      "id": "E001",
      "type": "document",
      "description": "Signed lease agreement",
      "filename": "lease_agreement.pdf",
      "ipfs_cid": "QmXXX...",
      "sha256": "a3f7b2c9...",
      "size_bytes": 245632,
      "ethereum_tx": "0x...",
      "submitted_date": "2025-11-06",
      "exhibits": ["Exhibit A"]
    },
    {
      "id": "E012",
      "type": "text_message",
      "description": "First notice of leak to landlord",
      "filename": "2025-05-25_first_leak_notice.png",
      "ipfs_cid": "QmYYY...",
      "sha256": "b4e8c3d0...",
      "size_bytes": 125840,
      "ethereum_tx": "0x...",
      "submitted_date": "2025-11-06",
      "critical": true,
      "exhibits": ["Exhibit D-1"],
      "legal_significance": "First constructive notice to landlord of habitability issue"
    },
    {
      "id": "E025",
      "type": "photo",
      "description": "Downstairs bathroom ceiling torn out, exposed framing",
      "filename": "downstairs_ceiling_torn_out_001.jpg",
      "ipfs_cid": "QmZZZ...",
      "sha256": "c5f9d4e1...",
      "size_bytes": 3456789,
      "ethereum_tx": "0x...",
      "submitted_date": "2025-11-06",
      "critical": true,
      "exhibits": ["Exhibit B-5"],
      "legal_significance": "Shows incomplete repair and hazardous conditions"
    }
  ],
  
  "rent_payments": [
    {
      "month": "2024-11",
      "amount": 3000,
      "date_paid": "2024-11-01",
      "status": "on_time",
      "ethereum_tx": "0x...",
      "ipfs_receipt": "QmAAA..."
    },
    {
      "month": "2025-05",
      "amount": 3000,
      "date_paid": "2025-05-01",
      "status": "on_time",
      "property_condition": "leak_active",
      "ethereum_tx": "0x...",
      "ipfs_receipt": "QmBBB..."
    },
    {
      "month": "2025-06",
      "amount": 3000,
      "date_paid": "2025-06-01",
      "status": "on_time",
      "property_condition": "2_bathrooms_unusable",
      "bad_faith_acceptance": true,
      "ethereum_tx": "0x...",
      "ipfs_receipt": "QmCCC..."
    }
  ],
  
  "damages_calculation": {
    "rent_abatement": {
      "total": 10500,
      "calculation": "5_months × $3000 × 70%_reduction",
      "ethereum_tx": "0x...",
      "verified": true
    },
    "repairs": {
      "total": 24500,
      "itemized": {
        "plumbing": 3000,
        "upstairs_bathroom": 5000,
        "downstairs_bathroom": 6500,
        "mold_remediation": 7500,
        "insulation": 800,
        "subflooring": 1200,
        "hvac_cleaning": 500
      },
      "contractor_estimates_ipfs": ["QmDDD...", "QmEEE...", "QmFFF..."],
      "ethereum_tx": "0x..."
    },
    "total_documented": 50750,
    "blockchain_verified": true
  }
}
```

---

## DEPLOYMENT INSTRUCTIONS

### Step 1: Set Up Ethereum Wallet

```bash
# Install MetaMask browser extension
# Create new wallet
# Save recovery phrase (SECURE!)
# Fund with ~$100 USD equivalent ETH
```

### Step 2: Deploy Smart Contract

```javascript
// Using Hardhat or Remix
npx hardhat compile
npx hardhat deploy --network mainnet

// Save contract address:
// 0x1234567890abcdef1234567890abcdef12345678
```

### Step 3: Upload to IPFS

```bash
# Install IPFS Desktop or use Pinata.cloud

# For each file:
ipfs add facts_timeline.md
# Returns: QmHash123...

# Pin to ensure permanence:
ipfs pin add QmHash123...
```

### Step 4: Record Evidence on Blockchain

```javascript
// For each piece of evidence:
const tx = await contract.submitEvidence(
  "document",                           // type
  "Facts timeline document",            // description
  "QmHash123...",                       // IPFS CID
  "0xa3f7b2c9..."                      // SHA-256 hash
);

await tx.wait();
console.log("Evidence recorded:", tx.hash);
```

### Step 5: Build Timeline

```javascript
// For each timeline event:
const evidenceHashes = [
  "0xa3f7b2c9...",
  "0xb4e8c3d0..."
];

const tx = await contract.addTimelineEvent(
  "2025-05-25",
  "First notice to landlord of leak",
  evidenceHashes
);

await tx.wait();
```

---

## VERIFICATION & ACCESS

### Public Verification Portal

**Create simple web page for anyone to verify evidence:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Patterstone Case - Evidence Verification</title>
</head>
<body>
  <h1>Verify Evidence Authenticity</h1>
  
  <p>This case is documented on the Ethereum blockchain, making all evidence permanent and tamper-proof.</p>
  
  <h2>Quick Verify</h2>
  <input type="text" id="sha256" placeholder="Enter SHA-256 hash">
  <button onclick="verifyEvidence()">Verify on Blockchain</button>
  
  <div id="result"></div>
  
  <h2>Case Information</h2>
  <ul>
    <li><strong>Contract:</strong> <a href="https://etherscan.io/address/0x...">0x1234...5678</a></li>
    <li><strong>IPFS Root:</strong> <a href="https://ipfs.io/ipfs/Qm...">QmHash123...</a></li>
    <li><strong>Evidence Count:</strong> <span id="count">Loading...</span></li>
    <li><strong>Timeline Events:</strong> <span id="events">Loading...</span></li>
  </ul>
  
  <h2>All Evidence (Permanent Links)</h2>
  <div id="evidence-list"></div>
  
  <script src="https://cdn.ethers.io/lib/ethers-5.0.umd.min.js"></script>
  <script>
    // Connect to Ethereum
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractAddress = "0x1234567890abcdef1234567890abcdef12345678";
    const contractABI = [...]; // Your contract ABI
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    async function verifyEvidence() {
      const hash = document.getElementById('sha256').value;
      const result = await contract.verifyEvidence(hash);
      
      if (result.exists) {
        document.getElementById('result').innerHTML = `
          ✅ VERIFIED!
          <br>Evidence ID: ${result.evidenceId}
          <br>Timestamp: ${new Date(result.timestamp * 1000).toLocaleString()}
          <br>IPFS: <a href="https://ipfs.io/ipfs/${result.ipfsHash}">${result.ipfsHash}</a>
        `;
      } else {
        document.getElementById('result').innerHTML = '❌ Not found in blockchain';
      }
    }
    
    // Load case stats
    async function loadStats() {
      const evidenceCount = await contract.getEvidenceCount();
      const timelineCount = await contract.getTimelineCount();
      
      document.getElementById('count').textContent = evidenceCount.toString();
      document.getElementById('events').textContent = timelineCount.toString();
    }
    
    loadStats();
  </script>
</body>
</html>
```

---

## LEGAL BENEFITS

### In Court

1. **Tamper-Proof Evidence**
   - "Your Honor, this evidence was recorded on the Ethereum blockchain on [date]"
   - "The cryptographic hash proves this photo has not been altered"
   - "Blockchain timestamp is independently verifiable"

2. **Chain of Custody**
   - Perfect digital chain of custody
   - No possibility of evidence tampering
   - Meets Federal Rules of Evidence 901(b)(9) (process or system authentication)

3. **Admissibility**
   - Growing number of courts accept blockchain evidence
   - Vermont, Wyoming, others have specific blockchain evidence statutes
   - Shows technological sophistication and credibility

### Public Impact

1. **Transparency**
   - Anyone can verify the evidence
   - Media can access and report
   - Other tenants can learn

2. **Precedent**
   - First fully blockchain-documented tenant case
   - Sets example for future litigation
   - Shows power of Web3 for justice

3. **Accountability**
   - Landlord's conduct permanently recorded
   - Cannot hide from public record
   - Future tenants can research

---

## COST BREAKDOWN

| Item | Cost |
|------|------|
| Ethereum wallet setup | Free |
| Smart contract deployment | $50-150 (gas fees) |
| Evidence recording (50 items) | $100-200 (gas fees) |
| IPFS storage (using Pinata) | Free-$20/month |
| Verification website hosting | Free (GitHub Pages) |
| **TOTAL** | **$150-370 one-time** |

**Compare to:** Potential $50,000+ recovery = 0.3-0.7% cost

---

## MEDIA & PUBLICITY STRATEGY

### Press Release

**"Tenant Uses Blockchain to Document Landlord Negligence"**

*First-of-its-kind case uses Ethereum smart contracts to create tamper-proof evidence of uninhabitable conditions*

ALPHARETTA, GA - In a groundbreaking legal case, tenant Yoda Burns has used blockchain technology to document months of landlord neglect at 3530 Patterstone Drive. The case, which involves suspected black mold, unusable bathrooms, and endangerment of minor children, is the first landlord-tenant dispute with fully blockchain-documented evidence.

"Traditional evidence can be disputed, altered, or destroyed," Burns stated. "By recording everything on the Ethereum blockchain and IPFS, I've created a permanent, tamper-proof record that anyone can verify."

The case demonstrates how Web3 technology can empower individuals against powerful entities. All evidence, including photos, messages, and legal documents, is stored on decentralized networks and timestamped on the blockchain.

Legal experts say this could revolutionize litigation: "blockchain-based evidence chains solve many authentication problems courts face," noted [expert name]. "This case could set a precedent for how evidence is preserved and presented."

The case is ongoing. All evidence can be verified at: [your verification website]

### Social Media Campaign

**Twitter/X:**
```
🧵 THREAD: I paid $3,000/month, on time, never late. My landlord left me with mold and 2 unusable bathrooms for 5 months.

So I put the ENTIRE case on the blockchain. Every text. Every photo. Every dollar. Immutable. Forever.

Here's how I used Web3 to fight back: 👇
```

**Reddit (r/legaladvice, r/ethereum, r/landlordlove):**
Title: "I used blockchain to create tamper-proof evidence against my negligent landlord - full case documentation"

### YouTube/TikTok

**"How I Used Blockchain to Sue My Landlord"**
- Show the property conditions
- Explain the timeline
- Demonstrate the blockchain verification
- Tutorial on how others can do the same

---

## LONG-TERM IMPACT

### Platform Development

**Build "TenantChain" - A platform for all tenants:**

1. Upload evidence of landlord misconduct
2. Automatic blockchain timestamping
3. Create public accountability database
4. Connect tenants with similar experiences
5. Generate legal documents automatically

**This case becomes the proof-of-concept.**

---

## EXECUTION CHECKLIST

### Technical Setup
☐ Create Ethereum wallet (MetaMask)
☐ Fund with ~$100 ETH
☐ Set up IPFS account (Pinata.cloud)
☐ Deploy smart contract to Ethereum mainnet
☐ Save contract address

### Evidence Upload
☐ Hash all documents (SHA-256)
☐ Upload all files to IPFS
☐ Pin all IPFS content (ensure permanence)
☐ Record each hash on blockchain via smart contract
☐ Verify all transactions confirmed

### Timeline Documentation
☐ Submit each timeline event to smart contract
☐ Link evidence to events
☐ Verify all events recorded

### Verification Portal
☐ Create verification website
☐ Host on GitHub Pages (free)
☐ Test verification functionality
☐ Share public link

### Publicity
☐ Draft press release
☐ Contact local media
☐ Post on social media
☐ Create YouTube explanation video
☐ Share in tenant advocacy groups

---

## BOTTOM LINE

**You're not just winning your case. You're changing the game.**

This landlord took your money and endangered your children. Now it's documented forever on a public, immutable blockchain.

No hiding. No deleting. No denying.

**Welcome to Web3 justice.**
