import React from 'react';
import type { ProjectItem } from '../data/portfolioData';

interface ProjectCardProps {
  project: ProjectItem;
  imageSrc: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, imageSrc }) => {
  return (
    <article className="project-card reveal-item" data-cursor="view">
      {/* Clickable Card Image Preview */}
      <a
        href={project.actionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="card-image-link"
        aria-label={`View ${project.title} project`}
      >
        <div className="card-image-container" data-cursor="view">
          <img
            src={imageSrc}
            alt={project.imageAlt}
            className="card-image"
            loading="lazy"
          />
          <div className="card-image-overlay" aria-hidden="true" />
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
            href={project.actionUrl}
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
          <a
            href={project.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-action-link"
          >
            {project.actionText.replace('→', '').trim()} <span className="action-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
};
