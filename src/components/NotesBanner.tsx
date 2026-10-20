import React, { useState, useEffect, useCallback, useRef } from 'react';
import { portfolioData, type NoteItem } from '../data/portfolioData';

export const NotesBanner: React.FC = () => {
  const { notes } = portfolioData;
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const triggerRefMap = useRef<Record<string, HTMLElement | null>>({});

  const activeNote = notes.items.find((n) => n.id === activeNoteId);

  const handleOpenNote = (note: NoteItem) => {
    setActiveNoteId(note.id);
  };

  const handleClose = useCallback(() => {
    const prevId = activeNoteId;
    setActiveNoteId(null);
    if (prevId && triggerRefMap.current[prevId]) {
      triggerRefMap.current[prevId]?.focus();
    }
  }, [activeNoteId]);

  // Handle Escape key and body scroll locking
  useEffect(() => {
    if (!activeNoteId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeNoteId, handleClose]);

  return (
    <section className="notes-section" id="notes">
      <div className="container">
        {/* Bold Editorial Section Heading */}
        <div className="section-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">{notes.kicker}</span>
          </div>
          <h2 className="section-display-heading">{notes.sectionHeading}</h2>
          {notes.supportingLine && (
            <p className="section-narrative">{notes.supportingLine}</p>
          )}
        </div>

        {/* 3-Column Responsive Editorial Notes Grid */}
        <div className="notes-grid">
          {notes.items.map((item, index) => (
            <article
              key={item.id}
              ref={(el) => {
                triggerRefMap.current[item.id] = el;
              }}
              className={`note-card reveal-item delay-${index + 1}`}
              onClick={() => handleOpenNote(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenNote(item);
                }
              }}
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-expanded={activeNoteId === item.id}
              aria-label={`Read note: ${item.title}`}
            >
              {/* Card Meta Bar */}
              <div className="note-card-meta">
                <span className="note-category-pill">
                  {item.number} • {item.category}
                </span>
                <span className="note-readtime-tag">{item.readTime}</span>
              </div>

              {/* Note Title */}
              <h3 className="note-card-title">{item.title}</h3>

              {/* Short Preview */}
              <p className="note-card-preview">{item.preview}</p>

              {/* Card Bottom Indicator */}
              <div className="note-card-footer">
                <span className="note-expand-prompt">
                  <span>Read full note</span>
                  <span className="note-expand-icon" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Expanded Note Modal Enlargement Overlay */}
      {activeNote && (
        <div
          className="note-overlay-backdrop"
          onClick={handleClose}
          role="presentation"
        >
          <div
            className="note-expanded-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`note-dialog-title-${activeNote.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="note-dialog-header">
              <div className="note-dialog-meta">
                <span className="note-category-pill">
                  {activeNote.number} • {activeNote.category}
                </span>
                <span className="note-readtime-tag">{activeNote.readTime}</span>
              </div>

              <button
                type="button"
                className="note-close-btn"
                onClick={handleClose}
                aria-label="Close note"
                autoFocus
              >
                <svg
                  width="18"
                  height="18"
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
            </div>

            {/* Dialog Content Area */}
            <div className="note-dialog-body">
              <h3
                id={`note-dialog-title-${activeNote.id}`}
                className="note-dialog-title"
              >
                {activeNote.title}
              </h3>

              {/* Expanded Paragraphs */}
              <div className="note-dialog-text">
                {activeNote.paragraphs.map((p, idx) => (
                  <p key={idx} className="note-paragraph">
                    {p}
                  </p>
                ))}

                {activeNote.listHeader && (
                  <div className="note-questions-block">
                    <p className="note-questions-header">
                      {activeNote.listHeader}
                    </p>
                    <ul className="note-questions-list">
                      {activeNote.listItems?.map((itemText, idx) => (
                        <li key={idx} className="note-question-item">
                          <span className="note-question-bullet" aria-hidden="true">
                            ↳
                          </span>
                          <span>{itemText}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeNote.conclusion && (
                  <p className="note-conclusion-paragraph">
                    {activeNote.conclusion}
                  </p>
                )}
              </div>
            </div>

            {/* Dialog Footer with Tags */}
            <div className="note-dialog-footer">
              <span className="note-tags-label">Tags</span>
              <div className="note-tags-list">
                {activeNote.tags.map((tag) => (
                  <span key={tag} className="note-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default NotesBanner;
