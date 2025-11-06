import React from 'react';

function IntegrationGuide() {
  return (
    <div className="page">
      <h1>Integration Guide</h1>
      <p>Step-by-step instructions for external devs to build worldlines.</p>

      <h2>1. Define a worldline class</h2>
      <p>Pick or define a classId, e.g., keccak256("RWA.CREDIT.NOTE_V1").</p>
      <pre>
{`// Solidity
bytes32 classId = keccak256("RWA.CREDIT.NOTE_V1");`}
      </pre>

      <h2>2. Compute anchorRef from real-world docs</h2>
      <p>Use hash of docs or records.</p>
      <pre>
{`// Pseudo
bytes32 anchorRef = keccak256(docBlob);`}
      </pre>

      <h2>3. Derive worldlineId</h2>
      <p>Typically hash of classId + anchorRef.</p>

      <h2>4. Emit WorldlineCreated with initialStateCid</h2>
      <pre>
{`// Solidity
registry.createWorldline(worldlineId, classId, anchorRef, initialStateCid);`}
      </pre>

      <h2>5. Emit WorldlineUpdated and WorldlineEntangled on lifecycle events</h2>
      <pre>
{`// On update
registry.updateWorldline(worldlineId, fieldMask, newStateCid);

// On entanglement
registry.entangleWorldlines(worldlineId_source, worldlineId_target, relType);`}
      </pre>

      <h2>TypeScript API Example</h2>
      <pre>
{`import { getWorldline } from '@worldline-protocol/client';

const worldline = await getWorldline('0x...');`}
      </pre>
    </div>
  );
}

export default IntegrationGuide;
