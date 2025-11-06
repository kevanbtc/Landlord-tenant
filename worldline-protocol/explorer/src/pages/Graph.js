import React, { useState } from 'react';
import demoWorldlines from '../mockData';

function Graph() {
  const [centerId, setCenterId] = useState('WL_VAULT_GOLD_42');

  const buildGraphForWorldline = (centerId) => {
    const nodes = [];
    const links = [];
    const byId = new Map(demoWorldlines.map(w => [w.worldlineId, w]));
    const center = byId.get(centerId);
    if (!center) return { nodes, links };

    nodes.push({
      id: center.worldlineId,
      label: center.worldlineId,
      classId: center.classId,
      phase: center.currentPhase
    });

    for (const ent of center.entanglements) {
      const target = byId.get(ent.targetWorldline);
      if (!target) continue;
      nodes.push({
        id: target.worldlineId,
        label: target.worldlineId,
        classId: target.classId,
        phase: target.currentPhase
      });
      links.push({
        source: center.worldlineId,
        target: target.worldlineId,
        relType: ent.relType
      });
    }

    for (const w of demoWorldlines) {
      for (const ent of w.entanglements) {
        if (ent.targetWorldline === centerId && w.worldlineId !== centerId) {
          nodes.push({
            id: w.worldlineId,
            label: w.worldlineId,
            classId: w.classId,
            phase: w.currentPhase
          });
          links.push({
            source: w.worldlineId,
            target: centerId,
            relType: ent.relType
          });
        }
      }
    }

    return { nodes, links };
  };

  const { nodes, links } = buildGraphForWorldline(centerId);

  return (
    <div className="page">
      <h1>Worldline Graph</h1>
      <select value={centerId} onChange={(e) => setCenterId(e.target.value)}>
        {demoWorldlines.map(w => (
          <option key={w.worldlineId} value={w.worldlineId}>{w.worldlineId}</option>
        ))}
      </select>
      <div className="entanglement-graph">
        <div style={{ position: 'relative', width: '100%', height: '400px' }}>
          {nodes.map(node => (
            <div key={node.id} style={{
              position: 'absolute',
              left: node.id === centerId ? '50%' : Math.random() * 80 + '%',
              top: node.id === centerId ? '50%' : Math.random() * 80 + '%',
              transform: 'translate(-50%, -50%)',
              padding: '10px',
              border: '1px solid #ccc',
              backgroundColor: node.phase === 'IN_DEFAULT' ? 'red' : 'lightblue',
              borderRadius: '5px'
            }}>
              {node.label}
            </div>
          ))}
          {links.map((link, idx) => (
            <div key={idx} style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '2px',
              height: '50px',
              backgroundColor: 'black',
              transform: `rotate(${Math.random() * 360}deg)`
            }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Graph;
