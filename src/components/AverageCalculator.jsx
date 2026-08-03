import React, { useState, useEffect } from 'react';

function AverageCalculator() {
  const [rows, setRows] = useState([
    { id: '1', qty: 100, price: 150.25 },
    { id: '2', qty: 50, price: 142.10 }
  ]);
  const [profitPercent, setProfitPercent] = useState(10.0);
  const [currentLivePrice, setCurrentLivePrice] = useState('');
  
  const [summary, setSummary] = useState({
    totalQty: 0,
    totalInvestment: 0,
    avgPrice: 0,
    targetSalePrice: 0,
    expectedProfit: 0,
    netPL: null,
    plPercent: 0
  });

  useEffect(() => {
    let totalQty = 0;
    let totalInvestment = 0;

    rows.forEach(row => {
      const qty = parseFloat(row.qty) || 0;
      const price = parseFloat(row.price) || 0;
      totalQty += qty;
      totalInvestment += (qty * price);
    });

    const avgPrice = totalQty > 0 ? (totalInvestment / totalQty) : 0;
    const targetSalePrice = avgPrice * (1 + (parseFloat(profitPercent || 0) / 100));
    const expectedProfit = totalInvestment * (parseFloat(profitPercent || 0) / 100);

    let netPL = null;
    let plPercent = 0;
    const livePriceNum = parseFloat(currentLivePrice);
    if (!isNaN(livePriceNum) && livePriceNum > 0 && totalQty > 0) {
      const currentHoldingsValue = totalQty * livePriceNum;
      netPL = currentHoldingsValue - totalInvestment;
      plPercent = totalInvestment > 0 ? (netPL / totalInvestment) * 100 : 0;
    }

    setSummary({
      totalQty,
      totalInvestment,
      avgPrice,
      targetSalePrice,
      expectedProfit,
      netPL,
      plPercent
    });
  }, [rows, profitPercent, currentLivePrice]);

  const addRow = () => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setRows([...rows, { id, qty: '', price: '' }]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) {
      alert("Please retain at least one purchase row.");
      return;
    }
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value === '' ? '' : (parseFloat(value) || 0) };
      }
      return r;
    }));
  };

  const formatCurrency = (val) => {
    return val.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const exportCSV = () => {
    if (rows.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Entry #,Quantity,Buy Price,Line Total\n";

    rows.forEach((row, index) => {
      const qty = parseFloat(row.qty) || 0;
      const price = parseFloat(row.price) || 0;
      const lineTotal = (qty * price).toFixed(2);
      csvContent += `${index + 1},${qty},${price},${lineTotal}\n`;
    });

    csvContent += `\nTotal Quantity,${summary.totalQty},,\n`;
    csvContent += `Total Outlay,,${summary.totalInvestment.toFixed(2)},\n`;
    csvContent += `Average Buy Price,,${summary.avgPrice.toFixed(2)},\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stratboonco_portfolio_averages.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="stock-calculator" className="view-section active">
      <div className="action-bar">
        <h2 className="section-title">Reactive Portfolio Average Calculator</h2>
        <div className="controls">
          <button className="btn btn-outline" onClick={exportCSV}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button className="btn" onClick={addRow}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Purchase Row
          </button>
        </div>
      </div>

      <div className="calculator-grid">
        {/* Left: Dynamic inputs spreadsheet */}
        <div className="table-wrapper" style={{ background: 'transparent', border: 'none' }}>
          <table style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '12px', overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Entry</th>
                <th style={{ width: '40%' }}>Quantity</th>
                <th style={{ width: '40%' }}>Buy Price ($ / ₹)</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td><strong>#{index + 1}</strong></td>
                  <td>
                    <input 
                      type="number" 
                      className="calc-input" 
                      min="0.01" 
                      step="any" 
                      placeholder="e.g. 50" 
                      value={row.qty} 
                      onChange={(e) => updateRow(row.id, 'qty', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="calc-input" 
                      min="0.01" 
                      step="any" 
                      placeholder="e.g. 150.00" 
                      value={row.price} 
                      onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn btn-outline btn-danger" 
                      style={{ padding: '6px 10px' }} 
                      onClick={() => removeRow(row.id)}
                      title="Delete Row"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Results summary cards */}
        <div className="summary-panel">
          <h3 className="summary-title">Calculation Summary</h3>
          
          <div className="summary-item">
            <span className="lbl">Total Units:</span>
            <span className="val">{summary.totalQty.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
          </div>

          <div className="summary-item">
            <span className="lbl">Total Outlay:</span>
            <span className="val">{formatCurrency(summary.totalInvestment)}</span>
          </div>

          <div className="summary-item total-highlight">
            <span className="lbl">Average Buy Price:</span>
            <span class="val">{formatCurrency(summary.avgPrice)}</span>
          </div>

          <div style={{ margin: '8px 0', borderTop: '1px solid var(--border-primary)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label htmlFor="calcProfitPercent">Desired Profit (%)</label>
              <input 
                type="number" 
                id="calcProfitPercent" 
                className="calc-input" 
                step="0.1" 
                value={profitPercent} 
                onChange={(e) => setProfitPercent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="calcCurrentMarketPrice">Current Live Price (Optional)</label>
              <input 
                type="number" 
                id="calcCurrentMarketPrice" 
                className="calc-input" 
                step="0.01" 
                placeholder="Enter live price to compare" 
                value={currentLivePrice}
                onChange={(e) => setCurrentLivePrice(e.target.value)}
              />
            </div>
          </div>

          <div className="summary-item">
            <span className="lbl">Target Sell Price:</span>
            <span className="val" style={{ color: 'var(--color-up)', fontWeight: 700 }}>
              {formatCurrency(summary.targetSalePrice)}
            </span>
          </div>

          <div className="summary-item">
            <span className="lbl">Net Target Profit:</span>
            <span className="val">{formatCurrency(summary.expectedProfit)}</span>
          </div>

          {summary.netPL !== null && (
            <div className="summary-item" style={{ borderTop: '1px dashed var(--border-primary)', paddingTop: '10px', marginTop: '5px' }}>
              <span className="lbl">Current Gain/Loss:</span>
              <span className="val" style={{ color: summary.netPL >= 0 ? 'var(--color-up)' : 'var(--color-down)', fontWeight: 600 }}>
                {formatCurrency(summary.netPL)} ({summary.netPL >= 0 ? '+' : ''}{summary.plPercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AverageCalculator;
