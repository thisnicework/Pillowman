import React, { useEffect, useState } from 'react';

const TABS = [
  { id: 'all', label: '전체 보기' },
  { id: 'story', label: '이야기 텍스트' },
  { id: 'archive', label: '전시 아카이빙' },
  { id: 'character', label: '캐릭터 페이지' },
  { id: 'extra', label: '+@ (미니게임 · 이스터에그)' }
];

export default function LocationDetailModal({
  location,
  locations,
  onClose,
  onSelectLocation
}) {
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setActiveTab('all');
  }, [location?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!location) return null;

  const currentIndex = locations.findIndex((item) => item.id === location.id);
  const prevLocation = locations[(currentIndex - 1 + locations.length) % locations.length];
  const nextLocation = locations[(currentIndex + 1) % locations.length];

  const showStory = activeTab === 'all' || activeTab === 'story';
  const showArchive = activeTab === 'all' || activeTab === 'archive';
  const showCharacter = activeTab === 'all' || activeTab === 'character';
  const showExtra = activeTab === 'all' || activeTab === 'extra';

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-location-title"
    >
      <div className="modal-sheet">
        {/* Top Archival Bar */}
        <header className="modal-header">
          <div className="modal-title-group">
            <div className="modal-meta-row">
              <span className="modal-code-badge">구역 {location.code}</span>
              <span className="modal-team-badge">{location.teamBadge}</span>
              <span className="modal-table-story">{location.tableStory}</span>
            </div>
            <h2 id="modal-location-title" className="modal-title">
              {location.name}
              <span className="modal-title-divider">—</span>
              <span className="modal-story-subtitle">{location.storyTitle}</span>
            </h2>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="세부 페이지 닫기 (ESC)"
          >
            <span>지도 돌아가기</span>
            <span className="close-x" aria-hidden="true">✕</span>
          </button>
        </header>

        {/* Section Tabs */}
        <nav className="modal-tabs" aria-label="세부 페이지 구성 탭">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`modal-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Scrollable Content Body */}
        <div className="modal-body">
          {/* 1. 이야기 텍스트 (Story Text from Proposal 2-1) */}
          {showStory && (
            <section className="detail-section story-text-section">
              <div className="section-heading-row">
                <span className="section-index">01</span>
                <h3 className="section-heading">이야기 텍스트</h3>
                <span className="section-sub">장소 설명 및 도입 서사</span>
              </div>

              <div className="story-manuscript-box">
                {location.description.map((line, index) => {
                  const isQuote = line.startsWith('"') || line.startsWith('“');
                  return (
                    <p
                      key={index}
                      className={`manuscript-line ${isQuote ? 'manuscript-quote' : ''}`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2. 전시 아카이빙 (Exhibition Archiving Placeholder) */}
          {showArchive && (
            <section className="detail-section">
              <div className="section-heading-row">
                <span className="section-index">02</span>
                <h3 className="section-heading">전시 아카이빙</h3>
                <span className="section-sub">작품 사진 · 영상 · 텍스트 맵 아카이브 영역</span>
              </div>

              <div className="placeholder-grid">
                {location.archivePlaceholders.map((item, idx) => (
                  <div key={idx} className="placeholder-card archive-card">
                    <div className="placeholder-thumb">
                      <span className="placeholder-icon" aria-hidden="true">▢</span>
                      <span className="placeholder-tag">{item.type}</span>
                    </div>
                    <div className="placeholder-info">
                      <h4>{item.title}</h4>
                      <p>{item.note || item.status || '전시 기록'} · 전시 콘텐츠 플레이스홀더</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. 캐릭터 페이지 (Character Page Placeholder) */}
          {showCharacter && (
            <section className="detail-section">
              <div className="section-heading-row">
                <span className="section-index">03</span>
                <h3 className="section-heading">캐릭터 페이지</h3>
                <span className="section-sub">등장인물 프로필 및 관계도 영역</span>
              </div>

              <div className="placeholder-grid character-grid">
                {location.characterPlaceholders.map((char, idx) => (
                  <div key={idx} className="placeholder-card character-card">
                    <div className="character-portrait-placeholder" aria-hidden="true">
                      <span>인물 초상</span>
                      <small>PORTRAIT</small>
                    </div>
                    <div className="character-details">
                      <span className="character-role">{char.role}</span>
                      <h4>{char.name}</h4>
                      <p>{char.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. +@ (미니 게임, 이스터 에그 등 Placeholder) */}
          {showExtra && (
            <section className="detail-section">
              <div className="section-heading-row">
                <span className="section-index">04</span>
                <h3 className="section-heading">+@ (미니 게임 · 이스터 에그)</h3>
                <span className="section-sub">인터랙티브 체험 요소 플레이스홀더</span>
              </div>

              <div className="extra-interactive-placeholder">
                <div className="extra-badge">INTERACTIVE MODULE PLACEHOLDER</div>
                <h4>{location.extraPlaceholder.title}</h4>
                <p className="extra-desc">{location.extraPlaceholder.desc || location.extraPlaceholder.subtitle}</p>
                <div className="extra-wireframe-box">
                  <span>[ 미니 게임 / 이스터 에그 캔버스 영역 ]</span>
                  <small>{location.extraPlaceholder.desc || location.extraPlaceholder.hint}</small>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer Navigation between locations */}
        <footer className="modal-footer">
          <button
            type="button"
            className="footer-nav-btn prev"
            onClick={() => onSelectLocation(prevLocation.id)}
          >
            <span className="nav-arrow" aria-hidden="true">←</span>
            <span className="nav-text">
              <small>이전 장소 ({prevLocation.code})</small>
              <strong>{prevLocation.name}</strong>
            </span>
          </button>

          <span className="footer-hash-indicator">
            #{location.id}
          </span>

          <button
            type="button"
            className="footer-nav-btn next"
            onClick={() => onSelectLocation(nextLocation.id)}
          >
            <span className="nav-text">
              <small>다음 장소 ({nextLocation.code})</small>
              <strong>{nextLocation.name}</strong>
            </span>
            <span className="nav-arrow" aria-hidden="true">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

