import React, { useState } from 'react';
import { lookupReservation, cancelReservation, formatPhoneNumber } from '../services/bookingService';

export default function LookupModal({ isOpen, onClose, onNotify }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [foundReservation, setFoundReservation] = useState(null);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    if (errorMsg) setErrorMsg('');
  };

  const handleClose = () => {
    setFoundReservation(null);
    setName('');
    setPhone('');
    setErrorMsg('');
    setIsSearching(false);
    setIsCancelling(false);
    onClose();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !phone.trim()) {
      setErrorMsg('성함과 연락처를 모두 입력해 주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const result = await lookupReservation({ name, phone });
      setFoundReservation(result);
    } catch (err) {
      setErrorMsg(err.message || '예매 내역을 찾을 수 없습니다.');
      if (onNotify) onNotify(err.message || '조회 실패');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!foundReservation) return;

    const confirmMsg = '정말로 예매를 취소하시겠습니까?\n취소된 좌석은 다른 관객 분들을 위해 즉시 반환됩니다.';
    if (!window.confirm(confirmMsg)) return;

    setIsCancelling(true);
    setErrorMsg('');
    try {
      const updated = await cancelReservation(foundReservation.booking_code, {
        name: foundReservation.name,
        phone: foundReservation.phone,
      });

      setFoundReservation(updated);
      if (onNotify) onNotify('예매가 정상적으로 취소되었습니다.');
    } catch (err) {
      setErrorMsg(err.message || '예매 취소 처리 중 오류가 발생했습니다.');
      if (onNotify) onNotify(err.message || '취소 실패');
    } finally {
      setIsCancelling(false);
    }
  };

  const isCancelled = foundReservation?.status === 'CANCELLED';

  return (
    <div 
      className="modal-overlay open" 
      role="dialog" 
      aria-modal="true" 
      onClick={(e) => { if (e.target === e.currentTarget && !isSearching && !isCancelling) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>예매 내역 조회 및 취소</h3>
          <button 
            type="button" 
            className="btn-close-modal" 
            onClick={handleClose} 
            disabled={isSearching || isCancelling}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {!foundReservation ? (
            <form onSubmit={handleSearch} id="ticket-lookup-form">
              <p style={{ fontFamily: 'var(--font-body)', letterSpacing: '-0.025em', fontSize: '0.95rem', color: 'var(--body-color)', marginBottom: '20px' }}>
                예매 시 등록하셨던 <strong>예매자 성함과 휴대폰 번호</strong>를 입력해 주세요.
              </p>

              {errorMsg && (
                <div style={{
                  background: 'rgba(223, 54, 62, 0.15)',
                  border: '1px solid var(--accent-red)',
                  color: '#ff8a8f',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '-0.025em',
                  lineHeight: '1.5'
                }}>
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="lookup-name" className="form-label">예매자 성함</label>
                <input 
                  type="text" 
                  id="lookup-name" 
                  className="form-input" 
                  placeholder="홍길동" 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); if (errorMsg) setErrorMsg(''); }} 
                  required 
                  autoComplete="name"
                  disabled={isSearching}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lookup-phone" className="form-label">휴대폰 번호</label>
                <input 
                  type="tel" 
                  id="lookup-phone" 
                  className="form-input" 
                  placeholder="010-1234-5678" 
                  maxLength={13} 
                  value={phone} 
                  onChange={handlePhoneChange} 
                  required 
                  autoComplete="tel"
                  disabled={isSearching}
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit-booking"
                disabled={isSearching}
                style={{ opacity: isSearching ? 0.7 : 1 }}
              >
                {isSearching ? '예매 내역 조회 중...' : '예매 내역 확인'}
              </button>
            </form>
          ) : (
            <div>
              {errorMsg && (
                <div style={{
                  background: 'rgba(223, 54, 62, 0.15)',
                  border: '1px solid var(--accent-red)',
                  color: '#ff8a8f',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '-0.025em'
                }}>
                  {errorMsg}
                </div>
              )}

              <div className="eticket-card">
                <div className="eticket-header">
                  <div>
                    <div className="eticket-title">뮤지컬 〈필로우맨〉 E-TICKET</div>
                    <div style={{ 
                      fontFamily: 'var(--font-body)', 
                      letterSpacing: '-0.025em',
                      fontSize: '0.8rem', 
                      color: isCancelled ? 'var(--accent-red)' : '#10b981', 
                      marginTop: '4px', 
                      fontWeight: 700 
                    }}>
                      {isCancelled ? '✕ 예매 취소 완료' : '● 예매 완료 (OFFICIAL VOUCHER)'}
                    </div>
                  </div>
                  <div className="eticket-num">{foundReservation.booking_code}</div>
                </div>

                <div className="eticket-grid">
                  <div className="eticket-field">
                    <div className="lbl">예매자 성명</div>
                    <div className="val">{foundReservation.name}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">연락처</div>
                    <div className="val">{foundReservation.phone_formatted}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">공연 일시</div>
                    <div className="val">{foundReservation.show_date}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">공연 장소</div>
                    <div className="val">{foundReservation.venue}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">좌석 등급</div>
                    <div className="val">{foundReservation.seat_type}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">예매 상태</div>
                    <div className="val" style={{ color: isCancelled ? 'var(--accent-red)' : '#10b981' }}>
                      {isCancelled ? '예매 취소됨' : '예매 확정 (1인 1매)'}
                    </div>
                  </div>
                </div>

                {!isCancelled && (
                  <div className="eticket-barcode-wrap">
                    <svg className="barcode-svg" viewBox="0 0 280 40" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0" y="0" width="4" height="40" fill="#fff" />
                      <rect x="8" y="0" width="2" height="40" fill="#fff" />
                      <rect x="14" y="0" width="6" height="40" fill="#fff" />
                      <rect x="24" y="0" width="2" height="40" fill="#fff" />
                      <rect x="30" y="0" width="4" height="40" fill="#fff" />
                      <rect x="38" y="0" width="8" height="40" fill="#fff" />
                      <rect x="50" y="0" width="3" height="40" fill="#fff" />
                      <rect x="58" y="0" width="6" height="40" fill="#fff" />
                      <rect x="68" y="0" width="2" height="40" fill="#fff" />
                      <rect x="74" y="0" width="5" height="40" fill="#fff" />
                      <rect x="84" y="0" width="3" height="40" fill="#fff" />
                      <rect x="92" y="0" width="7" height="40" fill="#fff" />
                      <rect x="104" y="0" width="4" height="40" fill="#fff" />
                      <rect x="112" y="0" width="2" height="40" fill="#fff" />
                      <rect x="118" y="0" width="8" height="40" fill="#fff" />
                      <rect x="130" y="0" width="4" height="40" fill="#fff" />
                      <rect x="138" y="0" width="2" height="40" fill="#fff" />
                      <rect x="144" y="0" width="6" height="40" fill="#fff" />
                      <rect x="154" y="0" width="3" height="40" fill="#fff" />
                      <rect x="162" y="0" width="5" height="40" fill="#fff" />
                      <rect x="172" y="0" width="2" height="40" fill="#fff" />
                      <rect x="178" y="0" width="8" height="40" fill="#fff" />
                      <rect x="190" y="0" width="4" height="40" fill="#fff" />
                      <rect x="198" y="0" width="6" height="40" fill="#fff" />
                      <rect x="208" y="0" width="2" height="40" fill="#fff" />
                      <rect x="214" y="0" width="4" height="40" fill="#fff" />
                      <rect x="222" y="0" width="7" height="40" fill="#fff" />
                      <rect x="234" y="0" width="3" height="40" fill="#fff" />
                      <rect x="242" y="0" width="5" height="40" fill="#fff" />
                      <rect x="252" y="0" width="2" height="40" fill="#fff" />
                      <rect x="258" y="0" width="8" height="40" fill="#fff" />
                      <rect x="270" y="0" width="4" height="40" fill="#fff" />
                    </svg>
                    <div className="eticket-barcode-code">{foundReservation.booking_code}</div>
                  </div>
                )}
              </div>

              {!isCancelled ? (
                <div className="modal-actions-dual">
                  <button 
                    type="button" 
                    className="btn-modal-cancel-ticket" 
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                  >
                    {isCancelling ? '취소 처리 중...' : '예매 취소하기'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-modal-print" 
                    onClick={() => window.print()}
                    disabled={isCancelling}
                  >
                    티켓 인쇄 / 저장
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ fontFamily: 'var(--font-body)', letterSpacing: '-0.025em', color: 'var(--body-color)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    취소 완료된 티켓입니다. 다른 관객 분들을 위해 좌석이 반환되었습니다.
                  </p>
                  <button type="button" className="btn-modal-print" onClick={handleClose}>
                    닫기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
