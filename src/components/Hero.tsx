import React from 'react';
import { portfolioData } from '../data/portfolioData';
import portraitImg from '../assets/portrait.jpg';

export const Hero: React.FC = () => {
  const { personal } = portfolioData;

  return (
    <section className="hero-section" id="hero">
      <div className="container">
        {/* Main 2-Column Hero Grid */}
        <div className="hero-grid">
          {/* Left Column: Two-Line Name Heading, Tagline, Bio & Actions */}
          <div className="hero-content">
            {/* Two-Line Asymmetric Personal Name Heading */}
            <h1 className="hero-name-header" aria-label={`${personal.firstName} ${personal.lastName}`}>
              <span className="hero-name-prefix reveal-item">
                {personal.firstName}
              </span>
              <span className="hero-name-main reveal-item delay-1">
                {personal.lastName}
              </span>
            </h1>

            {/* Introductory Tagline */}
            <p className="hero-statement reveal-item delay-2">
              {personal.heroHeadline.lead}{' '}
              <span className="serif-italic">{personal.heroHeadline.italic}</span>{' '}
              {personal.heroHeadline.trail}
            </p>

            {/* Supporting Bio */}
            <p className="hero-bio reveal-item delay-3">
              {personal.heroBio}
            </p>

            {/* Action Buttons */}
            <div className="hero-actions reveal-item delay-4">
              <a href="#work" className="btn-primary">
                EXPLORE MY WORK <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
              <a href={personal.resumeUrl} className="btn-secondary">
                VIEW RESUME
              </a>
            </div>
          </div>

          {/* Right Column: Layered Editorial Portrait Card */}
          <div className="hero-visual reveal-item delay-2">
            <div className="portrait-composition">
              {/* Layered Decorative Backdrop Frames */}
              <div className="frame-backdrop-top-right" aria-hidden="true" />
              <div className="frame-backdrop-bottom-left" aria-hidden="true" />

              {/* Main Portrait Container */}
              <div className="portrait-card">
                <div className="portrait-image-wrapper">
                  <img
                    src={portraitImg}
                    alt={`${personal.name} — Computer Science student and software engineer`}
                    className="portrait-image"
                    width="480"
                    height="600"
                    loading="eager"
                  />
                </div>

                {/* Card Caption Strip */}
                <div className="portrait-caption">
                  <span className="caption-text">
                    {personal.name.toUpperCase()} — SOFTWARE &amp; SYSTEMS
                  </span>
                  <span className="caption-year">
                    <span className="caption-dot" aria-hidden="true">•</span> {personal.year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
