import React, { useState } from 'react';

export default function TrafficChart({ liveCount = 1, trafficStats = {}, onRefresh, isLoading = false }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const hourlyData = trafficStats.hourlyData || [];
  const maxVal = Math.max(10, ...hourlyData.map((d) => Math.max(d.visits || 0, d.bookings || 0)));

  return (
    <section className="traffic-section">
      <div className="traffic-header">
        <div className="traffic-title-wrap">
          <div className="traffic-live-indicator">
            <span className="live-dot-ping"></span>
            <span className="live-dot-core"></span>
            <span className="traffic-live-text">
              실시간 접속 중 <strong>{liveCount}</strong>명
            </span>
          </div>
          <h2 className="traffic-title">트래픽 & 예매 추이 (최근 24시간)</h2>
        </div>

        <div className="traffic-header-actions">
          <button
            type="button"
            className="btn-traffic-refresh"
            onClick={onRefresh}
            disabled={isLoading}
            title="트래픽 통계 즉시 새로고침"
          >
            {isLoading ? '갱신 중...' : '⟳ 트래픽 새로고침'}
          </button>
        </div>
      </div>

      {/* KPI Mini Pills */}
      <div className="traffic-pills-row">
        <div className="traffic-pill">
          <span className="pill-dot live"></span>
          <span className="pill-label">실시간 동시 접속</span>
          <span className="pill-val live-highlight">{liveCount}명</span>
        </div>
        <div className="traffic-pill">
          <span className="pill-dot visits"></span>
          <span className="pill-label">24H 누적 방문</span>
          <span className="pill-val">{trafficStats.totalVisits || 0}회</span>
        </div>
        <div className="traffic-pill">
          <span className="pill-dot bookings"></span>
          <span className="pill-label">24H 예매 성공</span>
          <span className="pill-val">{trafficStats.totalBookings || 0}건</span>
        </div>
        <div className="traffic-pill">
          <span className="pill-dot device"></span>
          <span className="pill-label">모바일 비중</span>
          <span className="pill-val">{trafficStats.mobileRatio || 85}%</span>
        </div>
        <div className="traffic-pill">
          <span className="pill-dot peak"></span>
          <span className="pill-label">최고 피크 시간</span>
          <span className="pill-val peak-highlight">
            {trafficStats.peakHour || '-'} ({trafficStats.peakVisits || 0}건)
          </span>
        </div>
      </div>

      {/* Visual Chart Card */}
      <div className="traffic-chart-card">
        <div className="chart-legend-row">
          <div className="chart-legend-item">
            <span className="legend-box visits"></span>
            <span>방문 트래픽 (Visits)</span>
          </div>
          <div className="chart-legend-item">
            <span className="legend-box bookings"></span>
            <span>예매 완료 (Bookings)</span>
          </div>
          <div className="chart-legend-hint">
            * 막대에 마우스를 올리면 상세 수치가 표시됩니다.
          </div>
        </div>

        <div className="chart-scroll-container">
          <div className="chart-bars-track">
            {hourlyData.map((item, idx) => {
              const visitHeight = Math.max(4, Math.round(((item.visits || 0) / maxVal) * 160));
              const bookingHeight = Math.max(
                item.bookings > 0 ? 4 : 0,
                Math.round(((item.bookings || 0) / maxVal) * 160)
              );
              const isHovered = activeTooltip === idx;

              return (
                <div
                  key={item.key || idx}
                  className={`chart-bar-group ${isHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setActiveTooltip(idx)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === idx ? null : idx)}
                >
                  {/* Tooltip Popup */}
                  {isHovered && (
                    <div className="chart-tooltip">
                      <div className="tooltip-time">{item.key} (KST)</div>
                      <div className="tooltip-row">
                        <span className="dot visit-dot"></span>
                        <span>방문: <strong>{item.visits}</strong>회</span>
                      </div>
                      <div className="tooltip-row">
                        <span className="dot booking-dot"></span>
                        <span>예매: <strong>{item.bookings}</strong>건</span>
                      </div>
                      {item.visits > 0 && (
                        <div className="tooltip-rate">
                          전환율: {Math.min(100, Math.round((item.bookings / item.visits) * 100))}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bars Container */}
                  <div className="bars-align-bottom">
                    {/* Visits Bar */}
                    <div
                      className="bar-item visit-bar"
                      style={{ height: `${visitHeight}px` }}
                    >
                      {item.visits > 0 && visitHeight >= 24 && (
                        <span className="bar-val-text">{item.visits}</span>
                      )}
                    </div>

                    {/* Bookings Bar */}
                    {item.bookings > 0 && (
                      <div
                        className="bar-item booking-bar"
                        style={{ height: `${bookingHeight}px` }}
                      >
                        {bookingHeight >= 20 && (
                          <span className="bar-val-text">{item.bookings}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* X-Axis Hour Label */}
                  <div className="bar-x-label">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
