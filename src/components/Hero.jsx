import React from 'react';
import OrnamentDivider from './OrnamentDivider';

export default function Hero({ onOpenPoster }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        {/* Date & Venue Badge */}
        <div className="hero-badge-wrap">
          <div className="hero-badge">
            <span className="badge-tag">PERFORMANCE</span>
            <span className="badge-text">2026. 11. 1.(일) 13:00 | 서울예술대학교 마동 예장</span>
          </div>
        </div>

        {/* Official Brush / Grunge Title Logo */}
        <div className="hero-logo-container">
          <img 
            src="/assets/logo-white.png" 
            alt="MUSICAL 필로우맨 (The Pillowman)" 
            className="hero-official-logo"
          />
        </div>

        {/* Subtitle & Performance Meta matching Home Mockup */}
        <div className="hero-meta-block">
          <p className="hero-original-author">
            원작 The Pillowman by Martin McDonagh
          </p>
          <p className="hero-date-venue">
            2026.11.1(SUN) 13:00 &nbsp; 서울예술대학교 마동 예장
          </p>
        </div>

        <OrnamentDivider />

        {/* CTA Buttons */}
        <div className="hero-cta-group">
          <button 
            type="button" 
            className="btn-primary-theatre" 
            onClick={() => scrollToSection('ticket')}
          >
            GET TICKET
          </button>
          
          <button 
            type="button" 
            className="btn-secondary-theatre" 
            onClick={() => scrollToSection('about')}
          >
            ABOUT THE SHOW
          </button>

          {onOpenPoster && (
            <button 
              type="button" 
              className="btn-secondary-theatre" 
              onClick={onOpenPoster}
              title="공식 포스터 전체보기"
            >
              POSTER VIEW
            </button>
          )}
        </div>
      </div>

      {/* Official Bottom Red Banner matching Home Mockup Image */}
      <div className="hero-bottom-red-band">
        <p className="hero-red-band-text">
          세계를 사로잡은 마틴 맥도너의 대표작, 새로운 뮤지컬의 등장
        </p>
      </div>
    </section>
  );
}
