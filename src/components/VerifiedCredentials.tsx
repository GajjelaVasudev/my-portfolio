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
              {/* Left Column: Issuer & Date */}
              <div className="credential-meta">
                <span className="credential-issuer">{cred.issuer}</span>
                <span className="credential-date">{cred.issueDate}</span>
              </div>

              {/* Right Column: Name, ID & Link */}
              <div className="credential-content">
                <div className="credential-info">
                  <h3 className="credential-name">{cred.name}</h3>
                  {cred.credentialId && (
                    <span className="credential-id-badge">
                      ID: {cred.credentialId}
                    </span>
                  )}
                </div>

                {cred.verificationUrl && (
                  <div className="credential-action-wrap">
                    <a
                      href={cred.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="credential-verify-link"
                      aria-label={`Verify ${cred.name} credential`}
                    >
                      <span>{cred.actionText ? cred.actionText.replace('↗', '').trim() : 'View Credential'}</span>
                      <span className="credential-link-arrow" aria-hidden="true">↗</span>
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
