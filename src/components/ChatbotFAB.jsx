/**
 * ChatbotFAB.jsx — Floating action button that opens/closes ChatbotWindow overlay.
 */

import { useState } from "react";
import ChatbotWindow from "./ChatbotWindow.jsx";

export default function ChatbotFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 84, right: 24,
          width: 400, height: 560,
          background: "linear-gradient(180deg, #0d1220 0%, #080c14 100%)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), var(--shadow-glow)",
          zIndex: 500,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "fadeIn 0.2s ease",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.3rem" }}>🤖</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>Finn</p>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--color-up)" }}>● Online · Live Data</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
              borderRadius: 8, color: "var(--text-secondary)",
              width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem",
            }}>✕</button>
          </div>
          <ChatbotWindow />
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Chat with Finn"
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 54, height: 54,
          background: open
            ? "rgba(0,229,255,0.15)"
            : "linear-gradient(135deg, #00e5ff, #0099cc)",
          border: open ? "1px solid var(--color-accent)" : "none",
          borderRadius: "50%",
          color: open ? "var(--color-accent)" : "#000",
          fontSize: "1.5rem",
          boxShadow: "0 4px 24px rgba(0,229,255,0.35)",
          zIndex: 501,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all var(--transition)",
        }}
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
