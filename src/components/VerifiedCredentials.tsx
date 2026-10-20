import React from 'react';
import { portfolioData } from '../data/portfolioData';

export const VerifiedCredentials: React.FC = () => {
  const { credentials } = portfolioData;

  return (
    <section className="credentials-section" id="credentials">
      <div className="container">
        {/* Bold Oversized Section Heading Header */}
        <div className="section-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">{credentials.kicker}</span>
          </div>
          <h2 className="section-display-heading">{credentials.sectionHeading}</h2>
          <p className="section-narrative">
            {credentials.supportingLine}
          </p>
        </div>

        {/* Clean Editorial Credentials List */}
        <div className="credentials-list">
          {credentials.items.map((cred) => (
            <article key={cred.id} className="credential-row reveal-item">
              {/* Left Column: Category */}
              <div className="credential-meta">
                <span className="credential-category">{cred.category}</span>
              </div>

              {/* Right Column: Name, Level Badge & Action Link */}
              <div className="credential-content">
                <div className="credential-info">
                  <div className="credential-name-row">
                    <h3 className="credential-name">{cred.name}</h3>
                    {cred.level && (
                      <span className="credential-level-badge">
                        LEVEL {cred.level}
                      </span>
                    )}
                  </div>
                </div>

                {cred.verificationUrl && (
                  <div className="credential-action-wrap">
                    <a
                      href={cred.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="credential-verify-link"
                      aria-label={`View ${cred.name} credential`}
                    >
                      <span>View Credential</span>
                      <svg
                        className="credential-link-icon"
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
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
