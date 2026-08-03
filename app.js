// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    
    // Highlight button
    const activeIndex = tabId === 'market-monitor' ? 0 : 1;
    document.querySelectorAll('.tab-btn')[activeIndex].classList.add('active');
}

// Toggle modals
function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (show) {
        modal.classList.add('active');
        // Load active config inside modal input
        document.getElementById('twelveDataKey').value = localStorage.getItem('twelvedata_apikey') || '';
    } else {
        modal.classList.remove('active');
    }
}

// Configurations Management
let appConfig = {
    mode: localStorage.getItem('app_mode') || 'sim',
    apiKey: localStorage.getItem('twelvedata_apikey') || ''
};

function setMode(mode) {
    document.getElementById('mode-sim').classList.remove('active');
    document.getElementById('mode-live').classList.remove('active');
    
    if (mode === 'sim') {
        document.getElementById('mode-sim').classList.add('active');
        document.getElementById('apikey-group').style.display = 'none';
    } else {
        document.getElementById('mode-live').classList.add('active');
        document.getElementById('apikey-group').style.display = 'flex';
    }
    appConfig.mode = mode;
}

function saveConfig() {
    const keyVal = document.getElementById('twelveDataKey').value.trim();
    localStorage.setItem('app_mode', appConfig.mode);
    localStorage.setItem('twelvedata_apikey', keyVal);
    appConfig.apiKey = keyVal;
    
    toggleModal('settings-modal', false);
    
    // Reinitialize and refresh values immediately
    initDataFeed();
    refreshData();
}

function initDataFeed() {
    const modeIndicator = document.getElementById('data-source-indicator');
    if (appConfig.mode === 'live' && appConfig.apiKey) {
        modeIndicator.textContent = "Live API Feed";
        modeIndicator.className = "badge-up";
        modeIndicator.style.background = "rgba(99, 102, 241, 0.15)";
        modeIndicator.style.color = "#818cf8";
    } else {
        modeIndicator.textContent = "Simulated Feed";
        modeIndicator.className = "badge-neutral";
        modeIndicator.style.background = "";
        modeIndicator.style.color = "";
    }
}

// Setup base data structures
// Includes fixed previous close values to resolve math discrepancies in simulated updates
const DEFAULT_MARKET_DATA = [
    { id: 1, name: "Gift Nifty", symbol: "NIFTY", current: 22340.50, prevClose: 22285.00 },
    { id: 2, name: "Nasdaq 100", symbol: "IXIC", current: 17980.20, prevClose: 18090.75 },
    { id: 3, name: "Hang Seng", symbol: "HSI", current: 17210.60, prevClose: 17045.00 },
    { id: 4, name: "Nikkei 225", symbol: "N225", current: 38850.00, prevClose: 38620.00 },
    { id: 5, name: "Kospi", symbol: "KS11", current: 2685.30, prevClose: 2704.50 },
    { id: 6, name: "FTSE 100", symbol: "FTSE", current: 8215.10, prevClose: 8222.90 },
    { id: 7, name: "Brent Crude Oil", symbol: "LCO/USD", current: 81.25, prevClose: 83.10 },
    { id: 8, name: "Gold Spot", symbol: "XAU/USD", current: 2384.40, prevClose: 2372.10 },
    { id: 9, name: "Silver Spot", symbol: "XAG/USD", current: 29.45, prevClose: 29.20 }
];

let activeMarketData = JSON.parse(JSON.stringify(DEFAULT_MARKET_DATA));
const REFRESH_INTERVAL_SECONDS = 180;
let timeRemaining = REFRESH_INTERVAL_SECONDS;
let countdownTimer = null;

function refreshData() {
    timeRemaining = REFRESH_INTERVAL_SECONDS;
    updateTimerDisplay();
    
    if (appConfig.mode === 'live' && appConfig.apiKey) {
        fetchLiveData();
    } else {
        runSimulationTick();
    }
}

// Mathematical Simulation Tick
function runSimulationTick() {
    activeMarketData.forEach(item => {
        // Apply a random walk drift (-0.5% to +0.5%)
        const percentageChange = (Math.random() - 0.495) * 1.0; 
        item.current = item.current * (1 + (percentageChange / 100));
        
        // MATH SANITATION RULES:
        // All values are calculated from the baseline previous close
        item.change = item.current - item.prevClose;
        item.percent = (item.change / item.prevClose) * 100;
    });
    renderMarketTable(activeMarketData);
    updateSummaryKPIs(activeMarketData);
}

// Live API Fetching using Twelve Data
async function fetchLiveData() {
    // Group symbols
    const symbolList = activeMarketData.map(d => d.symbol).join(',');
    const url = `https://api.twelvedata.com/quote?symbol=${symbolList}&apikey=${appConfig.apiKey}`;
    
    try {
        const response = await fetch(url);
        const results = await response.json();
        
        if (results.status === 'error') {
            console.error("Twelve Data API Error:", results.message);
            alert("Twelve Data API error. Falling back to simulator. " + results.message);
            runSimulationTick();
            return;
        }

        // Match API responses back to data array
        activeMarketData.forEach(item => {
            const apiData = results[item.symbol];
            if (apiData) {
                item.current = parseFloat(apiData.close || apiData.price);
                item.change = parseFloat(apiData.change);
                item.percent = parseFloat(apiData.percent_change);
                item.prevClose = parseFloat(apiData.previous_close);
            }
        });
        
        renderMarketTable(activeMarketData);
        updateSummaryKPIs(activeMarketData);
    } catch (err) {
        console.error("Failed to connect to API:", err);
        runSimulationTick(); // fallback
    }
}

function renderMarketTable(data) {
    const tbody = document.querySelector("#marketTable tbody");
    tbody.innerHTML = "";
    
    data.forEach((item, index) => {
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

        // Format values professionally
        const valDigits = item.current < 100 ? 4 : 2;
        const formattedValue = item.current.toLocaleString('en-US', { minimumFractionDigits: valDigits, maximumFractionDigits: valDigits });
        const formattedChange = `${prefix}${item.change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formattedPercent = `${prefix}${item.percent.toFixed(2)}%`;

        const rowHtml = `
            <tr onclick="showAssetChart('${item.name}', '${item.symbol}')">
                <td><strong>${index + 1}</strong></td>
                <td>
                    <div style="font-weight:600; color:var(--text-primary);">${item.name}</div>
                    <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase;">${item.symbol}</div>
                </td>
                <td style="text-align:right; font-weight:700; font-family:'Outfit'; font-size:15px;">
                    ${formattedValue}
                </td>
                <td style="text-align:right;">
                    <span class="${badgeClass}">${formattedChange}</span>
                </td>
                <td style="text-align:right;">
                    <span class="${badgeClass}">${formattedPercent}</span>
                </td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    });

    document.getElementById("lastUpdated").textContent = new Date().toLocaleTimeString();
}

function updateSummaryKPIs(data) {
    let gainersCount = 0;
    let losersCount = 0;
    let topGainer = data[0];
    let topLoser = data[0];

    data.forEach(item => {
        if (item.change > 0) gainersCount++;
        if (item.change < 0) losersCount++;

        if (item.percent > topGainer.percent) topGainer = item;
        if (item.percent < topLoser.percent) topLoser = item;
    });

    // Update Sentiment Card
    const sentimentCard = document.getElementById("sentiment-card");
    const sentimentValue = document.getElementById("sentiment-value");
    const sentimentDesc = document.getElementById("sentiment-desc");
    
    sentimentCard.className = "stat-card";
    if (gainersCount > losersCount) {
        sentimentCard.classList.add("bullish");
        sentimentValue.textContent = "Bullish";
        sentimentValue.style.color = "var(--color-up)";
        sentimentDesc.textContent = `${gainersCount} of ${data.length} trackers gaining`;
    } else if (losersCount > gainersCount) {
        sentimentCard.classList.add("bearish");
        sentimentValue.textContent = "Bearish";
        sentimentValue.style.color = "var(--color-down)";
        sentimentDesc.textContent = `${losersCount} of ${data.length} trackers losing`;
    } else {
        sentimentCard.classList.add("neutral");
        sentimentValue.textContent = "Mixed";
        sentimentValue.style.color = "var(--text-secondary)";
        sentimentDesc.textContent = "Market indexes evenly split";
    }

    // Update Top Gainer Card
    document.getElementById("gainer-value").textContent = topGainer.name;
    document.getElementById("gainer-value").style.color = "var(--color-up)";
    document.getElementById("gainer-desc").textContent = `Up +${topGainer.percent.toFixed(2)}% today`;

    // Update Top Loser Card
    document.getElementById("loser-value").textContent = topLoser.name;
    document.getElementById("loser-value").style.color = "var(--color-down)";
    document.getElementById("loser-desc").textContent = `Down ${topLoser.percent.toFixed(2)}% today`;
}

// Auto Refresh Countdown timer
function startTimer() {
    if (countdownTimer) clearInterval(countdownTimer);
    
    updateTimerDisplay();
    
    countdownTimer = setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            refreshData();
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const progress = document.getElementById("timer-indicator");
    if (progress) {
        const dashArrayMax = 63; 
        const percentageRemaining = timeRemaining / REFRESH_INTERVAL_SECONDS;
        const offset = dashArrayMax * (1 - percentageRemaining);
        progress.style.strokeDashoffset = offset;
    }
}

// ============================================
// REACTIVE CALCULATOR LOGIC
// ============================================
let calculatorRows = [];

function addCalculatorRow(qty = "", price = "") {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    calculatorRows.push({ id, qty, price });
    renderCalculatorRows();
    runCalculator();
}

function removeCalculatorRow(id) {
    if (calculatorRows.length <= 1) {
        alert("Please retain at least one purchase row.");
        return;
    }
    calculatorRows = calculatorRows.filter(r => r.id !== id);
    renderCalculatorRows();
    runCalculator();
}

function updateCalculatorData(id, field, value) {
    const row = calculatorRows.find(r => r.id === id);
    if (row) {
        row[field] = parseFloat(value) || 0;
        runCalculator();
    }
}

function renderCalculatorRows() {
    const tbody = document.getElementById("calculatorBody");
    tbody.innerHTML = "";

    calculatorRows.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td>
                <input type="number" class="calc-input" min="0.01" step="any" placeholder="e.g. 50" value="${row.qty || ''}" oninput="updateCalculatorData('${row.id}', 'qty', this.value)">
            </td>
            <td>
                <input type="number" class="calc-input" min="0.01" step="any" placeholder="e.g. 150.00" value="${row.price || ''}" oninput="updateCalculatorData('${row.id}', 'price', this.value)">
            </td>
            <td style="text-align: center;">
                <button class="btn btn-outline btn-danger" style="padding: 6px 10px;" onclick="removeCalculatorRow('${row.id}')" title="Delete Row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function runCalculator() {
    let totalQty = 0;
    let totalOutlay = 0;

    calculatorRows.forEach(row => {
        const qty = parseFloat(row.qty) || 0;
        const price = parseFloat(row.price) || 0;
        totalQty += qty;
        totalOutlay += (qty * price);
    });

    const profitPercent = parseFloat(document.getElementById("calcProfitPercent").value) || 0;
    const currentLivePrice = parseFloat(document.getElementById("calcCurrentMarketPrice").value) || 0;

    const avgBuyPrice = totalQty > 0 ? (totalOutlay / totalQty) : 0;
    const targetSellPrice = avgBuyPrice * (1 + (profitPercent / 100));
    const expectedProfit = totalOutlay * (profitPercent / 100);

    // Display Results
    document.getElementById("summaryTotalQty").textContent = totalQty.toLocaleString(undefined, { maximumFractionDigits: 4 });
    document.getElementById("summaryTotalInvestment").textContent = formatCurrency(totalOutlay);
    document.getElementById("summaryAvgPrice").textContent = formatCurrency(avgBuyPrice);
    document.getElementById("summaryTargetSalePrice").textContent = formatCurrency(targetSellPrice);
    document.getElementById("summaryExpectedProfit").textContent = formatCurrency(expectedProfit);

    // Live evaluation if current market price is supplied
    const liveComparisonRow = document.getElementById("live-comparison-row");
    if (currentLivePrice > 0 && totalQty > 0) {
        liveComparisonRow.style.display = "flex";
        const currentHoldingsValue = totalQty * currentLivePrice;
        const netProfitLoss = currentHoldingsValue - totalOutlay;
        const plPercent = (netProfitLoss / totalOutlay) * 100;
        
        const formattedPL = formatCurrency(netProfitLoss);
        const formattedPercent = plPercent >= 0 ? `+${plPercent.toFixed(2)}%` : `${plPercent.toFixed(2)}%`;
        
        const plVal = document.getElementById("summaryLiveProfitLoss");
        plVal.textContent = `${formattedPL} (${formattedPercent})`;
        
        if (netProfitLoss >= 0) {
            plVal.style.color = "var(--color-up)";
        } else {
            plVal.style.color = "var(--color-down)";
        }
    } else {
        liveComparisonRow.style.display = "none";
    }
}

function formatCurrency(val) {
    return val.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function exportCalculatorCSV() {
    if (calculatorRows.length === 0) {
        alert("No data available to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Entry #,Quantity,Buy Price,Line Total\n";

    calculatorRows.forEach((row, index) => {
        const qty = row.qty || 0;
        const price = row.price || 0;
        const lineTotal = (qty * price).toFixed(2);
        csvContent += `${index + 1},${qty},${price},${lineTotal}\n`;
    });

    // Calculate and append summary
    let totalQty = 0;
    let totalOutlay = 0;
    calculatorRows.forEach(row => {
        totalQty += parseFloat(row.qty) || 0;
        totalOutlay += (parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0);
    });
    const avg = totalQty > 0 ? (totalOutlay / totalQty).toFixed(2) : 0;

    csvContent += `\nTotal Quantity,${totalQty},,\n`;
    csvContent += `Total Outlay,,${totalOutlay.toFixed(2)},\n`;
    csvContent += `Average Buy Price,,${avg},\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stratboonco_portfolio_averages.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize state
window.addEventListener('DOMContentLoaded', () => {
    setMode(appConfig.mode);
    initDataFeed();
    
    // Add some initial calculator rows
    addCalculatorRow(100, 150.25);
    addCalculatorRow(50, 142.10);
    
    // Run initial load
    refreshData();
    startTimer();
});

// ============================================
// TRADINGVIEW INTERACTIVE CHARTING LOGIC
// ============================================
const TV_SYMBOL_MAP = {
    "NIFTY": "NSE:NIFTY",
    "IXIC": "NASDAQ:IXIC",
    "HSI": "HSI:HSI",
    "N225": "OANDA:JP225", // OANDA JP225 is stable and real-time
    "KS11": "KRX:KOSPI",
    "FTSE": "INDEX:UKX",
    "LCO/USD": "TVC:UKOIL",
    "XAU/USD": "TVC:GOLD",
    "XAG/USD": "TVC:SILVER"
};

function toggleDrawer(show) {
    const drawer = document.getElementById("chart-drawer");
    if (show) {
        drawer.classList.add("active");
    } else {
        drawer.classList.remove("active");
    }
}

function showAssetChart(name, symbol) {
    toggleDrawer(true);
    document.getElementById("drawer-title").textContent = `${name} Live Chart`;
    
    const tvSymbol = TV_SYMBOL_MAP[symbol] || symbol;
    
    // Clear and prepare mounting container
    document.getElementById("chart-container").innerHTML = '<div id="tv-widget-mount" style="height: 100%;"></div>';
    
    // Create new widget instance
    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": tvSymbol,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "container_id": "tv-widget-mount"
    });
}
