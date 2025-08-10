import React, { useState, useEffect, useRef } from 'react';
import './Chat.css'; // Import styles specific to Chat component

function Chat() {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null); // Ref for auto-scrolling

  const API_URL = 'http://127.0.0.1:5000/chat'; // Your Flask backend URL

  // Auto-scroll to the bottom of the chat history
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!input.trim()) return; // Prevent sending empty messages

    const userMessage = input;
    setInput(''); // Clear input field immediately
    setLoading(true);

    // Add user's message to chat history
    setChatHistory(prevHistory => [...prevHistory, { role: 'user', text: userMessage }]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.response;

      // Add bot's response to chat history
      setChatHistory(prevHistory => [...prevHistory, { role: 'bot', text: botResponse }]);

    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory(prevHistory => [...prevHistory, { role: 'bot', text: "Error: Could not get a response from AI." }]);
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="chat-component-container"> {/* Wrapper for the entire chat component */}
      <div className="chat-messages">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message-bubble-wrapper ${msg.role}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="message-bubble-wrapper bot loading">
            <div className="message-bubble">Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} /> {/* Element to scroll to */}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input-field"
          placeholder="Ask Gemini something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button className="chat-send-button" onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Chat;