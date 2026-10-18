import React from 'react';
import { portfolioData } from '../data/portfolioData';

export const NotesBanner: React.FC = () => {
  const { notes } = portfolioData;

  return (
    <section className="notes-section" id="notes">
      <div className="container">
        {/* Bold Oversized Section Heading Header */}
        <div className="section-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">NOTES &amp; IDEAS</span>
          </div>
          <h2 className="section-display-heading">{notes.sectionHeading}</h2>
        </div>

        <div className="notes-banner-card reveal-item delay-1">
          <div className="notes-meta-bar">
            <span className="notes-tag">{notes.tag}</span>
            <span className="notes-readtime">{notes.readTime}</span>
          </div>
          <h3 className="notes-title">
            <a href={notes.url} className="notes-link">
              {notes.title}
            </a>
          </h3>
        </div>
      </div>
    </section>
  );
};
