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
  "Explore my projects",
  "My technical skills",
  "My hackathon experience"
];

const DEPLOYED_BACKEND_URL = 'https://portfolio-rag-backend-vkq8.onrender.com';

const rawApiUrl =
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.PROD ? DEPLOYED_BACKEND_URL : 'http://localhost:8000');

const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

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
        "Hey, welcome! Curious about my projects, technical skills, hackathons, or experience? Ask away, and I'll help you explore."
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
          ? `Could not connect to the assistant backend service at ${API_BASE_URL}. Please try again shortly or reach out directly to Vasudev at gajjelavasudev@gmail.com.`
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
      <div className={`floating-assistant-launcher ${isOpen ? 'is-panel-open' : ''}`}>
        <button
          type="button"
          className={`assistant-launcher-btn ${isOpen ? 'is-open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Leo assistant' : "Ask Leo — Vasudev's Personal Assistant"}
          aria-expanded={isOpen}
          aria-controls="leo-assistant-dialog"
        >
          <svg
            className="assistant-launcher-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h.01" />
            <path d="M12 10h.01" />
            <path d="M16 10h.01" />
          </svg>
          <span className="assistant-launcher-label">Ask Leo</span>
        </button>
      </div>

      {/* Floating Chat Panel */}
      {isOpen && (
        <section
          id="leo-assistant-dialog"
          className="floating-assistant-panel"
          role="dialog"
          aria-label="Vasudev's Personal Assistant"
        >
          {/* Panel Header */}
          <header className="assistant-panel-header">
            <div className="header-info-wrap">
              <div className="header-icon-badge" aria-hidden="true">
                <svg
                  className="header-chat-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M16 10h.01" />
                </svg>
              </div>
              <div className="header-title-block">
                <h2 className="header-app-name">Vasudev's Personal Assistant</h2>
                <p className="header-app-desc">Your guide to my projects, skills and experience.</p>
              </div>
            </div>
            <button
              type="button"
              className="assistant-panel-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              title="Close assistant"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
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
                  <span className="chat-bubble-text">{msg.content}</span>

                  {/* Sources References as Structured Source Cards */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources-strip">
                      <span className="source-strip-label">Verified Sources</span>
                      <div className="source-cards-list">
                        {msg.sources.map((src, idx) => (
                          <div key={idx} className="source-citation-card">
                            <span className="source-accent-dot" aria-hidden="true" />
                            <div className="source-card-text">
                              <span className="source-card-file">{src.file_name}</span>
                              {src.section_title && (
                                <span className="source-card-section">{src.section_title}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Retry Action if Error */}
                  {msg.isError && lastFailedQuery && (
                    <button
                      type="button"
                      className="error-retry-btn"
                      onClick={() => handleSendMessage(lastFailedQuery)}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                      <span>Retry Question</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Suggested Question Chips (Only shown if <= 2 messages) */}
            {messages.length <= 2 && !isLoading && (
              <div className="suggested-questions-box">
                <span className="suggested-label">Suggested Questions</span>
                <div className="suggested-chips-list">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="suggested-chip-btn"
                      onClick={() => handleSendMessage(q)}
                    >
                      <span className="chip-text">{q}</span>
                      <svg
                        className="chip-arrow"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="assistant-typing-indicator" aria-label="Leo is searching knowledge base">
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
              <div className="assistant-input-field-wrap">
                <input
                  ref={inputRef}
                  type="text"
                  className="assistant-query-input"
                  placeholder="Ask Leo about projects, skills, or experience..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isLoading}
                  maxLength={500}
                  aria-label="Ask Leo a question"
                />
                <button
                  type="submit"
                  className="assistant-send-btn"
                  disabled={isLoading || !query.trim()}
                  aria-label="Send question"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
            <div className="assistant-footer-disclaimer">
              Grounded in Vasudev's verified portfolio knowledge base.
            </div>
          </footer>
        </section>
      )}
    </>
  );
};
