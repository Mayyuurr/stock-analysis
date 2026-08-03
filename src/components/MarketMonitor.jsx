import React from 'react';

const TV_SYMBOL_MAP = {
  "NIFTY": "NSE:NIFTY",
  "IXIC": "NASDAQ:IXIC",
  "HSI": "HSI:HSI",
  "N225": "OANDA:JP225",
  "KS11": "KRX:KOSPI",
  "FTSE": "INDEX:UKX",
  "LCO/USD": "TVC:UKOIL",
  "XAU/USD": "TVC:GOLD",
  "XAG/USD": "TVC:SILVER"
};

function MarketMonitor({ marketData, timeRemaining, refreshInterval, onManualRefresh, configMode }) {
  
  const handleRowClick = (name, symbol) => {
    const tvSymbol = TV_SYMBOL_MAP[symbol] || symbol;
    const url = `/chart/${encodeURIComponent(tvSymbol)}/${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  const getTimerOffset = () => {
    const dashArrayMax = 63; // 2 * PI * r (r=10)
    const percentageRemaining = timeRemaining / refreshInterval;
    return dashArrayMax * (1 - percentageRemaining);
  };

  return (
    <section id="market-monitor" className="view-section active">
      <div className="action-bar">
        <h2 className="section-title">
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            marginRight: '8px',
            boxShadow: '0 0 8px #10b981'
          }}></span>
          Global Indexes & Commodities
        </h2>
        
        <div className="controls">
          <span className={configMode === 'live' ? 'badge-up' : 'badge-neutral'} style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            background: configMode === 'live' ? 'rgba(99, 102, 241, 0.15)' : '',
            color: configMode === 'live' ? '#818cf8' : ''
          }}>
            {configMode === 'live' ? 'Live API Feed' : 'Simulated Feed'}
          </span>
          
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Last updated: <strong id="lastUpdated" style={{ color: 'var(--text-primary)' }}>
              {new Date().toLocaleTimeString()}
            </strong>
          </span>
          
          <div className="timer-circle" title="Auto-refresh countdown">
            <svg className="timer-svg">
              <circle className="timer-bg" cx="12" cy="12" r="10" />
              <circle 
                className="timer-progress" 
                cx="12" 
                cy="12" 
                r="10" 
                style={{ strokeDashoffset: getTimerOffset() }}
              />
            </svg>
          </div>
          
          <button className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={onManualRefresh} title="Force Refresh">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l.57.81" />
            </svg>
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table aria-label="Live Indices and Commodities Table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '8%' }}>SNo</th>
              <th scope="col" style={{ width: '25%' }}>Market / Asset</th>
              <th scope="col" style={{ width: '22%', textAlign: 'right' }}>Current Value</th>
              <th scope="col" style={{ width: '20%', textAlign: 'right' }}>Change</th>
              <th scope="col" style={{ width: '25%', textAlign: 'right' }}>Change %</th>
            </tr>
          </thead>
          <tbody>
            {marketData.map((item, index) => {
              const isUp = item.change > 0;
              const isDown = item.change < 0;
              let badgeClass = "badge-neutral";
              let prefix = "";

              if (isUp) {
                badgeClass = "badge-up";
                prefix = "+";
              } else if (isDown) {
                badgeClass = "badge-down";
              }

              const valDigits = item.current < 100 ? 4 : 2;
              const formattedValue = item.current.toLocaleString('en-US', { 
                minimumFractionDigits: valDigits, 
                maximumFractionDigits: valDigits 
              });
              const formattedChange = `${prefix}${item.change.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`;
              const formattedPercent = `${prefix}${item.percent.toFixed(2)}%`;

              return (
                <tr key={item.id} onClick={() => handleRowClick(item.name, item.symbol)}>
                  <td><strong>{index + 1}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {item.symbol}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'Outfit', fontSize: '15px' }}>
                    {formattedValue}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={badgeClass}>{formattedChange}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={badgeClass}>{formattedPercent}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default MarketMonitor;
