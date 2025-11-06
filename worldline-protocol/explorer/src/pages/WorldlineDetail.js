import React from 'react';
import { useParams } from 'react-router-dom';
import demoWorldlines from '../mockData';

function WorldlineDetail() {
  const { id } = useParams();
  const worldline = demoWorldlines.find(w => w.worldlineId === id);

  if (!worldline) return <div>Loading...</div>;

  return (
    <div className="page">
      <h1>Worldline {id}</h1>
      <div>
        <h2>Details</h2>
        <p>Worldline ID: {worldline.worldlineId}</p>
        <p>Class: {worldline.classId}</p>
        <p>Anchor Ref: {worldline.anchorRef}</p>
        <h3>Frequency</h3>
        <p>Yield: {worldline.frequency.yieldBps} bps</p>
        <p>Cashflow Cadence: {worldline.frequency.cashflowCadence}</p>
        <p>Volatility Band: {worldline.frequency.volatilityBand}</p>
        <h3>Polarization</h3>
        <p>Jurisdictions: {worldline.polarization.jurisdictions.join(', ')}</p>
        <p>Regimes: {worldline.polarization.regimes.join(', ')}</p>
        <p>Ethics Tags: {worldline.polarization.ethicsTags.join(', ')}</p>
        <h3>Phase</h3>
        <p>Current Phase: {worldline.currentPhase}</p>
        <p>Since: {worldline.phaseHistory[worldline.phaseHistory.length - 1]?.since}</p>
      </div>
      <div>
        <h2>Phase Timeline</h2>
        <div className="phase-timeline">
          {worldline.phaseHistory.map((event, index) => (
            <div key={index} className="phase-point" title={`${event.state} at ${event.since}`}></div>
          ))}
        </div>
      </div>
      <div>
        <h2>Entanglements</h2>
        <ul>
          {worldline.entanglements.map(ent => (
            <li key={ent.targetWorldline}>{ent.relType} → {ent.targetWorldline}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Raw JSON</h2>
        <pre>{JSON.stringify(worldline, null, 2)}</pre>
      </div>
    </div>
  );
}

export default WorldlineDetail;
