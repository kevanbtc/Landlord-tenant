import React from 'react';
import demoWorldlines from '../mockData';

function Overview() {
  const totalWorldlines = demoWorldlines.length;
  const activePhases = demoWorldlines.reduce((acc, w) => {
    acc[w.currentPhase] = (acc[w.currentPhase] || 0) + 1;
    return acc;
  }, {});
  const topJurisdictions = demoWorldlines.flatMap(w => w.polarization.jurisdictions).reduce((acc, j) => {
    acc[j] = (acc[j] || 0) + 1;
    return acc;
  }, {});
  const topJurisdictionsArray = Object.entries(topJurisdictions).sort((a, b) => b[1] - a[1]);

  return (
    <div className="page">
      <h1>Worldline Overview</h1>
      <p>Inspect and trace digital twins of real-world assets—worldlines—with lifecycle and relationship visibility.</p>
      <button>Explore Worldlines</button>
      <button>Integration Guide</button>
      <div>
        <h2>Total Worldlines: {totalWorldlines}</h2>
        <h3>Active Phases</h3>
        <ul>
          {Object.entries(activePhases).map(([phase, count]) => (
            <li key={phase}>{phase}: {count}</li>
          ))}
        </ul>
        <h3>Top Jurisdictions</h3>
        <ul>
          {topJurisdictionsArray.map(([jurisdiction, count]) => (
            <li key={jurisdiction}>{jurisdiction}: {count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Overview;
