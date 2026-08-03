import React, { useState, useEffect } from 'react';

function PercentageCalculator() {
  // Case 1 State: X% of Value
  const [val1, setVal1] = useState('');
  const [pct1, setPct1] = useState('7');
  const [res1, setRes1] = useState(0);

  // Case 2 State: Profit/Loss of 2 numbers
  const [buyVal, setBuyVal] = useState('');
  const [sellVal, setSellVal] = useState('');
  const [resAmt, setResAmt] = useState(0);
  const [resPct, setResPct] = useState(0);

  // Case 3 State: +/- percentage of LTP
  const [ltpVal, setLtpVal] = useState('');
  const [offsetPct, setOffsetPct] = useState('4');
  const [upperVal, setUpperVal] = useState(0);
  const [lowerVal, setLowerVal] = useState(0);

  // Calculate Case 1
  useEffect(() => {
    const v = parseFloat(val1) || 0;
    const p = parseFloat(pct1) || 0;
    setRes1((v * p) / 100);
  }, [val1, pct1]);

  // Calculate Case 2
  useEffect(() => {
    const buy = parseFloat(buyVal) || 0;
    const sell = parseFloat(sellVal) || 0;
    if (buy > 0) {
      const diff = sell - buy;
      setResAmt(diff);
      setResPct((diff / buy) * 100);
    } else {
      setResAmt(0);
      setResPct(0);
    }
  }, [buyVal, sellVal]);

  // Calculate Case 3
  useEffect(() => {
    const ltp = parseFloat(ltpVal) || 0;
    const offset = parseFloat(offsetPct) || 0;
    setUpperVal(ltp * (1 + offset / 100));
    setLowerVal(ltp * (1 - offset / 100));
  }, [ltpVal, offsetPct]);

  const formatCurrency = (val) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <section id="percentage-calculator" className="view-section active">
      <div className="action-bar">
        <h2 className="section-title">Interactive Percentage Utility Tool</h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginTop: '10px'
      }}>
        
        {/* Card 1: X% of Value */}
        <div className="summary-panel" style={{ background: 'var(--bg-card)' }}>
          <h3 className="summary-title" style={{ color: '#818cf8' }}>1. Find Percentage of Value</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div className="form-group">
              <label>Base Number</label>
              <input 
                type="number" 
                className="calc-input" 
                placeholder="e.g. 5000" 
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Percentage (%)</label>
              <input 
                type="number" 
                className="calc-input" 
                placeholder="e.g. 7" 
                value={pct1}
                onChange={(e) => setPct1(e.target.value)}
              />
            </div>
            
            {/* Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['5', '7', '8', '10', '12', '15'].map(p => (
                <button 
                  key={p} 
                  className={`btn btn-outline ${pct1 === p ? 'active' : ''}`}
                  style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px' }}
                  onClick={() => setPct1(p)}
                >
                  {p}%
                </button>
              ))}
            </div>

            <div style={{ 
              marginTop: '10px', 
              borderTop: '1px solid var(--border-primary)', 
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span className="lbl">Calculated Value:</span>
              <span className="val" style={{ fontSize: '20px', fontFamily: 'Outfit', color: 'var(--color-brand)', fontWeight: 700 }}>
                {formatCurrency(res1)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Return Gained/Lost */}
        <div className="summary-panel" style={{ background: 'var(--bg-card)' }}>
          <h3 className="summary-title" style={{ color: '#818cf8' }}>2. Profit / Loss % Gain</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div className="form-group">
              <label>Buy / Original Price</label>
              <input 
                type="number" 
                className="calc-input" 
                placeholder="e.g. 150.00" 
                value={buyVal}
                onChange={(e) => setBuyVal(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Sell / Current Price</label>
              <input 
                type="number" 
                className="calc-input" 
                placeholder="e.g. 162.00" 
                value={sellVal}
                onChange={(e) => setSellVal(e.target.value)}
              />
            </div>

            <div style={{ 
              marginTop: '10px', 
              borderTop: '1px solid var(--border-primary)', 
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div className="summary-item">
                <span className="lbl">Net Return:</span>
                <span className="val" style={{ 
                  color: resAmt >= 0 ? 'var(--color-up)' : 'var(--color-down)', 
                  fontWeight: 700 
                }}>
                  {resAmt >= 0 ? '+' : ''}{formatCurrency(resAmt)}
                </span>
              </div>
              <div className="summary-item">
                <span className="lbl">Gained / Lost %:</span>
                <span className="val" style={{ 
                  color: resPct >= 0 ? 'var(--color-up)' : 'var(--color-down)', 
                  fontWeight: 700 
                }}>
                  {resPct >= 0 ? '+' : ''}{resPct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: LTP Thresholds */}
        <div className="summary-panel" style={{ background: 'var(--bg-card)' }}>
          <h3 className="summary-title" style={{ color: '#818cf8' }}>3. LTP Target Ranges</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div className="form-group">
              <label>Last Traded Price (LTP)</label>
              <input 
                type="number" 
                className="calc-input" 
                placeholder="e.g. 248.50" 
                value={ltpVal}
                onChange={(e) => setLtpVal(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Offset Range (%)</label>
              <input 
                type="number" 
                className="calc-input" 
                placeholder="e.g. 4" 
                value={offsetPct}
                onChange={(e) => setOffsetPct(e.target.value)}
              />
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['1', '2', '3', '4', '5', '10'].map(p => (
                <button 
                  key={p} 
                  className={`btn btn-outline ${offsetPct === p ? 'active' : ''}`}
                  style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px' }}
                  onClick={() => setOffsetPct(p)}
                >
                  ±{p}%
                </button>
              ))}
            </div>

            <div style={{ 
              marginTop: '10px', 
              borderTop: '1px solid var(--border-primary)', 
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div className="summary-item">
                <span className="lbl">Upper Level (+{offsetPct}%):</span>
                <span className="val" style={{ color: 'var(--color-up)', fontWeight: 600 }}>
                  {formatCurrency(upperVal)}
                </span>
              </div>
              <div className="summary-item">
                <span className="lbl">Lower Level (-{offsetPct}%):</span>
                <span className="val" style={{ color: 'var(--color-down)', fontWeight: 600 }}>
                  {formatCurrency(lowerVal)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default PercentageCalculator;
