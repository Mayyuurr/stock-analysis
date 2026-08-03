import React, { useState, useEffect, useRef } from 'react';
import MarketMonitor from '../components/MarketMonitor';
import AverageCalculator from '../components/AverageCalculator';
import ConfigModal from '../components/ConfigModal';

const DEFAULT_MARKET_DATA = [
  { id: 1, name: "Gift Nifty", symbol: "NIFTY", current: 22340.50, prevClose: 22285.00, change: 55.50, percent: 0.25 },
  { id: 2, name: "Nasdaq 100", symbol: "IXIC", current: 17980.20, prevClose: 18090.75, change: -110.55, percent: -0.61 },
  { id: 3, name: "Hang Seng", symbol: "HSI", current: 17210.60, prevClose: 17045.00, change: 165.60, percent: 0.97 },
  { id: 4, name: "Nikkei 225", symbol: "N225", current: 38850.00, prevClose: 38620.00, change: 230.00, percent: 0.60 },
  { id: 5, name: "Kospi", symbol: "KS11", current: 2685.30, prevClose: 2704.50, change: -19.20, percent: -0.71 },
  { id: 6, name: "FTSE 100", symbol: "FTSE", current: 8215.10, prevClose: 8222.90, change: -7.80, percent: -0.09 },
  { id: 7, name: "Brent Crude Oil", symbol: "LCO/USD", current: 81.25, prevClose: 83.10, change: -1.85, percent: -2.23 },
  { id: 8, name: "Gold Spot", symbol: "XAU/USD", current: 2384.40, prevClose: 2372.10, change: 12.30, percent: 0.52 },
  { id: 9, name: "Silver Spot", symbol: "XAG/USD", current: 29.45, prevClose: 29.20, change: 0.25, percent: 0.86 }
];

const REFRESH_INTERVAL_SECONDS = 180;

function Dashboard() {
  const [activeTab, setActiveTab] = useState('market-monitor');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [config, setConfig] = useState({
    mode: localStorage.getItem('app_mode') || 'sim',
    apiKey: localStorage.getItem('twelvedata_apikey') || ''
  });
  
  const [marketData, setMarketData] = useState(() => {
    // Initial math alignment on first load
    return DEFAULT_MARKET_DATA.map(item => {
      const change = item.current - item.prevClose;
      const percent = (change / item.prevClose) * 100;
      return { ...item, change, percent };
    });
  });

  const [timeRemaining, setTimeRemaining] = useState(REFRESH_INTERVAL_SECONDS);
  const timerRef = useRef(null);

  // Stats KPIs
  const [kpis, setKpis] = useState({
    sentiment: 'Analyzing...',
    sentimentClass: 'neutral',
    sentimentDesc: 'Evaluating live movers',
    topGainer: null,
    topLoser: null
  });

  // Calculate KPIs on marketData changes
  useEffect(() => {
    let gainersCount = 0;
    let losersCount = 0;
    let topGainer = marketData[0];
    let topLoser = marketData[0];

    marketData.forEach(item => {
      if (item.change > 0) gainersCount++;
      if (item.change < 0) losersCount++;

      if (item.percent > topGainer.percent) topGainer = item;
      if (item.percent < topLoser.percent) topLoser = item;
    });

    let sentiment = 'Mixed';
    let sentimentClass = 'neutral';
    let sentimentDesc = 'Market indexes evenly split';

    if (gainersCount > losersCount) {
      sentiment = 'Bullish';
      sentimentClass = 'bullish';
      sentimentDesc = `${gainersCount} of ${marketData.length} trackers gaining`;
    } else if (losersCount > gainersCount) {
      sentiment = 'Bearish';
      sentimentClass = 'bearish';
      sentimentDesc = `${losersCount} of ${marketData.length} trackers losing`;
    }

    setKpis({
      sentiment,
      sentimentClass,
      sentimentDesc,
      topGainer,
      topLoser
    });
  }, [marketData]);

  // Refresh feed logic
  const refreshData = async (currentConfig = config) => {
    setTimeRemaining(REFRESH_INTERVAL_SECONDS);
    
    if (currentConfig.mode === 'live' && currentConfig.apiKey) {
      await fetchLiveData(currentConfig.apiKey);
    } else {
      runSimulationTick();
    }
  };

  const runSimulationTick = () => {
    setMarketData(prevData => 
      prevData.map(item => {
        const percentageChange = (Math.random() - 0.495) * 1.0; 
        const current = item.current * (1 + (percentageChange / 100));
        const change = current - item.prevClose;
        const percent = (change / item.prevClose) * 100;
        return { ...item, current, change, percent };
      })
    );
  };

  const fetchLiveData = async (apiKey) => {
    const symbolList = marketData.map(d => d.symbol).join(',');
    const url = `https://api.twelvedata.com/quote?symbol=${symbolList}&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const results = await response.json();
      
      if (results.status === 'error') {
        console.error("Twelve Data API Error:", results.message);
        alert("Twelve Data API error. Falling back to simulator. " + results.message);
        runSimulationTick();
        return;
      }

      setMarketData(prevData =>
        prevData.map(item => {
          const apiData = results[item.symbol];
          if (apiData) {
            const current = parseFloat(apiData.close || apiData.price);
            const change = parseFloat(apiData.change);
            const percent = parseFloat(apiData.percent_change);
            const prevClose = parseFloat(apiData.previous_close);
            return { ...item, current, change, percent, prevClose };
          }
          return item;
        })
      );
    } catch (err) {
      console.error("Failed to connect to API:", err);
      runSimulationTick();
    }
  };

  // Timer hook
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          refreshData();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [config]);

  // Handle configuration updates
  const handleSaveConfig = (newConfig) => {
    localStorage.setItem('app_mode', newConfig.mode);
    localStorage.setItem('twelvedata_apikey', newConfig.apiKey);
    setConfig(newConfig);
    refreshData(newConfig);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header>
        <div className="brand">
          <h1>StratBoonCo</h1>
          <span className="badge">Intelligence Hub</span>
        </div>
        
        <div className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'market-monitor' ? 'active' : ''}`} 
            onClick={() => setActiveTab('market-monitor')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
            Market Monitor
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stock-calculator' ? 'active' : ''}`} 
            onClick={() => setActiveTab('stock-calculator')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM9 9h6M9 13h6M9 17h6" />
            </svg>
            Average Calculator
          </button>
        </div>

        <button className="btn btn-outline" onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Config
        </button>
      </header>

      {/* Market Stats KPIs */}
      <div className="market-stats-row">
        <div className={`stat-card ${kpis.sentimentClass}`}>
          <span className="label">Market Sentiment</span>
          <span className="value" style={{ 
            color: kpis.sentimentClass === 'bullish' ? 'var(--color-up)' : 
                   kpis.sentimentClass === 'bearish' ? 'var(--color-down)' : 'var(--text-secondary)'
          }}>
            {kpis.sentiment}
          </span>
          <span className="desc">{kpis.sentimentDesc}</span>
        </div>
        
        <div className="stat-card bullish">
          <span class="label">Top Gainer</span>
          <span class="value" style={{ color: 'var(--color-up)' }}>
            {kpis.topGainer ? kpis.topGainer.name : '--'}
          </span>
          <span class="desc">
            {kpis.topGainer ? `Up +${kpis.topGainer.percent.toFixed(2)}% today` : 'Calculating top trend'}
          </span>
        </div>

        <div className="stat-card bearish">
          <span class="label">Top Loser</span>
          <span class="value" style={{ color: 'var(--color-down)' }}>
            {kpis.topLoser ? kpis.topLoser.name : '--'}
          </span>
          <span class="desc">
            {kpis.topLoser ? `Down ${kpis.topLoser.percent.toFixed(2)}% today` : 'Calculating bottom trend'}
          </span>
        </div>
      </div>

      {/* Main Workspace Container */}
      <main className="workspace">
        {activeTab === 'market-monitor' ? (
          <MarketMonitor 
            marketData={marketData}
            timeRemaining={timeRemaining}
            refreshInterval={REFRESH_INTERVAL_SECONDS}
            onManualRefresh={() => refreshData()}
            configMode={config.mode}
          />
        ) : (
          <AverageCalculator />
        )}
      </main>

      <footer>
        <p>&copy; 2026 StratBoonCo Market Intelligence. Data feeds are compliant with international standard calculations.</p>
      </footer>

      {/* Configurations Modal */}
      <ConfigModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialConfig={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}

export default Dashboard;
