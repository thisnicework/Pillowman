import React, { useState } from 'react';

// 침엽수림 (카메니체 숲의 분위기)
const PINE_TREES = [
  { x: 380, y: 240, scale: 0.85 },
  { x: 440, y: 210, scale: 0.9 },
  { x: 490, y: 195, scale: 1.0 },
  { x: 580, y: 200, scale: 0.95 },
  { x: 640, y: 220, scale: 0.9 },
  { x: 680, y: 245, scale: 0.85 },
  { x: 730, y: 215, scale: 1.05 },
  { x: 780, y: 240, scale: 0.95 },
  { x: 505, y: 285, scale: 0.9 },
  { x: 555, y: 295, scale: 0.85 },
  { x: 700, y: 460, scale: 0.85 },
  { x: 735, y: 440, scale: 0.8 },
  { x: 670, y: 530, scale: 0.8 },
  { x: 195, y: 360, scale: 0.85 },
  { x: 360, y: 390, scale: 0.75 }
];

function PineTree({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity="0.55" pointerEvents="none">
      <line x1="0" y1="8" x2="0" y2="24" stroke="rgba(220, 214, 200, 0.45)" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M 0 -22 L -10 -7 L -4 -7 L -13 4 L -5 4 L -15 15 L 15 15 L 5 4 L 13 4 L 4 -7 L 10 -7 Z"
        fill="#141619"
        stroke="rgba(220, 214, 200, 0.5)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line x1="-5" y1="-3" x2="4" y2="-3" stroke="rgba(220, 214, 200, 0.25)" strokeWidth="1" />
      <line x1="-7" y1="7" x2="6" y2="7" stroke="rgba(220, 214, 200, 0.25)" strokeWidth="1" />
    </g>
  );
}

export default function KameniceMap({ locations, activeLocationId, onSelectLocation }) {
  const [hoveredLocId, setHoveredLocId] = useState(null);

  // ID로 위치 정보 가져오기
  const locMap = locations.reduce((acc, loc) => {
    acc[loc.id] = loc;
    return acc;
  }, {});

  const hoveredLoc = hoveredLocId ? locMap[hoveredLocId] : null;

  return (
    <div className="map-stage">
      <div className="map-board">
        <svg
          viewBox="0 0 1000 680"
          className="kamenice-svg-canvas"
          preserveAspectRatio="xMidYMid meet"
          aria-label="카메니체 숲 지도"
        >
          <defs>
            {/* 분필 질감 및 발광 효과 */}
            <radialGradient id="forest-bg" cx="50%" cy="48%" r="60%">
              <stop offset="0%" stopColor="#1a1c20" />
              <stop offset="65%" stopColor="#121316" />
              <stop offset="100%" stopColor="#0a0b0d" />
            </radialGradient>

            <filter id="chalk-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 칠판 배경 */}
          <rect width="1000" height="680" fill="url(#forest-bg)" />

          {/* 지도 외곽 미세 프레임 */}
          <rect
            x="20"
            y="20"
            width="960"
            height="640"
            fill="none"
            stroke="rgba(225, 218, 202, 0.12)"
            strokeWidth="1"
            strokeDasharray="8 6"
          />

          {/* 1. 좌측 상단 나침반 (N, S, W, E - PDF 1페이지 시안과 동일) */}
          <g transform="translate(115, 105)" opacity="0.82" pointerEvents="none">
            <line x1="0" y1="-26" x2="0" y2="26" stroke="rgba(225, 218, 202, 0.78)" strokeWidth="1.3" />
            <line x1="-26" y1="0" x2="26" y2="0" stroke="rgba(225, 218, 202, 0.78)" strokeWidth="1.3" />
            <line x1="-4" y1="-14" x2="4" y2="-14" stroke="rgba(225, 218, 202, 0.55)" strokeWidth="1.1" />
            <line x1="-14" y1="-4" x2="-14" y2="4" stroke="rgba(225, 218, 202, 0.55)" strokeWidth="1.1" />
            <circle cx="0" cy="0" r="2.2" fill="rgba(225, 218, 202, 0.85)" />
            <text x="0" y="-34" textAnchor="middle" fill="rgba(225, 218, 202, 0.88)" fontSize="13" fontFamily="'Cormorant Garamond', serif">N</text>
            <text x="0" y="44" textAnchor="middle" fill="rgba(225, 218, 202, 0.88)" fontSize="13" fontFamily="'Cormorant Garamond', serif">S</text>
            <text x="-38" y="4" textAnchor="middle" fill="rgba(225, 218, 202, 0.88)" fontSize="13" fontFamily="'Cormorant Garamond', serif">W</text>
            <text x="38" y="4" textAnchor="middle" fill="rgba(225, 218, 202, 0.88)" fontSize="13" fontFamily="'Cormorant Garamond', serif">E</text>
          </g>

          {/* 2. 좌측 굽이치는 강 (River) */}
          <g opacity="0.6" pointerEvents="none">
            <path
              d="M 324 70 C 344 180, 285 240, 310 320 C 334 395, 282 440, 318 510 C 350 568, 312 612, 345 660"
              fill="none"
              stroke="rgba(210, 204, 190, 0.45)"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M 324 70 C 344 180, 285 240, 310 320 C 334 395, 282 440, 318 510 C 350 568, 312 612, 345 660"
              fill="none"
              stroke="#131518"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M 321 70 C 341 180, 282 240, 307 320 C 331 395, 279 440, 315 510 C 347 568, 309 612, 342 660"
              fill="none"
              stroke="rgba(210, 204, 190, 0.35)"
              strokeWidth="1.2"
            />
            <path
              d="M 327 70 C 347 180, 288 240, 313 320 C 337 395, 285 440, 321 510 C 353 568, 315 612, 348 660"
              fill="none"
              stroke="rgba(210, 204, 190, 0.3)"
              strokeWidth="1"
            />
          </g>

          {/* 3. 돌다리 (Bridge - 유대인 구역과 카투리안의 집 연결) */}
          <g transform="translate(315, 435)" opacity="0.9" pointerEvents="none">
            <path d="M -26 6 Q 0 -13 26 6" fill="#15171a" stroke="rgba(235, 228, 213, 0.88)" strokeWidth="2" />
            <path d="M -24 12 Q 0 -5 24 12" fill="none" stroke="rgba(235, 228, 213, 0.78)" strokeWidth="1.5" />
            <line x1="-13" y1="1" x2="-13" y2="8" stroke="rgba(235, 228, 213, 0.65)" strokeWidth="1.2" />
            <line x1="0" y1="-3" x2="0" y2="4" stroke="rgba(235, 228, 213, 0.65)" strokeWidth="1.2" />
            <line x1="13" y1="1" x2="13" y2="8" stroke="rgba(235, 228, 213, 0.65)" strokeWidth="1.2" />
          </g>

          {/* 4. 점선 길 (Footpaths - PDF 1페이지 시안의 동선 그대로 연결) */}
          <g
            fill="none"
            stroke="rgba(228, 220, 204, 0.58)"
            strokeWidth="1.8"
            strokeDasharray="4 6"
            strokeLinecap="round"
            pointerEvents="none"
          >
            {/* 유대인 구역 -> 다리 -> 카투리안의 집 */}
            <path d="M 275 435 L 340 435 C 375 430, 395 385, 420 355" />
            {/* 다리 -> 벌판 */}
            <path d="M 340 438 C 410 445, 460 475, 545 470" />
            {/* 카투리안의 집 -> 소원의 우물 / 장난감 집 */}
            <path d="M 435 365 C 500 395, 545 405, 620 420" />
            {/* 소원의 우물 / 장난감 집 -> 필로우맨 (숲) */}
            <path d="M 645 400 C 680 370, 715 345, 745 325" />
            {/* 유대인 구역 -> 검열국 */}
            <path d="M 260 410 C 248 360, 240 315, 235 285" />
          </g>

          {/* 5. 숲의 침엽수들 */}
          {PINE_TREES.map((tree, idx) => (
            <PineTree key={idx} x={tree.x} y={tree.y} scale={tree.scale} />
          ))}

          {/* 6. 중앙 타이틀: 카메니체 숲 */}
          <g transform="translate(535, 175)" pointerEvents="none">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill="rgba(235, 228, 214, 0.92)"
              fontSize="24"
              fontWeight="700"
              letterSpacing="0.14em"
              fontFamily="'Gowun Batang', 'Noto Serif KR', serif"
            >
              카메니체 숲
            </text>
            <text
              x="0"
              y="22"
              textAnchor="middle"
              fill="rgba(190, 182, 168, 0.52)"
              fontSize="10.5"
              letterSpacing="0.28em"
              fontFamily="'Cormorant Garamond', serif"
            >
              KAMENICE FOREST
            </text>
          </g>

          {/* 7. 우측 하단 축척선 (Scale: 0 - 1 - 2km) */}
          <g transform="translate(760, 595)" opacity="0.82" pointerEvents="none">
            <line x1="0" y1="0" x2="110" y2="0" stroke="rgba(225, 218, 202, 0.8)" strokeWidth="1.5" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="rgba(225, 218, 202, 0.8)" strokeWidth="1.5" />
            <line x1="55" y1="-4" x2="55" y2="4" stroke="rgba(225, 218, 202, 0.8)" strokeWidth="1.3" />
            <line x1="110" y1="-6" x2="110" y2="6" stroke="rgba(225, 218, 202, 0.8)" strokeWidth="1.5" />
            <text x="0" y="19" textAnchor="middle" fill="rgba(225, 218, 202, 0.88)" fontSize="12" fontFamily="'Cormorant Garamond', serif">0</text>
            <text x="55" y="19" textAnchor="middle" fill="rgba(225, 218, 202, 0.88)" fontSize="12" fontFamily="'Cormorant Garamond', serif">1</text>
            <text x="112" y="19" textAnchor="middle" fill="rgba(225, 218, 202, 0.88)" fontSize="12" fontFamily="'Cormorant Garamond', serif">2km</text>
          </g>

          {/* ================================================================= */}
          {/* 8. 인터랙티브 장소 노드들 (SVG 일러스트 + 명패 라벨 박스) */}
          {/* ================================================================= */}

          {/* A. 카투리안의 집 (중앙 x: 425, y: 355) */}
          <g
            className={`map-interactive-node ${hoveredLocId === 'katurian-house' ? 'is-hover' : ''} ${activeLocationId === 'katurian-house' ? 'is-active' : ''}`}
            transform="translate(425, 345)"
            onClick={() => onSelectLocation('katurian-house')}
            onMouseEnter={() => setHoveredLocId('katurian-house')}
            onMouseLeave={() => setHoveredLocId(null)}
            role="button"
            tabIndex={0}
            aria-label="카투리안의 집 세부 페이지 열기"
          >
            {/* 호버 배경 글로우 */}
            <circle cx="0" cy="-5" r="54" className="node-glow" />

            {/* 집 일러스트 & 굴뚝 연기 */}
            <path
              d="M 16 -44 C 19 -52, 27 -50, 30 -57 C 33 -62, 42 -60, 46 -63"
              fill="none"
              stroke="rgba(235, 228, 213, 0.75)"
              strokeWidth="1.4"
              strokeDasharray="2 2"
              strokeLinecap="round"
            />
            <rect x="13" y="-36" width="7" height="14" fill="#18191c" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.4" />
            <polygon points="-36,-10 0,-37 36,-10" fill="#1b1d20" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.6" strokeLinejoin="round" />
            <line x1="-22" y1="-20" x2="22" y2="-20" stroke="rgba(235, 228, 213, 0.35)" strokeWidth="1" />
            <rect x="-5" y="-25" width="10" height="9" fill="#121316" stroke="rgba(235, 228, 213, 0.85)" strokeWidth="1.2" />
            <rect x="-28" y="-10" width="56" height="26" fill="#15171a" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.6" />
            <rect x="-5.5" y="-1" width="11" height="17" fill="#22252a" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.3" />
            <rect x="-22" y="-5" width="10" height="10" fill="#1f2226" stroke="rgba(235, 228, 213, 0.82)" strokeWidth="1.2" />
            <rect x="11" y="-5" width="11" height="10" fill="#1f2226" stroke="rgba(235, 228, 213, 0.82)" strokeWidth="1.2" />

            {/* 분필 명패 상자 (PDF 1페이지 시안과 100% 동일한 '카투리안의 집') */}
            <g transform="translate(0, 32)" className="parchment-box">
              <rect x="-52" y="-11" width="104" height="22" rx="2" className="parchment-bg" />
              <rect x="-52" y="-11" width="104" height="22" rx="2" className="parchment-border" />
              <text x="0" y="4" textAnchor="middle" className="parchment-text">카투리안의 집</text>
            </g>
          </g>

          {/* B. 필로우맨 (우측 상단 숲속 x: 745, y: 310) */}
          <g
            className={`map-interactive-node ${hoveredLocId === 'kamenice-forest' ? 'is-hover' : ''} ${activeLocationId === 'kamenice-forest' ? 'is-active' : ''}`}
            transform="translate(745, 305)"
            onClick={() => onSelectLocation('kamenice-forest')}
            onMouseEnter={() => setHoveredLocId('kamenice-forest')}
            onMouseLeave={() => setHoveredLocId(null)}
            role="button"
            tabIndex={0}
            aria-label="카메니체 숲 필로우맨 세부 페이지 열기"
          >
            <circle cx="0" cy="-5" r="54" className="node-glow" />

            {/* 숲속 오두막 일러스트 */}
            <path d="M -42 14 L -32 -16 L -22 14 Z" fill="#141619" stroke="rgba(235, 228, 213, 0.55)" strokeWidth="1.2" />
            <path d="M 24 14 L 35 -18 L 46 14 Z" fill="#141619" stroke="rgba(235, 228, 213, 0.55)" strokeWidth="1.2" />
            <polygon points="-30,-7 0,-35 30,-7" fill="#1a1c1f" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.6" />
            <rect x="-24" y="-7" width="48" height="23" fill="#15171a" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.5" />
            <line x1="-12" y1="-7" x2="-12" y2="16" stroke="rgba(235, 228, 213, 0.5)" strokeWidth="1.1" />
            <line x1="12" y1="-7" x2="12" y2="16" stroke="rgba(235, 228, 213, 0.5)" strokeWidth="1.1" />
            <rect x="-5" y="2" width="10" height="14" fill="#23262b" stroke="rgba(235, 228, 213, 0.85)" strokeWidth="1.2" />
            <circle cx="0" cy="-18" r="4.5" fill="#1e2024" stroke="rgba(235, 228, 213, 0.8)" strokeWidth="1.2" />

            {/* 분필 명패 상자 '필로우맨' */}
            <g transform="translate(0, 31)" className="parchment-box">
              <rect x="-38" y="-11" width="76" height="22" rx="2" className="parchment-bg" />
              <rect x="-38" y="-11" width="76" height="22" rx="2" className="parchment-border" />
              <text x="0" y="4" textAnchor="middle" className="parchment-text">필로우맨</text>
            </g>
          </g>

          {/* C. 유대인 구역 & 강가의 한 마을 (좌측 하단 x: 250, y: 440) */}
          <g
            className={`map-interactive-node ${hoveredLocId === 'jewish-quarter' ? 'is-hover' : ''} ${activeLocationId === 'jewish-quarter' ? 'is-active' : ''}`}
            transform="translate(250, 435)"
            onClick={() => onSelectLocation('jewish-quarter')}
            onMouseEnter={() => setHoveredLocId('jewish-quarter')}
            onMouseLeave={() => setHoveredLocId(null)}
            role="button"
            tabIndex={0}
            aria-label="유대인 구역 강가의 한 마을 세부 페이지 열기"
          >
            <circle cx="0" cy="-5" r="58" className="node-glow" />

            {/* 지붕들 위 '유대인 구역' 텍스트 */}
            <text x="-5" y="-28" textAnchor="middle" fill="rgba(225, 217, 202, 0.88)" fontSize="11" fontFamily="'Gowun Batang', serif">
              유대인 구역
            </text>

            {/* 마을 건물들 */}
            <polygon points="-46,-6 -36,-38 -26,-6" fill="#181a1d" stroke="rgba(235, 228, 213, 0.88)" strokeWidth="1.4" />
            <line x1="-36" y1="-38" x2="-36" y2="-46" stroke="rgba(235, 228, 213, 0.88)" strokeWidth="1.4" />
            <rect x="-44" y="-6" width="18" height="22" fill="#15171a" stroke="rgba(235, 228, 213, 0.88)" strokeWidth="1.3" />
            <polygon points="-26,-4 -10,-22 6,-4" fill="#1b1d21" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.4" />
            <rect x="-22" y="-4" width="24" height="20" fill="#16181b" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.4" />
            <polygon points="2,-2 18,-18 34,-2" fill="#1b1d21" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.4" />
            <rect x="6" y="-2" width="24" height="18" fill="#16181b" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.4" />
            <rect x="-15" y="3" width="5" height="6" fill="rgba(235, 228, 213, 0.7)" />
            <rect x="14" y="4" width="6" height="6" fill="rgba(235, 228, 213, 0.7)" />

            {/* 분필 명패 상자 '강가의 한 마을' */}
            <g transform="translate(0, 31)" className="parchment-box">
              <rect x="-50" y="-11" width="100" height="22" rx="2" className="parchment-bg" />
              <rect x="-50" y="-11" width="100" height="22" rx="2" className="parchment-border" />
              <text x="0" y="4" textAnchor="middle" className="parchment-text">강가의 한 마을</text>
            </g>
          </g>

          {/* D. 벌판 (중앙 하단 x: 550, y: 465) */}
          <g
            className={`map-interactive-node ${hoveredLocId === 'open-field' ? 'is-hover' : ''} ${activeLocationId === 'open-field' ? 'is-active' : ''}`}
            transform="translate(550, 465)"
            onClick={() => onSelectLocation('open-field')}
            onMouseEnter={() => setHoveredLocId('open-field')}
            onMouseLeave={() => setHoveredLocId(null)}
            role="button"
            tabIndex={0}
            aria-label="벌판 작은 사과 인형들 세부 페이지 열기"
          >
            <circle cx="0" cy="-6" r="48" className="node-glow" />

            {/* 들판 풀/갈대 스케치 + 떨어진 사과 인형 */}
            <path
              d="M -40 10 Q -44 -6 -50 -13 M -34 10 Q -33 -8 -37 -16 M -26 10 Q -23 -3 -18 -10 M -14 10 Q -16 -6 -20 -14 M -4 10 Q -2 -10 4 -18 M 6 10 Q 10 -4 16 -12 M 18 10 Q 17 -7 14 -15 M 28 10 Q 32 -6 39 -13 M 38 10 Q 42 -2 48 -9"
              fill="none"
              stroke="rgba(235, 228, 213, 0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* 붉은 사과 인형 */}
            <circle cx="0" cy="5" r="4.5" fill="#4a1818" stroke="rgba(235, 190, 180, 0.95)" strokeWidth="1.3" />
            <path d="M 0 0.5 Q 2 -2.5 4 -1.5" fill="none" stroke="rgba(235, 228, 213, 0.85)" strokeWidth="1" />
            <line x1="-46" y1="10" x2="46" y2="10" stroke="rgba(235, 228, 213, 0.6)" strokeWidth="1.3" />

            {/* 분필 명패 상자 '벌판' */}
            <g transform="translate(0, 26)" className="parchment-box">
              <rect x="-30" y="-11" width="60" height="22" rx="2" className="parchment-bg" />
              <rect x="-30" y="-11" width="60" height="22" rx="2" className="parchment-border" />
              <text x="0" y="4" textAnchor="middle" className="parchment-text">벌판</text>
            </g>
          </g>

          {/* E & F. 소원의 우물 / 장난감 집 (우측 하단 x: 635, y: 430 - PDF 1페이지 시안과 100% 동일) */}
          <g
            className={`map-interactive-node ${hoveredLocId === 'wishing-well' || hoveredLocId === 'toy-house' || hoveredLocId === 'well-and-toy' ? 'is-hover' : ''} ${activeLocationId === 'wishing-well' || activeLocationId === 'toy-house' ? 'is-active' : ''}`}
            transform="translate(635, 425)"
            onMouseEnter={() => setHoveredLocId('well-and-toy')}
            onMouseLeave={() => setHoveredLocId(null)}
          >
            <circle cx="0" cy="-6" r="62" className="node-glow" />

            {/* 좌측: 소원의 우물 클릭 영역 */}
            <g
              transform="translate(-25, 0)"
              onClick={() => onSelectLocation('wishing-well')}
              className="clickable-sub-icon"
              role="button"
              tabIndex={0}
              aria-label="소원의 우물 세부 페이지 열기"
            >
              <polygon points="-16,-22 0,-38 16,-22" fill="#1a1c20" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.5" strokeLinejoin="round" />
              <line x1="-11" y1="-22" x2="-11" y2="-2" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.5" />
              <line x1="11" y1="-22" x2="11" y2="-2" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.5" />
              <line x1="-11" y1="-14" x2="11" y2="-14" stroke="rgba(235, 228, 213, 0.7)" strokeWidth="1.2" />
              <rect x="-14" y="-2" width="28" height="15" rx="1.5" fill="#17191c" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.5" />
            </g>

            {/* 우측: 장난감 집 클릭 영역 */}
            <g
              transform="translate(24, 0)"
              onClick={() => onSelectLocation('toy-house')}
              className="clickable-sub-icon"
              role="button"
              tabIndex={0}
              aria-label="장난감 집 세부 페이지 열기"
            >
              <polygon points="-18,-6 0,-34 18,-6" fill="#1c1f22" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="-14" y="-6" width="28" height="19" fill="#16181b" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.5" />
              <path d="M -9 13 L -9 2 A 4 4 0 0 1 -1 2 L -1 13 Z" fill="#23272c" stroke="rgba(235, 228, 213, 0.85)" strokeWidth="1.2" />
              <rect x="2" y="-1" width="8" height="8" fill="#1f2822" stroke="rgba(185, 225, 190, 0.9)" strokeWidth="1.2" />
            </g>

            {/* 분필 명패 상자 '소원의 우물 / 장난감 집' (PDF 시안 글자 그대로) */}
            <g
              transform="translate(0, 28)"
              className="parchment-box"
              onClick={() => onSelectLocation('toy-house')}
              role="button"
              tabIndex={0}
            >
              <rect x="-65" y="-11" width="130" height="22" rx="2" className="parchment-bg" />
              <rect x="-65" y="-11" width="130" height="22" rx="2" className="parchment-border" />
              <text x="0" y="4" textAnchor="middle" className="parchment-text">소원의 우물 / 장난감 집</text>
            </g>
          </g>

          {/* G. 검열국 (좌측 상단 강변 x: 235, y: 265 - 기획서 표 및 2-1) */}
          <g
            className={`map-interactive-node ${hoveredLocId === 'censorship-bureau' ? 'is-hover' : ''} ${activeLocationId === 'censorship-bureau' ? 'is-active' : ''}`}
            transform="translate(235, 260)"
            onClick={() => onSelectLocation('censorship-bureau')}
            onMouseEnter={() => setHoveredLocId('censorship-bureau')}
            onMouseLeave={() => setHoveredLocId(null)}
            role="button"
            tabIndex={0}
            aria-label="검열국 탑의 노인 세부 페이지 열기"
          >
            <circle cx="0" cy="-6" r="50" className="node-glow" />

            {/* 감시탑 일러스트 */}
            <polygon points="-16,-28 0,-50 16,-28" fill="#191b1f" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.5" strokeLinejoin="round" />
            <line x1="0" y1="-50" x2="0" y2="-58" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.5" />
            <rect x="-13" y="-28" width="26" height="42" fill="#15171a" stroke="rgba(235, 228, 213, 0.95)" strokeWidth="1.5" />
            {/* 최상층 둥근 창문 (중국인 노인 거주) */}
            <circle cx="0" cy="-18" r="5" fill="#24211d" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.3" />
            <line x1="0" y1="-18" x2="0" y2="-22" stroke="rgba(235, 228, 213, 0.85)" strokeWidth="1" />
            <line x1="0" y1="-18" x2="3" y2="-18" stroke="rgba(235, 228, 213, 0.85)" strokeWidth="1" />
            <rect x="-7" y="-7" width="4" height="6" fill="rgba(235, 228, 213, 0.7)" />
            <rect x="3" y="-7" width="4" height="6" fill="rgba(235, 228, 213, 0.7)" />
            <path d="M -5 14 L -5 4 A 5 5 0 0 1 5 4 L 5 14 Z" fill="#202328" stroke="rgba(235, 228, 213, 0.9)" strokeWidth="1.3" />

            {/* 분필 명패 상자 '검열국' */}
            <g transform="translate(0, 28)" className="parchment-box">
              <rect x="-32" y="-11" width="64" height="22" rx="2" className="parchment-bg" />
              <rect x="-32" y="-11" width="64" height="22" rx="2" className="parchment-border" />
              <text x="0" y="4" textAnchor="middle" className="parchment-text">검열국</text>
            </g>
          </g>
        </svg>

        {/* 9. 마우스 호버 가이드 텍스트 (기획서 구조: 마우스 갖다 대면 가이드 텍스트 -> 클릭 -> 세부 페이지) */}
        {hoveredLoc && (
          <div
            className={`floating-guide-tooltip ${
              hoveredLoc.mapCoords.x > 620
                ? 'pos-left'
                : hoveredLoc.mapCoords.x < 350
                ? 'pos-right'
                : 'pos-center'
            }`}
            style={{
              left: `${(hoveredLoc.mapCoords.x / 1000) * 100}%`,
              top: `${(hoveredLoc.mapCoords.y / 680) * 100}%`
            }}
            role="tooltip"
          >
            <div className="tooltip-tag-row">
              <span className="tooltip-badge">{hoveredLoc.code}. {hoveredLoc.name}</span>
              <span className="tooltip-team">{hoveredLoc.teamBadge}</span>
            </div>
            <h4 className="tooltip-story-title">{hoveredLoc.storyTitle}</h4>
            <p className="tooltip-body-text">{hoveredLoc.guideSummary}</p>
            <div className="tooltip-action-prompt">
              <span>클릭하여 이야기 아카이브 열기</span>
              <span className="prompt-arrow">→</span>
            </div>
          </div>
        )}

        {/* 듀얼 호버: 소원의 우물 / 장난감 집 선택 말풍선 */}
        {hoveredLocId === 'well-and-toy' && (
          <div
            className="floating-guide-tooltip pos-left dual-choice-tooltip"
            style={{
              left: '63.5%',
              top: '63%'
            }}
            role="tooltip"
          >
            <div className="tooltip-tag-row">
              <span className="tooltip-badge">소원의 우물 · 장난감 집</span>
            </div>
            <p className="tooltip-body-text">
              동화 속 장난감 집과 소원의 우물이 맞닿아 있는 구역입니다. 열람할 이야기를 선택하십시오.
            </p>
            <div className="dual-btn-row">
              <button
                type="button"
                className="dual-link-btn"
                onClick={() => onSelectLocation('toy-house')}
              >
                <span>장난감 집 〈작은 초록 돼지〉 (5팀)</span>
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="dual-link-btn"
                onClick={() => onSelectLocation('wishing-well')}
              >
                <span>소원의 우물 〈작은 예수 이야기〉</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
