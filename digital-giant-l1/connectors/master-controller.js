const EventBridge = require('./event-bridge');
const DataPipeline = require('./data-pipeline');
const OracleBridge = require('./oracle-bridge');
const IPFSIntegration = require('./ipfs-integration');
const CertificateIntegration = require('../certificates/integration');

class MasterController {
  constructor(config) {
    this.config = config;
    this.eventBridge = new EventBridge(config.eventBridge);
    this.dataPipeline = new DataPipeline(config.dataPipeline);
    this.oracleBridge = new OracleBridge(config.oracleBridge);
    this.ipfsIntegration = new IPFSIntegration(config.ipfsIntegration);
    this.certificateIntegration = new CertificateIntegration(this);

    this.components = new Map();
    this.healthChecks = new Map();
    this.isRunning = false;
  }

  async initialize() {
    console.log('Initializing Digital Giant L1 Master Controller...');

    try {
      // Initialize all connectors
      await Promise.all([
        this.eventBridge.initialize(),
        this.dataPipeline.initialize(),
        this.oracleBridge.initialize(),
        this.ipfsIntegration.initialize(),
        this.certificateIntegration.initialize()
      ]);

      // Setup cross-component communication
      await this.setupCommunicationChannels();

      // Register component health checks
      this.registerComponents();

      // Start health monitoring
      this.startHealthMonitoring();

      // Start price feed monitoring
      this.oracleBridge.monitorPriceFeeds();

      this.isRunning = true;

      console.log('🎉 Digital Giant L1 Master Controller initialized successfully');

      // Publish initialization event
      await this.eventBridge.publishEvent('system', 'initialized', {
        timestamp: Date.now(),
        components: Array.from(this.components.keys())
      });

    } catch (error) {
      console.error('Failed to initialize Master Controller:', error);
      throw error;
    }
  }

  async setupCommunicationChannels() {
    console.log('Setting up communication channels...');

    // Besu -> Event Bridge
    this.eventBridge.subscribeToEvents('besu', ['block', 'transaction'], (event) => {
      this.handleBesuEvent(event);
    });

    // Chainlink -> Oracle Bridge
    this.oracleBridge.onPriceUpdate((priceData) => {
      this.eventBridge.publishEvent('oracle', 'price_update', priceData);
    });

    // Data Pipeline coordination
    this.dataPipeline.onDataProcessed = (processedData) => {
      this.distributeProcessedData(processedData);
    };

    // Setup data pipelines
    await this.setupDataPipelines();

    console.log('Communication channels established');
  }

  async setupDataPipelines() {
    // Besu to BlockScout
    await this.dataPipeline.createPipeline('besu', 'blockscout', [
      { name: 'add_sender_balance' },
      { name: 'add_receiver_balance' },
      { name: 'add_gas_price_usd' }
    ]);

    // Besu to The Graph
    await this.dataPipeline.createPipeline('besu', 'thegraph', [
      { name: 'add_sender_balance' },
      { name: 'add_receiver_balance' }
    ]);

    // Besu to IPFS
    await this.dataPipeline.createPipeline('besu', 'ipfs', []);
  }

  async handleBesuEvent(event) {
    try {
      switch (event.type) {
        case 'block':
          await this.processNewBlock(event.data);
          break;
        case 'transaction':
          await this.processTransaction(event.data);
          break;
        default:
          console.log(`Unhandled Besu event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling Besu event:', error);
    }
  }

  async processNewBlock(blockData) {
    console.log(`Processing new block: ${blockData.number}`);

    // Send to BlockScout via data pipeline
    await this.dataPipeline.routeData('besu', 'blockscout', blockData);

    // Send to The Graph via data pipeline
    await this.dataPipeline.routeData('besu', 'thegraph', blockData);

    // Store block data in IPFS
    const cid = await this.ipfsIntegration.storeData({
      type: 'block',
      data: blockData,
      timestamp: Date.now()
    }, 'temporary_data');

    // Check for oracle updates needed
    await this.checkOracleUpdates(blockData);

    // Publish block processed event
    await this.eventBridge.publishEvent('system', 'block_processed', {
      blockNumber: blockData.number,
      transactionCount: blockData.transactions?.length || 0,
      cid
    });
  }

  async processTransaction(txData) {
    console.log(`Processing transaction: ${txData.hash}`);

    // Check if private transaction
    if (txData.privacyFlag) {
      // Handle private transaction (would integrate with Orion)
      console.log('Processing private transaction');
    }

    // Store transaction data in IPFS
    const cid = await this.ipfsIntegration.storeTransactionData(txData);

    // Update indexes
    await this.updateIndexes(txData, cid);

    // Publish transaction processed event
    await this.eventBridge.publishEvent('system', 'transaction_processed', {
      txHash: txData.hash,
      cid
    });
  }

  async checkOracleUpdates(blockData) {
    try {
      // Check if any automation jobs need to run
      const dueJobs = await this.oracleBridge.getDueAutomationJobs();

      for (const job of dueJobs) {
        await this.executeAutomationJob(job);
      }
    } catch (error) {
      console.error('Error checking oracle updates:', error);
    }
  }

  async executeAutomationJob(job) {
    try {
      console.log(`Executing automation job: ${job.name}`);

      const result = await this.oracleBridge.executeAutomationJob(job.id);

      // Update last run time
      job.lastRun = Date.now();

      // Publish event
      await this.eventBridge.publishEvent('automation', 'job_executed', {
        jobId: job.id,
        jobName: job.name,
        result,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error(`Automation job failed: ${job.name}`, error);

      // Publish failure event
      await this.eventBridge.publishEvent('automation', 'job_failed', {
        jobId: job.id,
        jobName: job.name,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  async updateIndexes(txData, cid) {
    // This would update various indexes (The Graph, BlockScout, etc.)
    console.log(`Updating indexes for transaction: ${txData.hash}`);
  }

  async distributeProcessedData(processedData) {
    // Distribute processed data to relevant components
    console.log('Distributing processed data:', processedData.type);
  }

  registerComponents() {
    this.components.set('eventBridge', this.eventBridge);
    this.components.set('dataPipeline', this.dataPipeline);
    this.components.set('oracleBridge', this.oracleBridge);
    this.components.set('ipfsIntegration', this.ipfsIntegration);
    this.components.set('certificateIntegration', this.certificateIntegration);
  }

  startHealthMonitoring() {
    console.log('Starting health monitoring...');

    setInterval(async () => {
      if (!this.isRunning) return;

      const healthStatus = await this.checkSystemHealth();

      if (!healthStatus.healthy) {
        await this.handleHealthIssues(healthStatus.issues);
      }

      // Publish health status
      await this.eventBridge.publishEvent('system', 'health_check', healthStatus);

    }, 30000); // Check every 30 seconds
  }

  async checkSystemHealth() {
    const healthChecks = await Promise.allSettled([
      this.checkComponentHealth('eventBridge'),
      this.checkComponentHealth('dataPipeline'),
      this.checkComponentHealth('oracleBridge'),
      this.checkComponentHealth('ipfsIntegration')
    ]);

    const issues = [];

    healthChecks.forEach((result, index) => {
      const component = Array.from(this.components.keys())[index];
      if (result.status === 'rejected') {
        issues.push({
          component,
          healthy: false,
          error: result.reason.message
        });
      } else if (!result.value.healthy) {
        issues.push(result.value);
      }
    });

    return {
      healthy: issues.length === 0,
      timestamp: Date.now(),
      issues
    };
  }

  async checkComponentHealth(componentName) {
    try {
      const component = this.components.get(componentName);
      if (!component) {
        throw new Error(`Component ${componentName} not found`);
      }

      // Each component should have a healthCheck method
      const health = await component.healthCheck();

      return {
        component: componentName,
        healthy: health.status === 'ok',
        details: health
      };
    } catch (error) {
      return {
        component: componentName,
        healthy: false,
        error: error.message
      };
    }
  }

  async handleHealthIssues(issues) {
    for (const issue of issues) {
      console.warn(`Health issue detected: ${issue.component} - ${issue.error}`);

      // Attempt automatic recovery
      await this.attemptRecovery(issue.component, issue);

      // Publish alert
      await this.eventBridge.publishEvent('system', 'health_alert', {
        component: issue.component,
        issue: issue.error,
        timestamp: Date.now()
      });
    }
  }

  async attemptRecovery(component, issue) {
    try {
      switch (component) {
        case 'eventBridge':
          await this.restartEventBridge();
          break;
        case 'dataPipeline':
          await this.restartDataPipeline();
          break;
        case 'oracleBridge':
          await this.restartOracleBridge();
          break;
        case 'ipfsIntegration':
          await this.restartIPFSIntegration();
          break;
        default:
          console.log(`No recovery procedure for ${component}`);
      }
    } catch (error) {
      console.error(`Failed to recover ${component}:`, error);
    }
  }

  async restartEventBridge() {
    console.log('Attempting to restart Event Bridge...');
    // Implementation would restart the event bridge
  }

  async restartDataPipeline() {
    console.log('Attempting to restart Data Pipeline...');
    // Implementation would restart the data pipeline
  }

  async restartOracleBridge() {
    console.log('Attempting to restart Oracle Bridge...');
    // Implementation would restart the oracle bridge
  }

  async restartIPFSIntegration() {
    console.log('Attempting to restart IPFS Integration...');
    // Implementation would restart IPFS
  }

  async getSystemStatus() {
    const health = await this.checkSystemHealth();
    const metrics = {
      dataPipeline: this.dataPipeline.getPipelineMetrics(),
      oracleHealth: await this.oracleBridge.getFeedHealth(),
      ipfsPeers: await this.ipfsIntegration.listPeers()
    };

    return {
      status: this.isRunning ? 'running' : 'stopped',
      health,
      metrics,
      timestamp: Date.now()
    };
  }

  async pauseSystem() {
    console.log('Pausing system...');
    this.isRunning = false;

    // Pause all pipelines
    for (const [source, sink] of this.dataPipeline.pipeline.keys()) {
      await this.dataPipeline.pausePipeline(source, sink);
    }

    await this.eventBridge.publishEvent('system', 'paused', {
      timestamp: Date.now()
    });
  }

  async resumeSystem() {
    console.log('Resuming system...');
    this.isRunning = true;

    // Resume all pipelines
    for (const [source, sink] of this.dataPipeline.pipeline.keys()) {
      await this.dataPipeline.resumePipeline(source, sink);
    }

    await this.eventBridge.publishEvent('system', 'resumed', {
      timestamp: Date.now()
    });
  }

  async shutdown() {
    console.log('Shutting down Master Controller...');

    this.isRunning = false;

    // Close all connectors
    await Promise.allSettled([
      this.eventBridge.close(),
      this.oracleBridge.close && this.oracleBridge.close(),
      this.ipfsIntegration.close(),
      this.certificateIntegration.shutdown()
    ]);

    await this.eventBridge.publishEvent('system', 'shutdown', {
      timestamp: Date.now()
    });

    console.log('Master Controller shutdown complete');
  }

  // API methods for external control
  async createAutomationJob(jobConfig) {
    return await this.oracleBridge.setupAutomationJob(jobConfig);
  }

  async getPrices() {
    return await this.oracleBridge.getAllPrices();
  }

  async storeToIPFS(data, policy) {
    return await this.ipfsIntegration.storeData(data, policy);
  }

  async getFromIPFS(cid) {
    return await this.ipfsIntegration.retrieveData(cid);
  }

  async publishEvent(component, eventType, data) {
    return await this.eventBridge.publishEvent(component, eventType, data);
  }

  // Certificate-specific API methods
  async generateCertificate(eventType, eventData) {
    return await this.certificateIntegration.generateCertificate(eventType, eventData);
  }

  async verifyCertificate(certId) {
    return await this.certificateIntegration.verifyCertificate(certId);
  }

  async getUserCertificates(address) {
    return await this.certificateIntegration.getUserCertificates(address);
  }

  async createMintingFlow(mintData) {
    return await this.certificateIntegration.createMintingCertificateFlow(mintData);
  }

  async getCertificateStats() {
    return await this.certificateIntegration.getCelebrationStats();
  }
}

module.exports = MasterController;
