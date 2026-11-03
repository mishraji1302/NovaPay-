/**
 * server/apiProxy.js
 * Secure backend proxy for Finnhub and Gemini APIs.
 * Keeps API keys completely server-side and prevents client leakage.
 */

const stockCache = new Map();
const CACHE_TTL_MS = 15000; // 15-second cache to prevent rate limit exhaustion

export async function handleApiRequest(req, res, env = process.env) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // 1. Health & Config status check (does not leak keys)
  if (pathname === '/api/health' || pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      finnhubConfigured: Boolean(env.FINNHUB_KEY),
      geminiConfigured: Boolean(env.GEMINI_KEY),
    }));
    return true;
  }

  // 2. Stock Quote Proxy: GET /api/stock?symbol=AAPL
  if (pathname === '/api/stock' && req.method === 'GET') {
    const symbol = urlObj.searchParams.get('symbol');
    if (!symbol) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing symbol parameter' }));
      return true;
    }

    const finnhubKey = env.FINNHUB_KEY;
    if (!finnhubKey) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FINNHUB_KEY is not configured on the server' }));
      return true;
    }

    // Check cache
    const cached = stockCache.get(symbol);
    const now = Date.now();
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
      });
      res.end(JSON.stringify(cached.data));
      return true;
    }

    try {
      const upstream = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${finnhubKey}`
      );

      if (!upstream.ok) {
        res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Finnhub returned status ${upstream.status}` }));
        return true;
      }

      const data = await upstream.json();
      stockCache.set(symbol, { timestamp: now, data });

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Failed to fetch quote from Finnhub' }));
    }
    return true;
  }

  // 3. Gemini Chat Stream Proxy: POST /api/chat
  if (pathname === '/api/chat' && req.method === 'POST') {
    const geminiKey = env.GEMINI_KEY;
    if (!geminiKey) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'GEMINI_KEY is not configured on the server' }));
      return true;
    }

    let rawBody = '';
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(rawBody || '{}');
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${geminiKey}`;

        const upstreamRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!upstreamRes.ok) {
          const errData = await upstreamRes.text();
          res.writeHead(upstreamRes.status, { 'Content-Type': 'application/json' });
          res.end(errData);
          return;
        }

        // Forward SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        });

        const reader = upstreamRes.body.getReader();
        const abortHandler = () => reader.cancel();
        req.on('close', abortHandler);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }

        req.off('close', abortHandler);
        res.end();
      } catch (err) {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        } else {
          res.end();
        }
      }
    });
    return true;
  }

  return false;
}
