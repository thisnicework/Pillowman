import React, { useState, useEffect } from 'react';

export default function Header({ onOpenBooking }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);

      // Scrollspy
      const sections = ['home', 'ticket', 'about', 'team', 'theatre'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 140;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`} id="main-header">
      <div className="nav-container">
        <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="brand-logo" aria-label="필로우맨 홈으로 이동">
          <img src="/assets/symbol-white-tight.png" alt="필로우맨 심볼" className="brand-symbol-img" />
          <div className="brand-text-wrap">
            <span className="brand-title">THE PILLOWMAN</span>
            <span className="brand-sub">뮤지컬 〈필로우맨〉</span>
          </div>
        </a>

        {/* Desktop & Mobile Menu */}
        <nav aria-label="메인 내비게이션">
          <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <li>
              <a 
                href="#home" 
                onClick={(e) => handleNavClick(e, 'home')} 
                className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              >
                HOME
              </a>
            </li>
            <li>
              <a 
                href="#ticket" 
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  if (onOpenBooking) onOpenBooking();
                }} 
                className={`nav-link ${activeSection === 'ticket' ? 'active' : ''}`}
              >
                GET TICKET
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                onClick={(e) => handleNavClick(e, 'about')} 
                className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
              >
                ABOUT PILLOWMAN
              </a>
            </li>
            <li>
              <a 
                href="#team" 
                onClick={(e) => handleNavClick(e, 'team')} 
                className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}
              >
                TEAM
              </a>
            </li>
            <li>
              <a 
                href="#theatre" 
                onClick={(e) => handleNavClick(e, 'theatre')} 
                className={`nav-link ${activeSection === 'theatre' ? 'active' : ''}`}
              >
                ABOUT THE THEATRE
              </a>
            </li>
          </ul>
        </nav>

        {/* Nav Actions: Instagram & Ticket CTA */}
        <div className="nav-actions">
          <a 
            href="https://www.instagram.com/pillowman_kr/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-icon-insta" 
            title="공식 인스타그램 바로가기 (@pillowman_kr)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          
          <button 
            type="button" 
            className="btn-nav-ticket" 
            onClick={() => {
              if (onOpenBooking) onOpenBooking();
            }}
          >
            GET TICKET
          </button>

          <div 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </header>
  );
}
