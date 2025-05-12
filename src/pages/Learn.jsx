import React, { useState, useMemo, useRef } from 'react';
import data from '../../Data/MS-ASL/MSASL_Train.json';
import words from '../../Data/MS-ASL/MSASL_classes.json';
import synonyms from '../../Data/MS-ASL/MSASL_synonym.json';

export default function LearningPage() {
  // inputValue updates on each keystroke; searchTerm only updates on Enter
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data only when searchTerm changes (i.e., after Enter)
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    if (!words.includes(term)) return [];

    const searchTerms = new Set([term]);
    const syns = synonyms[term] || [];
    syns.forEach(s => searchTerms.add(s.toLowerCase()));

    return data.filter(item => {
      const clean = item.clean_text.toLowerCase();
      const org = item.org_text.toLowerCase();
      for (const t of searchTerms) {
        if (clean === t || org.includes(t)) {
          return true;
        }
      }
      return false;
    });
  }, [searchTerm]);

  const toEmbedUrl = url => {
    try {
      const urlObj = new URL(url);
      const vid = urlObj.searchParams.get('v');
      return vid ? `https://www.youtube.com/embed/${vid}` : url;
    } catch {
      return null;
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      setSearchTerm(inputValue.trim());
    }
  };

  return (
    <div className="learning-page">
      <div className="search-container">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search to Learn"
          className="search-input"
        />
      </div>

      <div className="results">
        {searchTerm && filtered.length === 0 && (
          <p className="no-results">
            No videos found for “{searchTerm}”.
          </p>
        )}

        {filtered.map((item, idx) => (
          <div key={idx} className="item-container">
            <div className="results-video">
              <iframe
                className="video"
                src={toEmbedUrl(item.url)}
                title={item.clean_text}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="label">
              <h3 className="text">{item.org_text}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}