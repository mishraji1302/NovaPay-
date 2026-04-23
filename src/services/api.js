const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

export const getStockPrice = async (symbol) => {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
  );
  return res.json();
};

export const askGemini = async (prompt) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );
  return res.json();
};