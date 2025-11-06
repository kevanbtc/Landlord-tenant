import { ethers } from "ethers";
import { handleWorldlineCreated, handleWorldlineUpdated, handleWorldlineEntangled } from "./worldlineProcessor";

// ENV: RPC_URL, REGISTRY_ADDRESS
const RPC_URL = process.env.RPC_URL!;
const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS!;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // ABI fragment for events only
  const registryAbi = [
    "event WorldlineCreated(bytes32 indexed worldlineId, bytes32 indexed classId, bytes32 indexed anchorRef, bytes initialStateCid)",
    "event WorldlineUpdated(bytes32 indexed worldlineId, uint8 fieldMask, bytes newStateCid)",
    "event WorldlineEntangled(bytes32 indexed sourceWorldline, bytes32 indexed targetWorldline, bytes32 relType)"
  ];

  const registry = new ethers.Contract(REGISTRY_ADDRESS, registryAbi, provider);

  registry.on("WorldlineCreated", async (worldlineId, classId, anchorRef, initialStateCid, event) => {
    await handleWorldlineCreated({
      worldlineId,
      classId,
      anchorRef,
      initialStateCid,
      txHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  });

  registry.on("WorldlineUpdated", async (worldlineId, fieldMask, newStateCid, event) => {
    await handleWorldlineUpdated({
      worldlineId,
      fieldMask: Number(fieldMask),
      newStateCid,
      txHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  });

  registry.on("WorldlineEntangled", async (sourceWorldline, targetWorldline, relType, event) => {
    await handleWorldlineEntangled({
      sourceWorldline,
      targetWorldline,
      relType,
      txHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  });

  console.log("Worldline indexer listening on", REGISTRY_ADDRESS);
}

main().catch(console.error);
