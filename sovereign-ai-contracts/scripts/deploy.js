const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Starting Sovereign AI Lab deployment...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy stable token (USDC mock)
  console.log("Deploying MockERC20 (USDC)...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const stableToken = await MockERC20.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
  await stableToken.waitForDeployment();
  console.log("MockERC20 deployed to:", await stableToken.getAddress());

  // Deploy SovereignAILab
  console.log("Deploying SovereignAILab...");
  const SovereignAILab = await ethers.getContractFactory("SovereignAILab");

  const platformFee = 500; // 5% in basis points
  const feeRecipient = deployer.address;

  const sovereignAILab = await upgrades.deployProxy(
    SovereignAILab,
    [await stableToken.getAddress(), feeRecipient, platformFee],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );

  await sovereignAILab.waitForDeployment();
  console.log("SovereignAILab deployed to:", await sovereignAILab.getAddress());

  // Verify deployment
  console.log("Verifying deployment...");
  const contractOwner = await sovereignAILab.owner();
  const contractStableToken = await sovereignAILab.stableToken();
  const contractPlatformFee = await sovereignAILab.platformFee();

  console.log("Contract owner:", contractOwner);
  console.log("Stable token:", contractStableToken);
  console.log("Platform fee:", contractPlatformFee);

  // Mint initial supply to deployer
  console.log("Minting initial token supply...");
  const initialSupply = ethers.parseEther("100000"); // 100k USDC
  await stableToken.mint(deployer.address, initialSupply);
  console.log("Minted", ethers.formatEther(initialSupply), "USDC to deployer");

  // Setup initial configuration
  console.log("Setting up initial configuration...");

  // Add deployer as authorized auditor and compliance officer
  await sovereignAILab.setAuthorizedAuditor(deployer.address, true);
  await sovereignAILab.setComplianceOfficer(deployer.address, true);
  console.log("Deployer set as authorized auditor and compliance officer");

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("SovereignAILab:", await sovereignAILab.getAddress());
  console.log("MockUSDC:", await stableToken.getAddress());
  console.log("Platform Fee:", platformFee / 100 + "%");
  console.log("Fee Recipient:", feeRecipient);
  console.log("========================\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    sovereignAILab: await sovereignAILab.getAddress(),
    stableToken: await stableToken.getAddress(),
    platformFee: platformFee,
    feeRecipient: feeRecipient,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("Deployment completed successfully!");
  console.log("Next steps:");
  console.log("1. Fund the contract with initial liquidity if needed");
  console.log("2. Set up additional auditors and compliance officers");
  console.log("3. Configure regulatory approvals");
  console.log("4. Test the deployment on a testnet before mainnet");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
