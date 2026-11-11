import React, { useState } from 'react';

// 기본 설정 암호 (원하는 암호로 언제든 변경 가능하며, 환경변수 VITE_ACCESS_PASSWORD도 지원합니다)
export const DEFAULT_PASSWORDS = ['pillowman', 'kamenice', '1234'];

export default function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const envPassword = import.meta.env?.VITE_ACCESS_PASSWORD;
  const validPasswords = envPassword ? [envPassword, ...DEFAULT_PASSWORDS] : DEFAULT_PASSWORDS;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);

    // 공백 제거 후 비교 (대소문자 무관하게 비교)
    const normalizedInput = password.trim().toLowerCase();
    const isMatch = validPasswords.some((p) => p.toLowerCase() === normalizedInput);

    if (isMatch) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lockscreen-backdrop">
      <div className="lockscreen-card">
        {/* 심볼 및 타이틀 */}
        <div className="lockscreen-symbol" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor">
            {/* 자물쇠 / 숲 아이콘 */}
            <path
              d="M 14 20 V 13 A 10 10 0 0 1 34 13 V 20"
              stroke="rgba(225, 218, 202, 0.75)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <rect
              x="10"
              y="20"
              width="28"
              height="22"
              rx="4"
              fill="#181a1f"
              stroke="rgba(225, 218, 202, 0.85)"
              strokeWidth="2.5"
            />
            <circle cx="24" cy="29" r="2.5" fill="rgba(225, 218, 202, 0.9)" />
            <line x1="24" y1="31.5" x2="24" y2="36" stroke="rgba(225, 218, 202, 0.9)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <span className="lockscreen-eyebrow">THE PILLOWMAN STORY ARCHIVE</span>
        <h1 className="lockscreen-title">이 페이지는 오픈 예정입니다</h1>
        
        <p className="lockscreen-desc">
          카메니체 숲의 이야기는 현재 준비 중입니다.<br />
          사전 확인 및 입장을 위해 비밀번호를 입력해 주십시오.
        </p>

        {/* 암호 입력 폼 */}
        <form onSubmit={handleSubmit} className="lockscreen-form">
          <div className={`lockscreen-input-wrapper ${error ? 'has-error' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="암호를 입력하세요"
              className="lockscreen-input"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '암호 숨기기' : '암호 보기'}
            >
              {showPassword ? '숨김' : '표시'}
            </button>
          </div>

          {error && (
            <p className="lockscreen-error-msg" role="alert">
              암호가 올바르지 않습니다. 다시 입력해 주십시오.
            </p>
          )}

          <button
            type="submit"
            className="lockscreen-submit-btn"
            disabled={isSubmitting || !password.trim()}
          >
            입장하기
          </button>
        </form>

        <div className="lockscreen-footer">
          <span>카메니체 숲 이야기 아카이빙 프로젝트</span>
        </div>
      </div>
    </div>
  );
}
