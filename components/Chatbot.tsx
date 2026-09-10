'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import './Chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initialize session when chatbot opens
  useEffect(() => {
    if (isOpen && !sessionId && !isInitializing) {
      initializeSession();
    }
  }, [isOpen, sessionId, isInitializing, initializeSession]);

  const initializeSession = useCallback(async () => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/chatbot/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);

      // Add welcome message
      const welcomeMessage: Message = {
        id: '1',
        text: data.welcomeMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

    } catch (error) {
      console.error('Session initialization error:', error);
      
      const errorMessage: Message = {
        id: 'error-init',
        text: "Sorry, I'm having trouble connecting to the AI brain. Please check your credentials or try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const sendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    
    if (!messageText || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          message: messageText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Message send error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, my server is a bit sleepy. Can you try saying that again?',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        <span className="icon">{isOpen ? '✕' : '💬'}</span>
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-content">
              <div className="chatbot-avatar">
                <div className="bot-pulse"></div>
                🤖
              </div>
              <div className="chatbot-info">
                <h4>SARTHI AI</h4>
                <div className="status-indicator">
                  <span className="dot"></span>
                  <span>Online Assistant</span>
                </div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages container */}
          <div className="chatbot-messages">
            {isInitializing ? (
              <div className="initializing">
                <div className="loader"></div>
                <p>Establishing secure link...</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className="message-container">
                    <div className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                      <div className="message-bubble">
                        <p>{msg.text}</p>
                        <span className="message-time">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="suggestions">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            className="suggestion-chip"
                            onClick={() => sendMessage(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="message bot-message">
                    <div className="message-bubble typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="How can I help you?..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isInitializing || isTyping}
            />
            <button
              className="send-button"
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isInitializing || isTyping}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

