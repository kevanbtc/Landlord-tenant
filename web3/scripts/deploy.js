const hre = require("hardhat");

async function main() {
  console.log("\n🚀 PATTERSTONE CASE - BLOCKCHAIN DEPLOYMENT");
  console.log("=".repeat(70));
  
  try {
    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`\n✅ Deployer Address: ${deployer.address}`);
    
    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    const networkName = network.name;
    const chainId = network.chainId;
    
    console.log(`📡 Network: ${networkName} (Chain ID: ${chainId})`);
    
    // Check balance
    try {
      const balance = await hre.ethers.provider.getBalance(deployer.address);
      console.log(`💰 Balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
    } catch (e) {
      console.log(`💰 Balance: Unable to check (read-only RPC)`);
    }
    
    // Deploy contract
    console.log(`\n⏳ Deploying PatterstoneCase contract...`);
    const PatterstoneCase = await hre.ethers.getContractFactory("PatterstoneCase");
    
    // For testnet/demo, deploy without args or with minimal args
    let contract;
    try {
      contract = await PatterstoneCase.deploy();
      await contract.deployed();
      console.log(`✅ Contract deployed to: ${contract.address}`);
    } catch (error) {
      if (error.message.includes("invalid project id") || error.message.includes("Could not find a matching")) {
        console.log(`\n⚠️  NOTE: Private key needed for actual deployment`);
        console.log(`\n📝 To deploy with funds:`);
        console.log(`   1. Edit .env file with your PRIVATE_KEY`);
        console.log(`   2. Fund wallet with ETH from faucet (Sepolia) or exchange`);
        console.log(`   3. Re-run this deployment script`);
        return { status: "READY_TO_DEPLOY", needsFunding: true };
      }
      throw error;
    }
    
    console.log(`\n${"=".repeat(70)}`);
    console.log(`✅ DEPLOYMENT SUCCESSFUL`);
    console.log(`${"=".repeat(70)}`);
    console.log(`\n📍 CONTRACT ADDRESS: ${contract.address}`);
    console.log(`📡 NETWORK: ${networkName}`);
    console.log(`🔗 CHAIN ID: ${chainId}`);
    
    // Block explorer links
    const explorerUrls = {
      1: "https://etherscan.io/address",
      137: "https://polygonscan.com/address",
      42161: "https://arbiscan.io/address",
      10: "https://optimistic.etherscan.io/address",
      8453: "https://basescan.org/address",
      11155111: "https://sepolia.etherscan.io/address",
    };
    
    const explorerUrl = explorerUrls[chainId];
    if (explorerUrl) {
      console.log(`🔍 View on Explorer: ${explorerUrl}/${contract.address}`);
    }
    
    console.log(`\n✅ Contract deployed and sealed on blockchain!`);
    console.log(`📋 Next Steps:`);
    console.log(`   1. Register evidence using contract.registerEvidence()`);
    console.log(`   2. Upload evidence to IPFS and save IPFS CIDs`);
    console.log(`   3. Verify contract on block explorer`);
    console.log(`   4. Deploy to other networks for redundancy\n`);
    
    return {
      contractAddress: contract.address,
      network: networkName,
      chainId: chainId,
    };
    
  } catch (error) {
    console.log(`\n❌ DEPLOYMENT STATUS:`);
    if (error.message.includes("invalid project id")) {
      console.log(`   Error: Infura API key not set`);
      console.log(`\n📝 SETUP INSTRUCTIONS:`);
      console.log(`   1. Get a free Sepolia ETH from faucet:`);
      console.log(`      https://www.sepoliafaucet.com/`);
      console.log(`   2. Get an Infura API key:`);
      console.log(`      https://infura.io/`);
      console.log(`   3. Set your private key in .env:`);
      console.log(`      PRIVATE_KEY=your_private_key_here`);
      console.log(`   4. Set Infura key in .env:`);
      console.log(`      INFURA_API_KEY=your_key_here`);
      console.log(`   5. Re-run deployment`);
    } else if (error.message.includes("insufficient funds")) {
      console.log(`   Error: Insufficient funds`);
      console.log(`   Solution: Send ETH to wallet`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

main();
