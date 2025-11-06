#!/usr/bin/env node

const AdvancedGenesis = require('./advanced-genesis');

async function createAdvancedGenesis() {
  console.log('🚀 Creating Advanced Digital Giant L1 Genesis...');

  // Initialize advanced genesis creator
  const genesis = new AdvancedGenesis({});

  try {
    // Basic configuration
    genesis
      .setChainId(2023)
      .setGasLimit('0x1fffffffffffff')
      .setDifficulty('0x1');

    // Enable advanced features
    await genesis.enableAIOptimization({
      tps: 1000,
      decentralization: 0.8,
      security: 0.9,
      scalability: 0.85
    });

    await genesis.enableQuantumResistance();

    // Enable specialized features
    genesis
      .enableAdvancedPrivacy()
      .enableDeFiOptimization()
      .enableGamingOptimization()
      .enableEnterpriseFeatures()
      .enableSustainability()
      .enableDynamicUpdates();

    // Add validators
    genesis
      .addValidator('0x0000000000000000000000000000000000000001', '0x100000000000000000000000000')
      .addValidator('0x0000000000000000000000000000000000000002', '0x100000000000000000000000000')
      .addValidator('0x0000000000000000000000000000000000000003', '0x100000000000000000000000000')
      .addValidator('0x0000000000000000000000000000000000000004', '0x100000000000000000000000000');

    // Add token allocations
    genesis
      .addAllocation('0x0000000000000000000000000000000000000005', {
        balance: '1000000000000000000000000' // 1 million DG tokens
      })
      .addAllocation('0x0000000000000000000000000000000000000006', {
        balance: '500000000000000000000000' // 500k DG tokens
      });

    // Add privacy groups
    genesis
      .addPrivacyGroup({
        id: 'enterprise-group-1',
        members: ['0x0000000000000000000000000000000000000001'],
        privacyFlag: 1
      })
      .addPrivacyGroup({
        id: 'regulatory-group-1',
        members: ['0x0000000000000000000000000000000000000002'],
        privacyFlag: 2
      });

    // Add bootnodes
    genesis
      .addBootnode('enode://pubkey1@127.0.0.1:30301')
      .addBootnode('enode://pubkey2@127.0.0.1:30302');

    // Setup permissioning
    genesis.setPermissioning({
      accounts: {
        allowlist: [
          '0x0000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000002'
        ]
      }
    });

    // Add sidechains
    genesis
      .addSidechain({
        id: 'gaming-sidechain',
        chainId: 2024,
        consensus: 'qbft',
        validators: ['0x0000000000000000000000000000000000000001'],
        bridge: 'gaming-bridge'
      })
      .addSidechain({
        id: 'defi-sidechain',
        chainId: 2025,
        consensus: 'qbft',
        validators: ['0x0000000000000000000000000000000000000002'],
        bridge: 'defi-bridge'
      });

    // Add bridges
    genesis
      .addBridge({
        type: 'ccip',
        sourceChain: 2023,
        targetChain: 1, // Ethereum mainnet
        validators: ['0x0000000000000000000000000000000000000001'],
        threshold: 2
      });

    // Validate the genesis
    await genesis.advancedValidate();

    // Generate and save
    const filename = genesis.saveToFile('advanced-genesis.json');

    // Generate report
    const report = genesis.generateReport();
    require('fs').writeFileSync('genesis-report.json', JSON.stringify(report, null, 2));

    // Create backup
    const backupFile = genesis.createBackup();

    console.log('✅ Advanced Genesis Created Successfully!');
    console.log(`📄 Genesis file: ${filename}`);
    console.log(`📊 Report file: genesis-report.json`);
    console.log(`💾 Backup file: ${backupFile}`);

    // Display summary
    console.log('\n📋 Genesis Summary:');
    console.log(`   Chain ID: ${genesis.genesis.config.chainId}`);
    console.log(`   Consensus: QBFT`);
    console.log(`   Validators: ${Object.keys(genesis.genesis.alloc).length}`);
    console.log(`   Features: ${genesis.getEnabledFeatures().join(', ')}`);

    // Simulate genesis
    console.log('\n🔬 Running Genesis Simulation...');
    const simulation = await genesis.simulateGenesis(60); // 1 minute simulation
    console.log(`   Simulated blocks: ${simulation.blocks.length}`);
    console.log(`   Average TPS: ${simulation.metrics.tps}`);
    console.log(`   Decentralization: ${(simulation.metrics.decentralization * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Failed to create genesis:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createAdvancedGenesis();
}

module.exports = createAdvancedGenesis;
