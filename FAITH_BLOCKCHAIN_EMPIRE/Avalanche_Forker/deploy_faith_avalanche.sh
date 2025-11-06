#!/bin/bash
# Faith-Avalanche Subnet Deployment

# Install Avalanche CLI
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s

# Create subnet
avalanche subnet create faith-subnet \
  --evm \
  --chain-id 32000004 \
  --token-name FAITH \
  --token-symbol FAITH

# Deploy subnet
avalanche subnet deploy faith-subnet \
  --local

# Add validators
avalanche subnet addValidator faith-subnet \
  --nodeID NodeID-Faith1 \
  --weight 1000000

echo "Faith-Avalanche Subnet DEPLOYED!"
echo "RPC: http://localhost:9650/ext/bc/faith-subnet/rpc"
