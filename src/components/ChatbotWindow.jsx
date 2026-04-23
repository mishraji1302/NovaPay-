/**
 * ChatbotWindow.jsx — Finn AI chatbot powered by Google Gemini (free tier).
 * Falls back to client-side intent resolution for common queries.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useStock } from "../context/StockContext.jsx";
import { parseIntent, resolveIntent, INTENTS } from "../utils/intentParser.js";

// Google Gemini free API — get key at https://aistudio.google.com (free, no credit card)
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`;

function buildGeminiPayload(systemPrompt, history, userMessage) {
  // Gemini uses "contents" array; system prompt goes as first user turn + model ack
  const contents = [];

  // Inject system context as first exchange
  contents.push({ role: "user", parts: [{ text: systemPrompt }] });
  contents.push({ role: "model", parts: [{ text: "Understood. I'm Finn, ready to help with live financial data." }] });

  // Conversation history (skip system messages)
  history.forEach(m => {
    if (m.role === "system") return;
    contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] });
  });

  // Current message
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  return {
    contents,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    ]
  };
}

function buildSystemPrompt(stockData, predictions) {
  const stockJson = JSON.stringify(
    Object.fromEntries(Object.entries(stockData).map(([sym, s]) => [
      sym, { price: s.price, changePercent: s.changePercent, change: s.change, high: s.high, low: s.low, volume: s.volume }
    ]))
  );
  const predJson = JSON.stringify(
    Object.fromEntries(Object.entries(predictions).map(([sym, p]) => [
      sym, { direction: p.combinedDirection, confidence: p.combinedConfidence, shortTerm: p.shortTerm, longTerm: p.longTerm, rsi: p.modelB?.rsi }
    ]))
  );
  return `You are Finn, an AI financial assistant embedded in NeoBank (NovaPay).
Real-time stock data: ${stockJson}
ML predictions: ${predJson}
Answer questions about these stocks precisely. Quote exact prices from the data above. Be concise (2-4 sentences unless asked for detail). Never fabricate prices. Do NOT give personalized investment advice.`;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <span className="text-xl">🤖</span>
      <div className="typing-dots"><span /><span /><span /></div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-[fadeIn_0.2s_ease]`}>
      {!isUser && <span className="text-xl flex-shrink-0 mt-1">🤖</span>}
      <div className={`max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'rounded-[14px_14px_4px_14px] text-white border border-[rgba(0,229,255,0.25)]'
          : 'rounded-[14px_14px_14px_4px] text-[#f0f4ff] border border-white/8'
      }`}
        style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,229,255,0.08))'
            : 'rgba(255,255,255,0.05)'
        }}>
        {msg.content}
        {msg.usedLiveData && (
          <div className="mt-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: '#00e5ff', background: 'rgba(0,229,255,0.08)', borderColor: 'rgba(0,229,255,0.2)' }}>
              ● Sources: Live Data
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatbotWindow({ fullScreen = false }) {
  const { stockData, predictions, watchlist } = useStock();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Finn 👋 Ask me about live stock prices, predictions, your watchlist, or market trends.", usedLiveData: false }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const hasSpeech = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startVoice = useCallback(() => {
    if (!hasSpeech) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "en-US"; r.interimResults = false;
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); setListening(false); setTimeout(() => sendMessageRef.current?.(t), 100); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start(); setListening(true);
  }, [hasSpeech]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Client-side intent resolution
    const parsed = parseIntent(msg);
    const localResponse = parsed.intent !== INTENTS.UNKNOWN
      ? resolveIntent(parsed, stockData, predictions, watchlist)
      : null;

    if (localResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "assistant", content: localResponse, usedLiveData: true }]);
        setLoading(false);
      }, 200);
      return;
    }

    // Gemini API
    if (!GEMINI_KEY) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠ No Gemini API key found. Add VITE_GEMINI_KEY to your .env file.\n\nGet a free key at: https://aistudio.google.com",
        usedLiveData: false,
      }]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const history = messages.filter(m => m.role !== "system");

    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(buildGeminiPayload(buildSystemPrompt(stockData, predictions), history, msg)),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      // Stream SSE
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      setMessages(prev => [...prev, { role: "assistant", content: "", usedLiveData: true, streaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) {
              accumulated += text;
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: accumulated, usedLiveData: true, streaming: true };
                return next;
              });
            }
          } catch { /* skip malformed */ }
        }
      }
      setMessages(prev => { const n = [...prev]; n[n.length - 1] = { ...n[n.length - 1], streaming: false }; return n; });
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `⚠ Finn couldn't respond: ${err.message}. Please check your VITE_GEMINI_KEY or try again.`,
          usedLiveData: false,
        }]);
      }
    } finally {
      setLoading(false);
    }
  }, [input, messages, stockData, predictions, watchlist]);

  const sendMessageRef = useRef(sendMessage);
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  return (
    <div className={`flex flex-col ${fullScreen ? 'h-full' : 'h-[560px] w-[400px]'}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && !messages[messages.length - 1]?.streaming && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-white/8 flex gap-2 items-end"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask about prices, predictions, trends…"
          rows={1}
          className="flex-1 bg-white/6 border border-white/10 rounded-xl text-white px-3.5 py-2.5 text-sm resize-none outline-none placeholder:text-white/25 focus:border-[#00e5ff]/50 transition-colors"
          style={{ maxHeight: 100 }}
        />
        {hasSpeech && (
          <button onClick={startVoice} disabled={listening}
            className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center border transition-all ${listening ? 'border-[#00e5ff] text-[#00e5ff]' : 'border-white/10 text-[#8892a4] hover:text-white'}`}
            style={{ background: listening ? 'rgba(0,229,255,0.12)' : 'rgba(255,255,255,0.05)' }}>
            {listening ? <div className="waveform scale-75"><div className="bar" /><div className="bar" /><div className="bar" /></div> : "🎤"}
          </button>
        )}
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
          style={{ background: input.trim() ? 'linear-gradient(135deg, #00e5ff, #0099cc)' : 'rgba(255,255,255,0.06)', color: input.trim() ? '#000' : '#4a5568' }}>
          ➤
        </button>
      </div>
    </div>
  );
}
