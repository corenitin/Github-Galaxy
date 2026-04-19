import React, { useState } from 'react';
import GalaxyStats from '../galaxy/GalaxyStats';
import './MobileStatsDrawer.css';

const MobileStatsDrawer = ({ planets, allPlanets, onFilter, user }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating toggle button — only visible on mobile */}
      <button
        className="mobile-stats-toggle"
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle stats"
      >
        <span className="mst-icon">{open ? '✕' : '◉'}</span>
        <span className="mst-label">{open ? 'Close' : 'Stats'}</span>
      </button>

      {/* Drawer */}
      {open && (
        <>
          <div className="mobile-stats-backdrop" onClick={() => setOpen(false)} />
          <div className="mobile-stats-drawer">
            <GalaxyStats
              planets={planets}
              allPlanets={allPlanets}
              onFilter={(f) => { onFilter(f); setOpen(false); }}
              user={user}
            />
          </div>
        </>
      )}
    </>
  );
};

export default MobileStatsDrawer;
