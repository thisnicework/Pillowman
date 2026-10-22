import React, { useState } from 'react';
import { 
  lookupReservation, 
  formatPhoneNumber,
  isValidKoreanPhone 
} from '../services/bookingService';

export default function LookupModal({ isOpen, onClose, onNotify }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [foundReservation, setFoundReservation] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    if (errorMsg) setErrorMsg('');
  };

  const handleCopyTemplate = () => {
    const template = `[뮤지컬 필로우맨 예매 문의]\n- 성함: ${name.trim() || ''}\n- 연락처: ${phone.trim() || ''}\n- 요청사항: 예매 확인 / 취소 요청`;
    navigator.clipboard.writeText(template).then(() => {
      setCopiedTemplate(true);
      if (onNotify) onNotify('인스타그램 DM 문의 양식이 복사되었습니다!');
      setTimeout(() => setCopiedTemplate(false), 2500);
    }).catch(() => {
      if (onNotify) onNotify('복사에 실패했습니다. 직접 작성해 주세요.');
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('예매자 성함을 입력해 주세요.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!isValidKoreanPhone(cleanPhone)) {
      setErrorMsg('010으로 시작하는 올바른 휴대폰 번호를 입력해 주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const result = await lookupReservation({ name, phone: cleanPhone });
      setFoundReservation(result);
    } catch (err) {
      setErrorMsg(err.message || '예매 내역을 찾을 수 없습니다.');
      if (onNotify) onNotify(err.message || '조회 실패');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setFoundReservation(null);
    setName('');
    setPhone('');
    setErrorMsg('');
    setIsSearching(false);
    setCopiedTemplate(false);
    onClose();
  };

  const isCancelled = foundReservation?.status === 'CANCELLED';

  return (
    <div 
      className="modal-overlay open" 
      role="dialog" 
      aria-modal="true" 
      onClick={(e) => { if (e.target === e.currentTarget && !isSearching) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>예매 확인 및 취소 안내</h3>
          <button 
            type="button" 
            className="btn-close-modal" 
            onClick={handleClose} 
            disabled={isSearching}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {!foundReservation ? (
            <div>
              {/* Instagram DM Primary Notice Card */}
              <div className="lookup-dm-hero-card">
                <div className="lookup-dm-tag">OFFICIAL NOTICE</div>
                <h4 className="lookup-dm-heading">
                  예매 확인 및 취소는 인스타그램 DM으로 진행됩니다.
                </h4>
                <p className="lookup-dm-desc">
                  뮤지컬 〈필로우맨〉의 정확한 좌석 관리 및 취소표 즉시 반환을 위해, 
                  <strong>예매 확인 및 취소 접수는 공식 인스타그램 DM(@pillowman_kr)</strong>을 통해 운영됩니다.
                </p>

                <div className="lookup-dm-guide-box">
                  <div className="guide-title">📋 DM 문의 시 전달해 주실 정보</div>
                  <ol className="guide-list">
                    <li>예매자 성함</li>
                    <li>예매 시 등록한 휴대폰 번호</li>
                    <li>요청 사항 (예매 확인 또는 취소 요청)</li>
                  </ol>
                </div>

                <div className="lookup-dm-btn-group">
                  <a 
                    href="https://www.instagram.com/pillowman_kr/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-dm-direct-action"
                  >
                    공식 인스타그램 DM 보내기 (@pillowman_kr) ↗
                  </a>
                  <button 
                    type="button" 
                    className="btn-dm-copy-action"
                    onClick={handleCopyTemplate}
                  >
                    {copiedTemplate ? '✓ 양식 복사 완료!' : '문의 양식 복사하기'}
                  </button>
                </div>

                <div className="lookup-dm-subinfo">
                  인스타그램 이용이 어려우신 경우 전화 문의: <strong>010-7771-3198</strong>
                </div>
              </div>

              {/* Direct Web E-Ticket Lookup Divider */}
              <div className="lookup-divider">
                <span>또는 웹사이트에서 E-TICKET 바로 확인</span>
              </div>

              {errorMsg && (
                <div className="modal-alert-error">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSearch} id="ticket-direct-lookup-form">
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
                  disabled={isSearching || !name.trim() || phone.replace(/[^0-9]/g, '').length < 10}
                  style={{
                    opacity: (isSearching || !name.trim() || phone.replace(/[^0-9]/g, '').length < 10) ? 0.6 : 1
                  }}
                >
                  {isSearching ? '예매 내역 조회 중...' : 'E-TICKET 바우처 조회하기'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              {errorMsg && (
                <div className="modal-alert-error">
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

              {/* Instagram Cancellation Guidance */}
              {!isCancelled ? (
                <div className="booking-dm-notice-box" style={{ marginBottom: '20px' }}>
                  <div className="dm-notice-title">
                    <span>⚠</span> 예매 취소 요청 방법
                  </div>
                  <p className="dm-notice-text">
                    예매 취소를 원하실 경우, <strong>공식 인스타그램 DM(@pillowman_kr)</strong>으로 예매번호({foundReservation.booking_code})와 성함을 남겨주시면 즉시 좌석이 반환됩니다.
                  </p>
                  <a 
                    href="https://www.instagram.com/pillowman_kr/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-dm-link"
                  >
                    인스타그램 DM으로 예매 취소 요청하기 →
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--body-color)', fontSize: '0.9rem' }}>
                  취소 완료된 티켓입니다. 다른 관객 분들을 위해 좌석이 정상 반환되었습니다.
                </div>
              )}

              <div className="modal-actions-dual">
                <button 
                  type="button" 
                  className="btn-modal-print" 
                  onClick={() => window.print()}
                >
                  티켓 인쇄 / 저장
                </button>
                <button 
                  type="button" 
                  className="btn-modal-cancel-ticket" 
                  onClick={handleClose}
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
