import React, { useState } from 'react';
import GalaxyNameEditor from './GalaxyNameEditor';
import './Navbar.css';

const Navbar = ({ user, galaxyName, lastSynced, onSync, syncing, syncProgress, onGalaxyNameChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(null);

  const displayName = localName || galaxyName || `${user?.username}'s galaxy`;

  const handleNameSave = (name) => {
    setLocalName(name);
    onGalaxyNameChange?.(name);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="nav-logo">✦</div>
          <div className="nav-galaxy-info">
            <button
              className="nav-galaxy-name-btn"
              onClick={() => setEditingName(true)}
              title="Click to rename your galaxy"
            >
              {displayName}
              <span className="nav-edit-icon">✎</span>
            </button>
            {lastSynced && (
              <span className="nav-last-sync">
                synced {new Date(lastSynced).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        <div className="navbar-center">
          {syncing && syncProgress && (
            <div className="sync-progress">
              <div className="sync-spinner" />
              <span className="sync-msg">{syncProgress.message}</span>
              {syncProgress.total > 0 && (
                <span className="sync-count">
                  {syncProgress.current || 0}/{syncProgress.total}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="navbar-right">
          <button
            className={`btn btn-primary sync-btn ${syncing ? 'syncing' : ''}`}
            onClick={onSync}
            disabled={syncing}
          >
            {syncing ? '⟳ Syncing...' : '⟳ Sync galaxy'}
          </button>

          <div className="nav-avatar" onClick={() => setMenuOpen(v => !v)}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt={user.username} />
              : <span>{user?.username?.[0]?.toUpperCase()}</span>
            }
          </div>

          {menuOpen && (
            <>
              <div className="nav-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="nav-menu">
                <div className="nav-menu-user">
                  <div className="nav-menu-name">{user?.displayName || user?.username}</div>
                  <div className="nav-menu-uname">@{user?.username}</div>
                </div>
                <button
                  className="nav-menu-item"
                  onClick={() => { setEditingName(true); setMenuOpen(false); }}
                >
                  Rename galaxy
                </button>
                <a
                  href={`/galaxy/${user?.username}`}
                  className="nav-menu-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                >
                  Public galaxy ↗
                </a>
                <a
                  href="/explore"
                  className="nav-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Explore galaxies
                </a>
                <a
                  href={`https://github.com/${user?.username}`}
                  className="nav-menu-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                >
                  GitHub profile ↗
                </a>
                <button
                  className="nav-menu-item nav-menu-logout"
                  onClick={() => { localStorage.removeItem('galaxy_token'); window.location.href = '/'; }}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {editingName && (
        <GalaxyNameEditor
          currentName={displayName}
          onSave={handleNameSave}
          onClose={() => setEditingName(false)}
        />
      )}
    </>
  );
};

export default Navbar;
