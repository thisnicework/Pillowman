import React, { useState } from 'react';

export default function LookupModal({ isOpen, onClose, onNotify }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [foundReservation, setFoundReservation] = useState(null);

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
    setFoundReservation(null);
    setName('');
    setPhone('');
    onClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      if (onNotify) onNotify('성함과 연락처를 모두 입력해 주세요.');
      return;
    }

    let reservations = [];
    try {
      const saved = localStorage.getItem('pillowman_reservations');
      if (saved) reservations = JSON.parse(saved);
    } catch (err) {}

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const found = reservations.find(r => 
      r.name.trim() === name.trim() && r.phone.replace(/[^0-9]/g, '') === cleanPhone
    );

    if (!found) {
      if (onNotify) onNotify('일치하는 예매 내역을 찾을 수 없습니다.');
      return;
    }

    setFoundReservation(found);
  };

  const handleCancelBooking = () => {
    if (!foundReservation) return;

    if (window.confirm('정말로 예매를 취소하시겠습니까? 취소된 좌석은 다른 관객에게 즉시 반환됩니다.')) {
      let reservations = [];
      try {
        const saved = localStorage.getItem('pillowman_reservations');
        if (saved) reservations = JSON.parse(saved);
      } catch (err) {}

      reservations = reservations.filter(r => r.code !== foundReservation.code);
      localStorage.setItem('pillowman_reservations', JSON.stringify(reservations));

      if (onNotify) onNotify('예매가 성공적으로 취소되었습니다.');
      handleClose();
    }
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
          <h3>예매 내역 조회 및 취소</h3>
          <button type="button" className="btn-close-modal" onClick={handleClose} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="modal-body">
          {!foundReservation ? (
            <form onSubmit={handleSearch} id="ticket-lookup-form">
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: 'var(--parchment-muted)', marginBottom: '20px' }}>
                예매 시 등록하셨던 <strong>성함과 휴대폰 번호</strong>를 입력해 주세요.
              </p>

              <div className="form-group">
                <label htmlFor="lookup-name" className="form-label">예매자 성함</label>
                <input 
                  type="text" 
                  id="lookup-name" 
                  className="form-input" 
                  placeholder="홍길동" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
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
                />
              </div>

              <button type="submit" className="btn-submit-booking">
                예매 내역 조회
              </button>
            </form>
          ) : (
            <div id="lookup-result-card">
              <div className="eticket-card">
                <div className="eticket-header">
                  <div>
                    <div className="eticket-title">뮤지컬 〈필로우맨〉 예매 내역</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: '#10b981', marginTop: '4px' }}>
                      ● 유효한 예매 내역 (ACTIVE)
                    </div>
                  </div>
                  <div className="eticket-num">{foundReservation.code}</div>
                </div>

                <div className="eticket-grid">
                  <div className="eticket-field">
                    <div className="lbl">예매자</div>
                    <div className="val">{foundReservation.name}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">연락처</div>
                    <div className="val">{foundReservation.phone}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">공연 일시</div>
                    <div className="val">{foundReservation.date}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">공연 장소</div>
                    <div className="val">{foundReservation.venue}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">좌석 구분</div>
                    <div className="val">{foundReservation.seatType}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">티켓 가격</div>
                    <div className="val" style={{ color: '#10b981' }}>전석 무료 (1매)</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px', padding: '14px', background: 'rgba(220, 38, 38, 0.1)', borderLeft: '3px solid var(--crimson-blood)', borderRadius: '4px' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.88rem', color: '#fca5a5', lineHeight: '1.5' }}>
                  ※ 관람이 어려우실 경우, 다른 관객분들이 기회를 얻을 수 있도록 예매를 취소해 주시기 바랍니다.
                </p>
              </div>

              <div className="modal-actions-dual">
                <button 
                  type="button" 
                  className="btn-modal-cancel-ticket" 
                  onClick={handleCancelBooking}
                >
                  예매 취소하기
                </button>
                <button 
                  type="button" 
                  className="btn-modal-print" 
                  onClick={() => window.print()}
                >
                  티켓 인쇄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
