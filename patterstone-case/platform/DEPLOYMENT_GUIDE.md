# 🚀 TENANT JUSTICE PLATFORM - DEPLOYMENT GUIDE

**Complete step-by-step guide to deploy and run the platform**

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Install Dependencies](#install-dependencies)
5. [Database Setup](#database-setup)
6. [Blockchain Deployment](#blockchain-deployment)
7. [Legal Database Seeding](#legal-database-seeding)
8. [Test with Patterstone Case](#test-with-patterstone-case)
9. [Deploy Web Application](#deploy-web-application)
10. [Production Deployment](#production-deployment)

---

## 🔧 PREREQUISITES

### Required Software

- **Node.js** >= 18.0.0 ([download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **PostgreSQL** >= 14.0 ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com/downloads))

### Required Accounts

- **OpenAI API Key** ([get key](https://platform.openai.com/api-keys))
  - For AI agents (GPT-4)
  - Budget: ~$100/month for moderate usage
  
- **Alchemy Account** ([sign up](https://www.alchemy.com/))
  - For Ethereum RPC access
  - Free tier available
  
- **Pinata or Web3.Storage** ([Pinata](https://www.pinata.cloud/) | [Web3.Storage](https://web3.storage/))
  - For IPFS storage
  - Free tier available
  
- **Stripe Account** ([sign up](https://stripe.com/))
  - For payment processing
  - Test mode for development

### Optional but Recommended

- **Pinecone Account** ([sign up](https://www.pinecone.io/))
  - For vector database (legal code search)
  - Free tier available

---

## 🎯 INITIAL SETUP

### 1. Clone or Navigate to Project

```bash
cd c:\Users\Kevan\Desktop\patterstone-case\platform
```

### 2. Check Node Version

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

If you need to update Node.js, download the latest LTS version from [nodejs.org](https://nodejs.org/).

---

## ⚙️ ENVIRONMENT CONFIGURATION

### 1. Create `.env` File

Create a new file: `platform/.env`

```env
# ======================
# AI & ML
# ======================
OPENAI_API_KEY=sk-your-openai-key-here
PINECONE_API_KEY=your-pinecone-key-here  # Optional for now
PINECONE_ENVIRONMENT=us-east-1-aws       # Optional

# ======================
# Blockchain & Web3
# ======================
# Ethereum RPC (from Alchemy or Infura)
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY

# Wallet for contract deployment & evidence minting
# ⚠️ USE A NEW WALLET FOR TESTING - NOT YOUR MAIN WALLET
WALLET_PRIVATE_KEY=your-private-key-here

# Contract addresses (will be filled after deployment)
CONTRACT_ADDRESS_SEPOLIA=
CONTRACT_ADDRESS_POLYGON=
CONTRACT_ADDRESS_MAINNET=

# ======================
# IPFS Storage
# ======================
# Option 1: Pinata
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_API_KEY=your-pinata-secret

# Option 2: Web3.Storage
WEB3_STORAGE_TOKEN=your-web3-storage-token

# ======================
# Database
# ======================
DATABASE_URL=postgresql://username:password@localhost:5432/tenant_justice

# ======================
# Payments
# ======================
STRIPE_SECRET_KEY=sk_test_your-stripe-test-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-test-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# ======================
# Application
# ======================
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-jwt-secret-here

# ======================
# Email (Optional - for notifications)
# ======================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@tenantjustice.io
```

### 2. Get Your API Keys

#### OpenAI

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy and paste into `.env` as `OPENAI_API_KEY`
4. Add credit ($10 minimum recommended for testing)

#### Alchemy (for Ethereum RPC)

1. Sign up at [alchemy.com](https://www.alchemy.com/)
2. Create new app → Select "Ethereum" → "Sepolia" (testnet)
3. Copy the HTTPS URL
4. Paste into `.env` as `ETHEREUM_RPC_URL`
5. Repeat for Polygon Mumbai if desired

#### Pinata (for IPFS)

1. Sign up at [pinata.cloud](https://www.pinata.cloud/)
2. Go to API Keys → New Key
3. Copy API Key and API Secret
4. Paste into `.env`

#### Stripe (for payments)

1. Sign up at [stripe.com](https://stripe.com/)
2. Go to Developers → API keys
3. Copy "Secret key" (starts with `sk_test_`)
4. Paste into `.env` as `STRIPE_SECRET_KEY`

---

## 📦 INSTALL DEPENDENCIES

```bash
cd platform
npm install
```

This will install:
- Next.js (web framework)
- OpenAI SDK (for AI agents)
- Ethers.js (for blockchain)
- Prisma (database ORM)
- All other dependencies

**Expected time:** 2-5 minutes

If you see warnings about peer dependencies, you can usually ignore them.

---

## 🗄️ DATABASE SETUP

### 1. Install PostgreSQL

If you don't have PostgreSQL installed:

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install with default settings
- Remember the password you set for user `postgres`

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE tenant_justice;
CREATE USER tenant_app WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tenant_justice TO tenant_app;
\q
```

### 3. Update `.env` with Database URL

```env
DATABASE_URL=postgresql://tenant_app:your_password@localhost:5432/tenant_justice
```

### 4. Run Prisma Migrations

```bash
cd platform
npx prisma migrate dev --name init
```

This creates all the database tables.

### 5. (Optional) Open Prisma Studio

```bash
npx prisma studio
```

Opens a visual database browser at `http://localhost:5555`

---

## ⛓️ BLOCKCHAIN DEPLOYMENT

### 1. Get Test ETH

You need test ETH to deploy contracts on Sepolia testnet.

**Get Sepolia ETH:**
- Go to [sepoliafaucet.com](https://sepoliafaucet.com/)
- Enter your wallet address
- Request test ETH (0.5 ETH is plenty)

**Get Mumbai MATIC (for Polygon):**
- Go to [faucet.polygon.technology](https://faucet.polygon.technology/)
- Request test MATIC

### 2. Configure Hardhat

File should already exist: `platform/blockchain/hardhat.config.js`

Verify it has your networks:

```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.ETHEREUM_RPC_URL,
      accounts: [process.env.WALLET_PRIVATE_KEY]
    },
    mumbai: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.WALLET_PRIVATE_KEY]
    }
  }
};
```

### 3. Compile Contracts

```bash
cd platform
npm run blockchain:compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 4. Deploy to Sepolia Testnet

```bash
npm run blockchain:deploy:testnet
```

Expected output:
```
Deploying TenantJusticeRegistry...
✓ Contract deployed at: 0x1234...5678
✓ Saved to config/contracts.json
```

Copy the contract address and update `.env`:

```env
CONTRACT_ADDRESS_SEPOLIA=0x1234567890abcdef...
```

### 5. Verify Deployment

Check your contract on Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

---

## 📚 LEGAL DATABASE SEEDING

### 1. Seed Initial Legal Codes

```bash
npm run legal:seed
```

This loads:
- Georgia tenant-landlord statutes
- Federal housing laws
- Common legal templates

**Expected time:** 30 seconds

### 2. Verify Data

```bash
npx prisma studio
```

Navigate to `LegalCode` table → Should see ~50 entries for Georgia laws.

---

## 🧪 TEST WITH PATTERSTONE CASE

### 1. Run the Test Script

```bash
node scripts/process-patterstone-case.js
```

This will:
1. ✅ Intake Agent → Structure the case
2. ✅ Legal Mapper → Find violations
3. ✅ Damages Calculator → Calculate money owed

**Expected output:**

```
🚀 PROCESSING PATTERSTONE CASE THROUGH TENANT JUSTICE PLATFORM

📝 STEP 1: INTAKE SPECIALIST - Structuring Case Data...

✅ Case Data Structured
   Tenant: Kevan
   Property: 3530 Patterstone Drive
   Landlord: Ari Niazi
   Issues: 3 problems identified
   Duration: 150 days
   Children Affected: Yes

⚖️  STEP 2: LEGAL MAPPER - Analyzing Violations & Laws...

✅ Legal Analysis Complete
   Violations Found: 4
   Legal Theories: 3
   Case Strength: 8/10
   Attorney Fees Available: YES

   📜 VIOLATIONS:
      1. O.C.G.A. § 44-7-13 - Duty to keep premises in repair
         Strength: 9/10
      2. Georgia HB 404 - Safe at Home Act
         Strength: 8/10
      ...

💰 STEP 3: DAMAGES CALCULATOR - Calculating Money Owed...

✅ Damages Calculated

   CONSERVATIVE ESTIMATE: $42,500
   Breakdown:
      - Rent Abatement: $27,000
      - Security Deposit Return: $3,000
      - Repair Costs: $8,000
      - Loss of Use: $1,500
      - Emotional Distress: $3,000

   AGGRESSIVE ESTIMATE: $68,000
   
   💡 RECOMMENDED DEMAND: $55,250
   Settlement Range: $33,150 - $44,200

✅ PATTERSTONE CASE PROCESSING COMPLETE
```

### 2. Check Output Files

```bash
dir output
```

You should see:
- `patterstone_case_data.json`
- `patterstone_legal_analysis.json`
- `patterstone_damages.json`

---

## 🌐 DEPLOY WEB APPLICATION

### 1. Start Development Server

```bash
npm run dev
```

Opens at: `http://localhost:3000`

### 2. Key Pages (once built)

- `/` - Homepage
- `/intake` - Case intake form
- `/dashboard` - Tenant dashboard
- `/cases/[caseId]` - Individual case view
- `/verify` - Blockchain verification portal
- `/explore` - Public case explorer

### 3. Test Intake Flow

1. Go to `/intake`
2. Fill out form with a test case
3. Upload sample evidence
4. Submit
5. Check `/dashboard` for results

---

## 🚀 PRODUCTION DEPLOYMENT

### 1. Set Up Production Environment

#### Option A: Vercel (Recommended for Frontend)

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: AWS / DigitalOcean / Render

1. Set up Node.js server
2. Install dependencies
3. Run build: `npm run build`
4. Start: `npm start`

### 2. Deploy Contracts to Mainnet

⚠️ **WARNING: This costs real money (gas fees)**

```bash
# Make sure you have real ETH in your wallet
npm run blockchain:deploy:mainnet
```

Expected cost: $50-$200 depending on gas prices

### 3. Production Environment Variables

Update `.env.production`:

```env
NODE_ENV=production
BASE_URL=https://tenantjustice.io

# Use mainnet RPC
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-KEY

# Use production contract addresses
CONTRACT_ADDRESS_MAINNET=0xYourMainnetContract...

# Stripe production keys
STRIPE_SECRET_KEY=sk_live_your-live-key
```

### 4. Database Migration

```bash
npm run db:migrate:prod
```

### 5. Monitor & Scale

- Set up logging (Datadog, LogRocket)
- Monitor AI costs (OpenAI dashboard)
- Monitor blockchain gas (Alchemy dashboard)
- Set up alerts for errors

---

## ✅ VERIFICATION CHECKLIST

Before going live, verify:

- [ ] All AI agents work correctly
- [ ] Blockchain contract deployed and verified
- [ ] Database migrations applied
- [ ] Payment processing works (Stripe test mode)
- [ ] Evidence upload to IPFS works
- [ ] Email notifications work
- [ ] Security audit completed
- [ ] Terms of Service & Privacy Policy published
- [ ] Lawyer network onboarded (at least 5 lawyers)
- [ ] Patterstone case fully processed and public

---

## 🆘 TROUBLESHOOTING

### Issue: "OpenAI API Error: Insufficient Funds"

**Solution:** Add credit to your OpenAI account
- Go to [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
- Add at least $10

### Issue: "Contract deployment failed: insufficient funds"

**Solution:** Get more test ETH
- For Sepolia: [sepoliafaucet.com](https://sepoliafaucet.com/)
- For Mumbai: [faucet.polygon.technology](https://faucet.polygon.technology/)

### Issue: "Database connection refused"

**Solution:** Make sure PostgreSQL is running
```bash
# Windows: Check services
services.msc → PostgreSQL → Start

# Mac:
brew services start postgresql

# Linux:
sudo service postgresql start
```

### Issue: "Module not found"

**Solution:** Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 MONITORING & METRICS

### Track These Metrics

1. **User Metrics**
   - Sign-ups per day
   - Free → Paid conversion rate
   - Churn rate

2. **AI Performance**
   - Agent success rate
   - Average processing time
   - OpenAI costs per case

3. **Financial**
   - MRR (Monthly Recurring Revenue)
   - CAC (Customer Acquisition Cost)
   - LTV (Lifetime Value)

4. **Impact**
   - Total damages calculated
   - Cases won/settled
   - Bad landlords exposed

---

## 🎓 NEXT STEPS AFTER DEPLOYMENT

1. **Launch Marketing Campaign**
   - Reddit (r/tenants, r/legaladvice)
   - Twitter/X
   - TikTok (case breakdowns)
   - SEO blog posts

2. **Onboard Lawyers**
   - Reach out to tenant-rights lawyers
   - Show them AI-generated documents
   - Offer referral fees (10%)

3. **Process Real Cases**
   - Start with friends/family
   - Gather testimonials
   - Document outcomes

4. **Iterate Based on Feedback**
   - Improve AI prompts
   - Add more legal codes
   - Enhance UI/UX

5. **Scale**
   - Add more states
   - Build mobile app
   - Launch API for partners

---

## 💪 YOU'RE READY TO LAUNCH

**You now have:**
- ✅ A working AI legal analysis system
- ✅ Blockchain-verified evidence registry
- ✅ Database of tenant laws
- ✅ Web application for tenants
- ✅ Patterstone case as proof-of-concept

**Go make justice accessible to everyone.**

---

## 📞 SUPPORT

- **Issues:** Open GitHub issue
- **Questions:** support@tenantjustice.io
- **Community:** Discord (link TBD)

---

**Built with 💪 by Kevan**

*Inspired by the injustice at 3530 Patterstone Drive*
