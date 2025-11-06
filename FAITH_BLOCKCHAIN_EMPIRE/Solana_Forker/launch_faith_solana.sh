#!/bin/bash
# Faith-Solana Validator Launch

# Generate validator identity
solana-keygen new -o faith-validator-1.json
solana-keygen new -o faith-vote-1.json

# Start test validator (for development)
solana-test-validator \
  --ledger ./faith-solana-ledger \
  --rpc-port 8899 \
  --faucet-sol 1000000 \
  --bpf-program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA BPFLoader2111111111111111111111111111111111 \
  --reset

# For mainnet validator:
# solana-validator \
#   --identity faith-validator-1.json \
#   --vote-account faith-vote-1.json \
#   --ledger ./faith-solana-ledger \
#   --rpc-port 8899 \
#   --entrypoint mainnet-beta.solana.com:8001 \
#   --expected-genesis-hash 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d \
#   --dynamic-port-range 8000-8020 \
#   --limit-ledger-size 50000000

echo "Faith-Solana Validator is RUNNING!"
echo "RPC: http://localhost:8899"
