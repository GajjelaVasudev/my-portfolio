import React from 'react';
import { portfolioData } from '../data/portfolioData';

export const AboutPhilosophy: React.FC = () => {
  const { about } = portfolioData;

  return (
    <section className="about-section" id="about">
      <div className="container">
        {/* Bold Oversized Section Heading Header */}
        <div className="section-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">BACKGROUND &amp; PHILOSOPHY</span>
          </div>
          <h2 className="section-display-heading">{about.sectionHeading}</h2>
        </div>

        {/* 2-Column About Grid */}
        <div className="about-grid">
          {/* Left Column: Blueprint Focus Card */}
          <div className="about-blueprint-col reveal-item">
            <div className="blueprint-card">
              {/* Dotted Graph Surface */}
              <div className="blueprint-grid-surface">
                {/* Clean Identity Header (No Artificial Monogram Stamp) */}
                <div className="blueprint-identity-header">
                  <span className="blueprint-identity-name">GAJJELA VASUDEV</span>
                  <span className="blueprint-role-pill">{about.blueprintRole}</span>
                </div>

                {/* Summary Statement */}
                <p className="blueprint-summary">
                  {about.blueprintSummary}
                </p>
              </div>

              {/* Bottom Spec Caption */}
              <div className="blueprint-caption">
                {about.monogramTag}
              </div>
            </div>
          </div>

          {/* Right Column: Philosophy & Focus */}
          <div className="about-content-col reveal-item delay-1">
            <h3 className="about-headline">
              {about.headline.lead}{' '}
              <span className="serif-italic">{about.headline.italic}</span>{' '}
              {about.headline.trail}
            </h3>

            <p className="about-body">
              {about.body}
            </p>

            {/* Two Column Technical Details */}
            <div className="about-focus-grid">
              <div className="focus-col">
                <span className="focus-label">{about.enjoyBuilding.label}</span>
                <p className="focus-text">
                  {about.enjoyBuilding.text}
                </p>
              </div>

              <div className="focus-col">
                <span className="focus-label">{about.exploringNext.label}</span>
                <p className="focus-text">
                  {about.exploringNext.text}
                </p>
              </div>
            </div>

            {/* Offscreen Context */}
            <div className="offscreen-callout">
              <span className="callout-bullet" aria-hidden="true">↳</span>
              <p className="callout-text">
                <span className="callout-lead">OFF-SCREEN CONTEXT:</span>{' '}
                {about.offScreenContext.replace('OFF-SCREEN CONTEXT: ', '')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
