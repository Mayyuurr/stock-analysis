import React, { useState, useEffect } from 'react';

function ConfigModal({ isOpen, onClose, initialConfig, onSave }) {
  const [mode, setMode] = useState(initialConfig.mode || 'sim');
  const [twelveDataKey, setTwelveDataKey] = useState(initialConfig.twelveDataKey || '');
  const [finnhubKey, setFinnhubKey] = useState(initialConfig.finnhubKey || '');
  const [alphaVantageKey, setAlphaVantageKey] = useState(initialConfig.alphaVantageKey || '');

  useEffect(() => {
    if (isOpen) {
      setMode(initialConfig.mode || 'sim');
      setTwelveDataKey(initialConfig.twelveDataKey || '');
      setFinnhubKey(initialConfig.finnhubKey || '');
      setAlphaVantageKey(initialConfig.alphaVantageKey || '');
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ 
      mode, 
      twelveDataKey,
      finnhubKey,
      alphaVantageKey
    });
    onClose();
  };

  return (
    <div className="modal active" id="settings-modal">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3>System Configuration</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="form-group">
          <label>Data Feed Source</label>
          <div className="toggle-container">
            <div 
              className={`toggle-option ${mode === 'sim' ? 'active' : ''}`} 
              onClick={() => setMode('sim')}
            >
              Simulation
            </div>
            <div 
              className={`toggle-option ${mode === 'live' ? 'active' : ''}`} 
              onClick={() => setMode('live')}
            >
              Live Multi-API
            </div>
          </div>
        </div>

        {mode === 'live' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            <div className="form-group">
              <label htmlFor="twelveDataKey">Twelve Data API Key</label>
              <input 
                type="password" 
                id="twelveDataKey" 
                className="calc-input" 
                placeholder="Twelve Data API Key"
                value={twelveDataKey}
                onChange={(e) => setTwelveDataKey(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Free key from <a href="https://twelvedata.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand)' }}>twelvedata.com</a>.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="finnhubKey">Finnhub API Key</label>
              <input 
                type="password" 
                id="finnhubKey" 
                className="calc-input" 
                placeholder="Finnhub API Token"
                value={finnhubKey}
                onChange={(e) => setFinnhubKey(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Free key from <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand)' }}>finnhub.io</a>.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="alphaVantageKey">Alpha Vantage API Key</label>
              <input 
                type="password" 
                id="alphaVantageKey" 
                className="calc-input" 
                placeholder="Alpha Vantage API Key"
                value={alphaVantageKey}
                onChange={(e) => setAlphaVantageKey(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Free key from <a href="https://www.alphavantage.co" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand)' }}>alphavantage.co</a>.
              </span>
            </div>
          </div>
        )}

        <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={handleSave}>
          Apply Configurations
        </button>
      </div>
    </div>
  );
}

export default ConfigModal;
