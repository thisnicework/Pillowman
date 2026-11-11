import React, { useState, useEffect, useCallback } from 'react';
import { LOCATIONS } from './data/locations';
import KameniceMap from './components/KameniceMap';
import LocationDetailModal from './components/LocationDetailModal';
import './App.css';

export default function App() {
  const [activeLocationId, setActiveLocationId] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return LOCATIONS.some((loc) => loc.id === hash) ? hash : null;
  });
  const [isIndexOpen, setIsIndexOpen] = useState(false);

  // Sync with browser hash navigation (Back / Forward / Direct URL)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (LOCATIONS.some((loc) => loc.id === hash)) {
        setActiveLocationId(hash);
      } else {
        setActiveLocationId(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectLocation = useCallback((id) => {
    setActiveLocationId(id);
    window.history.pushState(null, '', `#${id}`);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveLocationId(null);
    window.history.pushState(null, '', window.location.pathname + window.location.search);
  }, []);

  const activeLocation = LOCATIONS.find((loc) => loc.id === activeLocationId) || null;

  return (
    <div className="app-shell">
      {/* Top Floating Archival Header */}
      <header className="top-hud">
        <div className="brand-block">
          <span className="brand-eyebrow">THE PILLOWMAN STORY ARCHIVE</span>
          <h1 className="brand-title">카메니체 숲 지도</h1>
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className={`hud-index-btn ${isIndexOpen ? 'active' : ''}`}
            onClick={() => setIsIndexOpen((prev) => !prev)}
            aria-expanded={isIndexOpen}
          >
            <span>지도 표기 · 이야기 색인</span>
            <span className="index-count">{LOCATIONS.length}</span>
          </button>
        </div>
      </header>

      {/* Collapsible Story Index Table (Matches Proposal Page 1-2 Table) */}
      {isIndexOpen && (
        <aside className="story-index-panel" aria-label="지도 표기 및 이야기 목록">
          <div className="index-panel-header">
            <h2>지도 표기별 이야기 목록</h2>
            <button
              type="button"
              className="index-close-btn"
              onClick={() => setIsIndexOpen(false)}
              aria-label="색인 닫기"
            >
              ✕
            </button>
          </div>
          <ul className="index-list">
            {LOCATIONS.map((loc) => (
              <li key={loc.id}>
                <button
                  type="button"
                  className={`index-row-btn ${activeLocationId === loc.id ? 'active' : ''}`}
                  onClick={() => {
                    handleSelectLocation(loc.id);
                    setIsIndexOpen(false);
                  }}
                >
                  <span className="index-code">{loc.code}</span>
                  <span className="index-place">{loc.name}</span>
                  <span className="index-story">{loc.tableStory}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Main Interactive Map Canvas */}
      <main className="main-map-viewport">
        <KameniceMap
          locations={LOCATIONS}
          activeLocationId={activeLocationId}
          onSelectLocation={handleSelectLocation}
        />
      </main>

      {/* Bottom Quick Location Bar for Accessibility & Mobile */}
      <nav className="bottom-location-dock" aria-label="장소 빠른 이동">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            type="button"
            className={`dock-pill ${activeLocationId === loc.id ? 'active' : ''}`}
            onClick={() => handleSelectLocation(loc.id)}
          >
            <span className="dock-code">{loc.code}.</span>
            <span className="dock-name">{loc.name}</span>
          </button>
        ))}
      </nav>

      {/* Detail Page Modal Overlay */}
      <LocationDetailModal
        location={activeLocation}
        locations={LOCATIONS}
        onClose={handleCloseModal}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
}
