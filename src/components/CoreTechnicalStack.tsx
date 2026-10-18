import React from 'react';
import { portfolioData } from '../data/portfolioData';

export const CoreTechnicalStack: React.FC = () => {
  const { technicalStack } = portfolioData;

  return (
    <section className="tech-stack-section" id="tech-stack">
      <div className="container">
        {/* Bold Oversized Section Heading Header */}
        <div className="section-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">{technicalStack.kicker}</span>
          </div>
          <h2 className="section-display-heading">{technicalStack.sectionHeading}</h2>
          <p className="section-narrative">
            {technicalStack.supportingLine}
          </p>
        </div>

        {/* Distinctive Typography-Led Editorial Grid */}
        <div className="tech-editorial-grid">
          {technicalStack.categories.map((cat) => (
            <article
              key={cat.id}
              className={`tech-editorial-group ${cat.isAnchor ? 'is-anchor-group' : ''} reveal-item`}
            >
              {/* Category Header */}
              <div className="tech-group-header">
                <div className="tech-group-title-wrap">
                  <span className="tech-group-num">{cat.categoryNumber}</span>
                  <h3 className="tech-group-name">{cat.name}</h3>
                </div>
                {cat.isAnchor && (
                  <span className="tech-anchor-tag">
                    <span className="tech-anchor-dot" aria-hidden="true" />
                    <span>CORE FOCUS</span>
                  </span>
                )}
              </div>

              {/* Technologies: Clean Inline Group with Subtle Typographic Separators */}
              <div className="tech-skills-flow" aria-label={`${cat.name} technologies`}>
                {cat.skills.map((skill, index) => (
                  <span key={skill} className="tech-skill-token">
                    <span className="tech-skill-name">{skill}</span>
                    {index < cat.skills.length - 1 && (
                      <span className="tech-skill-sep" aria-hidden="true">
                        /
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

