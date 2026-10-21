import React, { useState } from 'react';

export default function BookingModal({ isOpen, onClose, onNotify }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTrigger, setAgreeTrigger] = useState(false);
  const [agreeCancellation, setAgreeCancellation] = useState(false);
  const [reservation, setReservation] = useState(null);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 3 && val.length <= 7) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 7) {
      val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
    }
    setPhone(val);
  };

  const handleClose = () => {
    setReservation(null);
    setName('');
    setPhone('');
    setAgreeAge(false);
    setAgreeTrigger(false);
    setAgreeCancellation(false);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      if (onNotify) onNotify('예매자 성함을 입력해 주세요.');
      return;
    }

    if (!phone || phone.length < 12) {
      if (onNotify) onNotify('올바른 휴대폰 번호를 입력해 주세요.');
      return;
    }

    if (!agreeAge || !agreeTrigger || !agreeCancellation) {
      if (onNotify) onNotify('모든 관람 안내 및 유의사항에 동의해 주세요.');
      return;
    }

    // Check existing booking
    let reservations = [];
    try {
      const saved = localStorage.getItem('pillowman_reservations');
      if (saved) reservations = JSON.parse(saved);
    } catch (err) {}

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const alreadyBooked = reservations.some(r => r.phone.replace(/[^0-9]/g, '') === cleanPhone);

    if (alreadyBooked) {
      if (onNotify) onNotify('이미 예매 내역이 존재합니다. 1인 1매만 예매 가능합니다.');
      return;
    }

    // Create reservation
    const bookingCode = 'PLW-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newReservation = {
      code: bookingCode,
      name: name.trim(),
      phone: phone,
      showTitle: '뮤지컬 〈필로우맨〉',
      date: '2026. 11. 1.(일) 13:00',
      venue: '서울예술대학교 마동 1층 예장',
      seatType: '전석 비지정석 (현장 수령 선착순 배정)',
      price: '전석 무료',
      bookedAt: new Date().toLocaleString('ko-KR')
    };

    reservations.push(newReservation);
    localStorage.setItem('pillowman_reservations', JSON.stringify(reservations));

    setReservation(newReservation);
    if (onNotify) onNotify('예매가 정상적으로 완료되었습니다!');
  };

  return (
    <div 
      className="modal-overlay open" 
      role="dialog" 
      aria-modal="true" 
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>티켓 예매 (BOOK TICKET)</h3>
          <button type="button" className="btn-close-modal" onClick={handleClose} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="modal-body">
          {!reservation ? (
            <form onSubmit={handleSubmit} id="ticket-booking-form">
              <div className="form-perf-summary">
                <div className="title">뮤지컬 〈필로우맨〉 2026</div>
                <div className="info">
                  일시: 2026. 11. 1.(일) 13:00 | 장소: 서울예술대학교 마동 예장<br />
                  가격: <strong>전석 무료 (1인 1매 선착순 비지정석)</strong>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="book-name" className="form-label">예매자 성함 *</label>
                <input 
                  type="text" 
                  id="book-name" 
                  className="form-input" 
                  placeholder="홍길동" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="book-phone" className="form-label">휴대폰 번호 *</label>
                <input 
                  type="tel" 
                  id="book-phone" 
                  className="form-input" 
                  placeholder="010-1234-5678" 
                  maxLength={13} 
                  value={phone} 
                  onChange={handlePhoneChange} 
                  required 
                  autoComplete="tel"
                />
                <small style={{ fontFamily: 'var(--font-serif)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  ※ 티켓 수령 시 본인 확인 및 공연 전날 안내 문자 발송에 사용됩니다.
                </small>
              </div>

              <div className="form-agreement-box">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="agree-age" 
                    checked={agreeAge} 
                    onChange={(e) => setAgreeAge(e.target.checked)} 
                    required 
                  />
                  <span>[필수] 본 공연은 <strong>15세 이상 관람가</strong>임을 확인하였습니다.</span>
                </label>

                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="agree-trigger" 
                    checked={agreeTrigger} 
                    onChange={(e) => setAgreeTrigger(e.target.checked)} 
                    required 
                  />
                  <span>[필수] 아동학대, 폭력 등 <strong>트리거워닝 안내 내용</strong>을 사전에 확인하였습니다.</span>
                </label>

                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="agree-cancellation" 
                    checked={agreeCancellation} 
                    onChange={(e) => setAgreeCancellation(e.target.checked)} 
                    required 
                  />
                  <span>[필수] 공연 시작 5분 전까지 미수령 시 취소표 처리되며, 관람 불가 시 사전 취소에 동의합니다.</span>
                </label>
              </div>

              <button type="submit" className="btn-submit-booking">
                예매 완료하기 (무료 발권)
              </button>
            </form>
          ) : (
            <div id="booking-result-card">
              <div className="eticket-card">
                <div className="eticket-header">
                  <div>
                    <div className="eticket-title">뮤지컬 〈필로우맨〉 E-TICKET</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: '#10b981', marginTop: '4px' }}>
                      ● 예매 완료 (OFFICIAL VOUCHER)
                    </div>
                  </div>
                  <div className="eticket-num">{reservation.code}</div>
                </div>

                <div className="eticket-grid">
                  <div className="eticket-field">
                    <div className="lbl">예매자 성명</div>
                    <div className="val">{reservation.name}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">연락처</div>
                    <div className="val">{reservation.phone}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">공연 일시</div>
                    <div className="val">{reservation.date}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">공연 장소</div>
                    <div className="val">{reservation.venue}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">좌석 등급</div>
                    <div className="val">{reservation.seatType}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">티켓 가격</div>
                    <div className="val" style={{ color: '#10b981' }}>전석 무료 (1매)</div>
                  </div>
                </div>

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
                  <div className="eticket-barcode-code">{reservation.code}</div>
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.88rem', color: 'var(--parchment-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
                ※ 공연 당일 1시간 전부터 마동 로비 티켓부스에서 <strong>예매자 성함 및 연락처 뒷자리</strong>를 제시하시면 지류 티켓으로 수령하실 수 있습니다.<br />
                ※ 공연 시작 5분 전까지 미수령 시 현장 취소표로 전환됩니다.
              </div>

              <div className="modal-actions-dual">
                <button type="button" className="btn-modal-print" onClick={() => window.print()}>
                  🖨️ 티켓 인쇄 / 저장
                </button>
                <button type="button" className="btn-modal-cancel-ticket" onClick={handleClose}>
                  확인 완료
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
