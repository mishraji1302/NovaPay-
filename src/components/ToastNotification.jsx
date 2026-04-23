/**
 * ToastNotification.jsx — Toast alert system (top-right, auto-dismiss 4s).
 */

import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const addToast = useCallback((message, type = "info") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: "fixed", top: "1rem", right: "1rem",
        zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px",
        maxWidth: "340px",
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: t.type === "alert" ? "rgba(255,77,109,0.15)" : "rgba(0,229,255,0.1)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${t.type === "alert" ? "rgba(255,77,109,0.3)" : "rgba(0,229,255,0.2)"}`,
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            animation: "slideInRight 0.3s ease",
            cursor: "pointer",
          }} onClick={() => removeToast(t.id)}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>
              {t.type === "alert" ? "🚨" : t.type === "success" ? "✅" : "💬"}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: 1.4 }}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Hook to trigger toasts from any component */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
