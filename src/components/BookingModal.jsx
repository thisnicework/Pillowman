import React, { useState, useEffect } from 'react';
import { 
  createReservation, 
  formatPhoneNumber, 
  sendPhoneOtp, 
  verifyPhoneOtp,
  isValidKoreanPhone
} from '../services/bookingService';

export default function BookingModal({ isOpen, onClose, onNotify }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTrigger, setAgreeTrigger] = useState(false);
  const [agreeCancellation, setAgreeCancellation] = useState(false);
  
  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpInfoMsg, setOtpInfoMsg] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reservation, setReservation] = useState(null);

  // 180s OTP countdown timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0 && !isVerified) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer, isVerified]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    if (errorMsg) setErrorMsg('');
    if (otpSent && !isVerified) {
      setOtpSent(false);
      setOtpCode('');
      setOtpTimer(0);
      setOtpInfoMsg('');
    }
  };

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const isPhoneValid = isValidKoreanPhone(cleanPhone);
  const isPhonePrefixInvalid = cleanPhone.length >= 3 && !cleanPhone.startsWith('01');
  const isPhoneLengthIncomplete = cleanPhone.length >= 4 && cleanPhone.length < 10;

  const handleSendOtp = async () => {
    setErrorMsg('');
    setOtpInfoMsg('');
    if (!isPhoneValid) {
      setErrorMsg('010으로 시작하는 올바른 휴대폰 번호(10~11자리)를 입력해 주세요.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendPhoneOtp(phone);
      setOtpSent(true);
      setOtpTimer(180);
      setOtpInfoMsg(res.message || '인증번호가 발송되었습니다.');
      if (onNotify) onNotify(res.message || '인증번호 발송 완료');
    } catch (err) {
      setErrorMsg(err.message || '인증번호 발송에 실패했습니다.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');
    if (!otpCode.trim()) {
      setErrorMsg('인증번호를 입력해 주세요.');
      return;
    }

    if (otpTimer <= 0) {
      setErrorMsg('인증 유효시간이 만료되었습니다. 다시 인증요청을 눌러주세요.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await verifyPhoneOtp(phone, otpCode);
      setIsVerified(true);
      setOtpSent(false);
      setOtpInfoMsg('');
      if (onNotify) onNotify('휴대폰 번호 인증이 완료되었습니다.');
    } catch (err) {
      setErrorMsg(err.message || '인증번호가 일치하지 않습니다.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPhone = () => {
    setIsVerified(false);
    setOtpSent(false);
    setOtpCode('');
    setOtpTimer(0);
    setOtpInfoMsg('');
    setErrorMsg('');
  };

  const handleAllAgree = (e) => {
    const checked = e.target.checked;
    setAgreeAge(checked);
    setAgreeTrigger(checked);
    setAgreeCancellation(checked);
  };

  const allAgreed = agreeAge && agreeTrigger && agreeCancellation;

  const handleClose = () => {
    setReservation(null);
    setName('');
    setPhone('');
    setIsVerified(false);
    setOtpSent(false);
    setOtpCode('');
    setOtpTimer(0);
    setOtpInfoMsg('');
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

    if (!name.trim()) {
      setErrorMsg('예매자 성함을 입력해 주세요.');
      return;
    }

    if (!isVerified) {
      setErrorMsg('휴대폰 번호 인증을 완료해 주세요.');
      return;
    }

    if (!allAgreed) {
      setErrorMsg('필수 관람 및 예매 유의사항에 모두 동의해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createReservation({
        name,
        phone,
        isVerified: true,
        agreedAge: agreeAge,
        agreedTrigger: agreeTrigger,
        agreedCancellation: agreeCancellation,
      });

      setReservation(result);
      if (onNotify) onNotify('예매가 성공적으로 완료되었습니다!');
    } catch (err) {
      setErrorMsg(err.message || '예매 처리 중 오류가 발생했습니다.');
      if (onNotify) onNotify(err.message || '예매 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                </div>
              </div>

              {errorMsg && (
                <div className="modal-alert-error">
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="book-name" className="form-label">예매자 성함 *</label>
                <input 
                  type="text" 
                  id="book-name" 
                  className="form-input" 
                  placeholder="홍길동" 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); if (errorMsg) setErrorMsg(''); }} 
                  required 
                  autoComplete="name"
                  disabled={isSubmitting}
                />
              </div>

              {/* 휴대폰 번호 및 Supabase OTP 인증 */}
              <div className="form-group">
                <label htmlFor="book-phone" className="form-label">
                  휴대폰 번호 (본인 인증 필수) *
                </label>
                
                <div className="input-with-action">
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
                    disabled={isVerified || isSubmitting || isSendingOtp}
                  />
                  {!isVerified ? (
                    <button
                      type="button"
                      className="btn-input-action"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || isSubmitting || !isPhoneValid}
                      style={{
                        background: isPhoneValid ? 'rgba(223, 54, 62, 0.25)' : undefined,
                        borderColor: isPhoneValid ? 'var(--accent-red)' : undefined,
                        color: isPhoneValid ? '#fff' : undefined,
                      }}
                    >
                      {isSendingOtp ? '발송 중...' : (otpSent ? '재전송' : '인증요청')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-input-action btn-change-phone"
                      onClick={handleResetPhone}
                      disabled={isSubmitting}
                    >
                      번호변경
                    </button>
                  )}
                </div>

                {isPhonePrefixInvalid && !isVerified && (
                  <div style={{ color: '#ff8a8f', fontSize: '0.8rem', marginTop: '6px', fontFamily: 'var(--font-body)', letterSpacing: '-0.025em' }}>
                    ⚠ 휴대폰 번호는 010 등 '01'로 시작해야 합니다.
                  </div>
                )}

                {!isPhonePrefixInvalid && isPhoneLengthIncomplete && !isVerified && (
                  <div style={{ color: 'var(--body-color)', opacity: 0.7, fontSize: '0.78rem', marginTop: '6px', fontFamily: 'var(--font-body)', letterSpacing: '-0.025em' }}>
                    휴대폰 번호 10~11자리를 모두 입력해 주세요.
                  </div>
                )}

                {isVerified && (
                  <div className="verified-badge">
                    <span style={{ fontSize: '1rem' }}>✓</span> 휴대폰 번호 인증 완료
                  </div>
                )}

                {/* OTP 입력 창 */}
                {otpSent && !isVerified && (
                  <div className="otp-box">
                    <div className="otp-box-header">
                      <span className="otp-box-title">인증번호 6자리 입력</span>
                      <span className="otp-timer">{formatTimer(otpTimer)}</span>
                    </div>

                    <div className="input-with-action">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        className="form-input" 
                        placeholder="인증번호 6자리" 
                        value={otpCode}
                        onChange={(e) => { setOtpCode(e.target.value.replace(/[^0-9]/g, '')); if (errorMsg) setErrorMsg(''); }}
                        disabled={isVerifyingOtp}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn-input-action btn-verify-action"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || otpCode.length < 4 || otpTimer <= 0}
                      >
                        {isVerifyingOtp ? '확인 중...' : '인증확인'}
                      </button>
                    </div>

                    {otpInfoMsg && (
                      <div className="otp-box-note">
                        {otpInfoMsg}
                      </div>
                    )}
                  </div>
                )}

                <small className="form-help-text">
                  ※ 1인 1매 원칙으로, 번호 인증을 완료하신 관객에 한해 예매가 확정됩니다.
                </small>
              </div>

              {/* 필수 관람 유의사항 동의 */}
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
                disabled={isSubmitting || !isVerified}
                style={{ 
                  opacity: (isSubmitting || !isVerified) ? 0.6 : 1,
                  cursor: !isVerified ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? '예매 처리 중...' : (!isVerified ? '휴대폰 번호 인증 필요' : '예매 완료하기 (무료 발권)')}
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

              <div style={{ fontFamily: 'var(--font-body)', letterSpacing: '-0.025em', fontSize: '0.88rem', color: 'var(--body-color)', marginBottom: '20px', lineHeight: '1.6' }}>
                ※ 공연 당일 1시간 전부터 마동 로비 티켓부스에서 <strong>예매자 성함 및 연락처 뒷자리</strong>를 제시하시면 지류 티켓으로 수령하실 수 있습니다.<br />
                ※ 공연 시작 5분 전까지 미수령 시 현장 취소표로 전환됩니다.
              </div>

              <div className="modal-actions-dual">
                <button type="button" className="btn-modal-print" onClick={() => window.print()}>
                  티켓 인쇄 / 저장
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
