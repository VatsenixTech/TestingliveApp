import React, { useEffect, useRef, useState } from "react";
import "./HelpChatWidget.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function HelpChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi 👋 I am NoPromptJobs AI Help Assistant. How can I help you today?",
    },
  ]);

  useEffect(() => {
    const openChat = () => setOpen(true);

    window.addEventListener("openHelpChat", openChat);

    return () => {
      window.removeEventListener("openHelpChat", openChat);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const askQuick = (text) => {
    sendMessage(text);
  };

  const sendMessage = async (directText) => {
    const question = directText || input.trim();

    if (!question || loading) return;

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: question,
      },
    ]);

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/help-chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Help chat request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.answer ||
            "Sorry, I could not understand. Please ask again.",
        },
      ]);
    } catch (error) {
      console.error("HELP CHAT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Help assistant is not connected right now. Please check backend route /api/help-chat/ask.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <section className="help-widget">
          <header className="help-widget-head">
            <div className="bot-circle">🤖</div>

            <div>
              <h3>Help Center</h3>
              <p>AI Assistant</p>
            </div>

            <button type="button" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>

          <div className="online-row">
            <span></span> Online
          </div>

          <div className="help-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`help-msg ${
                  msg.role === "user" ? "user" : "bot"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && <div className="help-msg bot">Typing...</div>}

            <div ref={endRef}></div>
          </div>

          <div className="quick-help">
            <button
              type="button"
              onClick={() => askQuick("How to use Resume Studio?")}
            >
              Resume Studio
            </button>

            <button
              type="button"
              onClick={() => askQuick("How to apply for jobs?")}
            >
              Apply for Jobs
            </button>

            <button
              type="button"
              onClick={() => askQuick("How to upgrade premium?")}
            >
              Premium Plan
            </button>
          </div>

          <footer className="help-input">
            <input
              placeholder="Ask your question..."
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              type="button"
              disabled={loading}
              onClick={() => sendMessage()}
            >
              ➤
            </button>
          </footer>

          <small className="powered">Powered by NoPromptJobs AI</small>
        </section>
      )}

      <button
        type="button"
        className="help-floating-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "×" : "🤖"}
      </button>
    </>
  );
}