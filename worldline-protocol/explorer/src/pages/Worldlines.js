import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import demoWorldlines from '../mockData';

function Worldlines() {
  const [filters, setFilters] = useState({ classId: '', phase: '', jurisdiction: '' });

  const filteredWorldlines = useMemo(() => {
    return demoWorldlines.filter(w => {
      return (
        (filters.classId === '' || w.classId.includes(filters.classId)) &&
        (filters.phase === '' || w.currentPhase.includes(filters.phase)) &&
        (filters.jurisdiction === '' || w.polarization.jurisdictions.some(j => j.includes(filters.jurisdiction)))
      );
    });
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="page">
      <h1>Worldlines</h1>
      <div>
        <input name="classId" placeholder="Class ID" onChange={handleFilterChange} />
        <input name="phase" placeholder="Phase" onChange={handleFilterChange} />
        <input name="jurisdiction" placeholder="Jurisdiction" onChange={handleFilterChange} />
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Class</th>
            <th>Jurisdiction(s)</th>
            <th>Phase</th>
            <th>Yield</th>
            <th>Entanglements</th>
          </tr>
        </thead>
        <tbody>
          {filteredWorldlines.map(worldline => (
            <tr key={worldline.worldlineId}>
              <td><Link to={`/worldlines/${worldline.worldlineId}`}>{worldline.worldlineId}</Link></td>
              <td>{worldline.classId}</td>
              <td>{worldline.polarization.jurisdictions.join(', ')}</td>
              <td>{worldline.currentPhase}</td>
              <td>{worldline.frequency.yieldBps} bps</td>
              <td>{worldline.entanglements.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Worldlines;
