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
  "Explore Vasudev's projects",
  "What technologies does he use?",
  "Tell me about his hackathon experience"
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

function formatSourceName(src: SourceReference): string {
  if (src.section_title && src.section_title.trim().length > 0) {
    return src.section_title.replace(/^#+\s*/, '').trim();
  }
  const base = src.file_name.split('/').pop()?.replace(/\.md$/i, '') || '';
  return base
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const renderInlineTokens = (text: string): React.ReactNode => {
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="chat-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
};

const renderFormattedText = (text: string): React.ReactNode => {
  const blocks = text.split(/\n{2,}/);

  return blocks.map((block, blockIdx) => {
    const lines = block.split('\n');

    const isList = lines.length > 0 && lines.every((line) => /^[\s]*[-*•]\s+/.test(line));
    if (isList) {
      return (
        <ul key={blockIdx} className="chat-markdown-list">
          {lines.map((line, lineIdx) => {
            const cleanLine = line.replace(/^[\s]*[-*•]\s+/, '');
            return <li key={lineIdx}>{renderInlineTokens(cleanLine)}</li>;
          })}
        </ul>
      );
    }

    const headingMatch = block.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      return (
        <h4 key={blockIdx} className="chat-markdown-heading">
          {renderInlineTokens(headingMatch[2])}
        </h4>
      );
    }

    return (
      <p key={blockIdx} className="chat-markdown-paragraph">
        {lines.map((line, lineIdx) => (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {renderInlineTokens(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });
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
        "Hi! Curious about Vasudev's work? Ask me about his projects, technical skills, or hackathon experience."
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
          aria-label={isOpen ? 'Close Leo assistant' : "Ask Leo — Your guide to Vasudev's projects, skills, and experience"}
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
          aria-label="Leo — Your guide to Vasudev's projects, skills, and experience"
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
                <h2 className="header-app-name">Leo</h2>
                <p className="header-app-desc">Your guide to Vasudev's projects, skills, and experience.</p>
              </div>
            </div>
            <button
              type="button"
              className="assistant-panel-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Leo assistant"
              title="Close Leo assistant"
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
            {messages.map((msg) => {
              const uniqueSources =
                msg.sources && msg.sources.length > 0
                  ? Array.from(new Set(msg.sources.map(formatSourceName).filter(Boolean)))
                  : [];

              return (
                <div key={msg.id} className={`chat-message-row is-${msg.role}`}>
                  <div className={`chat-bubble ${msg.isError ? 'chat-error-card' : ''}`}>
                    <div className="chat-bubble-content">
                      {msg.role === 'assistant' && !msg.isError
                        ? renderFormattedText(msg.content)
                        : msg.content}
                    </div>

                    {/* Subtle inline source names without cards, paths, or boxes */}
                    {uniqueSources.length > 0 && (
                      <div className="chat-sources-inline" aria-label="Reference sources">
                        <span className="sources-inline-label">Sources:</span> {uniqueSources.join(' · ')}
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
              );
            })}

            {/* Suggested Question Rows (shown before conversation starts) */}
            {messages.length <= 1 && !isLoading && (
              <div className="suggested-questions-box">
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
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="assistant-typing-indicator" aria-label="Leo is responding">
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
                  placeholder="Ask about Vasudev's work…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isLoading}
                  maxLength={500}
                  aria-label="Ask about Vasudev's work"
                />
                <button
                  type="submit"
                  className="assistant-send-btn"
                  disabled={isLoading || !query.trim()}
                  aria-label="Send message"
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
              Answers about Vasudev's work and experience
            </div>
          </footer>
        </section>
      )}
    </>
  );
};
