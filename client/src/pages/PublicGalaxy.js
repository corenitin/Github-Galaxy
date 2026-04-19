import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GalaxyCanvas from '../components/galaxy/GalaxyCanvas';
import PlanetTooltip from '../components/galaxy/PlanetTooltip';
import PlanetPanel from '../components/galaxy/PlanetPanel';

const PublicGalaxy = () => {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    axios.get(`/api/galaxy/public/${username}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Galaxy not found'))
      .finally(() => setLoading(false));
  }, [username]);

  const handlePlanetHover = useCallback((planet, x, y) => {
    setHoveredPlanet(planet); setTooltipPos({ x, y });
  }, []);

  if (loading) return (
    <div className="loading-cosmos">
      <div className="cosmos-spinner" />
    </div>
  );

  if (error) return (
    <div className="loading-cosmos" style={{ flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--star-white)' }}>
        Galaxy not found
      </div>
      <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-cyan)' }}>
        ← Go home
      </Link>
    </div>
  );

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#03050f' }}>
      {/* Minimal nav */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(3,5,15,0.9)',
        borderBottom: '1px solid rgba(106,126,168,0.1)',
        backdropFilter: 'blur(12px)',
        zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {data?.user?.avatarUrl && (
            <img src={data.user.avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          )}
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--star-white)' }}>
            {data?.galaxyName}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--star-dim)' }}>
            {data?.planets?.length} planets
          </span>
        </div>
        <Link to="/" style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-cyan)',
          textDecoration: 'none', padding: '6px 14px',
          border: '1px solid rgba(79,195,247,0.25)', borderRadius: 6,
        }}>
          Build your galaxy ✦
        </Link>
      </div>

      <div
        ref={containerRef}
        style={{ position: 'fixed', top: 56, left: 0, right: selectedPlanet ? 320 : 0, bottom: 0 }}
      >
        <GalaxyCanvas
          planets={data?.planets || []}
          onPlanetClick={p => setSelectedPlanet(prev => prev?._id === p._id ? null : p)}
          onPlanetHover={handlePlanetHover}
        />
      </div>

      {hoveredPlanet && !selectedPlanet && (
        <PlanetTooltip planet={hoveredPlanet} x={tooltipPos.x} y={tooltipPos.y} />
      )}
      {selectedPlanet && (
        <PlanetPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}
    </div>
  );
};

export default PublicGalaxy;
