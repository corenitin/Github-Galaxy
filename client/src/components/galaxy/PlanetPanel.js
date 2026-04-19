import React from 'react';
import './PlanetPanel.css';

const LANG_COLORS = {
  JavaScript:'#f5c842',TypeScript:'#4287f5',Python:'#3bb8a8',
  Go:'#00c4e0',Rust:'#e8763a',Java:'#e84c3d',Ruby:'#cc3366',
  'C++':'#a855f7',Swift:'#f97316',Kotlin:'#8b5cf6',
  HTML:'#ef4444',CSS:'#3b82f6',Vue:'#22c55e',default:'#4a6fa5',
};

function getPlanetType(p) {
  if (p.isArchived) return 'archived';
  if (p.isFork) return 'forked';
  if (p.hasDeployment || p.homepage) return 'deployed';
  return 'active';
}

const TYPE_META = {
  active:   { label: 'Active World',    color: '#00d4ff' },
  deployed: { label: 'Deployed World',  color: '#00ffcc' },
  archived: { label: 'Ancient World',   color: '#f59e0b' },
  forked:   { label: 'Borrowed World',  color: '#a78bfa' },
};

const PlanetPanel = ({ planet, onClose }) => {
  if (!planet) return null;
  const type = getPlanetType(planet);
  const meta = TYPE_META[type];
  const color = LANG_COLORS[planet.language] || LANG_COLORS.default;

  const totalLang = planet.languages
    ? Object.values(planet.languages).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="planet-panel">
      <button className="panel-close" onClick={onClose}>✕</button>

      <div className="panel-inner">
        {/* Planet hero visual */}
        <div className="panel-hero">
          <div className="panel-planet-display">
            <div className="panel-planet-orb" style={{
              background: `radial-gradient(circle at 32% 32%, ${color}ff 0%, ${color}cc 40%, ${color}77 70%, ${color}33 100%)`,
              boxShadow: `0 0 40px ${color}50, 0 0 80px ${color}20`,
            }}>
              <div className="panel-planet-shine" />
              <div className="panel-planet-shadow" />
            </div>
          </div>

          <div className="panel-type-badge" style={{ color: meta.color, borderColor: `${meta.color}40`, background: `${meta.color}0d` }}>
            {meta.label}
          </div>
          <h2 className="panel-name">{planet.name}</h2>
          {planet.description && (
            <p className="panel-desc">
              {planet.description.slice(0, 90)}{planet.description.length > 90 ? '…' : ''}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="panel-stats">
          <div className="stat-card">
            <span className="stat-value">{(planet.commitCount || 0).toLocaleString()}</span>
            <span className="stat-label">commits</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{planet.starCount || 0}</span>
            <span className="stat-label">stars</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{planet.forkCount || 0}</span>
            <span className="stat-label">forks</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{planet.size ? `${Math.round(planet.size / 1024)}mb` : '—'}</span>
            <span className="stat-label">size</span>
          </div>
        </div>

        {/* Language breakdown */}
        {planet.languages && totalLang > 0 && (
          <div className="panel-section">
            <div className="panel-section-title">Language composition</div>
            <div className="lang-bar">
              {Object.entries(planet.languages).slice(0, 6).map(([lang, bytes]) => (
                <div key={lang} className="lang-bar-segment" style={{
                  width: `${(bytes / totalLang) * 100}%`,
                  background: LANG_COLORS[lang] || LANG_COLORS.default,
                }} />
              ))}
            </div>
            <div className="lang-legend">
              {Object.entries(planet.languages).slice(0, 5).map(([lang, bytes]) => (
                <div key={lang} className="lang-legend-item">
                  <span className="lang-dot" style={{ background: LANG_COLORS[lang] || LANG_COLORS.default }} />
                  <span className="lang-name">{lang}</span>
                  <span className="lang-pct">{Math.round((bytes / totalLang) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {planet.topics?.length > 0 && (
          <div className="panel-section">
            <div className="panel-section-title">Topics</div>
            <div className="panel-topics">
              {planet.topics.map(t => <span key={t} className="topic-tag">{t}</span>)}
            </div>
          </div>
        )}

        {/* Commits */}
        {planet.recentCommits?.length > 0 && (
          <div className="panel-section">
            <div className="panel-section-title">Recent commits</div>
            <div className="commit-list">
              {planet.recentCommits.slice(0, 6).map((c, i) => (
                <div key={i} className="commit-item">
                  <div className="commit-top">
                    <span className="commit-sha">{(c.sha||'').slice(0,7)}</span>
                    {c.date && (
                      <span className="commit-date">
                        {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="commit-msg">
                    {c.message?.slice(0, 56)}{c.message?.length > 56 ? '…' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="panel-links">
          <a href={`https://github.com/${planet.fullName}`} target="_blank" rel="noopener noreferrer" className="panel-link panel-link-blue">
            View on GitHub ↗
          </a>
          {planet.homepage && (
            <a href={planet.homepage} target="_blank" rel="noopener noreferrer" className="panel-link panel-link-green">
              Visit live site ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanetPanel;
