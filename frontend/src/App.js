import React, { useEffect, useState } from "react";
import AIChat from "./pages/AIChat";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [page, setPage] = useState("chat");
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const loadConversations = () => {
      const saved = localStorage.getItem(
        "aiBusinessConversations"
      );

      if (saved) {
        setConversations(JSON.parse(saved));
      }
    };

    loadConversations();

    const interval = setInterval(
      loadConversations,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="app-navigation">
        <button
          onClick={() => setPage("chat")}
          className={page === "chat" ? "active-nav" : ""}
        >
          💬 AI Chat
        </button>

        <button
          onClick={() => setPage("dashboard")}
          className={page === "dashboard" ? "active-nav" : ""}
        >
          📊 Dashboard
        </button>
      </div>

      {page === "chat" ? (
        <AIChat />
      ) : (
        <Dashboard conversations={conversations} />
      )}
    </>
  );
}

export default App;