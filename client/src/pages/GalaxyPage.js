import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGalaxy } from '../hooks/useGalaxy';
import useCommitActivity from '../hooks/useCommitActivity';
import GalaxyCanvas from '../components/galaxy/GalaxyCanvas';
import PlanetTooltip from '../components/galaxy/PlanetTooltip';
import PlanetPanel from '../components/galaxy/PlanetPanel';
import GalaxyStats from '../components/galaxy/GalaxyStats';
import Navbar from '../components/ui/Navbar';
import SyncOverlay from '../components/ui/SyncOverlay';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import MobileStatsDrawer from '../components/ui/MobileStatsDrawer';
import './GalaxyPage.css';

const EmptyState = ({ onSync, syncing }) => (
  <div className="empty-galaxy">
    <div className="empty-orb" />
    <h2 className="empty-title">Your galaxy is empty</h2>
    <p className="empty-desc">
      Sync your GitHub repositories to populate your galaxy.<br />
      Every repo becomes a planet. Every commit builds its mass.
    </p>
    <button className="btn btn-primary" onClick={onSync} disabled={syncing}>
      {syncing ? '⟳ Syncing...' : '✦ Build my galaxy'}
    </button>
  </div>
);

const GalaxyPage = () => {
  const { user } = useAuth();
  const { planets, galaxyInfo, loading, syncing, syncProgress, syncGalaxy, fetchGalaxy } = useGalaxy();

  const [filteredPlanets, setFilteredPlanets] = useState(null);
  const displayPlanets = filteredPlanets ?? planets;

  // Live polling — silently refreshes planet data every 5 minutes
  useCommitActivity({
    planets,
    onPlanetUpdated: () => fetchGalaxy(),
    enabled: !syncing,
  });

  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const containerRef = useRef(null);

  const handlePlanetHover = useCallback((planet, x, y) => {
    setHoveredPlanet(planet);
    setTooltipPos({ x, y });
  }, []);

  const handlePlanetClick = useCallback((planet) => {
    setSelectedPlanet(prev => prev?._id === planet._id ? null : planet);
  }, []);

  const handleFilter = useCallback((filtered) => {
    setFilteredPlanets(filtered.length === planets.length ? null : filtered);
    setSelectedPlanet(null);
  }, [planets]);

  if (loading) {
    return (
      <div className="loading-cosmos">
        <div style={{ textAlign: 'center' }}>
          <div className="cosmos-spinner" style={{ margin: '0 auto 20px' }} />
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--star-dim)', fontSize: '13px' }}>
            Loading your galaxy...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="galaxy-page">
        <Navbar
          user={user}
          galaxyName={galaxyInfo?.galaxyName}
          lastSynced={galaxyInfo?.lastSynced}
          onSync={syncGalaxy}
          syncing={syncing}
          syncProgress={syncProgress}
        />

        <GalaxyStats
          planets={displayPlanets}
          allPlanets={planets}
          onPlanetSelect={setSelectedPlanet}
          onFilter={handleFilter}
          user={user}
        />

        <main
          className={`galaxy-main ${selectedPlanet ? 'panel-open' : ''}`}
          ref={containerRef}
        >
          {planets.length === 0 && !syncing ? (
            <EmptyState onSync={syncGalaxy} syncing={syncing} />
          ) : (
            <GalaxyCanvas
              planets={displayPlanets}
              onPlanetClick={handlePlanetClick}
              onPlanetHover={handlePlanetHover}
            />
          )}
        </main>

        {hoveredPlanet && !selectedPlanet && (
          <PlanetTooltip
            planet={hoveredPlanet}
            x={tooltipPos.x}
            y={tooltipPos.y}
            containerRect={containerRef.current?.getBoundingClientRect()}
          />
        )}

        {selectedPlanet && (
          <PlanetPanel
            planet={selectedPlanet}
            onClose={() => setSelectedPlanet(null)}
          />
        )}

        <SyncOverlay visible={syncing} syncProgress={syncProgress} />

        {/* Mobile stats drawer — only renders on small screens */}
        <MobileStatsDrawer
          planets={displayPlanets}
          allPlanets={planets}
          onPlanetSelect={setSelectedPlanet}
          onFilter={handleFilter}
          user={user}
        />
      </div>
    </ErrorBoundary>
  );
};

export default GalaxyPage;
