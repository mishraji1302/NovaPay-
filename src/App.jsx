/**
 * App.jsx — Root component: auth gate → Router with all routes.
 */

import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StockProvider } from "./context/StockContext.jsx";
import { ToastProvider } from "./components/ToastNotification.jsx";
import AppShell from "./layout/AppShell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Stocks from "./pages/Stocks.jsx";
import Banking from "./pages/Banking.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  const [auth, setAuth] = useState(false);
  const [register, setRegister] = useState(false);

  if (!auth) {
    return register ? (
      <RegisterPage onLogin={() => setAuth(true)} onSwitch={() => setRegister(false)} />
    ) : (
      <LoginPage onLogin={() => setAuth(true)} onSwitch={() => setRegister(true)} />
    );
  }

  return (
    <ToastProvider>
      <StockProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/banking" element={<Banking />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </StockProvider>
    </ToastProvider>
  );
}
