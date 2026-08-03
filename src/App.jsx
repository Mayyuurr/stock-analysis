import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ChartPage from './pages/ChartPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chart/:symbol/:name" element={<ChartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
