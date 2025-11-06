const axios = require('axios');
const Web3 = require('web3');

class DataPipeline {
  constructor(config) {
    this.sources = config.sources;
    this.sinks = config.sinks;
    this.transformations = config.transformations;
    this.pipeline = new Map();
    this.web3 = new Web3();
  }

  async initialize() {
    // Initialize connections to sources and sinks
    for (const source of this.sources) {
      await this.initializeSource(source);
    }

    for (const sink of this.sinks) {
      await this.initializeSink(sink);
    }

    console.log('Data Pipeline initialized');
  }

  async initializeSource(source) {
    switch (source.type) {
      case 'besu':
        source.client = new Web3(source.endpoint);
        break;
      case 'chainlink':
        source.client = axios.create({
          baseURL: source.endpoint,
          timeout: 10000
        });
        break;
      default:
        console.warn(`Unknown source type: ${source.type}`);
    }
  }

  async initializeSink(sink) {
    switch (sink.type) {
      case 'blockscout':
        sink.client = axios.create({
          baseURL: sink.endpoint,
          timeout: 10000
        });
        break;
      case 'thegraph':
        sink.client = axios.create({
          baseURL: sink.endpoint,
          timeout: 10000
        });
        break;
      case 'ipfs':
        // IPFS client would be initialized here
        break;
      default:
        console.warn(`Unknown sink type: ${sink.type}`);
    }
  }

  async createPipeline(sourceType, sinkType, transformationRules) {
    const source = this.sources.find(s => s.type === sourceType);
    const sink = this.sinks.find(s => s.type === sinkType);

    if (!source || !sink) {
      throw new Error(`Invalid source or sink: ${sourceType} -> ${sinkType}`);
    }

    const pipeline = {
      source,
      sink,
      transformations: transformationRules,
      status: 'active',
      lastRun: null,
      metrics: {
        processed: 0,
        errors: 0,
        latency: 0
      }
    };

    this.pipeline.set(`${sourceType}-${sinkType}`, pipeline);

    // Start data flow
    this.startDataFlow(pipeline);

    return pipeline;
  }

  async startDataFlow(pipeline) {
    const { source, sink, transformations } = pipeline;

    try {
      // Extract data from source
      const rawData = await this.extractData(source);

      // Apply transformations
      const transformedData = await this.applyTransformations(rawData, transformations);

      // Load data to sink
      await this.loadData(sink, transformedData);

      // Update metrics
      pipeline.lastRun = Date.now();
      pipeline.metrics.processed++;

    } catch (error) {
      console.error('Data flow error:', error);
      pipeline.metrics.errors++;
    }
  }

  async extractData(source) {
    switch (source.type) {
      case 'besu':
        return await this.extractFromBesu(source);
      case 'chainlink':
        return await this.extractFromChainlink(source);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  async extractFromBesu(source) {
    const latestBlock = await source.client.eth.getBlockNumber();
    const block = await source.client.eth.getBlock(latestBlock, true);

    return {
      type: 'block',
      data: block,
      timestamp: Date.now()
    };
  }

  async extractFromChainlink(source) {
    // This would query Chainlink feeds
    // Placeholder implementation
    return {
      type: 'price_feed',
      data: {},
      timestamp: Date.now()
    };
  }

  async applyTransformations(data, rules) {
    let transformedData = data;

    for (const rule of rules) {
      transformedData = await this.applyTransformation(transformedData, rule);
    }

    return transformedData;
  }

  async applyTransformation(data, rule) {
    switch (rule.name) {
      case 'add_sender_balance':
        if (data.type === 'block' && data.data.transactions) {
          for (const tx of data.data.transactions) {
            if (tx.from) {
              tx.senderBalance = await this.web3.eth.getBalance(tx.from);
            }
          }
        }
        break;
      case 'add_receiver_balance':
        if (data.type === 'block' && data.data.transactions) {
          for (const tx of data.data.transactions) {
            if (tx.to) {
              tx.receiverBalance = await this.web3.eth.getBalance(tx.to);
            }
          }
        }
        break;
      case 'add_gas_price_usd':
        // This would require price feed integration
        if (data.type === 'block' && data.data.transactions) {
          for (const tx of data.data.transactions) {
            tx.gasPriceUSD = tx.gasPrice * 0.000000001; // Placeholder conversion
          }
        }
        break;
    }

    return data;
  }

  async loadData(sink, data) {
    switch (sink.type) {
      case 'blockscout':
        return await this.loadToBlockScout(sink, data);
      case 'thegraph':
        return await this.loadToTheGraph(sink, data);
      case 'ipfs':
        return await this.loadToIPFS(sink, data);
      default:
        throw new Error(`Unsupported sink type: ${sink.type}`);
    }
  }

  async loadToBlockScout(sink, data) {
    if (data.type === 'block') {
      try {
        await sink.client.post('/api/blocks', data.data);
      } catch (error) {
        console.error('Failed to load block to BlockScout:', error);
      }
    }
  }

  async loadToTheGraph(sink, data) {
    if (data.type === 'block') {
      try {
        await sink.client.post('/graphql', {
          query: `
            mutation AddBlock($block: BlockInput!) {
              addBlock(block: $block) {
                id
              }
            }
          `,
          variables: { block: data.data }
        });
      } catch (error) {
        console.error('Failed to load block to The Graph:', error);
      }
    }
  }

  async loadToIPFS(sink, data) {
    // IPFS storage implementation would go here
    console.log('Loading data to IPFS:', data.type);
  }

  getPipelineMetrics() {
    const metrics = {};

    for (const [key, pipeline] of this.pipeline) {
      metrics[key] = {
        status: pipeline.status,
        lastRun: pipeline.lastRun,
        processed: pipeline.metrics.processed,
        errors: pipeline.metrics.errors,
        latency: pipeline.metrics.latency
      };
    }

    return metrics;
  }

  async pausePipeline(sourceType, sinkType) {
    const key = `${sourceType}-${sinkType}`;
    const pipeline = this.pipeline.get(key);

    if (pipeline) {
      pipeline.status = 'paused';
    }
  }

  async resumePipeline(sourceType, sinkType) {
    const key = `${sourceType}-${sinkType}`;
    const pipeline = this.pipeline.get(key);

    if (pipeline) {
      pipeline.status = 'active';
      this.startDataFlow(pipeline);
    }
  }
}

module.exports = DataPipeline;
