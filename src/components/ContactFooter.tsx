import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';

export const ContactFooter: React.FC = () => {
  const { contact, personal, navigation } = portfolioData;
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(personal.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }).catch(() => {
      window.location.href = `mailto:${personal.email}`;
    });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="contact-footer" id="contact">
      <div className="container">
        {/* Bold Oversized Section Heading Header: LET'S TALK */}
        <div className="footer-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">CONTACT &amp; COLLABORATION</span>
          </div>
          <h2 className="section-display-heading">{contact.sectionHeading}</h2>
          <p className="footer-narrative">
            {contact.headline.lead}{' '}
            <span className="serif-italic">{contact.headline.italic}</span>
            {contact.headline.trail}
          </p>
        </div>

        {/* Spacious Multi-Column Layout */}
        <div className="footer-columns-grid">
          {/* Column 1: Identity & Natural Description */}
          <div className="footer-identity-col reveal-item delay-1">
            <a href="#hero" className="footer-brand-link" aria-label="Gajjela Vasudev - Top of page">
              <span className="footer-brand-name">{personal.name}</span>
            </a>
            <p className="footer-brand-desc">
              {personal.footerBio}
            </p>

            {/* Direct Email Action Box */}
            <div className="footer-email-box">
              <a
                href={`mailto:${personal.email}`}
                className="footer-email-address"
                aria-label={`Send email to ${personal.email}`}
              >
                {personal.email}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-copy-email"
                aria-label="Copy email address"
              >
                {copied ? (
                  <span className="copy-status-text">✓ Copied</span>
                ) : (
                  <>
                    <svg className="copy-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Simple Navigation Links */}
          <div className="footer-nav-col reveal-item delay-2">
            <span className="footer-col-heading">Navigation</span>
            <ul className="footer-links-list">
              <li>
                <a href="#hero" className="footer-text-link">Home</a>
              </li>
              {navigation.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="footer-text-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social & Professional Links */}
          <div className="footer-connect-col reveal-item delay-3">
            <span className="footer-col-heading">Connect</span>
            <ul className="footer-links-list">
              <li>
                <a
                  href={personal.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-text-link"
                >
                  <span>GitHub</span>
                  <span className="footer-link-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={personal.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-text-link"
                >
                  <span>LinkedIn</span>
                  <span className="footer-link-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={personal.resumeUrl}
                  className="footer-text-link"
                >
                  <span>Resume PDF</span>
                  <span className="footer-link-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Restrained Bottom Row: Divider, Copyright & Back to Top */}
        <div className="footer-bottom-row">
          <span className="footer-copyright-text">
            © {personal.year} {personal.name}. All rights reserved.
          </span>

          <button
            type="button"
            onClick={handleScrollToTop}
            className="footer-back-to-top"
            aria-label="Scroll back to top of page"
          >
            <span>Back to top</span>
            <span className="top-arrow" aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
