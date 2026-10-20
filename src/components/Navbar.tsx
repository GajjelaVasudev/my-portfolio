import React, { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Active section tracking
    const sectionIds = ['hero', 'about', 'work', 'experience', 'notes', 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  return (
    <header className={`navbar-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Left Side: Gajjela Vasudev | Software Engineer & Developer */}
        <a href="#hero" className="navbar-identity" aria-label="Gajjela Vasudev - Top of page">
          <span className="navbar-name">{portfolioData.personal.name}</span>
          <span className="navbar-identity-divider" aria-hidden="true">|</span>
          <span className="navbar-descriptor">{portfolioData.personal.descriptor}</span>
        </a>

        {/* Center / Navigation Links */}
        <nav className="navbar-nav" aria-label="Primary navigation">
          {portfolioData.navigation.map((link) => {
            const linkId = link.href.replace('#', '');
            const isActive = activeSection === linkId;

            return (
              <a
                key={link.label}
                href={link.href}
                className={`navbar-nav-item ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Clean Resume Action */}
        <div className="navbar-actions">
          <a
            href={portfolioData.personal.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-navbar-resume"
            aria-label="View Resume PDF (opens in new tab)"
          >
            <svg
              className="resume-doc-icon"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Resume</span>
            <span className="resume-arrow-icon" aria-hidden="true">↗</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Accessible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
          <nav className="mobile-nav-list">
            {portfolioData.navigation.map((link) => {
              const linkId = link.href.replace('#', '');
              const isActive = activeSection === linkId;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`mobile-nav-link ${isActive ? 'is-active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href={portfolioData.personal.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-navbar-resume mobile-resume-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Resume</span>
              <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
