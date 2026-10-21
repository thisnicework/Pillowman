import React, { useState, useEffect } from 'react';
import OrnamentDivider from './OrnamentDivider';

export default function GetTicket({ onOpenBooking, onOpenLookup }) {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isOpen: false
  });

  const [activeTab, setActiveTab] = useState('booking');

  useEffect(() => {
    const targetDate = new Date('2026-10-22T20:00:00+09:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setTimeLeft({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          isOpen: true
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isOpen: false
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section" id="ticket">
      <div className="container">
        
        {/* ==========================================================================
            OFFICIAL INFORMATION CARD (Matching Reference Image 2)
            ========================================================================== */}
        <div className="theatre-card-woodcut">
          <OrnamentDivider />
          <h2 className="section-title-warhaven" style={{ margin: '14px 0 10px' }}>
            INFORMATION
          </h2>
          <OrnamentDivider />

          <div className="info-table-wrap">
            <div className="info-row">
              <span className="info-label">작 품 명</span>
              <span className="info-val">뮤지컬 &lt;필로우맨&gt;</span>
            </div>
            <div className="info-row">
              <span className="info-label">공연일시</span>
              <span className="info-val">2026.11.1.(일) 13:00</span>
            </div>
            <div className="info-row">
              <span className="info-label">공연장소</span>
              <span className="info-val">서울예술대학교 마동 예장</span>
            </div>
            <div className="info-row">
              <span className="info-label">티켓가격</span>
              <span className="info-val" style={{ color: 'var(--accent-red)', fontWeight: 700 }}>전석 무료</span>
            </div>
            <div className="info-row">
              <span className="info-label">러닝타임</span>
              <span className="info-val">약 145분 (인터미션 15분 포함)</span>
            </div>
            <div className="info-row">
              <span className="info-label">관람연령</span>
              <span className="info-val">15세 이상 관람가</span>
            </div>
            <div className="info-row">
              <span className="info-label">문&nbsp;&nbsp;&nbsp;&nbsp;의</span>
              <span className="info-val">
                <a href="https://www.instagram.com/pillowman_kr/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                  @pillowman_kr DM
                </a>{' '}/ 010-7771-3198
              </span>
            </div>
          </div>
        </div>

        {/* ==========================================================================
            TICKET OPEN & COUNTDOWN
            ========================================================================== */}
        <div className="ticket-countdown-container">
          <div>
            <div style={{ fontFamily: 'var(--font-title)', letterSpacing: '-0.04em', fontSize: '1.4rem', color: 'var(--title-color)', fontWeight: 700 }}>
              TICKET OPEN
            </div>
            <div style={{ fontFamily: 'var(--font-title)', letterSpacing: '-0.03em', fontSize: '1.8rem', color: 'var(--accent-red)', fontWeight: 700, margin: '4px 0' }}>
              10/22(목) 20:00
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--body-color)' }}>
              * 10/30(금) 자정까지 예매 가능하도록 설정 | 회차당 1인 1매 비지정석
            </p>
          </div>

          <div className="countdown-timer-grid">
            <div className="timer-slot">
              <span className="timer-num">{timeLeft.days}</span>
              <span className="timer-label">DAYS</span>
            </div>
            <div className="timer-slot">
              <span className="timer-num">{timeLeft.hours}</span>
              <span className="timer-label">HOURS</span>
            </div>
            <div className="timer-slot">
              <span className="timer-num">{timeLeft.minutes}</span>
              <span className="timer-label">MINUTES</span>
            </div>
            <div className="timer-slot">
              <span className="timer-num">{timeLeft.seconds}</span>
              <span className="timer-label">SECONDS</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="booking-actions-row">
          <button 
            type="button" 
            className="btn-action-big btn-action-primary" 
            onClick={onOpenBooking}
          >
            <div>
              <span className="title">예매하기</span>
              <span className="sub">*예매 시 이름/전화번호 작성 (1인 1매 무료)</span>
            </div>
            <span style={{ fontSize: '1.4rem' }}>➔</span>
          </button>

          <button 
            type="button" 
            className="btn-action-big btn-action-secondary" 
            onClick={onOpenLookup}
          >
            <div>
              <span className="title">예매 조회 및 취소</span>
              <span className="sub">예매자명 + 전화번호로 확인</span>
            </div>
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
          </button>
        </div>

        {/* Official Main Poster Display */}
        <div className="official-poster-container" onClick={onOpenPoster} role="button" tabIndex={0} title="포스터 크게 보기">
          <div className="poster-badge-top">OFFICIAL POSTER</div>
          <img 
            src="/assets/poster.png" 
            alt="뮤지컬 필로우맨 공식 메인 포스터" 
            className="get-ticket-poster-img"
          />
          <div className="poster-hover-overlay">
            <span>🔍 클릭하여 포스터 크게 보기</span>
          </div>
        </div>

        {/* 4 Guidelines Tabs */}
        <div className="guidelines-container">
          <div className="guideline-tabs" role="tablist">
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'booking' ? 'active' : ''}`} 
              onClick={() => setActiveTab('booking')}
              role="tab"
            >
              예매 안내
            </button>
            <button 
              type="button" 
              className={`tab-btn tab-warning ${activeTab === 'trigger' ? 'active' : ''}`} 
              onClick={() => setActiveTab('trigger')}
              role="tab"
            >
              트리거워닝 안내
            </button>
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'pickup' ? 'active' : ''}`} 
              onClick={() => setActiveTab('pickup')}
              role="tab"
            >
              티켓 수령 안내
            </button>
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'onsite' ? 'active' : ''}`} 
              onClick={() => setActiveTab('onsite')}
              role="tab"
            >
              현장 예매 안내
            </button>
          </div>

          <div className="guidelines-panels">
            {/* 1. 예매 안내 */}
            {activeTab === 'booking' && (
              <div className="guideline-panel active" role="tabpanel">
                <h3 className="guideline-panel-title">예매 안내</h3>
                <ul className="guideline-list">
                  <li>본 공연은 인터미션(15분) 포함 약 145분간 진행됩니다.</li>
                  <li>본 공연은 전석 무료이며, 서울예술대학교 재학생 및 외부인 모두 예매 가능합니다.</li>
                  <li>전석 비지정석 예매로 진행되며, 공연 당일 티켓 수령 순서에 따라 선착순으로 좌석이 배정됩니다.</li>
                  <li>회차당 1인 1매까지 예매가 가능합니다.</li>
                  <li>공연 전 날, 예매자를 대상으로 관람 안내 문자가 발송됩니다.</li>
                </ul>
                <div className="guideline-alert-box">
                  *관람이 불가할 경우, 반드시 예매를 취소하여 다른 관객에게 관람 기회가 제공될 수 있도록 협조 부탁드립니다.<br />
                  *공연 당일 잔여표에 한해 현장 예매가 가능합니다.
                </div>
              </div>
            )}

            {/* 2. 트리거워닝 안내 */}
            {activeTab === 'trigger' && (
              <div className="guideline-panel active" role="tabpanel">
                <div className="trigger-card-inner">
                  <h3 className="guideline-panel-title" style={{ color: 'var(--accent-red)' }}>트리거워닝 안내</h3>
                  <p className="trigger-lead">
                    뮤지컬 〈필로우맨〉은 잔혹한 동화와 현실의 폭력을 주요 소재로 다루고 있습니다.
                  </p>
                  <p className="trigger-body">
                    작품에는 아동학대 및 아동 대상 폭력·살인, 고문과 강압적 심문, 신체 훼손, 자살과 죽음, 총기를 사용하는 장면, 흡연을 묘사하는 장면, 욕설 및 폭력적인 언어가 포함되어 있으며, 일부 장면에서는 위와 같은 내용이 직접적으로 묘사되거나 강렬하게 표현됩니다.<br /><br />
                    관람에 앞서 위 내용을 확인하시고 관람에 참고해 주시기 바랍니다.
                  </p>
                </div>
              </div>
            )}

            {/* 3. 티켓 수령 안내 */}
            {activeTab === 'pickup' && (
              <div className="guideline-panel active" role="tabpanel">
                <h3 className="guideline-panel-title">티켓 수령 안내</h3>
                <ul className="guideline-list">
                  <li>공연 시작 1시간 전부터 마동 로비에 위치한 티켓부스에서 수령 가능합니다.</li>
                  <li>티켓부스에서 예매자명과 전화번호 뒷자리 또는 예매내역서 확인 부탁드립니다.</li>
                  <li>발권된 티켓이 분실 또는 훼손된 경우, 재발권이 불가하오니 보관에 유의하시기 바랍니다.</li>
                </ul>
                <div className="guideline-alert-box">
                  * 공연 시작 5분 전까지 티켓 미수령시 취소표로 간주되어 관람이 제한되니, 반드시 5분 전까지 티켓 수령 부탁드립니다.
                </div>
              </div>
            )}

            {/* 4. 현장 예매 안내 */}
            {activeTab === 'onsite' && (
              <div className="guideline-panel active" role="tabpanel">
                <h3 className="guideline-panel-title">현장 예매 안내</h3>
                <ul className="guideline-list">
                  <li>공연 당일 미수령 및 취소표에 한해 현장예매가 가능합니다.</li>
                  <li>공연 시작 1시간 전, 관객 대기실(마동 102호)에서 선착순으로 현장예매 명단 작성이 가능합니다.</li>
                  <li>공연 시작 5분 전, 마동 로비에 위치한 티켓부스에서 명단을 순서대로 호명하며, 현장에 없을 시 다음 순서로 넘어갑니다.</li>
                </ul>
                <div className="guideline-alert-box">
                  *미수령 및 취소표가 미발생할 경우, 명단을 작성하셨더라도 관람이 불가할 수 있습니다.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
