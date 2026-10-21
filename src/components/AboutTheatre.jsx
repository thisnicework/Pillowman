import React from 'react';
import OrnamentDivider from './OrnamentDivider';

export default function AboutTheatre({ onNotify }) {
  const addressText = '경기도 안산시 단원구 예술대학로 171, 서울예술대학교 마동 1층 예장';

  const handleCopyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(addressText).then(() => {
        if (onNotify) onNotify('공연장 주소가 클립보드에 복사되었습니다.');
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const tempInput = document.createElement('input');
    tempInput.value = addressText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    if (onNotify) onNotify('공연장 주소가 클립보드에 복사되었습니다.');
  };

  return (
    <section className="section section-darker" id="theatre">
      <div className="container">
        <div className="section-header-box">
          <OrnamentDivider />
          <h2 className="section-title-warhaven">ABOUT THE THEATRE</h2>
          <OrnamentDivider />
        </div>

        {/* 극장 이용 안내 */}
        <div className="theatre-rules-box">
          <h3 style={{ fontFamily: 'var(--font-title)', letterSpacing: '-0.04em', fontSize: '1.25rem', color: 'var(--title-color)', marginBottom: '18px' }}>
            극장 이용 안내
          </h3>
          <ul className="theatre-rules-list">
            <li>본 공연은 인터미션(15분) 포함 약 145분간 진행되며, 객석 입장은 공연 시작 30분 전부터 가능합니다.</li>
            <li><strong style={{ color: 'var(--accent-red)' }}>공연 시작 후에는 추가 입장 및 재입장이 제한됩니다.</strong></li>
            <li>배정된 좌석 외 다른 좌석으로의 이동은 불가합니다.</li>
            <li><strong style={{ color: 'var(--title-color)' }}>본 공연은 공연 시작 전 빈 무대와 공연 종료 후 커튼콜만 촬영이 가능하며, 이 외 합의되지 않은 모든 촬영은 불가합니다.</strong></li>
            <li>공연장 내 생수를 제외한 모든 음료, 음식물 섭취 및 꽃다발 반입이 금지되어 있습니다.</li>
            <li>반입 제한 물품과 부피가 큰 짐은 관객 대기실 내 자율 물품보관소 이용을 부탁드립니다.</li>
          </ul>
        </div>

        {/* 찾아오시는 길 */}
        <div className="address-bar-vintage">
          <div>
            <div className="address-title">찾아오시는 길 — 서울예술대학교 마동 예장</div>
            <div className="address-desc">경기도 안산시 단원구 예술대학로 171, 서울예술대학교 마동 1층</div>
          </div>

          <div className="address-actions">
            <button 
              type="button" 
              className="btn-pill-action btn-pill-copy" 
              onClick={handleCopyAddress}
            >
              📋 주소 복사하기
            </button>
            <a 
              href="https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%EC%98%88%EC%88%A0%EB%8C%80%ED%95%99%EA%B5%90" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-pill-action btn-pill-naver"
            >
              네이버 지도 길찾기
            </a>
            <a 
              href="https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8%EC%98%88%EC%88%A0%EB%8C%80%ED%95%99%EA%B5%90" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-pill-action btn-pill-kakao"
            >
              카카오맵 길찾기
            </a>
          </div>
        </div>

        {/* Transit Grid */}
        <div className="transit-grid-vintage">
          <div className="transit-box-vintage">
            <div className="transit-box-head">
              <span className="subway-badge">4호선</span>
              <span className="transit-station-name">중앙역 하차 시</span>
            </div>
            <p>
              중앙역 <strong>1번 출구</strong> 인근 정류장에서 시내버스 <strong>77번</strong>(부곡 방면) 승차 후, <strong>‘서울예술대학교’</strong> 정류장에서 하차
            </p>
          </div>

          <div className="transit-box-vintage">
            <div className="transit-box-head">
              <span className="subway-badge">4호선</span>
              <span className="transit-station-name">고잔역 하차 시</span>
            </div>
            <p>
              고잔역 인근에서 시내버스 <strong>99-1번</strong> 승차 후, <strong>‘고잔주공7단지’</strong> 정류장 하차 후 도보 이동
            </p>
          </div>
        </div>

        <div className="transit-parking-alert">
          *공연장 내 주차 공간이 마련되어 있지 않으니, 가급적 대중교통 이용을 권장드립니다.
        </div>
      </div>
    </section>
  );
}
