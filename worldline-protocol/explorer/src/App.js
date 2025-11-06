import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Worldlines from './pages/Worldlines';
import WorldlineDetail from './pages/WorldlineDetail';
import Graph from './pages/Graph';
import IntegrationGuide from './pages/IntegrationGuide';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Header />
          <div className="content">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/worldlines" element={<Worldlines />} />
              <Route path="/worldlines/:id" element={<WorldlineDetail />} />
              <Route path="/graph" element={<Graph />} />
              <Route path="/integration-guide" element={<IntegrationGuide />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
