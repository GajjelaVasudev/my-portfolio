import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';

const CONTACT_EMAIL = 'vgajjella@gmail.com';
const CURRENT_YEAR = new Date().getFullYear();

export const ContactFooter: React.FC = () => {
  const { contact, personal } = portfolioData;
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = CONTACT_EMAIL;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerNavLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Selected Work', href: '#work' },
    { label: 'Experience', href: '#experience' },
    { label: 'Notes', href: '#notes' },
    { label: 'Contact', href: '#contact' },
  ];

  const footerConnectLinks = [
    {
      label: 'GitHub',
      href: personal.githubUrl || 'https://github.com/GajjelaVasudev',
      isExternal: true,
    },
    {
      label: 'LinkedIn',
      href: personal.linkedinUrl || 'https://linkedin.com/in/gajjelavasudev',
      isExternal: true,
    },
    {
      label: 'Resume PDF',
      href: personal.resumeUrl || '#resume',
      isExternal: Boolean(
        personal.resumeUrl &&
          (personal.resumeUrl.startsWith('http') || personal.resumeUrl.endsWith('.pdf'))
      ),
    },
  ];

  return (
    <footer className="contact-footer" id="contact">
      <div className="container">
        {/* Top Header Block: Eyebrow, Heading, and Subtitle */}
        <div className="footer-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">CONTACT &amp; COLLABORATION</span>
          </div>
          <h2 className="section-display-heading footer-heading">
            {contact.sectionHeading || "LET'S TALK"}
          </h2>
          <p className="footer-narrative">
            Have an idea? Let's build something{' '}
            <span className="serif-italic">meaningful</span>.
          </p>
        </div>

        {/* 3-Column Balanced Layout */}
        <div className="footer-columns-grid">
          {/* Column 1: About and Contact */}
          <div className="footer-identity-col reveal-item delay-1">
            <a
              href="#hero"
              className="footer-brand-link"
              aria-label="Gajjela Vasudev - Top of page"
            >
              <span className="footer-brand-name">Gajjela Vasudev</span>
            </a>
            <p className="footer-brand-desc">
              Computer Science student and aspiring software engineer focused on
              building reliable backend systems, thoughtful web applications, and
              practical software solutions.
            </p>

            {/* Direct Email Action Box with Copy Control */}
            <div className="footer-email-box">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="footer-email-address"
                aria-label={`Send email to ${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-copy-email"
                aria-label="Copy email address vgajjella@gmail.com to clipboard"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <svg
                      className="copy-icon"
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
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="copy-status-text">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="copy-icon"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="footer-nav-col reveal-item delay-2">
            <span className="footer-col-heading">Navigation</span>
            <ul className="footer-links-list">
              {footerNavLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="footer-text-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="footer-connect-col reveal-item delay-3">
            <span className="footer-col-heading">Connect</span>
            <ul className="footer-links-list">
              {footerConnectLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    className="footer-text-link"
                    aria-label={
                      item.isExternal
                        ? `${item.label} profile (opens in a new tab)`
                        : item.label
                    }
                  >
                    <span>{item.label}</span>
                    <span className="footer-link-icon-wrap" aria-hidden="true">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Divider, Copyright & Back to Top */}
        <div className="footer-bottom-row">
          <span className="footer-copyright-text">
            © {CURRENT_YEAR} {personal.name}. All rights reserved.
          </span>

          <button
            type="button"
            onClick={handleScrollToTop}
            className="footer-back-to-top"
            aria-label="Scroll back to top of page"
          >
            <span>Back to top</span>
            <span className="top-arrow-icon-wrap" aria-hidden="true">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooter;
