import React from 'react';
import { portfolioData } from '../data/portfolioData';

const PlatformIcon: React.FC<{ platformId: string }> = ({ platformId }) => {
  switch (platformId) {
    case 'leetcode':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="platform-svg leetcode-svg"
        >
          <path
            d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 2.18 2.502l3.414 2.091 1.764 1.082a5.485 5.485 0 0 0 2.822.779 5.334 5.334 0 0 0 2.812-.78l3.407-2.09a5.952 5.952 0 0 0 2.18-2.503 5.527 5.527 0 0 0 .062-2.362 5.83 5.83 0 0 0-.349-1.017 5.928 5.928 0 0 0-2.18-2.502l-1.764-1.082a1.374 1.374 0 1 0-1.442 2.348l1.764 1.082a3.178 3.178 0 0 1 1.17 1.341c.094.17.158.353.188.545a2.777 2.777 0 0 1-.032 1.189 3.189 3.189 0 0 1-1.17 1.343l-3.408 2.09a2.584 2.584 0 0 1-1.357.377 2.656 2.656 0 0 1-1.363-.377l-1.764-1.082-3.414-2.091a3.189 3.189 0 0 1-1.171-1.343 2.973 2.973 0 0 1-.188-.545 2.777 2.777 0 0 1 .032-1.189 3.189 3.189 0 0 1 1.17-1.343l3.855-4.126 5.405-5.788a1.374 1.374 0 0 0-.96-2.348z"
            fill="currentColor"
          />
          <path
            d="M9.833 10.924a1.375 1.375 0 0 0-.972 2.347l2.809 2.809a1.375 1.375 0 1 0 1.944-1.944l-2.809-2.809a1.375 1.375 0 0 0-.972-.403z"
            fill="currentColor"
          />
        </svg>
      );
    case 'codechef':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="platform-svg codechef-svg"
        >
          <path d="M12.44 2.5a3.56 3.56 0 0 0-3.1 1.83 3.6 3.6 0 0 0-3.66 2.45A3.56 3.56 0 0 0 3 10.28a3.57 3.57 0 0 0 1.93 3.16c-.02.18-.04.36-.04.55 0 4.14 3.19 7.51 7.11 7.51s7.11-3.37 7.11-7.51c0-.21-.02-.41-.05-.61A3.57 3.57 0 0 0 21 10.22a3.56 3.56 0 0 0-2.68-3.5 3.6 3.6 0 0 0-3.66-2.43 3.56 3.56 0 0 0-2.22-1.79zm-4.7 10.05a1.44 1.44 0 1 1 0 2.88 1.44 1.44 0 0 1 0-2.88zm8.52 0a1.44 1.44 0 1 1 0 2.88 1.44 1.44 0 0 1 0-2.88zm-4.26 3.25c1.47 0 2.73.74 3.34 1.83a.6.6 0 1 1-1.04.59c-.43-.76-1.32-1.28-2.3-1.28s-1.87.52-2.3 1.28a.6.6 0 1 1-1.04-.59c.61-1.09 1.87-1.83 3.34-1.83z" />
        </svg>
      );
    case 'codeforces':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="platform-svg codeforces-svg"
        >
          <path
            d="M4.5 7.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 0 19.5V9a1.5 1.5 0 0 1 1.5-1.5z"
            fill="#EBB305"
          />
          <path
            d="M13.5 3a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 19.5V4.5A1.5 1.5 0 0 1 10.5 3z"
            fill="#318CE7"
          />
          <path
            d="M22.5 10.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5z"
            fill="#D9532F"
          />
        </svg>
      );
    case 'hackerrank':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="platform-svg hackerrank-svg"
        >
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3.328 17.515h-1.638v-3.792h-3.38v3.792h-1.638v-11.03h1.638v4.062h3.38v-4.062h1.638v11.03z" />
        </svg>
      );
    default:
      return null;
  }
};

export const CodingProfiles: React.FC = () => {
  const { codingProfiles } = portfolioData;

  return (
    <section className="coding-profiles-section" id="coding-profiles">
      <div className="container">
        {/* Bold Oversized Section Heading Header */}
        <div className="section-header-block reveal-item">
          <div className="section-kicker-row">
            <span className="section-kicker">{codingProfiles.kicker}</span>
          </div>
          <h2 className="section-display-heading">{codingProfiles.sectionHeading}</h2>
          <p className="section-narrative">
            {codingProfiles.supportingLine}
          </p>
        </div>

        {/* 4-Column Responsive Editorial Grid */}
        <div className="coding-profiles-grid">
          {codingProfiles.items.map((item, index) => (
            <article
              key={item.id}
              className={`coding-profile-card reveal-item delay-${index + 1}`}
            >
              {/* Card Header: Icon & Category Tag */}
              <div className="profile-card-top">
                <div className="profile-icon-wrap" aria-hidden="true">
                  <PlatformIcon platformId={item.id} />
                </div>
                {item.badge && (
                  <span className="profile-badge">{item.badge}</span>
                )}
              </div>

              {/* Card Body: Platform Name & Username */}
              <div className="profile-body">
                <h3 className="profile-platform-name">{item.platform}</h3>

                <div className="profile-username-wrap">
                  <span className="profile-username-label">Username</span>
                  <span className="profile-username-pill">@{item.username}</span>
                </div>
              </div>

              {/* Card Footer: Clear Action Link */}
              <div className="profile-card-footer">
                <a
                  href={item.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-action-link"
                  aria-label={`View ${item.platform} profile of ${item.username} (opens in a new tab)`}
                >
                  <span>{item.actionText || 'View Profile'}</span>
                  <span className="profile-link-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CodingProfiles;
