# NeoBank — Upgraded (Tailwind + Gemini Edition)

## Quick Start

```bash
cd neobank-output        # ← make sure you're in THIS folder
npm install
cp .env.example .env     # then edit .env with your keys
npm run dev
```

## Free API Keys (no credit card needed)

| Service | Key in .env | Get it at | Free limit |
|---------|------------|-----------|-----------|
| Finnhub | `VITE_FINNHUB_KEY` | https://finnhub.io | 60 req/min |
| Google Gemini | `VITE_GEMINI_KEY` | https://aistudio.google.com | 15 req/min, 1M tokens/day |

## Why Gemini instead of Anthropic?
Gemini 1.5 Flash is completely free (no credit card), supports streaming, handles financial context well, and has a generous daily quota. The chatbot works identically — Finn still receives live stock data and ML predictions injected into every message.

## What's new
- **Tailwind CSS** throughout — login, register, dashboard, sidebar, stocks, banking, chatbot
- **Login page** — glassmorphism card, animated orbs, password strength, show/hide toggle
- **Register page** — real-time password strength meter, terms checkbox, smooth animations
- **Chatbot (Finn)** — now uses Google Gemini 1.5 Flash (free) with streaming
- All 4 original modules intact: live stocks, ML predictions, watchlist, AI chatbot
