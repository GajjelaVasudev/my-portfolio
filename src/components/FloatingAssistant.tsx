import React, { useState, useRef, useEffect } from 'react';

interface SourceReference {
  file_name: string;
  section_title: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceReference[];
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What is Vasudev's core tech stack?",
  "Tell me about the Smart India Hackathon project",
  "What microservices projects has he built?",
  "What practical backend experience does he have?"
];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

let messageSequence = 0;
const createMessageId = (prefix: string): string => {
  messageSequence += 1;
  return `${prefix}-${messageSequence}`;
};

export const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createMessageId('init'),
      role: 'assistant',
      content:
        "Hello! I am Vasudev's portfolio assistant. I can answer questions about his distributed systems projects, core technical stack, hackathon solutions, and professional experience grounded in his verified knowledge files. What would you like to know?"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: text
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLastFailedQuery(null);
    setIsLoading(true);

    // Prepare session history for context
    const historyPayload = messages
      .filter((m) => !m.isError)
      .slice(-4)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: text,
          history: historyPayload
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded (too many queries). Please wait a minute before asking again.');
        }
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: createMessageId('asst'),
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error && err.message.includes('Failed to fetch')
          ? `Could not connect to the RAG backend server at ${API_BASE_URL}. Please verify that the FastAPI backend is running (python -m uvicorn backend.main:app --port 8000), or reach out directly to Vasudev at gajjelavasudev@gmail.com.`
          : err instanceof Error
          ? err.message
          : 'An unexpected connection error occurred. Please try again.';

      setLastFailedQuery(text);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId('err'),
          role: 'assistant',
          content: errorMsg,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="floating-assistant-launcher">
        <span className="assistant-launcher-label">Ask Vasudev AI</span>
        <button
          type="button"
          className="assistant-btn-circle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close assistant' : 'Ask Vasudev AI assistant'}
          aria-expanded={isOpen}
        >
          <span className="assistant-status-dot-pulse" aria-hidden="true" />
          {isOpen ? (
            <svg
              className="assistant-launcher-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              className="assistant-launcher-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M9.5 9h.01" />
              <path d="M14.5 9h.01" />
            </svg>
          )}
        </button>
      </div>

      {/* Floating Chat Panel */}
      {isOpen && (
        <section
          className="floating-assistant-panel"
          role="dialog"
          aria-label="Portfolio AI Assistant"
        >
          {/* Panel Header */}
          <header className="assistant-panel-header">
            <div className="header-info-wrap">
              <span className="header-status-indicator" aria-hidden="true" />
              <div className="header-title-block">
                <span className="header-app-name">Vasudev Assistant</span>
                <span className="header-app-desc">RAG Verified // Knowledge Base</span>
              </div>
            </div>
            <button
              type="button"
              className="assistant-panel-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant panel"
            >
              ✕
            </button>
          </header>

          {/* Messages Area */}
          <div className="assistant-messages-container" role="log" aria-live="polite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row is-${msg.role}`}
              >
                <div className={`chat-bubble ${msg.isError ? 'chat-error-card' : ''}`}>
                  <span>{msg.content}</span>

                  {/* Sources References */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources-strip">
                      <span className="source-strip-label">Verified Sources:</span>
                      {msg.sources.map((src, idx) => (
                        <span key={idx} className="source-citation-pill">
                          <span aria-hidden="true">↳</span>
                          <span>{src.file_name} // {src.section_title}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Retry Action if Error */}
                  {msg.isError && lastFailedQuery && (
                    <button
                      type="button"
                      className="error-retry-btn"
                      onClick={() => handleSendMessage(lastFailedQuery)}
                    >
                      ↻ Retry Query
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Suggested Question Chips (Only shown if less than 3 messages) */}
            {messages.length <= 2 && !isLoading && (
              <div className="suggested-questions-box">
                <span className="suggested-label">Suggested Questions:</span>
                <div className="suggested-chips-list">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="suggested-chip-btn"
                      onClick={() => handleSendMessage(q)}
                    >
                      {q} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="assistant-typing-indicator" aria-label="Assistant is searching knowledge base">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Panel Footer */}
          <footer className="assistant-panel-footer">
            <form className="assistant-input-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="assistant-query-input"
                placeholder="Ask about projects, skills, SIH hackathon..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
                maxLength={500}
                aria-label="Your inquiry for the portfolio assistant"
              />
              <button
                type="submit"
                className="assistant-send-btn"
                disabled={isLoading || !query.trim()}
                aria-label="Send inquiry"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
            <div className="assistant-footer-disclaimer">
              Grounded strictly in Vasudev's verified knowledge files.
            </div>
          </footer>
        </section>
      )}
    </>
  );
};
