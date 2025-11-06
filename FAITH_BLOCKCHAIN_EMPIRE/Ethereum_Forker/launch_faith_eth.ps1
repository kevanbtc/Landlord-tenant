# Faith-ETH Windows Launcher

# Download Geth: https://geth.ethereum.org/downloads
# Extract to C:\geth

# Initialize
C:\geth\geth.exe --datadir .\faith-eth-data init genesis_faith_eth.json

# Launch
C:\geth\geth.exe --datadir .\faith-eth-data `
  --networkid 32000001 `
  --http --http.api eth,net,web3,personal `
  --http.addr 0.0.0.0 --http.port 8545 `
  --ws --ws.api eth,net,web3,personal `
  --ws.addr 0.0.0.0 --ws.port 8546 `
  --mine --miner.etherbase 0xdcc03ea6a5bE3A2fB51e05cb9F25e9AD034b0a42 `
  --syncmode full `
  console

Write-Host "Faith-ETH is LIVE!"
