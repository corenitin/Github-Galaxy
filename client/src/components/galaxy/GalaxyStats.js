import React from 'react';
import SearchBar from '../ui/SearchBar';
import './GalaxyStats.css';

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

const TYPE_STYLES = {
  active:   { color: '#00d4ff', label: 'Active' },
  deployed: { color: '#00ffcc', label: 'Deployed' },
  archived: { color: '#f59e0b', label: 'Archived' },
  forked:   { color: '#a78bfa', label: 'Forked' },
};

const GalaxyStats = ({ planets, allPlanets, onFilter, onPlanetSelect, user }) => {
  const totalCommits = planets.reduce((a, p) => a + (p.commitCount || 0), 0);
  const deployed = planets.filter(p => p.hasDeployment || p.homepage).length;
  const active = planets.filter(p => !p.isArchived && !p.isFork).length;
  const languages = [...new Set(planets.map(p => p.language).filter(Boolean))];

  const topPlanets = [...planets]
    .sort((a, b) => (b.commitCount || 0) - (a.commitCount || 0))
    .slice(0, 8);

  return (
    <div className="galaxy-stats">
      {allPlanets?.length > 0 && (
        <SearchBar planets={allPlanets} onFilter={onFilter} />
      )}

      <div className="stats-scroll">

        {/* Universe stats */}
        <div className="stats-section">
          <div className="stats-title">Your universe</div>
          <div className="stats-grid">
            <div className="stats-item">
              <span className="stats-val">{planets.length}</span>
              <span className="stats-lbl">planets</span>
            </div>
            <div className="stats-item">
              <span className="stats-val">{totalCommits > 999 ? (totalCommits/1000).toFixed(1)+'k' : totalCommits}</span>
              <span className="stats-lbl">commits</span>
            </div>
            <div className="stats-item">
              <span className="stats-val">{deployed}</span>
              <span className="stats-lbl">deployed</span>
            </div>
            <div className="stats-item">
              <span className="stats-val">{active}</span>
              <span className="stats-lbl">active</span>
            </div>
          </div>
        </div>

        {/* Planet types legend */}
        <div className="stats-section">
          <div className="stats-title">Planet types</div>
          <div className="legend-items">
            {Object.entries(TYPE_STYLES).map(([type, s]) => (
              <div key={type} className="legend-item">
                <div className="legend-orb" style={{
                  background: `radial-gradient(circle at 35% 35%, ${s.color}cc, ${s.color}55)`,
                  boxShadow: `0 0 6px ${s.color}60`,
                }} />
                <span>{s.label}</span>
                <span style={{ marginLeft: 'auto', color: 'rgba(100,140,180,0.4)', fontSize: 9 }}>
                  {planets.filter(p => getPlanetType(p) === type).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top planets by commits */}
        {topPlanets.length > 0 && (
          <div className="stats-section">
            <div className="stats-title">Biggest worlds</div>
            <div className="planet-list">
              {topPlanets.map(p => {
                const color = LANG_COLORS[p.language] || LANG_COLORS.default;
                return (
                  <div
                    key={p._id}
                    className="planet-list-item"
                    onClick={() => onPlanetSelect?.(p)}
                  >
                    <div className="planet-list-orb" style={{
                      background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}55)`,
                      boxShadow: `0 0 5px ${color}50`,
                    }} />
                    <span className="planet-list-name">{p.name}</span>
                    <span className="planet-list-commits">{p.commitCount || 0}c</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Galaxy mechanics */}
        <div className="stats-section">
          <div className="stats-title">Galaxy rules</div>
          <div className="howto-items">
            <div className="howto-item"><span className="howto-icon">◉</span>Size = commit count</div>
            <div className="howto-item"><span className="howto-icon">⊛</span>Ring = deployed live</div>
            <div className="howto-item"><span className="howto-icon">·</span>Dots = recent commits</div>
            <div className="howto-item"><span className="howto-icon">○</span>Moons = repo forks</div>
            <div className="howto-item"><span className="howto-icon">◌</span>Color = language</div>
          </div>
        </div>

        {/* Languages */}
        {languages.length > 0 && (
          <div className="stats-section">
            <div className="stats-title">Your languages</div>
            <div className="lang-tags">
              {languages.slice(0, 10).map(l => {
                const c = LANG_COLORS[l] || LANG_COLORS.default;
                return (
                  <span key={l} className="lang-tag" style={{
                    color: c, borderColor: `${c}40`,
                    background: `${c}0d`,
                  }}>{l}</span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Controls — sticky bottom */}
      <div className="stats-controls">
        <div className="control-hint">scroll to zoom</div>
        <div className="control-hint">drag to pan</div>
        <div className="control-hint">click planet to explore</div>
      </div>
    </div>
  );
};

export default GalaxyStats;
