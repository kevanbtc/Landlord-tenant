import { saveWorldlineMeta, saveWorldlineState, saveEntanglement } from "./db";
import { fetchStateJson } from "./ipfsUtils";

export async function handleWorldlineCreated(evt: {
  worldlineId: string;
  classId: string;
  anchorRef: string;
  initialStateCid: string;
  txHash: string;
  blockNumber: number;
}) {
  await saveWorldlineMeta({
    worldlineId: evt.worldlineId,
    classId: evt.classId,
    anchorRef: evt.anchorRef,
    createdAt: new Date()
  });

  const stateJson = await fetchStateJson(evt.initialStateCid);
  await saveWorldlineState({
    worldlineId: evt.worldlineId,
    cid: evt.initialStateCid,
    rawJson: stateJson,
    createdAt: new Date()
  });
}

export async function handleWorldlineUpdated(evt: {
  worldlineId: string;
  fieldMask: number;
  newStateCid: string;
  txHash: string;
  blockNumber: number;
}) {
  const stateJson = await fetchStateJson(evt.newStateCid);
  await saveWorldlineState({
    worldlineId: evt.worldlineId,
    cid: evt.newStateCid,
    rawJson: stateJson,
    createdAt: new Date()
  });
}

export async function handleWorldlineEntangled(evt: {
  sourceWorldline: string;
  targetWorldline: string;
  relType: string;
  txHash: string;
  blockNumber: number;
}) {
  await saveEntanglement({
    sourceWorldline: evt.sourceWorldline,
    targetWorldline: evt.targetWorldline,
    relType: evt.relType,
    createdAt: new Date()
  });
}
