const hre = require("hardhat");

async function main() {
  console.log("Deploying PatterstoneCase contract...");

  // Case metadata
  const caseId = "PATTERSTONE-2025-001";
  const propertyAddress = "3530 Patterstone Drive, Alpharetta, GA 30022";
  const jurisdiction = "DeKalb County Superior Court, Georgia";
  const plaintiff = "Yoda Burns";
  const defendant = "Monisha [Last Name TBD]";

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);

  // Get contract factory
  const PatterstoneCase = await hre.ethers.getContractFactory("PatterstoneCase");

  // Deploy contract
  const contract = await PatterstoneCase.deploy(
    caseId,
    propertyAddress,
    jurisdiction,
    plaintiff,
    defendant
  );

  await contract.deployed();

  console.log("✅ PatterstoneCase deployed to:", contract.address);
  console.log("\n📋 DEPLOYMENT DETAILS:");
  console.log("═══════════════════════════════════════");
  console.log(`Case ID:            ${caseId}`);
  console.log(`Contract Address:   ${contract.address}`);
  console.log(`Deployer Address:   ${deployer.address}`);
  console.log(`Network:            ${hre.network.name}`);
  console.log(`Block Timestamp:    ${new Date().toISOString()}`);
  console.log("═══════════════════════════════════════\n");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contract.address,
    deployer: deployer.address,
    network: hre.network.name,
    caseId: caseId,
    propertyAddress: propertyAddress,
    jurisdiction: jurisdiction,
    plaintiff: plaintiff,
    defendant: defendant,
    deploymentTimestamp: new Date().toISOString(),
    etherscanUrl: `https://etherscan.io/address/${contract.address}`,
    blockExplorerUrl: hre.network.name === 'mainnet' ? 
      `https://etherscan.io/address/${contract.address}` :
      `https://${hre.network.name}.etherscan.io/address/${contract.address}`
  };

  // Log deployment info
  console.log("\n📍 NEXT STEPS:");
  console.log("═══════════════════════════════════════");
  console.log("1. Update evidence_manifest.json with contract address");
  console.log("2. Update verification_portal.html with contract address");
  console.log("3. Upload evidence files to IPFS (Pinata, NFT.Storage, etc.)");
  console.log("4. Record IPFS CIDs in evidence_manifest.json");
  console.log("5. Call registerEvidence() for each evidence item:");
  console.log(`   npx hardhat run scripts/populate-evidence.js --network ${hre.network.name}`);
  console.log("6. Share Etherscan link with attorney for verification");
  console.log("═══════════════════════════════════════\n");

  console.log("Deployment info saved. Contract is ready to register evidence.\n");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function main() {
    log('\n========================================', 'blue');
    log(' PATTERSTONE CASE - BLOCKCHAIN DEPLOYMENT', 'blue');
    log('========================================\n', 'blue');
    
    // Step 1: Connect to Ethereum
    log('Step 1: Connecting to Ethereum network...', 'yellow');
    const provider = new ethers.providers.JsonRpcProvider(CONFIG.providerUrl);
    const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
    const balance = await wallet.getBalance();
    
    log(`✓ Connected to ${CONFIG.network}`, 'green');
    log(`  Address: ${wallet.address}`, 'blue');
    log(`  Balance: ${ethers.utils.formatEther(balance)} ETH\n`, 'blue');
    
    if (balance.lt(ethers.utils.parseEther('0.1'))) {
        log('⚠️  Warning: Low balance. You may need more ETH for gas fees.', 'red');
    }
    
    // Step 2: Load contract bytecode and ABI
    log('Step 2: Loading smart contract...', 'yellow');
    
    // NOTE: You need to compile the contract first using:
    // - Remix IDE (remix.ethereum.org)
    // - Hardhat (npm install --save-dev hardhat)
    // - Truffle
    
    // Placeholder - replace with actual compiled contract
    const contractBytecode = 'COMPILED_BYTECODE_HERE';
    const contractABI = []; // ABI array here
    
    if (contractBytecode === 'COMPILED_BYTECODE_HERE') {
        log('❌ Error: Contract not compiled yet!', 'red');
        log('   Please compile PatterstoneCase.sol first using Remix or Hardhat\n', 'yellow');
        log('   Instructions:', 'blue');
        log('   1. Go to remix.ethereum.org', 'blue');
        log('   2. Upload PatterstoneCase.sol', 'blue');
        log('   3. Compile the contract', 'blue');
        log('   4. Copy bytecode and ABI to this script\n', 'blue');
        process.exit(1);
    }
    
    log('✓ Contract loaded\n', 'green');
    
    // Step 3: Deploy contract
    log('Step 3: Deploying smart contract to Ethereum...', 'yellow');
    log('  This may take 1-3 minutes depending on gas price...', 'blue');
    
    const ContractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const contract = await ContractFactory.deploy();
    
    log('  Transaction sent. Waiting for confirmation...', 'blue');
    await contract.deployed();
    
    log(`✓ Contract deployed!`, 'green');
    log(`  Contract Address: ${contract.address}`, 'green');
    log(`  Transaction Hash: ${contract.deployTransaction.hash}\n`, 'blue');
    
    // Step 4: Load evidence manifest
    log('Step 4: Loading evidence manifest...', 'yellow');
    const manifest = JSON.parse(fs.readFileSync(CONFIG.manifestPath, 'utf8'));
    log(`✓ Manifest loaded: ${manifest.timeline.length} events, ${manifest.evidence.length} evidence items\n`, 'green');
    
    // Step 5: Submit evidence to blockchain
    log('Step 5: Submitting evidence to blockchain...', 'yellow');
    
    for (let i = 0; i < manifest.evidence.length; i++) {
        const evidence = manifest.evidence[i];
        log(`  Submitting evidence ${i + 1}/${manifest.evidence.length}: ${evidence.description}`, 'blue');
        
        // Convert SHA-256 to bytes32
        const sha256Hash = evidence.sha256 || '0x0000000000000000000000000000000000000000000000000000000000000000';
        
        try {
            const tx = await contract.submitEvidence(
                evidence.type,
                evidence.description,
                evidence.ipfs_cid || '',
                sha256Hash,
                evidence.category,
                JSON.stringify(evidence)
            );
            
            await tx.wait();
            log(`    ✓ Recorded (TX: ${tx.hash.substring(0, 20)}...)`, 'green');
        } catch (error) {
            log(`    ✗ Error: ${error.message}`, 'red');
        }
    }
    
    log(`\n✓ All evidence submitted!\n`, 'green');
    
    // Step 6: Submit timeline events
    log('Step 6: Submitting timeline events...', 'yellow');
    
    for (let i = 0; i < manifest.timeline.length; i++) {
        const event = manifest.timeline[i];
        log(`  Submitting event ${i + 1}/${manifest.timeline.length}: ${event.event}`, 'blue');
        
        // Convert evidence IDs to hashes (placeholder)
        const evidenceHashes = event.evidence_ids.map(() => 
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        );
        
        try {
            const tx = await contract.addTimelineEvent(
                event.date,
                event.description,
                evidenceHashes,
                event.critical || false,
                event.bad_faith_event || false,
                event.event_type
            );
            
            await tx.wait();
            log(`    ✓ Recorded (TX: ${tx.hash.substring(0, 20)}...)`, 'green');
        } catch (error) {
            log(`    ✗ Error: ${error.message}`, 'red');
        }
    }
    
    log(`\n✓ All timeline events submitted!\n`, 'green');
    
    // Step 7: Submit rent payments
    log('Step 7: Submitting rent payment records...', 'yellow');
    
    for (let i = 0; i < manifest.rent_payments.length; i++) {
        const payment = manifest.rent_payments[i];
        log(`  Recording payment ${i + 1}/${manifest.rent_payments.length}: ${payment.month}`, 'blue');
        
        try {
            const tx = await contract.recordRentPayment(
                payment.month,
                payment.amount * 100, // Convert to cents
                payment.date_paid,
                payment.payment_method,
                payment.status === 'on_time',
                payment.property_condition,
                payment.bad_faith_acceptance || false,
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                payment.ipfs_receipt || ''
            );
            
            await tx.wait();
            log(`    ✓ Recorded (TX: ${tx.hash.substring(0, 20)}...)`, 'green');
        } catch (error) {
            log(`    ✗ Error: ${error.message}`, 'red');
        }
    }
    
    log(`\n✓ All rent payments recorded!\n`, 'green');
    
    // Step 8: Get final stats
    log('Step 8: Verifying deployment...', 'yellow');
    
    const stats = await contract.getCaseStats();
    const paymentReliability = await contract.getPaymentReliability();
    
    log('✓ Deployment successful!', 'green');
    log('\n========================================', 'blue');
    log(' DEPLOYMENT SUMMARY', 'blue');
    log('========================================', 'blue');
    log(`Contract Address:   ${contract.address}`, 'green');
    log(`Evidence Count:     ${stats.evidenceCount.toString()}`, 'blue');
    log(`Timeline Events:    ${stats.timelineEventCount.toString()}`, 'blue');
    log(`Rent Payments:      ${stats.paymentCount.toString()}`, 'blue');
    log(`Payment Reliability: ${paymentReliability.toString()}%`, 'blue');
    log(`Bad Faith Events:   ${stats.badFaithEvents.toString()}`, 'blue');
    log(`Critical Events:    ${stats.criticalEvents.toString()}`, 'blue');
    log(`Total Damages:      $${(stats.totalDamageAmount / 100).toLocaleString()}`, 'blue');
    log('========================================\n', 'blue');
    
    // Step 9: Save deployment info
    log('Step 9: Saving deployment information...', 'yellow');
    
    const deploymentInfo = {
        network: CONFIG.network,
        contractAddress: contract.address,
        deploymentTx: contract.deployTransaction.hash,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
        stats: {
            evidenceCount: stats.evidenceCount.toString(),
            timelineEventCount: stats.timelineEventCount.toString(),
            paymentCount: stats.paymentCount.toString(),
            paymentReliability: paymentReliability.toString(),
            badFaithEvents: stats.badFaithEvents.toString(),
            criticalEvents: stats.criticalEvents.toString(),
            totalDamages: stats.totalDamageAmount.toString()
        }
    };
    
    fs.writeFileSync(
        './deployment_info.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    log('✓ Deployment info saved to deployment_info.json\n', 'green');
    
    // Step 10: Next steps
    log('========================================', 'blue');
    log(' NEXT STEPS', 'blue');
    log('========================================', 'blue');
    log('1. Update verification_portal.html with contract address:', 'yellow');
    log(`   CONTRACT_ADDRESS = '${contract.address}'`, 'blue');
    log('\n2. Upload all evidence files to IPFS using Pinata.cloud', 'yellow');
    log('\n3. Update evidence_manifest.json with IPFS hashes', 'yellow');
    log('\n4. Deploy verification_portal.html to GitHub Pages', 'yellow');
    log('\n5. Share verification portal URL publicly', 'yellow');
    log('\n6. Include contract address in demand letter and complaint', 'yellow');
    log('========================================\n', 'blue');
    
    log('🎉 Deployment complete! Your case is now on the blockchain forever.\n', 'green');
}

// Error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        log(`\n❌ Deployment failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
