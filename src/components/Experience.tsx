import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import { HackathonCarousel, type CarouselImage } from './HackathonCarousel';

import cfgTeamImg from '../assets/cfg_team.png';
import cfgPhotoboothImg from '../assets/cfg_photobooth.jpg';
import cfgOfficeImg from '../assets/cfg_office.png';

type ExperienceTab = 'hackathons' | 'internships';

export const Experience: React.FC = () => {
  const { experience } = portfolioData;
  const { hackathons, professional } = experience;
  const [activeTab, setActiveTab] = useState<ExperienceTab>('hackathons');

  const cfgImages: CarouselImage[] = [
    {
      src: cfgTeamImg,
      alt: 'Team 28 members standing together at JPMorgan Chase Code for Good 2026',
      caption: 'Team 28 at JPMorgan Chase Code for Good 2026'
    },
    {
      src: cfgPhotoboothImg,
      alt: 'Code for Good 19 & 20 September, 2026 photo booth keepsake strips',
      caption: 'Code for Good 2026 Photo Booth Keepsakes (Sept 19–20, 2026)'
    },
    {
      src: cfgOfficeImg,
      alt: 'JPMorgan Chase corporate office reception desk during Code for Good',
      caption: 'JPMorgan Chase event reception'
    }
  ];

  const featuredHackathon = hackathons.items.find((item) => item.isFeatured);
  const regularHackathons = hackathons.items.filter((item) => !item.isFeatured);

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
            id="tab-internships"
            aria-controls="panel-internships"
            aria-selected={activeTab === 'internships'}
            className={`exp-tab-btn ${activeTab === 'internships' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('internships')}
          >
            <span className="tab-label">Internships</span>
            <span className="tab-count-tag">{professional.items.length}</span>
          </button>
        </div>

        {/* Tab Panel: Dynamic Content Presentation */}
        <div
          role="tabpanel"
          id={activeTab === 'hackathons' ? 'panel-hackathons' : 'panel-internships'}
          aria-labelledby={activeTab === 'hackathons' ? 'tab-hackathons' : 'tab-internships'}
          className="experience-tab-panel"
          key={activeTab}
        >
          {activeTab === 'hackathons' ? (
            <div className="hackathons-content-wrap">
              {/* Featured Hackathon: JPMorgan Code for Good 2026 */}
              {featuredHackathon && (
                <article className="hackathon-featured-card">
                  <div className="hackathon-featured-grid">
                    {/* Left Column: Details */}
                    <div className="hackathon-featured-body">
                      {/* Meta Header with Runner-up Badge */}
                      <div className="exp-featured-badge-row">
                        <span className="exp-status-badge status--runner-up">
                          <span className="achievement-trophy" aria-hidden="true">🏆</span>
                          <span>{featuredHackathon.achievement || 'Runner-up — PS-2 Dharmalife'}</span>
                        </span>
                        <span className="exp-date-label">{featuredHackathon.date}</span>
                      </div>

                      {/* Headings */}
                      <div className="exp-featured-heading-wrap">
                        <div className="exp-event-name">
                          {featuredHackathon.event || featuredHackathon.name} • {featuredHackathon.team}
                        </div>
                        <h3 className="exp-featured-project-title">
                          {featuredHackathon.projectTitle}
                        </h3>
                        <span className="exp-featured-role">
                          {featuredHackathon.role} • Problem Statement 2 (Dharmalife)
                        </span>
                      </div>

                      {/* Narrative Description */}
                      <p className="exp-narrative-desc">{featuredHackathon.description}</p>

                      {/* Key Highlights */}
                      {featuredHackathon.technicalContributions && featuredHackathon.technicalContributions.length > 0 && (
                        <ul className="exp-highlights-list" aria-label="Key features and technical contributions">
                          {featuredHackathon.technicalContributions.map((contrib, idx) => (
                            <li key={idx} className="exp-highlight-item">
                              <span className="exp-bullet-symbol" aria-hidden="true">↳</span>
                              <span>{contrib}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Footer: Tech Stack & LinkedIn Post Link */}
                      <div className="exp-row-footer">
                        <div className="exp-tech-pills">
                          {featuredHackathon.technologies.map((tech) => (
                            <span key={tech} className="exp-tech-tag">
                              {tech}
                            </span>
                          ))}
                        </div>

                        {featuredHackathon.actionUrl && (
                          <a
                            href={featuredHackathon.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exp-action-link exp-linkedin-link"
                            aria-label="View JPMorgan Code for Good 2026 LinkedIn post in a new tab"
                          >
                            <span>{featuredHackathon.actionText || 'View LinkedIn post ↗'}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Column: 3-Photo Carousel */}
                    <div className="hackathon-featured-media">
                      <HackathonCarousel images={cfgImages} />
                    </div>
                  </div>
                </article>
              )}

              {/* Secondary Hackathon Rows (e.g. Smart India Hackathon) */}
              {regularHackathons.length > 0 && (
                <div className="experience-rows-list">
                  {regularHackathons.map((item) => (
                    <article key={item.id} className="experience-row">
                      <div className="exp-row-meta">
                        <span className="exp-date-label">{item.date}</span>
                        <span className={`exp-status-badge status--${item.status.toLowerCase()}`}>
                          <span className="status-dot-indicator" aria-hidden="true" />
                          <span>{item.status}</span>
                        </span>
                      </div>

                      <div className="exp-row-content">
                        <div className="exp-row-heading-wrap">
                          <h4 className="exp-entity-name">{item.name}</h4>
                          <span className="exp-role-title">
                            {item.role} {item.projectTitle ? `• ${item.projectTitle}` : ''}
                          </span>
                        </div>

                        <p className="exp-narrative-desc">{item.description}</p>

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

                        {item.teamworkHighlight && (
                          <div className="exp-teamwork-strip">
                            <span className="teamwork-prefix">COLLABORATION:</span>{' '}
                            <span>{item.teamworkHighlight}</span>
                          </div>
                        )}

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
              )}
            </div>
          ) : (
            /* Internships Tab Panel */
            professional.items.length === 0 ? (
              <div className="experience-empty-state">
                <div className="empty-state-card">
                  <span className="empty-state-pill">TRAJECTORY // EDUCATION & EXPLORATION</span>
                  <h4 className="empty-state-title">No internships added yet</h4>
                  <p className="empty-state-desc">
                    Currently focused on computer science coursework, hackathons, and software engineering projects. Open to software engineering and backend development internship opportunities.
                  </p>
                </div>
              </div>
            ) : (
              <div className="experience-rows-list">
                {professional.items.map((item) => (
                  <article key={item.id} className="experience-row">
                    <div className="exp-row-meta">
                      <span className="exp-date-label">{item.period}</span>
                      {item.location && (
                        <span className="exp-location-tag">{item.location}</span>
                      )}
                    </div>

                    <div className="exp-row-content">
                      <div className="exp-row-heading-wrap">
                        <h4 className="exp-entity-name">{item.organization}</h4>
                        <span className="exp-role-title">{item.role}</span>
                      </div>

                      <p className="exp-narrative-desc">{item.description}</p>

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
            )
          )}
        </div>
      </div>
    </section>
  );
};
