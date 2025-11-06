const fs = require('fs');
const crypto = require('crypto');

class GenesisCreator {
  constructor(config) {
    this.config = config;
    this.genesis = {
      config: {
        chainId: 2023,
        homesteadBlock: 0,
        eip150Block: 0,
        eip155Block: 0,
        eip158Block: 0,
        byzantiumBlock: 0,
        constantinopleBlock: 0,
        petersburgBlock: 0,
        istanbulBlock: 0,
        muirGlacierBlock: 0,
        berlinBlock: 0,
        londonBlock: 0,
        shanghaiTime: 0,
        cancunTime: 0,
        qbft: {
          blockperiodseconds: 5,
          epochlength: 30000,
          requesttimeoutseconds: 10,
          blockreward: "0x0",
          miningbeneficiary: "0x0000000000000000000000000000000000000000",
          extraData: "0xf83ea00000000000000000000000000000000000000000000000000000000000000000d5940000000000000000000000000000000000000000c0"
        }
      },
      nonce: "0x0",
      timestamp: this.generateTimestamp(),
      extraData: "0xf83ea00000000000000000000000000000000000000000000000000000000000000000d5940000000000000000000000000000000000000000c0",
      gasLimit: "0x1fffffffffffff",
      difficulty: "0x1",
      mixHash: "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",
      coinbase: "0x0000000000000000000000000000000000000000",
      alloc: {},
      number: "0x0",
      gasUsed: "0x0",
      parentHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      baseFeePerGas: "0x3b9aca00"
    };
  }

  generateTimestamp() {
    return "0x" + Math.floor(Date.now() / 1000).toString(16);
  }

  setChainId(chainId) {
    this.genesis.config.chainId = chainId;
    return this;
  }

  setConsensus(type, config) {
    // Remove existing consensus
    delete this.genesis.config.qbft;
    delete this.genesis.config.ibft;
    delete this.genesis.config.ethash;

    this.genesis.config[type.toLowerCase()] = config;
    return this;
  }

  addAllocation(address, allocation) {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }

    this.genesis.alloc[address] = {
      balance: allocation.balance || "0x0",
      ...allocation
    };
    return this;
  }

  addValidator(address, stake = "0x1") {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid validator address: ${address}`);
    }

    // Add stake to allocation
    this.addAllocation(address, { balance: stake });

    // Update QBFT extraData with validator address
    this.updateExtraData(address);

    return this;
  }

  updateExtraData(validatorAddress) {
    // Extract address without 0x prefix
    const address = validatorAddress.substring(2);

    // Current extraData structure: 0xf83e (prefix) + a000... (vanity) + d594... (validators) + c0 (suffix)
    // We need to insert the validator address
    const prefix = "f83e";
    const vanity = "a00000000000000000000000000000000000000000000000000000000000000000";
    const suffix = "c0";

    // For simplicity, we'll replace the vanity with validator data
    // In production, this would properly encode multiple validators
    const validatorData = address + "0000000000000000000000000000000000000000";

    this.genesis.extraData = `0x${prefix}${vanity}${validatorData}${suffix}`;
  }

  addPrivacyGroup(groupConfig) {
    if (!this.genesis.privacy) {
      this.genesis.privacy = { groups: [] };
    }

    this.genesis.privacy.groups.push({
      id: groupConfig.id,
      members: groupConfig.members || [],
      privacyFlag: groupConfig.privacyFlag || 1,
      ...groupConfig
    });

    return this;
  }

  setPermissioning(permissioningConfig) {
    this.genesis.permissioning = {
      accounts: permissioningConfig.accounts || {
        allowlist: [],
        blocklist: []
      },
      nodes: permissioningConfig.nodes || {
        allowlist: [],
        blocklist: []
      },
      ...permissioningConfig
    };

    return this;
  }

  addBootnode(enode) {
    if (!this.genesis.bootnodes) {
      this.genesis.bootnodes = [];
    }

    this.genesis.bootnodes.push(enode);
    return this;
  }

  setGasLimit(gasLimit) {
    this.genesis.gasLimit = gasLimit;
    return this;
  }

  setDifficulty(difficulty) {
    this.genesis.difficulty = difficulty;
    return this;
  }

  addContractDeployment(address, bytecode, storage = {}) {
    this.genesis.alloc[address] = {
      balance: "0x0",
      code: bytecode,
      storage: storage
    };
    return this;
  }

  generate() {
    this.validate();
    return JSON.stringify(this.genesis, null, 2);
  }

  validate() {
    // Validate chainId
    if (!this.genesis.config.chainId || this.genesis.config.chainId < 1) {
      throw new Error('Valid chain ID is required');
    }

    // Validate consensus configuration
    const consensusTypes = ['qbft', 'ibft', 'ethash'];
    const hasConsensus = consensusTypes.some(type =>
      this.genesis.config[type]
    );

    if (!hasConsensus) {
      throw new Error('Consensus mechanism must be configured');
    }

    // Validate allocations
    for (const [address, alloc] of Object.entries(this.genesis.alloc)) {
      if (!this.isValidAddress(address)) {
        throw new Error(`Invalid address in allocation: ${address}`);
      }

      if (alloc.balance && !this.isValidHex(alloc.balance)) {
        throw new Error(`Invalid balance for address ${address}: ${alloc.balance}`);
      }
    }

    // Validate privacy groups if present
    if (this.genesis.privacy && this.genesis.privacy.groups) {
      for (const group of this.genesis.privacy.groups) {
        if (!group.id) {
          throw new Error('Privacy group must have an ID');
        }

        for (const member of group.members || []) {
          if (!this.isValidAddress(member)) {
            throw new Error(`Invalid member address in privacy group ${group.id}: ${member}`);
          }
        }
      }
    }

    console.log('Genesis configuration validated successfully');
  }

  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  isValidHex(value) {
    return /^0x[a-fA-F0-9]+$/.test(value);
  }

  saveToFile(filename = 'genesis.json') {
    const genesisJson = this.generate();
    fs.writeFileSync(filename, genesisJson);
    console.log(`Genesis saved to ${filename}`);
    return filename;
  }

  loadFromFile(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    this.genesis = JSON.parse(data);
    return this;
  }

  // Advanced features
  enableQuantumResistance() {
    // Add quantum-resistant cryptographic parameters
    this.genesis.quantum = {
      signatureAlgorithm: 'Dilithium',
      encryptionAlgorithm: 'Kyber',
      keySize: 256
    };
    return this;
  }

  addAIOptimization() {
    // Add AI-optimized parameters
    this.genesis.ai = {
      optimizationEnabled: true,
      predictiveScaling: true,
      anomalyDetection: true
    };
    return this;
  }

  generateHash() {
    const genesisJson = this.generate();
    return crypto.createHash('sha256').update(genesisJson).digest('hex');
  }

  signGenesis(privateKey) {
    const hash = this.generateHash();
    const sign = crypto.createSign('SHA256');
    sign.update(hash);
    const signature = sign.sign(privateKey, 'hex');
    this.genesis.signature = signature;
    return this;
  }

  verifyGenesis(publicKey) {
    if (!this.genesis.signature) {
      throw new Error('Genesis is not signed');
    }

    const hash = this.generateHash();
    const verify = crypto.createVerify('SHA256');
    verify.update(hash);
    return verify.verify(publicKey, this.genesis.signature, 'hex');
  }

  // Utility methods
  clone() {
    return new GenesisCreator(JSON.parse(JSON.stringify(this.genesis)));
  }

  merge(otherGenesis) {
    // Deep merge genesis configurations
    this.genesis = this.deepMerge(this.genesis, otherGenesis);
    return this;
  }

  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  toHex(value) {
    if (typeof value === 'string' && value.startsWith('0x')) {
      return value;
    }
    return '0x' + BigInt(value).toString(16);
  }

  fromHex(hexValue) {
    if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
      return parseInt(hexValue, 16);
    }
    return hexValue;
  }

  // Export methods
  toToml() {
    // Convert to TOML format for some clients
    // Implementation would convert JSON to TOML
    return "# TOML format not implemented yet";
  }

  toYaml() {
    // Convert to YAML format
    // Implementation would convert JSON to YAML
    return "# YAML format not implemented yet";
  }
}

module.exports = GenesisCreator;
