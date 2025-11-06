const axios = require('axios');
const { ethers } = require('ethers');

class OracleBridge {
  constructor(config) {
    this.config = config;
    this.chainlink = axios.create({
      baseURL: config.chainlink.endpoint,
      timeout: 10000,
      auth: {
        username: config.chainlink.api_credentials.email,
        password: config.chainlink.api_credentials.password
      }
    });

    this.feeds = config.feeds;
    this.automation = config.automation;
    this.vrf = config.vrf;

    // Initialize ethers provider (would be configured for the network)
    this.provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY || '0x' + '0'.repeat(64), this.provider);
  }

  async initialize() {
    // Test connections
    await this.testConnections();

    // Setup automation jobs
    await this.setupAutomationJobs();

    console.log('Oracle Bridge initialized');
  }

  async testConnections() {
    try {
      // Test Chainlink connection
      await this.chainlink.get('/health');

      // Test blockchain connection
      await this.provider.getBlockNumber();

      console.log('All connections established');
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  }

  async getPrice(feedName) {
    const feed = this.feeds.find(f => f.name === feedName);
    if (!feed) {
      throw new Error(`Price feed ${feedName} not found`);
    }

    const priceFeed = new ethers.Contract(
      feed.address,
      [
        "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
      ],
      this.provider
    );

    const [, price, , updatedAt, ] = await priceFeed.latestRoundData();

    return {
      price: price.toString(),
      updatedAt: updatedAt.toNumber(),
      feed: feedName
    };
  }

  async getAllPrices() {
    const prices = {};

    for (const feed of this.feeds) {
      try {
        prices[feed.name] = await this.getPrice(feed.name);
      } catch (error) {
        console.error(`Failed to get price for ${feed.name}:`, error);
        prices[feed.name] = { error: error.message };
      }
    }

    return prices;
  }

  async setupAutomationJobs() {
    for (const job of this.automation) {
      await this.setupAutomationJob(job);
    }
  }

  async setupAutomationJob(jobConfig) {
    try {
      const job = {
        name: jobConfig.name,
        contractAddress: jobConfig.contract,
        functionName: jobConfig.function,
        schedule: jobConfig.schedule,
        status: 'active',
        created: Date.now()
      };

      // Register with Chainlink Automation
      const response = await this.chainlink.post('/jobs', job);
      job.id = response.data.id;

      this.automation.push(job);

      console.log(`Automation job created: ${job.name}`);
    } catch (error) {
      console.error(`Failed to create automation job ${jobConfig.name}:`, error);
      throw error;
    }
  }

  async executeAutomationJob(jobId) {
    const job = this.automation.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Automation job ${jobId} not found`);
    }

    try {
      // Execute the job via Chainlink
      const response = await this.chainlink.post(`/jobs/${jobId}/execute`);
      return response.data;
    } catch (error) {
      console.error(`Failed to execute automation job ${jobId}:`, error);
      throw error;
    }
  }

  async getDueAutomationJobs() {
    const now = Date.now();
    const dueJobs = [];

    for (const job of this.automation) {
      if (job.status === 'active' && this.isJobDue(job, now)) {
        dueJobs.push(job);
      }
    }

    return dueJobs;
  }

  isJobDue(job, currentTime) {
    // Simple cron-like scheduling (would be more sophisticated in production)
    const schedule = job.schedule; // e.g., "0 0 * * *" for daily at midnight

    // Placeholder logic - in production would parse cron expression
    const lastRun = job.lastRun || 0;
    const interval = this.parseSchedule(schedule);

    return (currentTime - lastRun) >= interval;
  }

  parseSchedule(schedule) {
    // Placeholder - would implement proper cron parsing
    if (schedule === '0 0 * * *') { // Daily
      return 24 * 60 * 60 * 1000;
    } else if (schedule === '0 */1 * * *') { // Hourly
      return 60 * 60 * 1000;
    }
    return 60 * 1000; // Default 1 minute
  }

  async requestRandomness(callbackGasLimit = 100000) {
    try {
      const vrfCoordinator = new ethers.Contract(
        this.vrf.coordinator,
        [
          "function requestRandomWords(bytes32 keyHash, uint64 subId, uint16 minimumRequestConfirmations, uint32 callbackGasLimit, uint32 numWords) external returns (uint256 requestId)"
        ],
        this.signer
      );

      const tx = await vrfCoordinator.requestRandomWords(
        this.vrf.key_hash,
        await this.getSubscriptionId(),
        3, // requestConfirmations
        callbackGasLimit,
        1  // numWords
      );

      await tx.wait();

      return {
        requestId: tx.hash,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Failed to request randomness:', error);
      throw error;
    }
  }

  async getSubscriptionId() {
    // This would retrieve or create a VRF subscription
    // Placeholder implementation
    return 1;
  }

  async createCustomFeed(feedConfig) {
    try {
      // Deploy custom price feed contract
      const CustomPriceFeed = await ethers.getContractFactory("CustomPriceFeed");
      const feed = await CustomPriceFeed.deploy();

      await feed.deployed();

      const feedData = {
        name: feedConfig.name,
        address: feed.address,
        heartbeat: feedConfig.heartbeat,
        created: Date.now()
      };

      // Register with Chainlink
      await this.chainlink.post('/feeds', feedData);

      this.feeds.push(feedData);

      console.log(`Custom feed created: ${feedConfig.name} at ${feed.address}`);

      return feed.address;
    } catch (error) {
      console.error('Failed to create custom feed:', error);
      throw error;
    }
  }

  async updateFeedPrice(feedName, newPrice) {
    const feed = this.feeds.find(f => f.name === feedName);
    if (!feed) {
      throw new Error(`Feed ${feedName} not found`);
    }

    try {
      const priceFeed = new ethers.Contract(
        feed.address,
        ["function updatePrice(int256 price) external"],
        this.signer
      );

      const tx = await priceFeed.updatePrice(newPrice);
      await tx.wait();

      console.log(`Updated price for ${feedName}: ${newPrice}`);
    } catch (error) {
      console.error(`Failed to update price for ${feedName}:`, error);
      throw error;
    }
  }

  async getFeedHealth() {
    const health = {};

    for (const feed of this.feeds) {
      try {
        const priceData = await this.getPrice(feed.name);
        const timeSinceUpdate = Date.now() / 1000 - priceData.updatedAt;
        const isHealthy = timeSinceUpdate < feed.heartbeat;

        health[feed.name] = {
          healthy: isHealthy,
          lastUpdate: priceData.updatedAt,
          timeSinceUpdate,
          heartbeat: feed.heartbeat
        };
      } catch (error) {
        health[feed.name] = {
          healthy: false,
          error: error.message
        };
      }
    }

    return health;
  }

  async getAutomationJobStatus(jobId) {
    const job = this.automation.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Automation job ${jobId} not found`);
    }

    try {
      const response = await this.chainlink.get(`/jobs/${jobId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get status for job ${jobId}:`, error);
      throw error;
    }
  }

  async pauseAutomationJob(jobId) {
    const job = this.automation.find(j => j.id === jobId);
    if (job) {
      job.status = 'paused';
      await this.chainlink.put(`/jobs/${jobId}`, { status: 'paused' });
    }
  }

  async resumeAutomationJob(jobId) {
    const job = this.automation.find(j => j.id === jobId);
    if (job) {
      job.status = 'active';
      await this.chainlink.put(`/jobs/${jobId}`, { status: 'active' });
    }
  }

  onPriceUpdate(callback) {
    // Set up listeners for price updates
    this.priceUpdateCallback = callback;
  }

  async monitorPriceFeeds() {
    setInterval(async () => {
      for (const feed of this.feeds) {
        try {
          const priceData = await this.getPrice(feed.name);
          if (this.priceUpdateCallback) {
            this.priceUpdateCallback(priceData);
          }
        } catch (error) {
          console.error(`Failed to monitor feed ${feed.name}:`, error);
        }
      }
    }, 30000); // Check every 30 seconds
  }
}

module.exports = OracleBridge;
