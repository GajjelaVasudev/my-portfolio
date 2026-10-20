import React, { useRef, useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import { ProjectCard } from './ProjectCard';

import nxtgenImg from '../assets/project_nxtgen.png';
import webinarImg from '../assets/project_webinar.png';

export const SelectedWork: React.FC = () => {
  const { featuredProject, gridProjects } = portfolioData;
  const terminalRef = useRef<HTMLDivElement>(null);
  const [endpointCopied, setEndpointCopied] = useState(false);

  const projectImages: Record<string, string | undefined> = {
    '02': undefined, // Deliberate minimal placeholder for active development; swap with image reference when ready
    '03': webinarImg
  };

  // Restrained 3D tilt interaction for terminal preview
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !terminalRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3.5;
    const rotateY = ((x - centerX) / centerX) * 3.5;

    terminalRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
  };

  const handleMouseLeave = () => {
    if (!terminalRef.current) return;
    terminalRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  };

  const handleCopyEndpoint = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('https://nxt-gen-lms.vercel.app').then(() => {
      setEndpointCopied(true);
      setTimeout(() => setEndpointCopied(false), 2200);
    });
  };

  return (
    <section className="selected-work-section" id="work">
      <div className="container">
        {/* Bold Oversized Section Heading Header */}
        <div className="section-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">WHAT I DO</span>
          </div>

          <h2 className="section-display-heading">SELECTED WORK</h2>

          <p className="section-narrative">
            Systems built with intent, <span className="serif-italic">care</span>, and precision.
          </p>

          <p className="section-subtitle">
            A selection of projects exploring role-based learning workflows, scalable backend architectures, and full-stack event platforms.
          </p>
        </div>

        {/* Featured Architecture (#01) Card */}
        <div className="featured-card reveal-item">
          <div className="featured-grid">
            {/* Left Content Column */}
            <div className="featured-content">
              {/* Badge & Status Pill Header */}
              <div className="featured-meta-row">
                <span className="featured-tag">{featuredProject.category}</span>
                <span className="status-pill">
                  <span className="status-dot" aria-hidden="true" />
                  {featuredProject.metricLabel.replace('• ', '')}
                </span>
              </div>

              {/* Title & Tech */}
              <h3 className="featured-title">{featuredProject.title}</h3>
              <div className="featured-tech">
                {featuredProject.tech.join(' • ')}
              </div>

              {/* Description */}
              <p className="featured-description">
                {featuredProject.description}
              </p>

              {/* Architecture Feature Tree List */}
              {featuredProject.bullets && (
                <ul className="featured-bullets" aria-label="Key architectural features">
                  {featuredProject.bullets.map((bullet, idx) => (
                    <li key={idx} className="bullet-item">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {/* Action Buttons: Live Demo & GitHub */}
              <div className="featured-actions-group">
                {featuredProject.liveUrl && (
                  <a
                    href={featuredProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-inspect btn-live-action"
                    aria-label={`Visit ${featuredProject.title} live demo`}
                  >
                    LIVE DEMO <span className="action-arrow" aria-hidden="true">↗</span>
                  </a>
                )}
                {featuredProject.githubUrl && (
                  <a
                    href={featuredProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-inspect btn-secondary-action"
                    aria-label={`View ${featuredProject.title} GitHub repository`}
                  >
                    GITHUB REPO <span className="action-arrow" aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Mockup Column with Subtle Interactive Depth */}
            <div
              className="featured-preview"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              data-cursor="view"
            >
              <div
                ref={terminalRef}
                className="terminal-window"
                data-cursor="view"
              >
                {/* Window Title Bar with Copyable Endpoint */}
                <div className="terminal-bar">
                  <div className="terminal-dots" aria-hidden="true">
                    <span className="dot dot-close" />
                    <span className="dot dot-minimize" />
                    <span className="dot dot-expand" />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEndpoint}
                    className="terminal-title-btn"
                    title="Click to copy deployment URL"
                    aria-label="Click to copy deployment URL"
                  >
                    nxt-gen-lms.vercel.app
                    {endpointCopied && (
                      <span className="endpoint-tooltip" role="status">
                        ✓ Copied
                      </span>
                    )}
                  </button>
                  <div className="terminal-badge">
                    VERCEL LIVE
                  </div>
                </div>

                {/* Dashboard Screenshot Preview */}
                <a
                  href={featuredProject.liveUrl || featuredProject.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terminal-screen-link"
                  aria-label={`Visit ${featuredProject.title} live demo`}
                  data-cursor="view"
                >
                  <div className="terminal-screen" data-cursor="view">
                    <img
                      src={nxtgenImg}
                      alt={featuredProject.imageAlt}
                      className="terminal-preview-img terminal-image"
                      loading="lazy"
                    />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid for Projects #02 and #03 */}
        <div className="projects-grid">
          {gridProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              imageSrc={projectImages[project.id]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
