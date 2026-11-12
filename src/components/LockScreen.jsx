import React, { useState } from 'react';

// 기본 설정 암호 (원하는 암호로 언제든 변경 가능하며, 환경변수 VITE_ACCESS_PASSWORD도 지원합니다)
export const DEFAULT_PASSWORDS = ['pillowman', 'kamenice', '1234'];

export default function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const envPassword = import.meta.env?.VITE_ACCESS_PASSWORD;
  const validPasswords = envPassword ? [envPassword, ...DEFAULT_PASSWORDS] : DEFAULT_PASSWORDS;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    // 공백 제거 후 비교 (대소문자 무관하게 비교)
    const normalizedInput = password.trim().toLowerCase();
    const isMatch = validPasswords.some((p) => p.toLowerCase() === normalizedInput);

    if (isMatch) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="simple-gate-screen">
      <div className="simple-gate-content">
        <h1 className="simple-gate-title">이 사이트는 공사중입니다</h1>

        <form onSubmit={handleSubmit} className="simple-gate-form">
          <div className={`simple-input-row ${error ? 'has-error' : ''}`}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="암호 입력"
              className="simple-gate-input"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="simple-gate-btn"
              aria-label="확인"
            >
              →
            </button>
          </div>

          {error && (
            <p className="simple-gate-error" role="alert">
              암호가 올바르지 않습니다.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
