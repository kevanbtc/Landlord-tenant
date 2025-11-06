import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Worldline Explorer</h2>
      <nav>
        <ul>
          <li><Link to="/">Overview</Link></li>
          <li><Link to="/worldlines">Worldlines</Link></li>
          <li><Link to="/graph">Graph</Link></li>
          <li><Link to="/integration-guide">Integration Guide</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
