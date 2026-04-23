/**
 * AppShell.jsx — Layout wrapper: Sidebar + Navbar + main content area + FAB.
 */

import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import ChatbotFAB from "../components/ChatbotFAB.jsx";

export default function AppShell({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
      <ChatbotFAB />
    </div>
  );
}
