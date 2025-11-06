#!/bin/bash
# Faith-Cosmos Launch Script

# Initialize chain
faithd init faith-validator --chain-id faith-cosmos-1

# Add validator key
faithd keys add validator

# Add genesis account
faithd add-genesis-account validator 100000000000faith

# Create genesis transaction
faithd gentx validator 10000000faith --chain-id faith-cosmos-1

# Collect genesis transactions
faithd collect-gentxs

# Start chain
faithd start --home ~/.faith-cosmos \
  --rpc.laddr tcp://0.0.0.0:26657 \
  --api.enable true \
  --api.address tcp://0.0.0.0:1317 \
  --ibc.enable true

echo "Faith-Cosmos is LIVE with IBC!"
