import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ExplorePage.css';

const GalaxyCard = ({ galaxy }) => {
  const topColors = galaxy.topPlanets?.map(p => p.planetColor || '#4fc3f7') || [];

  return (
    <Link to={`/galaxy/${galaxy.username}`} className="galaxy-card">
      <div className="gc-header">
        <img
          src={galaxy.avatarUrl}
          alt={galaxy.username}
          className="gc-avatar"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="gc-identity">
          <div className="gc-name">{galaxy.galaxyName}</div>
          <div className="gc-uname">@{galaxy.username}</div>
        </div>
      </div>

      {/* Mini planet preview */}
      <div className="gc-planets-preview">
        {galaxy.topPlanets?.map((p, i) => (
          <div key={i} className="gc-mini-planet-wrap">
            <div
              className="gc-mini-planet"
              style={{
                width: Math.min(Math.max((p.planetSize || 12), 8), 28),
                height: Math.min(Math.max((p.planetSize || 12), 8), 28),
                background: `radial-gradient(circle at 35% 35%, ${p.planetColor || '#4fc3f7'}cc, ${p.planetColor || '#4fc3f7'}55)`,
                boxShadow: `0 0 10px ${p.planetColor || '#4fc3f7'}50`,
              }}
            />
            <span className="gc-planet-name">{p.name}</span>
          </div>
        ))}
        {(galaxy.planetCount - (galaxy.topPlanets?.length || 0)) > 0 && (
          <div className="gc-more-planets">
            +{galaxy.planetCount - (galaxy.topPlanets?.length || 0)} more
          </div>
        )}
      </div>

      <div className="gc-stats">
        <div className="gc-stat">
          <span className="gc-stat-val">{galaxy.planetCount}</span>
          <span className="gc-stat-lbl">planets</span>
        </div>
        <div className="gc-stat">
          <span className="gc-stat-val">{(galaxy.totalCommits || 0).toLocaleString()}</span>
          <span className="gc-stat-lbl">commits</span>
        </div>
        <div className="gc-stat">
          <span className="gc-stat-val">{galaxy.totalRepos || 0}</span>
          <span className="gc-stat-lbl">repos</span>
        </div>
      </div>

      <div className="gc-footer">
        <span className="gc-synced">
          {galaxy.lastSynced
            ? `Updated ${new Date(galaxy.lastSynced).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'Recently joined'}
        </span>
        <span className="gc-explore-link">Explore →</span>
      </div>
    </Link>
  );
};

const ExplorePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [galaxies, setGalaxies] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [exploreRes, lbRes] = await Promise.all([
          axios.get(`/api/explore?page=${page}`),
          page === 1 ? axios.get('/api/explore/leaderboard') : Promise.resolve(null),
        ]);
        setGalaxies(exploreRes.data.galaxies);
        setPagination(exploreRes.data.pagination);
        if (lbRes) setLeaderboard(lbRes.data.leaderboard);
      } catch {
        // handle gracefully
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div className="explore-page">
      {/* Nav */}
      <nav className="explore-nav">
        <button className="explore-back" onClick={() => navigate(isAuthenticated ? '/galaxy' : '/')}>
          ← {isAuthenticated ? 'My galaxy' : 'Home'}
        </button>
        <div className="explore-logo">✦ Explore Galaxies</div>
        {!isAuthenticated && (
          <a href="/auth/github" className="btn btn-primary" style={{ fontSize: 12, padding: '7px 16px' }}>
            Sign in
          </a>
        )}
      </nav>

      <div className="explore-body">
        {/* Leaderboard sidebar */}
        {leaderboard.length > 0 && (
          <aside className="explore-sidebar">
            <div className="sidebar-title">🏆 Top galaxies</div>
            {leaderboard.slice(0, 10).map((u, i) => (
              <Link key={u._id} to={`/galaxy/${u.username}`} className="lb-item">
                <span className="lb-rank">#{i + 1}</span>
                <img src={u.avatarUrl} alt="" className="lb-avatar" onError={e => e.target.style.display='none'} />
                <div className="lb-info">
                  <div className="lb-name">{u.username}</div>
                  <div className="lb-commits">{(u.totalCommits || 0).toLocaleString()} commits</div>
                </div>
              </Link>
            ))}
          </aside>
        )}

        {/* Galaxy grid */}
        <main className="explore-main">
          <div className="explore-header">
            <h1 className="explore-title">All galaxies</h1>
            {pagination && (
              <span className="explore-count">
                {pagination.total} explorers charted
              </span>
            )}
          </div>

          {loading ? (
            <div className="explore-loading">
              <div className="cosmos-spinner" />
            </div>
          ) : galaxies.length === 0 ? (
            <div className="explore-empty">
              <p>No galaxies discovered yet.<br />Be the first to sync yours!</p>
              <a href="/auth/github" className="btn btn-primary">Start exploring</a>
            </div>
          ) : (
            <>
              <div className="galaxy-grid">
                {galaxies.map(g => (
                  <GalaxyCard key={g.username} galaxy={g} />
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="explore-pagination">
                  <button
                    className="btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Prev
                  </button>
                  <span className="explore-page-info">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    className="btn"
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExplorePage;
