// src/pages/ChatPage.js
import React, { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
  };

  return (
    <div>
      <h2>AI Chat (TRL Insights Coming Soon 🤖)</h2>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <p key={i} className={msg.sender}>{msg.text}</p>
        ))}
      </div>

      <form onSubmit={handleSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your innovation..."
        />
        <button type="submit" className="submit-btn">Send</button>
      </form>
    </div>
  );
}
