import React, { useState, useEffect, useMemo } from 'react';
import {
  getTotalCapacity,
  updateTotalCapacity,
  getAllReservationsForAdmin,
  adminUpdateReservationStatus,
  adminDeleteReservation,
} from '../services/bookingService';

export default function AdminPage({ onGoHome }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pillowman_admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data states
  const [reservations, setReservations] = useState([]);
  const [totalCapacity, setTotalCapacity] = useState(100);
  const [newCapacityInput, setNewCapacityInput] = useState('100');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingCapacity, setIsUpdatingCapacity] = useState(false);
  const [notification, setNotification] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CONFIRMED, CHECKED_IN, CANCELLED

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin1234') {
      sessionStorage.setItem('pillowman_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      showNotice('관리자 인증이 완료되었습니다.');
    } else {
      setLoginError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pillowman_admin_authenticated');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cap, resList] = await Promise.all([
        getTotalCapacity(),
        getAllReservationsForAdmin(),
      ]);
      setTotalCapacity(cap);
      setNewCapacityInput(String(cap));
      setReservations(resList);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showNotice('데이터를 불러오지 못했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Update Capacity
  const handleSaveCapacity = async (e) => {
    e.preventDefault();
    const val = parseInt(newCapacityInput, 10);
    if (isNaN(val) || val < 1) {
      alert('정원은 1명 이상의 숫자로 입력해 주세요.');
      return;
    }

    setIsUpdatingCapacity(true);
    try {
      const updated = await updateTotalCapacity(val);
      setTotalCapacity(updated);
      showNotice(`총 예매 정원이 ${updated}석으로 변경되었습니다.`);
    } catch (err) {
      alert(err.message || '정원 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingCapacity(false);
    }
  };

  // Change Reservation Status
  const handleStatusChange = async (bookingCode, newStatus) => {
    let confirmPrompt = '상태를 변경하시겠습니까?';
    if (newStatus === 'CHECKED_IN') confirmPrompt = '현장 티켓 수령(발권 완료) 처리하시겠습니까?';
    if (newStatus === 'CANCELLED') confirmPrompt = '해당 예매를 취소 처리하시겠습니까? 좌석이 반환됩니다.';
    if (newStatus === 'CONFIRMED') confirmPrompt = '해당 예매를 다시 확정 상태로 복구하시겠습니까?';

    if (!window.confirm(confirmPrompt)) return;

    try {
      await adminUpdateReservationStatus(bookingCode, newStatus);
      showNotice(`예매 [${bookingCode}] 상태가 변경되었습니다.`);
      loadData();
    } catch (err) {
      alert(err.message || '상태 변경에 실패했습니다.');
    }
  };

  // Delete Reservation
  const handleDeleteReservation = async (bookingCode, name) => {
    if (!window.confirm(`[주의] '${name}'님의 예매 데이터(${bookingCode})를 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await adminDeleteReservation(bookingCode);
      showNotice(`예매 [${bookingCode}]가 삭제되었습니다.`);
      loadData();
    } catch (err) {
      alert(err.message || '예매 삭제에 실패했습니다.');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (reservations.length === 0) {
      alert('내보낼 예매 데이터가 없습니다.');
      return;
    }

    const headers = ['예매번호', '예매자성명', '연락처', '상태', '공연일시', '공연장소', '예매일시'];
    const rows = reservations.map((r) => [
      r.booking_code,
      r.name,
      r.phone_formatted || r.phone,
      r.status === 'CONFIRMED' ? '예매확정' : (r.status === 'CHECKED_IN' ? '현장수령완료' : '예매취소'),
      r.show_date || '2026. 11. 1.(일) 13:00',
      r.venue || '서울예술대학교 마동 1층 예장',
      r.created_at ? new Date(r.created_at).toLocaleString('ko-KR') : '',
    ]);

    // UTF-8 BOM (\uFEFF) for Excel Korean compatibility
    const csvContent = '\uFEFF' + [headers, ...rows].map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `필로우맨_예매자명단_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('예매자 명단 CSV가 다운로드되었습니다.');
  };

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'CONFIRMED' && r.status === 'CONFIRMED') ||
        (statusFilter === 'CHECKED_IN' && r.status === 'CHECKED_IN') ||
        (statusFilter === 'CANCELLED' && r.status === 'CANCELLED');

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.phone?.includes(q) ||
        r.phone_formatted?.includes(q) ||
        r.booking_code?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [reservations, statusFilter, searchQuery]);

  // Statistics
  const confirmedCount = reservations.filter((r) => r.status === 'CONFIRMED').length;
  const checkedInCount = reservations.filter((r) => r.status === 'CHECKED_IN').length;
  const cancelledCount = reservations.filter((r) => r.status === 'CANCELLED').length;
  const occupiedCount = confirmedCount + checkedInCount;
  const remainingSeats = Math.max(0, totalCapacity - occupiedCount);

  // If NOT Authenticated, show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-badge">ADMINISTRATION</div>
          <h2 className="admin-login-title">뮤지컬 〈필로우맨〉 관리자 콘솔</h2>
          <p className="admin-login-desc">
            예매자 명단 관리 및 정원 설정을 위해 비밀번호를 입력해 주세요.
          </p>

          {loginError && (
            <div className="modal-alert-error" style={{ marginBottom: '16px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="admin-pwd" className="form-label">관리자 비밀번호</label>
              <input
                type="password"
                id="admin-pwd"
                className="form-input"
                placeholder="비밀번호 입력"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (loginError) setLoginError('');
                }}
                autoFocus
                required
              />
            </div>

            <button type="submit" className="btn-submit-booking" style={{ marginTop: '12px' }}>
              관리자 콘솔 접속
            </button>

            <button
              type="button"
              className="btn-modal-print"
              onClick={onGoHome}
              style={{ width: '100%', marginTop: '10px' }}
            >
              ← 일반 관객 페이지로 돌아가기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="admin-dashboard-wrapper">
      {/* Admin Top Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div>
            <span className="admin-badge">OFFICIAL STAGE CONSOLE</span>
            <h1 className="admin-main-title">뮤지컬 〈필로우맨〉 예매 관리 시스템</h1>
          </div>
          <div className="admin-header-actions">
            <button type="button" className="admin-btn-action" onClick={loadData} disabled={isLoading}>
              {isLoading ? '새로고침 중...' : '⟳ 새로고침'}
            </button>
            <button type="button" className="admin-btn-action" onClick={onGoHome}>
              관객 사이트 보기
            </button>
            <button type="button" className="admin-btn-logout" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Global Notice Toast */}
      {notification && (
        <div className="admin-notice-banner">
          {notification}
        </div>
      )}

      <main className="admin-main-content">
        {/* KPI Summary & Capacity Management */}
        <section className="admin-kpi-grid">
          {/* Capacity Controller Card */}
          <div className="admin-kpi-card capacity-card">
            <div className="kpi-label">총 예매 정원 (CAPACITY)</div>
            <div className="kpi-val-row">
              <span className="kpi-val-strong">{totalCapacity}</span>
              <span className="kpi-unit">석</span>
            </div>
            <form onSubmit={handleSaveCapacity} className="capacity-form">
              <input
                type="number"
                min="1"
                max="500"
                className="form-input capacity-input"
                value={newCapacityInput}
                onChange={(e) => setNewCapacityInput(e.target.value)}
                disabled={isUpdatingCapacity}
              />
              <button
                type="submit"
                className="btn-input-action"
                disabled={isUpdatingCapacity || newCapacityInput === String(totalCapacity)}
              >
                {isUpdatingCapacity ? '저장 중...' : '정원 변경'}
              </button>
            </form>
            <small className="kpi-note">※ 서울예대 마동 예장 회차당 정원 조절</small>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-label">예매 확정 (CONFIRMED)</div>
            <div className="kpi-val-row">
              <span className="kpi-val" style={{ color: 'var(--title-color)' }}>{confirmedCount}</span>
              <span className="kpi-unit">명</span>
            </div>
            <small className="kpi-note">선착순 예매 완료 인원</small>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-label">잔여 좌석 (REMAINING)</div>
            <div className="kpi-val-row">
              <span className="kpi-val" style={{ color: remainingSeats > 0 ? '#10b981' : 'var(--accent-red)' }}>
                {remainingSeats}
              </span>
              <span className="kpi-unit">석</span>
            </div>
            <small className="kpi-note">{remainingSeats === 0 ? '현재 전석 매진 상태' : '현재 예매 가능 잔여 좌석'}</small>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-label">현장 수령 (CHECKED-IN)</div>
            <div className="kpi-val-row">
              <span className="kpi-val" style={{ color: '#38bdf8' }}>{checkedInCount}</span>
              <span className="kpi-unit">명</span>
            </div>
            <small className="kpi-note">티켓부스 지류티켓 수령 완료</small>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-label">취소 건수 (CANCELLED)</div>
            <div className="kpi-val-row">
              <span className="kpi-val" style={{ color: 'var(--accent-red)' }}>{cancelledCount}</span>
              <span className="kpi-unit">건</span>
            </div>
            <small className="kpi-note">반환된 취소표 수량</small>
          </div>
        </section>

        {/* Reservations Management Section */}
        <section className="admin-table-section">
          <div className="admin-table-toolbar">
            <div className="search-box">
              <input
                type="text"
                className="form-input"
                placeholder="예매자 성함, 휴대폰, 예매코드 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              <button
                type="button"
                className={`admin-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                전체 ({reservations.length})
              </button>
              <button
                type="button"
                className={`admin-tab ${statusFilter === 'CONFIRMED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                예매확정 ({confirmedCount})
              </button>
              <button
                type="button"
                className={`admin-tab ${statusFilter === 'CHECKED_IN' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CHECKED_IN')}
              >
                현장수령 ({checkedInCount})
              </button>
              <button
                type="button"
                className={`admin-tab ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CANCELLED')}
              >
                예매취소 ({cancelledCount})
              </button>
            </div>

            <button type="button" className="btn-export-csv" onClick={handleExportCSV}>
              📥 엑셀(CSV) 다운로드
            </button>
          </div>

          {/* Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>예매번호</th>
                  <th>예매자 성명</th>
                  <th>연락처</th>
                  <th>상태</th>
                  <th>예매 일시</th>
                  <th style={{ textAlign: 'right' }}>관리 조치</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--body-color)' }}>
                      조회된 예매 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((item, idx) => (
                    <tr key={item.id || item.booking_code}>
                      <td>{filteredReservations.length - idx}</td>
                      <td>
                        <strong className="table-booking-code">{item.booking_code}</strong>
                      </td>
                      <td>
                        <span className="table-name">{item.name}</span>
                      </td>
                      <td>{item.phone_formatted || item.phone}</td>
                      <td>
                        {item.status === 'CONFIRMED' && (
                          <span className="status-badge status-confirmed">예매확정</span>
                        )}
                        {item.status === 'CHECKED_IN' && (
                          <span className="status-badge status-checkedin">현장수령완료</span>
                        )}
                        {item.status === 'CANCELLED' && (
                          <span className="status-badge status-cancelled">예매취소</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--body-color)' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleString('ko-KR', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions">
                          {item.status === 'CONFIRMED' && (
                            <>
                              <button
                                type="button"
                                className="btn-table-action checkin"
                                onClick={() => handleStatusChange(item.booking_code, 'CHECKED_IN')}
                                title="현장 지류 티켓 전달 완료"
                              >
                                발권완료
                              </button>
                              <button
                                type="button"
                                className="btn-table-action cancel"
                                onClick={() => handleStatusChange(item.booking_code, 'CANCELLED')}
                                title="예매 취소 처리"
                              >
                                예매취소
                              </button>
                            </>
                          )}

                          {item.status === 'CHECKED_IN' && (
                            <button
                              type="button"
                              className="btn-table-action revert"
                              onClick={() => handleStatusChange(item.booking_code, 'CONFIRMED')}
                              title="발권 취소 후 확정 상태로 복구"
                            >
                              수령취소
                            </button>
                          )}

                          {item.status === 'CANCELLED' && (
                            <button
                              type="button"
                              className="btn-table-action reconfirm"
                              onClick={() => handleStatusChange(item.booking_code, 'CONFIRMED')}
                              title="취소 건을 다시 예매 확정으로 복구"
                            >
                              예매복구
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-table-action delete"
                            onClick={() => handleDeleteReservation(item.booking_code, item.name)}
                            title="데이터 완전 삭제"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
