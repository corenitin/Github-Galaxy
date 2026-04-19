import React, { useState } from 'react';
import axios from 'axios';
import './GalaxyNameEditor.css';

const GalaxyNameEditor = ({ currentName, onSave, onClose }) => {
  const [value, setValue] = useState(currentName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (value.trim().length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await axios.put('/api/user/galaxy-name', { galaxyName: value.trim() });
      onSave(value.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="gne-backdrop" onClick={onClose}>
      <div className="gne-modal" onClick={e => e.stopPropagation()}>
        <h3 className="gne-title">Name your galaxy</h3>
        <p className="gne-hint">This is displayed to visitors and on your public galaxy page.</p>

        <input
          className="gne-input"
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          placeholder="corenitin's galaxy"
          maxLength={48}
          autoFocus
        />
        <div className="gne-char-count">{value.length}/48</div>

        {error && <div className="gne-error">{error}</div>}

        <div className="gne-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || value.trim().length < 3}
          >
            {saving ? 'Saving...' : 'Save name'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalaxyNameEditor;
