import React, { useEffect, useState } from 'react';
import './SyncOverlay.css';

const MESSAGES = [
  'Connecting to GitHub...',
  'Mapping your repositories...',
  'Calculating orbital trajectories...',
  'Measuring planetary mass from commits...',
  'Placing planets in the galaxy...',
  'Lighting up the stars...',
  'Almost there...',
];

const SyncOverlay = ({ syncProgress, visible }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!visible) return;
    const msgTimer = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 2200);
    const dotTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 420);
    return () => { clearInterval(msgTimer); clearInterval(dotTimer); };
  }, [visible]);

  if (!visible) return null;

  const pct = syncProgress?.total > 0
    ? Math.round((syncProgress.current / syncProgress.total) * 100)
    : null;

  return (
    <div className="sync-overlay">
      <div className="sync-overlay-content">
        {/* Animated galaxy forming */}
        <div className="sync-galaxy-anim">
          <div className="sync-core" />
          <div className="sync-ring sync-ring-1" />
          <div className="sync-ring sync-ring-2" />
          <div className="sync-ring sync-ring-3" />
          <div className="sync-planet sync-planet-1" />
          <div className="sync-planet sync-planet-2" />
          <div className="sync-planet sync-planet-3" />
        </div>

        <h2 className="sync-title">Building your galaxy</h2>

        <p className="sync-message">
          {syncProgress?.message || MESSAGES[msgIndex]}{dots}
        </p>

        {pct !== null && (
          <div className="sync-bar-wrap">
            <div className="sync-bar-track">
              <div className="sync-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="sync-pct">{pct}%</span>
          </div>
        )}

        {syncProgress?.total > 0 && (
          <p className="sync-count-text">
            {syncProgress.current || 0} / {syncProgress.total} repositories processed
          </p>
        )}
      </div>
    </div>
  );
};

export default SyncOverlay;
