import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';

type ExperienceTab = 'hackathons' | 'experience';

export const Experience: React.FC = () => {
  const { experience } = portfolioData;
  const { hackathons, professional } = experience;
  const [activeTab, setActiveTab] = useState<ExperienceTab>('hackathons');

  return (
    <section className="experience-section" id="experience">
      <div className="container">
        {/* Bold Oversized Section Heading Header */}
        <div className="section-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">{experience.kicker}</span>
          </div>
          <h2 className="section-display-heading">{experience.sectionHeading}</h2>
          <p className="section-narrative">
            {experience.supportingLine}
          </p>
        </div>

        {/* Minimal Interactive Segmented Text Tabs */}
        <div
          className="experience-tabs-bar reveal-item"
          role="tablist"
          aria-label="Experience Categories"
        >
          <button
            type="button"
            role="tab"
            id="tab-hackathons"
            aria-controls="panel-hackathons"
            aria-selected={activeTab === 'hackathons'}
            className={`exp-tab-btn ${activeTab === 'hackathons' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('hackathons')}
          >
            <span className="tab-label">Hackathons</span>
            <span className="tab-count-tag">{hackathons.items.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-experience"
            aria-controls="panel-experience"
            aria-selected={activeTab === 'experience'}
            className={`exp-tab-btn ${activeTab === 'experience' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <span className="tab-label">Experience</span>
            <span className="tab-count-tag">{professional.items.length}</span>
          </button>
        </div>

        {/* Tab Panel: Dynamic Content Presentation */}
        <div
          role="tabpanel"
          id={activeTab === 'hackathons' ? 'panel-hackathons' : 'panel-experience'}
          aria-labelledby={activeTab === 'hackathons' ? 'tab-hackathons' : 'tab-experience'}
          className="experience-tab-panel"
          key={activeTab}
        >
          {activeTab === 'hackathons' ? (
            <div className="experience-rows-list">
              {hackathons.items.map((item) => (
                <article key={item.id} className="experience-row">
                  {/* Meta Column: Date & Status Badge */}
                  <div className="exp-row-meta">
                    <span className="exp-date-label">{item.date}</span>
                    <span className={`exp-status-badge status--${item.status.toLowerCase()}`}>
                      <span className="status-dot-indicator" aria-hidden="true" />
                      <span>{item.status}</span>
                    </span>
                  </div>

                  {/* Content Column */}
                  <div className="exp-row-content">
                    <div className="exp-row-heading-wrap">
                      <h4 className="exp-entity-name">{item.name}</h4>
                      <span className="exp-role-title">
                        {item.role} {item.projectTitle ? `• ${item.projectTitle}` : ''}
                      </span>
                    </div>

                    <p className="exp-narrative-desc">{item.description}</p>

                    {/* Technical Contributions */}
                    {item.technicalContributions && item.technicalContributions.length > 0 && (
                      <ul className="exp-highlights-list" aria-label="Technical contributions">
                        {item.technicalContributions.map((contrib, idx) => (
                          <li key={idx} className="exp-highlight-item">
                            <span className="exp-bullet-symbol" aria-hidden="true">↳</span>
                            <span>{contrib}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Teamwork Highlight */}
                    {item.teamworkHighlight && (
                      <div className="exp-teamwork-strip">
                        <span className="teamwork-prefix">COLLABORATION:</span>{' '}
                        <span>{item.teamworkHighlight}</span>
                      </div>
                    )}

                    {/* Footer: Tech Stack & Repository / Demo Link */}
                    <div className="exp-row-footer">
                      <div className="exp-tech-pills">
                        {item.technologies.map((tech) => (
                          <span key={tech} className="exp-tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>

                      {item.actionUrl && item.actionText && (
                        <a
                          href={item.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="exp-action-link"
                          aria-label={`View ${item.name} project`}
                        >
                          <span>{item.actionText.replace('↗', '').trim()}</span>
                          <span className="exp-link-arrow" aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="experience-rows-list">
              {professional.items.map((item) => (
                <article key={item.id} className="experience-row">
                  {/* Meta Column: Period & Location */}
                  <div className="exp-row-meta">
                    <span className="exp-date-label">{item.period}</span>
                    {item.location && (
                      <span className="exp-location-tag">{item.location}</span>
                    )}
                  </div>

                  {/* Content Column */}
                  <div className="exp-row-content">
                    <div className="exp-row-heading-wrap">
                      <h4 className="exp-entity-name">{item.organization}</h4>
                      <span className="exp-role-title">{item.role}</span>
                    </div>

                    <p className="exp-narrative-desc">{item.description}</p>

                    {/* Core Responsibilities */}
                    {item.responsibilities && item.responsibilities.length > 0 && (
                      <ul className="exp-highlights-list" aria-label="Key responsibilities">
                        {item.responsibilities.map((resp, idx) => (
                          <li key={idx} className="exp-highlight-item">
                            <span className="exp-bullet-symbol" aria-hidden="true">↳</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Footer: Tech Stack & Links */}
                    <div className="exp-row-footer">
                      <div className="exp-tech-pills">
                        {item.technologies.map((tech) => (
                          <span key={tech} className="exp-tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>

                      {item.actionUrl && item.actionText && (
                        <a
                          href={item.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="exp-action-link"
                          aria-label={`View details for ${item.organization}`}
                        >
                          <span>{item.actionText.replace('↗', '').trim()}</span>
                          <span className="exp-link-arrow" aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
