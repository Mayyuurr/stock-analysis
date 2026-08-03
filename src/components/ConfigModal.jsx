import React, { useState, useEffect } from 'react';

function ConfigModal({ isOpen, onClose, initialConfig, onSave }) {
  const [mode, setMode] = useState(initialConfig.mode || 'sim');
  const [apiKey, setApiKey] = useState(initialConfig.apiKey || '');

  useEffect(() => {
    if (isOpen) {
      setMode(initialConfig.mode || 'sim');
      setApiKey(initialConfig.apiKey || '');
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ mode, apiKey });
    onClose();
  };

  return (
    <div className="modal active" id="settings-modal">
      <div className="modal-content">
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
              Twelve Data Live
            </div>
          </div>
        </div>

        {mode === 'live' && (
          <div className="form-group" id="apikey-group">
            <label htmlFor="twelveDataKey">Twelve Data API Key</label>
            <input 
              type="password" 
              id="twelveDataKey" 
              className="calc-input" 
              placeholder="Enter your apikey here"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Get a free API key in 30 seconds from <a href="https://twelvedata.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand)' }}>twelvedata.com</a>.
            </span>
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
