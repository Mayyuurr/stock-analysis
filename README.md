# StratBoonCo Market Intelligence Hub

A premium-grade, modular financial intelligence dashboard combining a real-time **Global Market Monitor** (with interactive TradingView technical charting) and a reactive **Portfolio Average & target Profit Calculator**.

Designed with modern dark-themed glassmorphism aesthetics, fluid micro-animations, and full responsive design.

---

## 📂 Project Structure

The project has been separated into clean, decoupled files following professional frontend engineering standards:

*   **`index.html`** - Core dashboard layout page structure, tab control system, and configuration views.
*   **`chart.html`** - Full-screen dedicated TradingView interactive charting view page.
*   **`styles.css`** - Global CSS theme styles, layouts, animations, and typography configurations.
*   **`app.js`** - Pure JavaScript state machine, calculations engine, simulation models, and live API connectors.

---

## 🌟 Key Features

### 1. Global Market Monitor
*   **Comprehensive Coverage:** Tracks major indices (Gift Nifty, Nasdaq 100, Hang Seng, Nikkei 225, Kospi, FTSE 100) and spot commodities (Brent Crude Oil, Gold, Silver).
*   **Market Sentiment Indicator:** Real-time analytics panel computing general market direction (Bullish / Bearish / Mixed), top daily gainer, and top daily loser.
*   **Timer & Auto-Refresh:** Visual countdown circle counts down from 3 minutes to auto-update values silently. Manual refresh is supported at any time.

*   **Dedicated Tab View:** Click on any asset row in the Market Monitor table to launch `chart.html` in a new browser tab/window.
*   **Full-Screen Charting:** Automatically loads the full-screen interactive TradingView charting widget for the selected asset, allowing you to use professional indicators, view real-time candlesticks, change intervals (1D, 1W, 1M, 1H), and analyze markets in a clean, distraction-free environment.

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
