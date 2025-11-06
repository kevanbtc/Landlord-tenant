#!/usr/bin/env node

const MasterController = require('./master-controller');
const config = require('./config');

class DigitalGiantL1App {
  constructor() {
    this.masterController = new MasterController(config);
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Starting Digital Giant L1 Connectors...');

    try {
      await this.masterController.initialize();
      this.isRunning = true;

      console.log('✅ Digital Giant L1 Connectors started successfully');

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Keep the process running
      await this.keepAlive();

    } catch (error) {
      console.error('❌ Failed to start Digital Giant L1 Connectors:', error);
      process.exit(1);
    }
  }

  async stop() {
    console.log('🛑 Stopping Digital Giant L1 Connectors...');

    try {
      await this.masterController.shutdown();
      this.isRunning = false;
      console.log('✅ Digital Giant L1 Connectors stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping Digital Giant L1 Connectors:', error);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // nodemon restart

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  async keepAlive() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.isRunning) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  // API methods for external control
  async getStatus() {
    return await this.masterController.getSystemStatus();
  }

  async pause() {
    await this.masterController.pauseSystem();
  }

  async resume() {
    await this.masterController.resumeSystem();
  }

  async createAutomationJob(jobConfig) {
    return await this.masterController.createAutomationJob(jobConfig);
  }

  async getPrices() {
    return await this.masterController.getPrices();
  }

  async storeToIPFS(data, policy) {
    return await this.masterController.storeToIPFS(data, policy);
  }

  async getFromIPFS(cid) {
    return await this.masterController.getFromIPFS(cid);
  }

  async publishEvent(component, eventType, data) {
    return await this.masterController.publishEvent(component, eventType, data);
  }
}

// CLI interface
if (require.main === module) {
  const app = new DigitalGiantL1App();

  // Handle command line arguments
  const command = process.argv[2];

  switch (command) {
    case 'start':
      app.start();
      break;
    case 'stop':
      app.stop().then(() => process.exit(0));
      break;
    case 'status':
      app.getStatus().then(status => {
        console.log(JSON.stringify(status, null, 2));
        process.exit(0);
      });
      break;
    case 'pause':
      app.pause().then(() => {
        console.log('System paused');
        process.exit(0);
      });
      break;
    case 'resume':
      app.resume().then(() => {
        console.log('System resumed');
        process.exit(0);
      });
      break;
    default:
      console.log('Usage: node app.js <command>');
      console.log('Commands:');
      console.log('  start   - Start the connectors');
      console.log('  stop    - Stop the connectors');
      console.log('  status  - Get system status');
      console.log('  pause   - Pause the system');
      console.log('  resume  - Resume the system');
      process.exit(1);
  }
}

module.exports = DigitalGiantL1App;
