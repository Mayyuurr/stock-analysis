import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StockSearch() {
  const [symbol, setSymbol] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      navigate(`/stock/${encodeURIComponent(symbol.trim().toUpperCase())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input 
        type="text" 
        className="calc-input" 
        placeholder="Search Symbol (e.g. AAPL)" 
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        style={{ width: '200px', padding: '6px 12px' }}
      />
      <button 
        type="submit" 
        className="btn" 
        style={{ padding: '8px 12px', fontSize: '13px', boxShadow: 'none' }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}

export default StockSearch;
