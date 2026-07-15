import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './GeminiChat.scss'; 

export const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const handleSendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = input;

  setMessages((prev) => [...prev, { text: userMessage, user: true }]);
  setInput("");
  setLoading(true);

  try {
    const res = await axios({
      method: "POST",
      url: "http://localhost:5000/api/v1/gemini/chat",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        prompt: userMessage,
      },
    });

    setMessages((prev) => [
      ...prev,
      {
        text: res.data.reply,
        user: false,
      },
    ]);
  } catch (err) {
    console.error("FULL ERROR:", err);

    alert(JSON.stringify(err.response?.data || err.message));

    setMessages((prev) => [
      ...prev,
      {
        text: "Error: Could not get response from AI",
        user: false,
      },
    ]);
  }

  setLoading(false);
};
  return (
    <div>
      <button
        className="open-chat-button"
        onClick={() => setIsChatVisible((prev) => !prev)}
      >
        Chat with AI
      </button>

      {isChatVisible && (
        <div className="chat-popup">
          <div className="chat-header">
            <h2>AI ChatBot</h2>
            <button
              className="close-button"
              onClick={() => setIsChatVisible(false)}
            >
              ✖
            </button>
          </div>
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.user ? 'user' : 'bot'}`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {loading && <div className="loading">Loading...</div>}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
