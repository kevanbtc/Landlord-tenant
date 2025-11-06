const { Kafka } = require('kafkajs');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

class EventBridge {
  constructor(config) {
    this.config = config;
    this.kafka = new Kafka({
      clientId: 'digital-giant-event-bridge',
      brokers: config.kafka.brokers
    });
    this.redis = new Redis(config.redis);
    this.consumers = new Map();
    this.producer = this.kafka.producer();
  }

  async initialize() {
    await this.producer.connect();
    console.log('Event Bridge initialized');
  }

  async publishEvent(component, eventType, data, metadata = {}) {
    const event = {
      id: uuidv4(),
      timestamp: Date.now(),
      component,
      type: eventType,
      data,
      metadata: {
        version: '1.0',
        chainId: 2023,
        ...metadata
      }
    };

    const topic = `${component}-events`;

    try {
      // Publish to Kafka
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(event) }]
      });

      // Publish to Redis for real-time subscribers
      await this.redis.publish(`${component}:${eventType}`, JSON.stringify(event));

      console.log(`Event published: ${component}:${eventType}`);
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  async subscribeToEvents(component, eventTypes, callback) {
    const consumer = this.kafka.consumer({
      groupId: `${component}-consumer-${Date.now()}`
    });

    await consumer.connect();

    const topics = eventTypes.map(type => `${component}-${type}`);

    await consumer.subscribe({
      topics,
      fromBeginning: false
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          await callback(event);
        } catch (error) {
          console.error('Error processing event:', error);
        }
      }
    });

    this.consumers.set(component, consumer);
    console.log(`Subscribed to events for ${component}: ${topics.join(', ')}`);
  }

  async getEventHistory(component, eventType, limit = 100) {
    // This would typically query a database or use Kafka's offset management
    // For now, return empty array as placeholder
    return [];
  }

  async filterEvents(component, filters) {
    // Implement event filtering logic
    // This could involve querying stored events with filters
    return [];
  }

  async close() {
    await this.producer.disconnect();
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
    await this.redis.quit();
  }
}

module.exports = EventBridge;
