import React from 'react';
import './PlanetTooltip.css';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
  Go: '#00ADD8', Rust: '#dea584', Java: '#b07219', Ruby: '#701516',
  'C++': '#f34b7d', Swift: '#ffac45', Kotlin: '#A97BFF',
  HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', default: '#8892b0',
};

function getPlanetType(p) {
  if (p.isArchived) return 'archived';
  if (p.isFork) return 'forked';
  if (p.hasDeployment || p.homepage) return 'deployed';
  return 'active';
}

const TYPE_META = {
  active:   { label: 'Active', color: '#3fb950' },
  deployed: { label: 'Deployed', color: '#56d364' },
  archived: { label: 'Archived', color: '#e3b341' },
  forked:   { label: 'Forked', color: '#a78bfa' },
};

const PlanetTooltip = ({ planet, x, y, containerRect }) => {
  if (!planet) return null;

  const type = getPlanetType(planet);
  const meta = TYPE_META[type];
  const langColor = LANG_COLORS[planet.language] || LANG_COLORS.default;
  const commitDots = Math.min(planet.commitCount || 0, 60);

  // Position tooltip so it doesn't go offscreen
  const tipW = 220, tipH = 200;
  let left = x + 16;
  let top = y - 20;
  if (containerRect) {
    if (left + tipW > containerRect.right) left = x - tipW - 16;
    if (top + tipH > containerRect.bottom) top = y - tipH;
  }

  return (
    <div className="planet-tooltip" style={{ left, top }}>
      <div className="tt-header">
        <span className="tt-name">{planet.name}</span>
        <span className="tt-badge" style={{ color: meta.color, borderColor: `${meta.color}40` }}>
          {meta.label}
        </span>
      </div>
      {planet.description && (
        <p className="tt-desc">{planet.description.slice(0, 80)}{planet.description.length > 80 ? '…' : ''}</p>
      )}
      <div className="tt-meta">
        {planet.language && (
          <span className="tt-lang">
            <span className="tt-lang-dot" style={{ background: langColor }} />
            {planet.language}
          </span>
        )}
        <span className="tt-stat">⭐ {planet.starCount || 0}</span>
        <span className="tt-stat">🍴 {planet.forkCount || 0}</span>
      </div>
      <div className="tt-commits-row">
        <span className="tt-commits-label">{planet.commitCount || 0} commits</span>
      </div>
      <div className="tt-commit-dots">
        {Array.from({ length: commitDots }, (_, i) => (
          <div
            key={i}
            className="tt-dot"
            style={{
              background: meta.color,
              opacity: 0.25 + (i / commitDots) * 0.75,
            }}
          />
        ))}
      </div>
      <div className="tt-footer">click to explore</div>
    </div>
  );
};

export default PlanetTooltip;
