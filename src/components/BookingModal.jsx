import React, { useState, useEffect } from 'react';
import { 
  createReservation, 
  formatPhoneNumber, 
  isValidKoreanPhone,
  checkPhoneAlreadyBooked,
  isBookingOpen,
  getBookingStats,
} from '../services/bookingService';

export default function BookingModal({ 
  isOpen, 
  onClose, 
  onNotify, 
  bookingStats, 
  onReservationSuccess 
}) {
  const [name, setName] = useState('');
  const [nameConfirm, setNameConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneConfirm, setPhoneConfirm] = useState('');
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTrigger, setAgreeTrigger] = useState(false);
  const [agreeCancellation, setAgreeCancellation] = useState(false);

  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reservation, setReservation] = useState(null);
  const [liveStats, setLiveStats] = useState(bookingStats);

  useEffect(() => {
    if (bookingStats) setLiveStats(bookingStats);
  }, [bookingStats]);

  useEffect(() => {
    if (isOpen) {
      getBookingStats().then(setLiveStats).catch(console.warn);
    }
  }, [isOpen]);

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    if (errorMsg) setErrorMsg('');
  };

  const handlePhoneConfirmChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneConfirm(formatted);
    if (errorMsg) setErrorMsg('');
  };

  const handleAllAgree = (e) => {
    const checked = e.target.checked;
    setAgreeAge(checked);
    setAgreeTrigger(checked);
    setAgreeCancellation(checked);
  };

  const allAgreed = agreeAge && agreeTrigger && agreeCancellation;

  // Name match validation
  const cleanName = name.trim();
  const cleanNameConfirm = nameConfirm.trim();
  const hasTypedNameConfirm = cleanNameConfirm.length > 0;
  const isNameMatched = cleanName.length > 0 && cleanName === cleanNameConfirm;
  const isNameMismatch = hasTypedNameConfirm && cleanName !== cleanNameConfirm;

  // Phone match validation
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const cleanPhoneConfirm = phoneConfirm.replace(/[^0-9]/g, '');
  const isPhoneValid = isValidKoreanPhone(cleanPhone);
  const isPhonePrefixInvalid = cleanPhone.length >= 3 && !cleanPhone.startsWith('01');
  const isPhoneLengthIncomplete = cleanPhone.length >= 4 && cleanPhone.length < 10;

  const hasTypedConfirm = cleanPhoneConfirm.length > 0;
  const isPhoneMatched = isPhoneValid && cleanPhone === cleanPhoneConfirm;
  const isPhoneMismatch = hasTypedConfirm && cleanPhone !== cleanPhoneConfirm;

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setReservation(null);
      setName('');
      setNameConfirm('');
      setPhone('');
      setPhoneConfirm('');
      setIsAlreadyBooked(false);
      setAgreeAge(false);
      setAgreeTrigger(false);
      setAgreeCancellation(false);
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Real-time check if phone number is already booked
  useEffect(() => {
    let isCurrent = true;
    if (isOpen && isPhoneMatched && cleanPhone.length >= 10) {
      checkPhoneAlreadyBooked(cleanPhone).then((booked) => {
        if (isCurrent) {
          setIsAlreadyBooked(booked);
          if (booked) {
            setErrorMsg('이미 예매된 번호입니다.');
          } else if (errorMsg === '이미 예매된 번호입니다.') {
            setErrorMsg('');
          }
        }
      });
    } else {
      setIsAlreadyBooked(false);
      if (errorMsg === '이미 예매된 번호입니다.') {
        setErrorMsg('');
      }
    }
    return () => {
      isCurrent = false;
    };
  }, [isOpen, isPhoneMatched, cleanPhone]);

  const currentStats = liveStats || bookingStats;
  const isOpenTime = isBookingOpen();
  const isSoldOut = Boolean(currentStats?.isSoldOut) || (currentStats?.remainingSeats !== undefined && currentStats.remainingSeats <= 0);
  const remainingSeats = currentStats?.remainingSeats ?? 0;

  const canSubmit = 
    !isSubmitting && 
    isOpenTime &&
    !isSoldOut &&
    isNameMatched && 
    isPhoneValid && 
    isPhoneMatched && 
    !isAlreadyBooked && 
    allAgreed;

  const handleClose = () => {
    setReservation(null);
    setName('');
    setNameConfirm('');
    setPhone('');
    setPhoneConfirm('');
    setIsAlreadyBooked(false);
    setAgreeAge(false);
    setAgreeTrigger(false);
    setAgreeCancellation(false);
    setErrorMsg('');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (bookingStats?.isSoldOut) {
      setErrorMsg('준비된 전 좌석이 모두 매진되어 예매가 불가합니다.');
      return;
    }

    if (!isBookingOpen()) {
      setErrorMsg('티켓 예매는 오늘(10/22) 20:00부터 가능합니다.');
      return;
    }

    if (!cleanName) {
      setErrorMsg('예매자 성함을 입력해 주세요.');
      return;
    }

    if (cleanName !== cleanNameConfirm) {
      setErrorMsg('입력하신 두 성함이 일치하지 않습니다. 다시 확인해 주세요.');
      return;
    }

    if (!isPhoneValid) {
      setErrorMsg('010으로 시작하는 올바른 휴대폰 번호(10~11자리)를 입력해 주세요.');
      return;
    }

    if (cleanPhone !== cleanPhoneConfirm) {
      setErrorMsg('입력하신 두 휴대폰 번호가 일치하지 않습니다. 다시 확인해 주세요.');
      return;
    }

    if (isAlreadyBooked) {
      setErrorMsg('이미 예매된 번호입니다.');
      return;
    }

    if (!allAgreed) {
      setErrorMsg('필수 관람 및 예매 유의사항에 모두 동의해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 0. 실시간 잔여석 최신 확인
      const freshStats = await getBookingStats();
      setLiveStats(freshStats);

      if (freshStats.isSoldOut || freshStats.remainingSeats <= 0) {
        setErrorMsg('준비된 전 좌석이 모두 매진되어 예매가 마감되었습니다.');
        setIsSubmitting(false);
        return;
      }

      const result = await createReservation({
        name: cleanName,
        nameConfirm: cleanNameConfirm,
        phone,
        phoneConfirm,
        agreedAge: agreeAge,
        agreedTrigger: agreeTrigger,
        agreedCancellation: agreeCancellation,
      });

      setReservation(result);
      if (onReservationSuccess) onReservationSuccess();
      if (onNotify) onNotify('예매가 성공적으로 완료되었습니다!');
    } catch (err) {
      setErrorMsg(err.message || '예매 처리 중 오류가 발생했습니다.');
      if (onNotify) onNotify(err.message || '예매 실패');
      getBookingStats().then(setLiveStats).catch(console.warn);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay open" 
      role="dialog" 
      aria-modal="true" 
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) handleClose(); }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>티켓 예매 (BOOK TICKET)</h3>
          <button 
            type="button" 
            className="btn-close-modal" 
            onClick={handleClose} 
            disabled={isSubmitting}
            aria-label="닫기"
          >
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
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isSoldOut ? (
                      <span style={{ 
                        padding: '4px 10px', 
                        background: 'rgba(239, 68, 68, 0.15)', 
                        border: '1px solid var(--accent-red)', 
                        color: 'var(--accent-red)', 
                        fontSize: '0.85rem', 
                        fontWeight: 700 
                      }}>
                        ● 현재 온라인 예매가 전석 매진되었습니다.
                      </span>
                    ) : (
                      <span style={{ 
                        padding: '4px 10px', 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        border: '1px solid #10b981', 
                        color: '#10b981', 
                        fontSize: '0.85rem', 
                        fontWeight: 700 
                      }}>
                        ● 실시간 잔여석: {remainingSeats}석 / 정원 {currentStats?.totalCapacity ?? 100}석
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="modal-alert-error">
                  {errorMsg}
                </div>
              )}

              {/* 1. 예매자 성함 */}
              <div className="form-group">
                <label htmlFor="book-name" className="form-label">예매자 성함 *</label>
                <input 
                  type="text" 
                  id="book-name" 
                  className="form-input" 
                  placeholder="홍길동 (신분증 실명 입력)" 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); if (errorMsg) setErrorMsg(''); }} 
                  required 
                  autoComplete="name"
                  disabled={isSubmitting}
                />
              </div>

              {/* 1-2. 예매자 성함 확인 (재입력) */}
              <div className="form-group">
                <label htmlFor="book-name-confirm" className="form-label">
                  예매자 성함 확인 (재입력) *
                </label>
                <input 
                  type="text" 
                  id="book-name-confirm" 
                  className="form-input" 
                  placeholder="성함을 한 번 더 입력해 주세요" 
                  value={nameConfirm} 
                  onChange={(e) => { setNameConfirm(e.target.value); if (errorMsg) setErrorMsg(''); }} 
                  required 
                  disabled={isSubmitting}
                  style={{
                    borderColor: isNameMatched 
                      ? '#10b981' 
                      : (isNameMismatch ? 'var(--accent-red)' : undefined)
                  }}
                />

                {isNameMatched && (
                  <div className="phone-match-badge match">
                    <span>✓</span> 성함이 일치합니다.
                  </div>
                )}

                {isNameMismatch && (
                  <div className="phone-match-badge mismatch">
                    <span>⚠</span> 입력하신 두 성함이 일치하지 않습니다.
                  </div>
                )}
              </div>

              {/* 2. 휴대폰 번호 입력 */}
              <div className="form-group">
                <label htmlFor="book-phone" className="form-label">
                  휴대폰 번호 *
                </label>
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
                  disabled={isSubmitting}
                />

                {isPhonePrefixInvalid && (
                  <div style={{ color: '#ff8a8f', fontSize: '0.8rem', marginTop: '6px', fontFamily: 'var(--font-body)', letterSpacing: '-0.025em' }}>
                    ⚠ 휴대폰 번호는 010 등 '01'로 시작해야 합니다.
                  </div>
                )}

                {!isPhonePrefixInvalid && isPhoneLengthIncomplete && (
                  <div style={{ color: 'var(--body-color)', opacity: 0.7, fontSize: '0.78rem', marginTop: '6px', fontFamily: 'var(--font-body)', letterSpacing: '-0.025em' }}>
                    휴대폰 번호 10~11자리를 모두 입력해 주세요.
                  </div>
                )}
              </div>

              {/* 3. 휴대폰 번호 확인 (일치 검증) */}
              <div className="form-group">
                <label htmlFor="book-phone-confirm" className="form-label">
                  휴대폰 번호 확인 (재입력) *
                </label>
                <input 
                  type="tel" 
                  id="book-phone-confirm" 
                  className="form-input" 
                  placeholder="010-1234-5678 (한 번 더 입력해 주세요)" 
                  maxLength={13} 
                  value={phoneConfirm} 
                  onChange={handlePhoneConfirmChange} 
                  required 
                  disabled={isSubmitting}
                  style={{
                    borderColor: isAlreadyBooked 
                      ? 'var(--accent-red)' 
                      : (isPhoneMatched ? '#10b981' : (isPhoneMismatch ? 'var(--accent-red)' : undefined))
                  }}
                />

                {isAlreadyBooked && (
                  <div className="phone-match-badge mismatch">
                    <span>⚠</span> 이미 예매된 번호입니다.
                  </div>
                )}

                {!isAlreadyBooked && isPhoneMatched && (
                  <div className="phone-match-badge match">
                    <span>✓</span> 휴대폰 번호가 일치합니다.
                  </div>
                )}

                {isPhoneMismatch && (
                  <div className="phone-match-badge mismatch">
                    <span>⚠</span> 입력하신 두 휴대폰 번호가 일치하지 않습니다.
                  </div>
                )}

                <small className="form-help-text">
                  ※ 오입력 방지를 위해 휴대폰 번호를 두 번 입력해 주세요. (1인 1매 제한)
                </small>
              </div>

              {/* 4. 필수 관람 유의사항 동의 */}
              <div className="form-agreement-box">
                <label className="checkbox-label" style={{ paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid var(--border-vintage)', fontWeight: 700, color: 'var(--title-color)' }}>
                  <input 
                    type="checkbox" 
                    checked={allAgreed} 
                    onChange={handleAllAgree} 
                    disabled={isSubmitting}
                  />
                  <span>아래 유의사항 전체 동의</span>
                </label>

                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="agree-age" 
                    checked={agreeAge} 
                    onChange={(e) => setAgreeAge(e.target.checked)} 
                    required 
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                  <span>[필수] 공연 시작 5분 전까지 미수령 시 취소표 처리되며, 관람 불가 시 사전 취소에 동의합니다.</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-submit-booking"
                disabled={!canSubmit || isSubmitting}
                style={{ 
                  opacity: canSubmit && !isSubmitting ? 1 : 0.6,
                  cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed'
                }}
              >
                {isSubmitting 
                  ? '잔여석 확인 및 예매 처리 중...' 
                  : (isSoldOut 
                      ? '전석 매진 (예매 마감)' 
                      : (!isOpenTime 
                          ? '예매 오픈 대기 중 (오늘 20:00 오픈)' 
                          : (!isPhoneMatched ? '휴대폰 번호 일치 확인 필요' : `예매 완료하기 (${remainingSeats}석 남음)`)))
                }
              </button>
            </form>
          ) : (
            <div id="booking-result-card">
              <div className="eticket-card">
                <div className="eticket-header">
                  <div>
                    <div className="eticket-title">뮤지컬 〈필로우맨〉 E-TICKET</div>
                    <div style={{ fontFamily: 'var(--font-body)', letterSpacing: '-0.025em', fontSize: '0.8rem', color: '#10b981', marginTop: '4px', fontWeight: 700 }}>
                      ● 예매 완료 (OFFICIAL VOUCHER)
                    </div>
                  </div>
                  <div className="eticket-num">{reservation.booking_code}</div>
                </div>

                <div className="eticket-grid">
                  <div className="eticket-field">
                    <div className="lbl">예매자 성명</div>
                    <div className="val">{reservation.name}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">연락처</div>
                    <div className="val">{reservation.phone_formatted}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">공연 일시</div>
                    <div className="val">{reservation.show_date}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">공연 장소</div>
                    <div className="val">{reservation.venue}</div>
                  </div>
                  <div className="eticket-field">
                    <div className="lbl">좌석 등급</div>
                    <div className="val">{reservation.seat_type}</div>
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
                  <div className="eticket-barcode-code">{reservation.booking_code}</div>
                </div>
              </div>

              {/* Instagram DM Notice */}
              <div className="booking-dm-notice-box">
                <div className="dm-notice-title">
                  <span>ℹ</span> 예매 확인 및 취소 안내
                </div>
                <p className="dm-notice-text">
                  예매 내역 확인 및 취소 요청은 공연 <strong>공식 인스타그램 DM(@pillowman_kr)</strong>으로 예매자 성함과 연락처를 보내주시면 신속히 처리해 드립니다.
                </p>
                <a 
                  href="https://www.instagram.com/pillowman_kr/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-dm-link"
                >
                  공식 인스타그램 @pillowman_kr 바로가기 →
                </a>
              </div>

              <div style={{ fontFamily: 'var(--font-body)', letterSpacing: '-0.025em', fontSize: '0.84rem', color: 'var(--body-color)', opacity: 0.85, marginBottom: '20px', lineHeight: '1.6' }}>
                ※ 공연 당일 1시간 전부터 마동 로비 티켓부스에서 <strong>예매자 성함 및 연락처 뒷자리</strong>를 제시하시면 지류 티켓으로 수령하실 수 있습니다.<br />
                ※ 공연 시작 5분 전까지 미수령 시 현장 취소표로 전환됩니다.
              </div>

              <div className="modal-actions-single" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-modal-cancel-ticket" 
                  onClick={handleClose}
                  style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
                >
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
