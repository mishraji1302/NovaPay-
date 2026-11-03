/**
 * api.js — Client-side API service.
 * All requests route through the secure /api backend proxy.
 * No private API keys are ever stored or exposed on the client.
 */

export const getStockPrice = async (symbol, signal) => {
  const res = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`, { signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch stock price: HTTP ${res.status}`);
  }
  return res.json();
};

export const askGemini = async (prompt) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to contact AI service: HTTP ${res.status}`);
  }
  return res.json();
};
