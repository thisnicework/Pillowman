import React, { useState, useEffect } from 'react';

export default function Footer({ onOpenBooking }) {
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloating(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Sticky Action Bar */}
      <div className={`floating-ticket-bar ${showFloating ? 'visible' : ''}`}>
        <button 
          type="button" 
          className="btn-floating-ticket" 
          onClick={onOpenBooking}
        >
          <span>GET TICKET</span>
        </button>
        <button 
          type="button" 
          className="btn-floating-top" 
          onClick={scrollToTop} 
          aria-label="맨 위로 이동" 
          title="맨 위로"
        >
          ▲
        </button>
      </div>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">THE PILLOWMAN</div>
              <p className="footer-desc">
                세계를 사로잡은 마틴 맥도너의 대표작, 새로운 뮤지컬의 등장.<br />
                이야기는 살아남는다. 결국, 이야기는 살아남는다.
              </p>
              <a 
                href="https://www.instagram.com/pillowman_kr/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-link"
              >
                <span>공식 인스타그램 @pillowman_kr</span>
              </a>
            </div>

            <div className="footer-info-col">
              <h5>PERFORMANCE INFO</h5>
              <ul className="footer-info-list">
                <li><strong>일시</strong> : 2026. 11. 1.(일) 13:00</li>
                <li><strong>장소</strong> : 서울예술대학교 마동 1층 예장</li>
                <li><strong>티켓</strong> : 전석 무료 (10/22(목) 20:00 오픈)</li>
                <li><strong>러닝타임</strong> : 약 145분 (인터미션 15분)</li>
              </ul>
            </div>

            <div className="footer-info-col">
              <h5>INQUIRIES</h5>
              <ul className="footer-info-list">
                <li><strong>인스타그램</strong> : @pillowman_kr DM</li>
                <li><strong>전화문의</strong> : 010-7771-3198</li>
                <li><strong>전시운영</strong> : 12:00 - 21:30 (무료 관람)</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© 2026 THE PILLOWMAN Production. All Rights Reserved.</p>
            <p className="support-credits">서울예술대학교 앵커사업단 × EMK뮤지컬컴퍼니 제작지원</p>
          </div>
        </div>
      </footer>
    </>
  );
}
