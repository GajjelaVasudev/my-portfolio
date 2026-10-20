import React from 'react';
import type { ProjectItem } from '../data/portfolioData';

interface ProjectCardProps {
  project: ProjectItem;
  imageSrc?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, imageSrc }) => {
  const projectTargetUrl = project.liveUrl || project.githubUrl || project.actionUrl;

  return (
    <article className="project-card reveal-item" data-cursor="view">
      {/* Clickable Card Image Preview or Deliberate Development Placeholder */}
      <a
        href={projectTargetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="card-image-link"
        aria-label={`View ${project.title} project`}
      >
        <div className="card-image-container" data-cursor="view">
          {imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt={project.imageAlt}
                className="card-image"
                loading="lazy"
              />
              <div className="card-image-overlay" aria-hidden="true" />
            </>
          ) : (
            <div className="card-image-placeholder" aria-label={`${project.title} - In Development`}>
              <div className="placeholder-content">
                <div className="placeholder-monogram" aria-hidden="true">
                  {project.placeholderInitials || 'SE'}
                </div>
                <div className="placeholder-badge-wrap">
                  <span className="placeholder-dot" aria-hidden="true" />
                  <span className="placeholder-badge">IN DEVELOPMENT</span>
                </div>
                <span className="placeholder-subtext">Backend Foundation Phase</span>
              </div>
            </div>
          )}
        </div>
      </a>

      {/* Card Body */}
      <div className="card-content">
        {/* Meta Header */}
        <div className="card-meta-header">
          <span className="card-tag">{project.tag}</span>
          <span className="card-category">{project.category}</span>
        </div>

        {/* Title */}
        <h3 className="card-title">
          <a
            href={projectTargetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-title-link"
          >
            {project.title}
          </a>
        </h3>

        {/* Tech Stack in terracotta accent */}
        <div className="card-tech">
          {project.tech.join(' • ')}
        </div>

        {/* Description */}
        <p className="card-description">
          {project.description}
        </p>

        {/* Card Footer */}
        <div className="card-footer">
          <span className="card-metric">{project.metricLabel}</span>
          <div className="card-actions-group">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-action-link btn-live"
                aria-label={`Open ${project.title} live demo in a new tab`}
              >
                LIVE DEMO <span className="action-arrow" aria-hidden="true">↗</span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`card-action-link ${project.isPrivate ? 'is-private' : ''}`}
                aria-label={`Open ${project.title} GitHub repository in a new tab${project.isPrivate ? ' (Private Repository)' : ''}`}
                title={project.isPrivate ? 'Repository is currently private during backend development' : undefined}
              >
                {project.isPrivate ? 'GITHUB (PRIVATE)' : 'GITHUB REPO'} <span className="action-arrow" aria-hidden="true">↗</span>
              </a>
            )}
            {!project.liveUrl && !project.githubUrl && (
              <a
                href={project.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-action-link"
              >
                {project.actionText.replace('→', '').trim()} <span className="action-arrow" aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
