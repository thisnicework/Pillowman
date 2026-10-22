import React, { useState, useEffect } from 'react';
import { 
  lookupReservation, 
  cancelReservation, 
  formatPhoneNumber,
  sendPhoneOtp,
  verifyPhoneOtp,
  isValidKoreanPhone
} from '../services/bookingService';

export default function LookupModal({ isOpen, onClose, onNotify, onOpenBooking }) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpInfoMsg, setOtpInfoMsg] = useState('');
  const [foundReservation, setFoundReservation] = useState(null);

  // 180s countdown timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0 && !foundReservation) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer, foundReservation]);

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
    if (otpSent && !foundReservation) {
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

  const handleVerifyAndLookup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode.trim()) {
      setErrorMsg('인증번호를 입력해 주세요.');
      return;
    }

    if (otpTimer <= 0) {
      setErrorMsg('인증 유효시간이 만료되었습니다. 다시 인증요청을 눌러주세요.');
      return;
    }

    setIsSearching(true);
    try {
      // 1. 휴대폰 번호 OTP 인증
      await verifyPhoneOtp(phone, otpCode);

      // 2. 인증 완료 후 해당 번호의 예매 내역 조회
      const result = await lookupReservation({ phone, isVerified: true });
      setFoundReservation(result);
      if (onNotify) onNotify('예매 내역 조회가 완료되었습니다.');
    } catch (err) {
      setErrorMsg(err.message || '예매 내역을 찾을 수 없거나 인증에 실패했습니다.');
      if (onNotify) onNotify(err.message || '조회 실패');
    } finally {
      setIsSearching(false);
    }
  };

  const handleResetSearch = () => {
    setFoundReservation(null);
    setPhone('');
    setOtpSent(false);
    setOtpCode('');
    setOtpTimer(0);
    setOtpInfoMsg('');
    setErrorMsg('');
    setIsSearching(false);
    setIsCancelling(false);
  };

  const handleClose = () => {
    handleResetSearch();
    onClose();
  };

  const handleCancelBooking = async () => {
    if (!foundReservation) return;

    const confirmMsg = '정말로 예매를 취소하시겠습니까?\n취소된 좌석은 다른 관객 분들을 위해 즉시 반환됩니다.';
    if (!window.confirm(confirmMsg)) return;

    setIsCancelling(true);
    setErrorMsg('');
    try {
      const updated = await cancelReservation(foundReservation.booking_code, {
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
            <form onSubmit={handleVerifyAndLookup} id="ticket-lookup-form">
              <p style={{ fontFamily: 'var(--font-body)', letterSpacing: '-0.025em', fontSize: '0.92rem', color: 'var(--body-color)', marginBottom: '18px', lineHeight: '1.6' }}>
                개인정보 보호 및 안전한 예매 관리를 위해 <strong>휴대폰 번호 본인 인증</strong> 후 예매 내역 조회 및 취소가 가능합니다.
              </p>

              {errorMsg && (
                <div className="modal-alert-error">
                  {errorMsg}
                </div>
              )}

              {/* 휴대폰 번호 입력 및 발송 */}
              <div className="form-group">
                <label htmlFor="lookup-phone" className="form-label">휴대폰 번호 *</label>
                <div className="input-with-action">
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
                    disabled={isSearching || isSendingOtp}
                  />
                  <button
                    type="button"
                    className="btn-input-action"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || isSearching || !isPhoneValid}
                    style={{
                      background: isPhoneValid ? 'rgba(223, 54, 62, 0.25)' : undefined,
                      borderColor: isPhoneValid ? 'var(--accent-red)' : undefined,
                      color: isPhoneValid ? '#fff' : undefined,
                    }}
                  >
                    {isSendingOtp ? '발송 중...' : (otpSent ? '재전송' : '인증요청')}
                  </button>
                </div>

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

              {/* OTP 입력 및 조회 버튼 */}
              {otpSent && (
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
                      disabled={isSearching}
                      autoFocus
                    />
                  </div>

                  {otpInfoMsg && (
                    <div className="otp-box-note">
                      {otpInfoMsg}
                    </div>
                  )}

                  <div style={{ fontSize: '0.76rem', color: 'var(--body-color)', opacity: 0.75, marginTop: '8px', lineHeight: '1.4' }}>
                    ※ 보안 발신 시스템(Twilio)을 통해 <strong>[국제발신]</strong> 문자로 수신될 수 있으니 수신함을 확인해 주세요.
                  </div>

                  <button 
                    type="submit" 
                    className="btn-submit-booking"
                    style={{ marginTop: '14px' }}
                    disabled={isSearching || otpCode.length < 4 || otpTimer <= 0}
                  >
                    {isSearching ? '인증 및 예매 조회 중...' : '인증 확인 및 예매 내역 조회'}
                  </button>
                </div>
              )}

              {!otpSent && (
                <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--body-color)', fontSize: '0.82rem', opacity: 0.7 }}>
                  [인증요청] 버튼을 눌러 SMS 인증번호를 수신해 주세요.
                </div>
              )}
            </form>
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
                    취소 완료된 티켓입니다. 좌석이 안전하게 반환되었습니다.
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
