# StratBoonCo Market Intelligence Hub

A premium-grade, modular financial intelligence dashboard combining a real-time **Global Market Monitor** (with interactive TradingView technical charting) and a reactive **Portfolio Average & target Profit Calculator**.

Designed with modern dark-themed glassmorphism aesthetics, fluid micro-animations, and full responsive design.

---

## 📂 Project Structure

The project has been separated into clean, decoupled files following professional frontend engineering standards:

*   **`index.html`** - Holds the semantic HTML structure, SEO metadata, and includes font assets and external stylesheet/script bindings.
*   **`styles.css`** - Custom CSS custom properties (variables), theme configuration, layout styles, and smooth transition animations.
*   **`app.js`** - Pure JavaScript application logic containing the state engine, calculation utilities, simulation triggers, and API connections.

---

## 🌟 Key Features

### 1. Global Market Monitor
*   **Comprehensive Coverage:** Tracks major indices (Gift Nifty, Nasdaq 100, Hang Seng, Nikkei 225, Kospi, FTSE 100) and spot commodities (Brent Crude Oil, Gold, Silver).
*   **Market Sentiment Indicator:** Real-time analytics panel computing general market direction (Bullish / Bearish / Mixed), top daily gainer, and top daily loser.
*   **Timer & Auto-Refresh:** Visual countdown circle counts down from 3 minutes to auto-update values silently. Manual refresh is supported at any time.

### 2. Interactive Charts
*   **TradingView Embeds:** Click on any asset row in the Market Monitor table to open a slide-out drawer from the right containing a fully interactive TradingView chart widget.
*   **Technical Tools:** Analyze price trends using candlestick patterns, adjust timeline intervals (1D, 1W, 1M, 1H), and apply standard technical indicators like RSI and Moving Averages directly in the drawer.

### 3. Reactive Average Calculator
*   **Spreadsheet-style Inputs:** Dynamically add or delete purchase entry rows. Averages and outlay compute instantly on every keystroke.
*   **Target Selling Price:** Enter your desired profit margin (%) to compute the exact required per-share selling price and net profits.
*   **Live Comparison:** Supply the current market price of the asset to see real-time unrealized gains or losses.
*   **Export to CSV:** Download the entire portfolio calculations spreadsheet instantly to your local machine.

### 4. Configurable Feeds
*   **Simulated Feed:** Default mode. Runs a mathematically consistent simulation model using random walk drifts. Unlike basic mock generators, prices, absolute changes, and percent changes remain perfectly consistent:
    $$\text{Change} = \text{Current Price} - \text{Previous Close}$$
    $$\text{Percent Change} = \left(\frac{\text{Change}}{\text{Previous Close}}\right) \times 100$$
*   **Live Feed:** Integrates with the **Twelve Data API** to pull real-time feeds directly from global exchanges.

---

## 🚀 Getting Started

1.  Clone or download the project files onto your local machine.
2.  Open **`index.html`** in any modern web browser (Chrome, Edge, Firefox, Safari).

### Configuring Live Data (Optional)

1.  Sign up for a free developer API key at [twelvedata.com](https://twelvedata.com).
2.  Open the application, and click the **Config** button in the header.
3.  Select **Twelve Data Live** as your feed source.
4.  Paste your API key and click **Apply Configurations**. The application will store the configuration in `localStorage` for future sessions.

---

## 🛠️ Built With

*   **Core:** Semantic HTML5, Vanilla JavaScript (ES6+).
*   **Styling:** Custom CSS Variables & Flexbox/Grid layouts.
*   **Typography:** Google Fonts (*Inter* & *Outfit*).
*   **Interactive Charts:** TradingView Embedded Charting Widget library.
*   **API Data Source:** Twelve Data API.
