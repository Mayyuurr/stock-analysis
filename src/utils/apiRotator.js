// Normalizes symbols to the provider specific format if needed
export const normalizeSymbol = (symbol, provider) => {
  // Twelve Data / Finnhub / Alpha Vantage symbols
  let cleaned = symbol.toUpperCase();
  // Strip TV exchanges prefixes if present (e.g. NASDAQ:AAPL -> AAPL)
  if (cleaned.includes(':')) {
    cleaned = cleaned.split(':').pop();
  }
  // Strip currency pairs formatting (e.g. XAU/USD -> XAUUSD for Finnhub/AlphaVantage, LCO/USD -> TVC:UKOIL etc)
  if (provider === 'finnhub' || provider === 'alphavantage') {
    if (cleaned === 'XAU/USD' || cleaned === 'XAUUSD') return 'GLD'; // Gold ETF as proxy or XAUUSD if supported
    if (cleaned === 'XAG/USD' || cleaned === 'XAGUSD') return 'SLV'; // Silver ETF
    if (cleaned === 'LCO/USD') return 'USO'; // Oil ETF proxy
    if (cleaned === 'NIFTY') return 'EPI'; // India ETF proxy for global feeds
  }
  return cleaned;
};

// Main fetch function with failover rotation
export const fetchStockQuote = async (symbol, keys) => {
  const providers = [];
  
  if (keys.twelveData) {
    providers.push({
      name: 'twelvedata',
      fetchFn: async () => {
        const sym = normalizeSymbol(symbol, 'twelvedata');
        const url = `https://api.twelvedata.com/quote?symbol=${sym}&apikey=${keys.twelveData}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.status === 'error' || data.code === 429) {
          throw new Error(data.message || 'Rate limited');
        }
        
        // Strict NaN fallback if fields don't exist
        return {
          price: parseFloat(data.close || data.price) || NaN,
          change: parseFloat(data.change) !== undefined ? parseFloat(data.change) : NaN,
          percent: parseFloat(data.percent_change) !== undefined ? parseFloat(data.percent_change) : NaN,
          open: parseFloat(data.open) || NaN,
          high: parseFloat(data.high) || NaN,
          low: parseFloat(data.low) || NaN,
          prevClose: parseFloat(data.previous_close) || NaN,
          high52: data.fifty_two_week ? (parseFloat(data.fifty_two_week.high) || NaN) : NaN,
          low52: data.fifty_two_week ? (parseFloat(data.fifty_two_week.low) || NaN) : NaN,
          provider: 'Twelve Data'
        };
      }
    });
  }

  if (keys.finnhub) {
    providers.push({
      name: 'finnhub',
      fetchFn: async () => {
        const sym = normalizeSymbol(symbol, 'finnhub');
        const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${keys.finnhub}`;
        const res = await fetch(url);
        if (res.status === 429) throw new Error('Finnhub Rate Limited');
        const data = await res.json();
        
        if (!data || data.c === 0 || data.c === null) {
          throw new Error('Finnhub empty response or invalid symbol');
        }

        return {
          price: parseFloat(data.c) || NaN,
          change: parseFloat(data.d) !== undefined ? parseFloat(data.d) : NaN,
          percent: parseFloat(data.dp) !== undefined ? parseFloat(data.dp) : NaN,
          open: parseFloat(data.o) || NaN,
          high: parseFloat(data.h) || NaN,
          low: parseFloat(data.l) || NaN,
          prevClose: parseFloat(data.pc) || NaN,
          high52: NaN, // Finnhub quote does not provide 52 week range on free tier
          low52: NaN,
          provider: 'Finnhub'
        };
      }
    });
  }

  if (keys.alphaVantage) {
    providers.push({
      name: 'alphavantage',
      fetchFn: async () => {
        const sym = normalizeSymbol(symbol, 'alphavantage');
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${keys.alphaVantage}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data['Note'] || data['Information']) {
          throw new Error('Alpha Vantage Rate Limited / Key info');
        }

        const quote = data['Global Quote'];
        if (!quote || Object.keys(quote).length === 0) {
          throw new Error('Alpha Vantage invalid symbol or response');
        }

        const rawPct = quote['10. change percent'] || '';
        const pctFloat = parseFloat(rawPct.replace('%', ''));

        return {
          price: parseFloat(quote['05. price']) || NaN,
          change: parseFloat(quote['09. change']) !== undefined ? parseFloat(quote['09. change']) : NaN,
          percent: isNaN(pctFloat) ? NaN : pctFloat,
          open: parseFloat(quote['02. open']) || NaN,
          high: parseFloat(quote['03. high']) || NaN,
          low: parseFloat(quote['04. low']) || NaN,
          prevClose: parseFloat(quote['08. previous close']) || NaN,
          high52: NaN, // Alpha Vantage quote does not provide 52 week range on free tier
          low52: NaN,
          provider: 'Alpha Vantage'
        };
      }
    });
  }

  // Iterate over providers and failover sequentially
  for (const provider of providers) {
    try {
      console.log(`Rotator trying provider: ${provider.name} for symbol: ${symbol}`);
      const result = await provider.fetchFn();
      return result; // return first successful fetch
    } catch (err) {
      console.warn(`Rotator provider: ${provider.name} failed. Error: ${err.message}`);
    }
  }

  // If all providers failed or no API keys entered
  return null;
};
