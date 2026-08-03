import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import StockSearch from '../components/StockSearch';
import { fetchStockQuote } from '../utils/apiRotator';

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

function StockDetail() {
  const { symbol } = useParams();
  const decodedSymbol = decodeURIComponent(symbol);
  
  const [stats, setStats] = useState({
    price: NaN,
    change: NaN,
    percent: NaN,
    open: NaN,
    high: NaN,
    low: NaN,
    prevClose: NaN,
    high52: NaN,
    low52: NaN,
    provider: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState('');
  const chartInitRef = useRef(false);

  // Initialize keys from localStorage
  const keys = {
    twelveData: localStorage.getItem('twelvedata_apikey') || '',
    finnhub: localStorage.getItem('twelvedata_apikey_finnhub') || '', // keys saved under standard local namespaces
    alphaVantage: localStorage.getItem('twelvedata_apikey_alphavantage') || ''
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorNotice('');

    const loadData = async () => {
      try {
        const quote = await fetchStockQuote(decodedSymbol, keys);
        if (!active) return;
        
        if (quote) {
          setStats(quote);
        } else {
          // If all APIs failed and we have no credentials, display NaN strictly as requested
          setStats({
            price: NaN,
            change: NaN,
            percent: NaN,
            open: NaN,
            high: NaN,
            low: NaN,
            prevClose: NaN,
            high52: NaN,
            low52: NaN,
            provider: 'None (Simulation Inactive for detail page)'
          });
          setErrorNotice('API keys rate-limited or missing. Detailed metrics returned NaN.');
        }
      } catch (err) {
        if (!active) return;
        setErrorNotice('Error fetching live metrics.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [decodedSymbol]);

  // Load TradingView script & mount widget
  useEffect(() => {
    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId);

    const initializeWidgets = () => {
      if (window.TradingView) {
        // 1. Mount Main Advanced Chart Widget
        new window.TradingView.widget({
          "width": "100%",
          "height": 450,
          "symbol": decodedSymbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": false,
          "container_id": "main-tv-chart"
        });

        // 2. Mount Related Market Sidebar Watchlist Widget
        new window.TradingView.MediumWidget({
          "symbols": [
            ["Dow Jones", "DJI|1d"],
            ["S&P 500", "SPX|1d"],
            ["Nasdaq Composite", "IXIC|1d"],
            ["Russell 2000", "RUT|1d"]
          ],
          "chartOnly": false,
          "width": "100%",
          "height": 380,
          "locale": "en",
          "colorTheme": "dark",
          "gridLineColor": "rgba(255, 255, 255, 0.06)",
          "trendLineColor": "rgba(99, 102, 241, 0.5)",
          "fontColor": "#94a3b8",
          "underLineColor": "rgba(99, 102, 241, 0.15)",
          "container_id": "sidebar-watchlist-widget"
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.onload = initializeWidgets;
      document.head.appendChild(script);
    } else {
      if (window.TradingView) {
        initializeWidgets();
      } else {
        script.addEventListener('load', initializeWidgets);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initializeWidgets);
      }
    };
  }, [decodedSymbol]);

  const formatCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return 'NaN';
    return val.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatStat = (val, isCurrency = true) => {
    if (isNaN(val) || val === null || val === undefined) return 'NaN';
    return isCurrency ? formatCurrency(val) : `${val.toFixed(2)}%`;
  };

  const isUp = stats.change > 0;
  const isDown = stats.change < 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '24px' }}>
      
      {/* Header Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '20px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            StratBoonCo
          </span>
        </div>
        <StockSearch />
      </header>

      {/* Main Google Finance View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        gap: '24px'
      }}>
        
        {/* Left Side: Stock Details, Chart, Key Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Stock Metadata & Live Price Details */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            padding: '24px',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: '800' }}>
                  {decodedSymbol.split(':').pop()}
                </h1>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>
                  Market Code: {decodedSymbol}
                </span>
              </div>
              {stats.provider && (
                <span className="badge-neutral" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                  Feed: {stats.provider}
                </span>
              )}
            </div>

            {/* Price values */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '42px', fontFamily: 'Outfit', fontWeight: '700' }}>
                {formatStat(stats.price)}
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: isUp ? 'var(--color-up)' : isDown ? 'var(--color-down)' : 'var(--text-secondary)',
                background: isUp ? 'var(--color-up-bg)' : isDown ? 'var(--color-down-bg)' : 'rgba(255,255,255,0.05)',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                {isUp ? '▲' : isDown ? '▼' : ''} {formatStat(stats.change)} ({formatStat(stats.percent, false)})
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Today
              </span>
            </div>

            {errorNotice && (
              <div style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>
                ⚠️ {errorNotice}
              </div>
            )}
          </div>

          {/* Interactive Chart */}
          <div className="table-wrapper" style={{ padding: '4px', overflow: 'hidden' }}>
            <div id="main-tv-chart" style={{ width: '100%', height: '450px', borderRadius: '8px', overflow: 'hidden' }}></div>
          </div>

          {/* Key Statistics Grid */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            padding: '24px',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid var(--border-primary)', paddingBottom: '10px' }}>
              Key statistics
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div className="summary-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span className="lbl">Open</span>
                <span className="val">{formatStat(stats.open)}</span>
              </div>
              <div className="summary-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span className="lbl">Day High</span>
                <span className="val">{formatStat(stats.high)}</span>
              </div>
              <div className="summary-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span className="lbl">Day Low</span>
                <span className="val">{formatStat(stats.low)}</span>
              </div>
              <div className="summary-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span className="lbl">Previous Close</span>
                <span className="val">{formatStat(stats.prevClose)}</span>
              </div>
              <div className="summary-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span className="lbl">52-wk High</span>
                <span className="val">{formatStat(stats.high52)}</span>
              </div>
              <div className="summary-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span className="lbl">52-wk Low</span>
                <span className="val">{formatStat(stats.low52)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Related Markets Watchlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            padding: '20px',
            backdropFilter: 'blur(16px)'
          }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              Related markets
            </h3>
            
            {/* TradingView Widget List */}
            <div id="sidebar-watchlist-widget"></div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default StockDetail;
