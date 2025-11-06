// Digital Giant L1 Connectors Configuration

const config = {
  eventBridge: {
    kafka: {
      brokers: ["kafka:9092"],
      topics: {
        blockchain_events: "besu-events",
        oracle_events: "chainlink-events",
        privacy_events: "orion-events"
      }
    },
    redis: {
      host: "redis:6379",
      channels: [
        "block:notifications",
        "transaction:updates",
        "oracle:feeds"
      ]
    }
  },

  dataPipeline: {
    sources: [
      {
        type: "besu",
        endpoint: "http://besu:8545",
        polling_interval: 1000
      },
      {
        type: "chainlink",
        endpoint: "http://chainlink:6688",
        polling_interval: 5000
      }
    ],
    sinks: [
      {
        type: "blockscout",
        endpoint: "http://blockscout:4000"
      },
      {
        type: "thegraph",
        endpoint: "http://graph-node:8020"
      },
      {
        type: "ipfs",
        endpoint: "http://ipfs:5001"
      }
    ],
    transformations: [
      {
        name: "transaction_enrichment",
        rules: [
          { name: "add_sender_balance" },
          { name: "add_receiver_balance" },
          { name: "add_gas_price_usd" }
        ]
      }
    ]
  },

  oracleBridge: {
    chainlink: {
      endpoint: "http://chainlink:6688",
      api_credentials: {
        email: process.env.CHAINLINK_EMAIL || "admin@digitalgiant.com",
        password: process.env.CHAINLINK_PASSWORD || "password"
      }
    },
    feeds: [
      {
        name: "ETH/USD",
        address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        heartbeat: 3600
      },
      {
        name: "BTC/USD",
        address: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        heartbeat: 3600
      },
      {
        name: "DG/USD",
        address: process.env.DG_USD_FEED || "0xCustomFeedAddress",
        heartbeat: 86400
      }
    ],
    automation: [
      {
        name: "daily_rebase",
        contract: "0xAlgorithmicStablecoin",
        function: "rebase()",
        schedule: "0 0 * * *"
      }
    ],
    vrf: {
      coordinator: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
      key_hash: "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef",
      fee: "100000000000000000"
    }
  },

  ipfsIntegration: {
    ipfs: {
      endpoint: "http://ipfs:5001",
      gateway: "http://ipfs:8080",
      cluster: {
        enabled: true,
        peers: ["ipfs-cluster-peer1", "ipfs-cluster-peer2"]
      }
    },
    storage_policies: {
      smart_contracts: {
        replication_factor: 3,
        pinning: true,
        retention: "permanent"
      },
      nfts: {
        replication_factor: 5,
        pinning: true,
        retention: "permanent"
      },
      temporary_data: {
        replication_factor: 1,
        pinning: false,
        retention: "30d"
      }
    },
    encryption: {
      enabled: true,
      algorithm: "AES-256-GCM",
      key_management: "vault"
    }
  },

  masterController: {
    health_check_interval: 30000,
    metrics_collection_interval: 60000,
    auto_recovery: true,
    alert_thresholds: {
      error_rate: 0.05,
      latency_ms: 5000,
      memory_usage: 0.8
    }
  }
};

module.exports = config;
