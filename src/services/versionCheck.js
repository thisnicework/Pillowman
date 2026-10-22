/**
 * 배포 버전 감지 & 구버전 탭 강제 새로고침
 *
 * 배경: 새 버전을 배포해도 이미 열려 있던 탭은 예전 JS로 계속 동작해
 * (예: 정원 100석으로 인식) 초과 예매가 발생했음.
 * → 서버의 /version.json 과 현재 번들의 버전을 비교해 다르면 새로고침.
 */

/* global __APP_VERSION__ */
const CURRENT_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : null;
const CHECK_INTERVAL_MS = 60 * 1000;
const RELOAD_GUARD_KEY = 'pillowman_version_reload';

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

async function fetchLatestVersion() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.version ? String(json.version) : null;
  } catch {
    return null;
  }
}

/** 최신 버전과 다르면 true */
export async function isOutdated() {
  if (isDev || !CURRENT_VERSION) return false;
  const latest = await fetchLatestVersion();
  return Boolean(latest && latest !== CURRENT_VERSION);
}

function hardReload(latestHint) {
  // 같은 버전으로 무한 새로고침되는 것을 방지
  try {
    const last = sessionStorage.getItem(RELOAD_GUARD_KEY);
    const marker = `${CURRENT_VERSION}->${latestHint || 'new'}`;
    if (last === marker) return false;
    sessionStorage.setItem(RELOAD_GUARD_KEY, marker);
  } catch {
    // ignore
  }
  window.location.reload();
  return true;
}

/**
 * 예매 등 중요한 동작 직전 호출.
 * 구버전이면 새로고침 후 에러를 던져 진행을 막는다.
 */
export async function ensureLatestVersion() {
  if (isDev || !CURRENT_VERSION || typeof window === 'undefined') return;
  const latest = await fetchLatestVersion();
  if (latest && latest !== CURRENT_VERSION) {
    hardReload(latest);
    throw new Error('사이트가 최신 버전으로 업데이트되었습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.');
  }
}

function isUserTyping() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/** 앱 시작 시 1회 호출: 주기적 + 탭 복귀 시 버전 확인 */
export function startVersionWatcher() {
  if (isDev || !CURRENT_VERSION || typeof window === 'undefined') return;

  const check = async () => {
    const latest = await fetchLatestVersion();
    if (!latest || latest === CURRENT_VERSION) return;
    // 입력 중이면 방해하지 않음 (예매 제출 시 ensureLatestVersion 이 다시 차단)
    if (isUserTyping() && !document.hidden) return;
    hardReload(latest);
  };

  check();
  setInterval(check, CHECK_INTERVAL_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) check();
  });
  window.addEventListener('focus', check);
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) check(); // bfcache 복원 시
  });
}
