# StratBoonCo Market Intelligence Hub (React Edition)

A premium-grade React web application combining a real-time **Global Market Monitor** (with interactive TradingView technical charting tabs) and a reactive **Portfolio Average & target Profit Calculator**.

Built using **React 19**, **Vite**, and **React Router v6** with modern dark-themed glassmorphism CSS aesthetics and fluid transitions.

---

## 📂 Project Structure

The codebase is organized into modular React components:

*   **`src/main.jsx`** - Application entry point. Mounts the root React tree and imports global styles.
*   **`src/App.jsx`** - Configuration engine for page routes (`react-router-dom`).
*   **`src/index.css`** - Global CSS rules containing our premium glassmorphism styling tokens and layout configurations.
*   **`src/pages/Dashboard.jsx`** - Main controller page. Orchestrates tab states, refresh countdowns, and live stats calculations (Sentiment, movers).
*   **`src/pages/ChartPage.jsx`** - Dedicated charting page loading a full-screen TradingView widget dynamically mapped from path parameters.
*   **`src/components/MarketMonitor.jsx`** - Renders the live index rates table and progress timer.
*   **`src/components/AverageCalculator.jsx`** - Renders the reactive portfolio calculator spreadsheet and handles CSV exporting.
*   **`src/components/ConfigModal.jsx`** - Settings dashboard overlay.
*   **`vanilla-backup/`** - Directory containing the original vanilla HTML/JS/CSS files.

---

## ⚙️ Available Scripts

In the project directory, you can run:

### `npm install`
Installs all required dependencies (React Router, Vite, React, etc.). Run this first.

### `npm run dev`
Runs the app in development mode at [http://localhost:5173](http://localhost:5173).
The browser will hot-reload automatically when you save changes.

### `npm run build`
Builds the production-ready assets to the `dist/` folder.
Vite will compile, optimize, and minify the React code.

---

## 🌟 Core Functionality

1. **Dual-Feed Modes:**
   - **Simulation Mode (Default):** Runs a smart mathematical random walk simulator drifting rates slightly up/down. All rates, changes, and percent changes calculate properly.
   - **Twelve Data Live Mode:** Connects to Twelve Data REST API to fetch live rates. Paste your free API key in the **Config** settings modal (saved in browser `localStorage`).
2. **Dynamic Calculator:** Add or remove rows instantly. Enter your target profit margin (%) to calculate average cost, expected profit, and required selling price dynamically. Optional live price comparisons show real-time paper profits/losses.
3. **Interactive Charts:** Click any asset row in the Market Monitor to open a full-screen TradingView charting widget in a new tab.

---

## 🚀 How to Run Locally

1. Install Node.js on your computer (if not already installed).
2. Open terminal in the project directory and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open the browser to the local address outputted in terminal (usually `http://localhost:5173`).
