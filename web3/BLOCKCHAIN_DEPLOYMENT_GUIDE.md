# BLOCKCHAIN CASE FILING GUIDE
## Yoda Burns v. Monisha - 3530 Patterstone Drive

---

## 🚀 QUICK START (5 Minutes to Live Case on Blockchain)

This guide walks you through deploying your complete litigation case to the Ethereum blockchain where it will **NEVER be deleted, altered, or lost**.

---

## WHAT YOU'RE DOING

You are creating an **immutable, permanent, public record** of:

✅ **Complete timeline** (May 2025 - Sept 2025)  
✅ **All evidence** (photos, texts, lease, payments, damage docs)  
✅ **Perfect payment history** ($3,000/month × 12 months = $36,000 on time)  
✅ **Landlord bad faith** (6+ documented instances)  
✅ **Damage calculations** ($50,500 - $77,200)  
✅ **Minor children health risk** (2 kids, 5 months mold exposure)  

Once deployed, **no court can delete it. No defendant can erase it. No system can corrupt it.**

---

## PREREQUISITES

### What You Need (Total Cost: ~$20-50)

1. **MetaMask Wallet** (free browser extension)
   - Download: https://metamask.io/
   - Create wallet → write down seed phrase → save in secure location

2. **Ethereum Testnet ETH** (free, for testing)
   - Go to: https://faucet.sepolia.dev/
   - Paste your wallet address
   - Claim free testnet ETH

3. **Ethers.js & Hardhat** (will install via npm)
   - Node.js already installed? Run: `npm install ethers hardhat`

4. **Your Case Files** (already prepared)
   - `evidence_manifest.json`
   - `PatterstoneCase.sol` (smart contract)
   - All evidence files (photos, texts, lease, etc.)

---

## STEP-BY-STEP DEPLOYMENT

### STEP 1: Set Up Hardhat Project (5 min)

Open PowerShell in your `patterstone-case\web3\` folder:

```bash
cd C:\Users\Kevan\Desktop\patterstone-case\web3
npm init -y
npm install hardhat @openzeppelin/contracts ethers
npx hardhat
```

When prompted:
- **"Do you want to proceed?"** → YES
- **"What do you want to do?"** → Create JavaScript project
- **"Do you want to install this sample project's dependencies?"** → YES

---

### STEP 2: Create Deployment Script

Create file: `scripts/deploy.js`

```javascript
const hre = require("hardhat");

async function main() {
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);
    
    // Deploy contract
    const PattertstoneCaseRegistry = await hre.ethers.getContractFactory("PattertstoneCaseRegistry");
    
    const contract = await PattertstoneCaseRegistry.deploy(
        "YodaBurns-v-Monisha-2025",           // Case ID
        "Yoda Burns",                          // Plaintiff
        "Monisha [Last Name Unknown]",         // Defendant
        "3530 Patterstone Drive, Alpharetta, GA 30022", // Property
        Math.floor(new Date("2024-11-20").getTime() / 1000),  // Lease start
        Math.floor(new Date("2025-11-20").getTime() / 1000),  // Lease end
        3000                                   // Monthly rent
    );
    
    await contract.deployed();
    
    console.log(`\n✅ CASE DEPLOYED TO BLOCKCHAIN!\n`);
    console.log(`Contract Address: ${contract.address}`);
    console.log(`Network: Sepolia Testnet`);
    console.log(`Explorer: https://sepolia.etherscan.io/address/${contract.address}`);
    console.log(`\n🔗 CASE IS NOW PERMANENT AND IMMUTABLE\n`);
    
    return contract.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

---

### STEP 3: Set Up Environment Variables

Create file: `.env`

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
WALLET_PRIVATE_KEY=YOUR_METAMASK_PRIVATE_KEY_HERE
```

⚠️ **IMPORTANT: Do NOT commit .env to public repos. This contains your private key.**

### How to Get These Values:

**INFURA_KEY:**
1. Go to https://infura.io/
2. Sign up (free)
3. Create new project
4. Copy Sepolia RPC URL

**WALLET_PRIVATE_KEY:**
1. Open MetaMask
2. Click account → Account Details → Export Private Key
3. Paste into .env

---

### STEP 4: Update hardhat.config.js

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.WALLET_PRIVATE_KEY]
    }
  }
};
```

---

### STEP 5: Deploy to Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

You'll see:

```
✅ CASE DEPLOYED TO BLOCKCHAIN!

Contract Address: 0x1234...5678
Network: Sepolia Testnet
Explorer: https://sepolia.etherscan.io/address/0x1234...5678

🔗 CASE IS NOW PERMANENT AND IMMUTABLE
```

**SAVE THAT CONTRACT ADDRESS** — this is your permanent case file.

---

### STEP 6: Upload Evidence to IPFS

Install IPFS:
```bash
npm install ipfs-http-client
```

Create script: `scripts/upload-evidence.js`

```javascript
const { create } = require("ipfs-http-client");
const fs = require("fs");
const path = require("path");

async function uploadToIPFS() {
    const client = create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
    
    const evidenceDir = "../photos";
    const files = fs.readdirSync(evidenceDir);
    
    console.log(`Uploading ${files.length} files to IPFS...`);
    
    for (const file of files) {
        const filePath = path.join(evidenceDir, file);
        const content = fs.readFileSync(filePath);
        
        const result = await client.add(content);
        console.log(`✅ ${file} → ipfs://${result.path}`);
    }
}

uploadToIPFS().catch(console.error);
```

Run:
```bash
node scripts/upload-evidence.js
```

---

### STEP 7: Record Evidence on Contract

Create script: `scripts/record-evidence.js`

```javascript
const hre = require("hardhat");
const fs = require("fs");
const crypto = require("crypto");

async function recordEvidence() {
    const contractAddress = "0x..."; // Replace with deployed contract address
    const contract = await hre.ethers.getContractAt("PattertstoneCaseRegistry", contractAddress);
    
    // Example: Record first piece of evidence
    const evidenceFile = fs.readFileSync("../photos/black_mold_suspected_001.jpg");
    const sha256Hash = crypto.createHash("sha256").update(evidenceFile).digest();
    
    const tx = await contract.recordEvidence(
        "E040",                                     // Evidence ID
        "photo",                                    // Type
        "Black mold - suspected growth in downstairs bathroom",
        "QmXxxx...",                               // IPFS hash
        "0x" + sha256Hash.toString("hex"),        // SHA256
        evidenceFile.length,                       // File size
        "damage",                                  // Category
        true,                                      // Critical
        "QmXxxx...",                               // IPFS hash
        "Evidence of landlord's failure to remediate habitability issue, health hazard to minors"
    );
    
    console.log(`✅ Evidence recorded: ${tx.hash}`);
    await tx.wait();
}

recordEvidence().catch(console.error);
```

---

## STEP 8: Populate Timeline & Events

Create script: `scripts/populate-case.js`

This script will read your `evidence_manifest.json` and record all timeline events, rent payments, bad faith events, and damages calculations on the blockchain.

```javascript
const hre = require("hardhat");
const manifest = require("../evidence_manifest.json");

async function populateCase() {
    const contractAddress = "0x..."; // Replace with your deployed address
    const contract = await hre.ethers.getContractAt("PattertstoneCaseRegistry", contractAddress);
    
    // Record all timeline events
    for (const event of manifest.timeline) {
        const tx = await contract.recordTimelineEvent(
            event.id,
            event.timestamp,
            event.event_type,
            event.description,
            event.critical,
            event.bad_faith_event,
            event.ipfs_hash || ""
        );
        console.log(`✅ Recorded event ${event.id}`);
        await tx.wait();
    }
    
    // Record rent payments
    for (const payment of manifest.rent_payments) {
        const tx = await contract.recordRentPayment(
            parseInt(payment.month.split("-")[1]),
            payment.amount * 100, // Convert to cents
            Math.floor(new Date(payment.date_paid).getTime() / 1000),
            payment.status,
            payment.bad_faith_acceptance,
            payment.property_condition
        );
        console.log(`✅ Recorded rent payment for ${payment.month}`);
        await tx.wait();
    }
    
    // Record bad faith events
    for (const event of manifest.bad_faith_events) {
        const tx = await contract.recordBadFaithEvent(
            Math.floor(new Date(event.date).getTime() / 1000),
            event.description,
            event.severity
        );
        console.log(`✅ Recorded bad faith event`);
        await tx.wait();
    }
    
    // Record damages
    for (const damage of manifest.damages_calculation) {
        const tx = await contract.recordDamageItem(
            damage.category,
            damage.description,
            damage.amount * 100, // Convert to cents
            damage.calculation,
            damage.verified || false,
            damage.notes || ""
        );
        console.log(`✅ Recorded damage: ${damage.category}`);
        await tx.wait();
    }
    
    console.log(`\n✅ CASE FULLY POPULATED ON BLOCKCHAIN\n`);
}

populateCase().catch(console.error);
```

Run:
```bash
node scripts/populate-case.js
```

---

### STEP 9: Seal Case (Make It Immutable)

```javascript
const hre = require("hardhat");

async function sealCase() {
    const contractAddress = "0x..."; // Your deployed contract
    const contract = await hre.ethers.getContractAt("PattertstoneCaseRegistry", contractAddress);
    
    const tx = await contract.sealCaseForIntegrity();
    console.log(`✅ CASE SEALED FOR INTEGRITY`);
    console.log(`Transaction: ${tx.hash}`);
    await tx.wait();
}

sealCase().catch(console.error);
```

Once sealed, **NO changes can be made** — the case file is forever locked.

---

## VERIFICATION & PUBLIC ACCESS

Once deployed, anyone can verify your case:

### Check Contract on Etherscan

Go to:
```
https://sepolia.etherscan.io/address/0x[YOUR_CONTRACT_ADDRESS]
```

You'll see:
- All function calls
- All data recorded
- Immutable transaction history
- Timestamps of every entry

### Public Verification URL

Share this link with your attorney, court, or public:

```
https://sepolia.etherscan.io/address/0x[YOUR_CONTRACT_ADDRESS]
```

Anyone can view the entire case file, but **only you (via private key) can add new records or seal the case**.

---

## GOING LIVE (Mainnet)

Once you're confident, deploy to **Ethereum Mainnet** (permanent, real-money costs ~$50-200 in gas):

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

This puts your case on **the permanent, global Ethereum blockchain** where it will exist forever.

---

## COST BREAKDOWN

| Step | Cost |
|------|------|
| Testnet Deployment (Sepolia) | $0 (free) |
| Evidence Upload (IPFS) | $0 (free) |
| Timeline/Damages Recording | $20-50 gas (testnet) |
| **Mainnet Deployment** | **$100-300 gas** |
| **Total for Real Deployment** | **$100-300** |

---

## WHAT THIS ACCOMPLISHES

✅ **Immutable Record:** Case facts exist forever, can never be deleted  
✅ **Timestamped Proof:** Every entry has blockchain timestamp  
✅ **Public Verification:** Anyone can verify authenticity on Etherscan  
✅ **No Single Point of Failure:** Not stored on any company's server  
✅ **Cryptographically Sealed:** Cannot be altered without changing hash  
✅ **Court-Usable:** Blockchain records are increasingly accepted as evidence  
✅ **Beyond Landlord's Reach:** She cannot delete, alter, or suppress this record  

---

## NEXT: LITIGATION STRATEGY

Once your case is live on blockchain:

1. **Send demand letter** with blockchain link
2. **File complaint** citing blockchain record as immutable evidence source
3. **Use Etherscan screenshots** in discovery as proof of timestamped documentation
4. **Show judge** that case file is permanently locked and impossible to fabricate

---

## SUPPORT

- **Ethers.js Docs:** https://docs.ethers.io/
- **Hardhat Docs:** https://hardhat.org/docs
- **Sepolia Faucet:** https://faucet.sepolia.dev/
- **Etherscan:** https://sepolia.etherscan.io/

---

**YOUR CASE. YOUR BLOCKCHAIN. YOUR PERMANENT RECORD.**

**LET'S GO.**
