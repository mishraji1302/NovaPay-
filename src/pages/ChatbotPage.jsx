import ChatbotWindow from "../components/ChatbotWindow.jsx";

export default function ChatbotPage() {
  return (
    <div className="flex flex-col p-6 lg:p-8" style={{ height: 'calc(100vh - var(--navbar-height))' }}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🤖</span> Finn — AI Assistant
        </h1>
        <p className="text-[#8892a4] text-sm mt-1">
          Powered by Google Gemini · Live stock data · ML predictions
        </p>
      </div>
      <div className="flex-1 rounded-2xl border border-white/8 overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg, #0d1220 0%, #080c14 100%)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8"
          style={{ background: 'rgba(0,0,0,0.2)' }}>
          <span className="text-xl">🤖</span>
          <span className="font-bold text-white text-sm">Finn</span>
          <span className="text-xs text-[#00e5ff] ml-1">● Live</span>
          <span className="ml-auto text-xs text-[#8892a4]">Gemini 1.5 Flash · Free tier</span>
        </div>
        <ChatbotWindow fullScreen />
      </div>
    </div>
  );
}
