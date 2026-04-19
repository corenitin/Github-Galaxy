import React, { useState, useCallback } from 'react';
import './SearchBar.css';

const SearchBar = ({ planets, onFilter }) => {
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState('');

  const languages = [...new Set(planets.map(p => p.language).filter(Boolean))].sort();

  const applyFilter = useCallback((q, lang) => {
    let filtered = planets;
    if (q.trim()) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.topics?.some(t => t.toLowerCase().includes(lower))
      );
    }
    if (lang) {
      filtered = filtered.filter(p => p.language === lang);
    }
    onFilter(filtered);
  }, [planets, onFilter]);

  const handleQuery = (e) => {
    setQuery(e.target.value);
    applyFilter(e.target.value, langFilter);
  };

  const handleLang = (e) => {
    setLangFilter(e.target.value);
    applyFilter(query, e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setLangFilter('');
    onFilter(planets);
  };

  const isFiltered = query || langFilter;

  return (
    <div className="searchbar">
      <div className="search-input-wrap">
        <span className="search-icon">⌕</span>
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={handleQuery}
          placeholder="Search planets..."
        />
        {isFiltered && (
          <button className="search-clear" onClick={handleClear}>✕</button>
        )}
      </div>
      <select className="lang-select" value={langFilter} onChange={handleLang}>
        <option value="">All languages</option>
        {languages.map(l => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
    </div>
  );
};

export default SearchBar;
