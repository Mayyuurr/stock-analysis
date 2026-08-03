import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ChartPage() {
  const { symbol, name } = useParams();
  const decodedSymbol = decodeURIComponent(symbol);
  const decodedName = decodeURIComponent(name);

  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId);

    const initializeWidget = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          "width": "100%",
          "height": "100%",
          "symbol": decodedSymbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "container_id": "tv-chart-container"
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.onload = initializeWidget;
      document.head.appendChild(script);
    } else {
      // If script is already there, initialize directly or wait if not loaded yet
      if (window.TradingView) {
        initializeWidget();
      } else {
        script.addEventListener('load', initializeWidget);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initializeWidget);
      }
    };
  }, [decodedSymbol]);

  // Mini styles for full-screen layout
  const headerStyle = {
    background: 'rgba(30, 41, 59, 0.8)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
    zIndex: 10,
    boxSizing: 'border-box'
  };

  const bodyStyle = {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  return (
    <div style={bodyStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '18px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.3px'
          }}>
            StratBoonCo
          </span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '16px',
            fontWeight: 600,
            color: '#f8fafc'
          }}>
            {decodedName} ({decodedSymbol.split(':').pop()})
          </h1>
        </div>
        <span style={{
          fontSize: '12px',
          color: '#94a3b8',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '4px 10px',
          borderRadius: '6px',
          background: 'rgba(15,23,42,0.4)'
        }}>
          Tab view
        </span>
      </header>

      <div style={{ flex: 1, position: 'relative', background: '#0f172a' }}>
        <div id="tv-chart-container" style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
}

export default ChartPage;
