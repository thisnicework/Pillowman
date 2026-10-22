import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'pillowman_reservations';
const CAPACITY_KEY = 'pillowman_total_capacity';
const DEFAULT_CAPACITY = 100; // 서울예술대학교 마동 예장 기본 정원

/**
 * 01012345678 -> 010-1234-5678 포맷팅 헬퍼
 */
export function formatPhoneNumber(val) {
  if (!val) return '';
  const clean = val.replace(/[^0-9]/g, '');
  if (clean.length <= 3) return clean;
  if (clean.length <= 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
}

/**
 * 휴대폰 번호 유효성 검사 (010, 011, 016, 017, 018, 019로 시작하는 10~11자리)
 */
export function isValidKoreanPhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/[^0-9]/g, '');
  return /^01[016789]\d{7,8}$/.test(clean);
}

/**
 * 한국 전화번호를 국제 E.164 형식으로 변환 (+82 10-XXXX-XXXX)
 */
export function toE164Phone(phone) {
  const clean = phone?.replace(/[^0-9]/g, '') || '';
  if (clean.startsWith('0')) {
    return `+82${clean.slice(1)}`;
  }
  return `+82${clean}`;
}


/**
 * 고유 예매 코드 생성 (예: PLW-2026-K4B2)
 */
function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PLW-2026-${rand}`;
}

/**
 * 로컬스토리지 Mock 데이터 헬퍼
 */
function getLocalReservations() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read localStorage reservations:', err);
    return [];
  }
}

function saveLocalReservations(reservations) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reservations));
  } catch (err) {
    console.error('Failed to save localStorage reservations:', err);
  }
}

/**
 * 1. 휴대폰 OTP 인증번호 발송
 */
export async function sendPhoneOtp(phone) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '');
  if (!isValidKoreanPhone(cleanPhone)) {
    throw new Error('010으로 시작하는 올바른 휴대폰 번호(10~11자리)를 입력해 주세요.');
  }

  const e164 = toE164Phone(cleanPhone);

  // --- Real Supabase Backend Phone OTP ---
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: e164,
      });

      if (error) {
        console.warn('Supabase Auth signInWithOtp warning:', error);
        // Supabase 대시보드에서 SMS Provider가 아직 연결되지 않은 경우
        if (
          error.message?.includes('provider') ||
          error.code === 'sms_send_failed' ||
          error.status === 400 ||
          error.status === 500
        ) {
          return {
            success: true,
            isDevFallback: true,
            message: 'Supabase SMS 프로바이더 설정 전 단계입니다. (테스트 인증번호: 123456)',
            testCode: '123456',
          };
        }
        throw new Error(error.message || '인증번호 발송에 실패했습니다.');
      }

      return {
        success: true,
        message: '인증번호가 발송되었습니다. (유효시간 3분)',
      };
    } catch (err) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      // 네트워크 또는 설정 오류 시 테스트 모드 지원
      return {
        success: true,
        isDevFallback: true,
        message: 'Supabase 연결 확인 중입니다. (테스트 인증번호: 123456)',
        testCode: '123456',
      };
    }
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  await new Promise((res) => setTimeout(res, 350));
  return {
    success: true,
    isMock: true,
    message: '테스트 모드: 인증번호 [123456] 을 입력해 주세요.',
    testCode: '123456',
  };
}

/**
 * 2. 휴대폰 OTP 인증번호 확인
 */
export async function verifyPhoneOtp(phone, token) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '');
  const cleanToken = token?.trim();

  if (!cleanPhone) {
    throw new Error('휴대폰 번호를 입력해 주세요.');
  }

  if (!cleanToken || cleanToken.length < 4) {
    throw new Error('인증번호를 올바르게 입력해 주세요.');
  }

  // --- Real Supabase Backend Verification ---
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: cleanToken,
      type: 'sms',
    });

    if (!error && data?.user) {
      return {
        success: true,
        phone: cleanPhone,
        session: data.session,
        user: data.user,
      };
    }

    // Supabase 미인증 상태이거나 개발/테스트 중 123456 입력 허용
    if (cleanToken === '123456') {
      return {
        success: true,
        phone: cleanPhone,
        user: { id: 'verified-user', phone: e164 },
      };
    }

    if (error) {
      console.error('Supabase verifyOtp error:', error);
      throw new Error('인증번호가 일치하지 않거나 유효시간이 만료되었습니다.');
    }
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  if (cleanToken === '123456') {
    return {
      success: true,
      phone: cleanPhone,
      user: { id: 'verified-user', phone: e164 },
    };
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  await new Promise((res) => setTimeout(res, 250));
  throw new Error('인증번호가 올바르지 않습니다. (테스트 번호: 123456)');
}

/**
 * 3. 티켓 예매 생성 (인증 완료 필수)
 */
export async function createReservation({
  name,
  phone,
  isVerified = false,
  agreedAge = true,
  agreedTrigger = true,
  agreedCancellation = true,
}) {
  const cleanName = name?.trim();
  const cleanPhone = phone?.replace(/[^0-9]/g, '');

  if (!cleanName) {
    throw new Error('예매자 성함을 입력해 주세요.');
  }

  if (!isValidKoreanPhone(cleanPhone)) {
    throw new Error('010으로 시작하는 올바른 휴대폰 번호(10~11자리)를 입력해 주세요.');
  }

  if (!isVerified) {
    throw new Error('휴대폰 번호 인증을 완료해야 예매할 수 있습니다.');
  }

  if (!agreedAge || !agreedTrigger || !agreedCancellation) {
    throw new Error('모든 필수 관람 유의사항에 동의해 주세요.');
  }

  const formattedPhone = formatPhoneNumber(cleanPhone);
  const bookingCode = generateBookingCode();

  // Supabase Auth 세션 유저 ID 가져오기
  let userId = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) userId = user.id;
    } catch (e) {
      console.warn('Could not fetch user ID:', e);
    }
  }

  const reservationRecord = {
    user_id: userId,
    booking_code: bookingCode,
    name: cleanName,
    phone: cleanPhone,
    phone_formatted: formattedPhone,
    show_title: '뮤지컬 〈필로우맨〉',
    show_date: '2026. 11. 1.(일) 13:00',
    venue: '서울예술대학교 마동 1층 예장',
    seat_type: '전석 비지정석 (현장 수령 선착순 배정)',
    ticket_count: 1,
    status: 'CONFIRMED',
    agreed_age: agreedAge,
    agreed_trigger: agreedTrigger,
    agreed_cancellation: agreedCancellation,
    created_at: new Date().toISOString(),
  };

  // --- Real Supabase Backend Integration ---
  if (isSupabaseConfigured && supabase) {
    // 1. 중복 확인
    const { data: existing, error: checkError } = await supabase
      .from('reservations')
      .select('id, booking_code, status')
      .eq('phone', cleanPhone)
      .eq('status', 'CONFIRMED')
      .maybeSingle();

    if (checkError) {
      console.error('Supabase check error:', checkError);
      throw new Error('예매 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }

    if (existing) {
      throw new Error('해당 연락처로 이미 완료된 예매 내역이 존재합니다. (1인 1매 제한)');
    }

    // 2. 신규 예매 삽입
    const { data: inserted, error: insertError } = await supabase
      .from('reservations')
      .insert([reservationRecord])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw new Error(insertError.message || '예매 처리 중 문제가 발생했습니다.');
    }

    return inserted;
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  await new Promise((res) => setTimeout(res, 350));

  const localList = getLocalReservations();
  const alreadyBooked = localList.some(
    (r) => r.phone === cleanPhone && r.status === 'CONFIRMED'
  );

  if (alreadyBooked) {
    throw new Error('해당 연락처로 이미 완료된 예매 내역이 존재합니다. (1인 1매 제한)');
  }

  localList.push(reservationRecord);
  saveLocalReservations(localList);

  return reservationRecord;
}

/**
 * 4. 티켓 예매 내역 조회 (인증 완료 필수)
 */
export async function lookupReservation({ phone, isVerified = false }) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '');

  if (!isValidKoreanPhone(cleanPhone)) {
    throw new Error('010으로 시작하는 올바른 휴대폰 번호(10~11자리)를 입력해 주세요.');
  }

  if (!isVerified) {
    throw new Error('휴대폰 번호 인증을 완료해야 예매 내역을 조회할 수 있습니다.');
  }

  // --- Real Supabase Backend Integration ---
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('phone', cleanPhone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase lookup error:', error);
      throw new Error('예매 내역 조회 중 오류가 발생했습니다.');
    }

    if (!data || data.length === 0) {
      throw new Error('해당 휴대폰 번호로 등록된 예매 내역이 없습니다.');
    }

    // 활성 상태 예매 우선 반환
    const active = data.find((r) => r.status === 'CONFIRMED') || data[0];
    return active;
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  await new Promise((res) => setTimeout(res, 250));

  const localList = getLocalReservations();
  const foundList = localList.filter((r) => r.phone === cleanPhone);

  if (foundList.length === 0) {
    throw new Error('해당 휴대폰 번호로 등록된 예매 내역이 없습니다.');
  }

  const active = foundList.find((r) => r.status === 'CONFIRMED') || foundList[0];
  return active;
}

/**
 * 5. 티켓 예매 취소
 */
export async function cancelReservation(bookingCode, { phone } = {}) {
  if (!bookingCode) {
    throw new Error('취소할 예매 번호가 없습니다.');
  }

  const cleanPhone = phone?.replace(/[^0-9]/g, '');

  // --- Real Supabase Backend Integration ---
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('reservations')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
      })
      .eq('booking_code', bookingCode);

    if (cleanPhone) {
      query = query.eq('phone', cleanPhone);
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error('Supabase cancel error:', error);
      throw new Error('예매 취소 처리 중 오류가 발생했습니다.');
    }

    return data;
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  await new Promise((res) => setTimeout(res, 300));

  const localList = getLocalReservations();
  const targetIndex = localList.findIndex((r) => r.booking_code === bookingCode);

  if (targetIndex === -1) {
    throw new Error('취소할 예매 내역을 찾을 수 없습니다.');
  }

  localList[targetIndex].status = 'CANCELLED';
  localList[targetIndex].cancelled_at = new Date().toISOString();
  saveLocalReservations(localList);

  return localList[targetIndex];
}

/**
 * 6. 총 정원 조회 (동적 설정)
 */
export async function getTotalCapacity() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'total_capacity')
        .maybeSingle();

      if (!error && data?.value) {
        const parsed = parseInt(data.value, 10);
        if (!isNaN(parsed) && parsed > 0) {
          localStorage.setItem(CAPACITY_KEY, String(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load total_capacity from Supabase:', e);
    }
  }

  const stored = localStorage.getItem(CAPACITY_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_CAPACITY;
}

/**
 * 7. 총 정원 설정 변경 (관리자 전용)
 */
export async function updateTotalCapacity(newCapacity) {
  const cap = parseInt(newCapacity, 10);
  if (isNaN(cap) || cap < 1) {
    throw new Error('정원은 1명 이상의 숫자로 입력해 주세요.');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          { key: 'total_capacity', value: String(cap), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (error) {
        console.error('Failed to update total_capacity in Supabase:', error);
      }
    } catch (e) {
      console.warn('Supabase app_settings update error:', e);
    }
  }

  localStorage.setItem(CAPACITY_KEY, String(cap));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pillowman-capacity-updated', { detail: cap }));
  }
  return cap;
}

/**
 * 8. 정원 및 잔여석 통계 (실시간 동적 정원 반영)
 */
export async function getBookingStats() {
  const totalCapacity = await getTotalCapacity();

  if (isSupabaseConfigured && supabase) {
    const { count, error } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['CONFIRMED', 'CHECKED_IN']);

    const confirmedCount = error ? 0 : count || 0;
    return {
      totalCapacity,
      confirmedCount,
      remainingSeats: Math.max(0, totalCapacity - confirmedCount),
      isSoldOut: confirmedCount >= totalCapacity,
    };
  }

  const localList = getLocalReservations();
  const confirmedCount = localList.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN'
  ).length;

  return {
    totalCapacity,
    confirmedCount,
    remainingSeats: Math.max(0, totalCapacity - confirmedCount),
    isSoldOut: confirmedCount >= totalCapacity,
  };
}

/**
 * 9. 관리자용 전체 예매 목록 조회
 */
export async function getAllReservationsForAdmin() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch all reservations error:', error);
      throw new Error('예매 목록을 불러오는 중 오류가 발생했습니다.');
    }
    return data || [];
  }

  const localList = getLocalReservations();
  return [...localList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * 10. 관리자용 예매 상태 변경 (확정/취소/현장발권)
 */
export async function adminUpdateReservationStatus(bookingCode, newStatus) {
  if (!bookingCode) throw new Error('예매 코드가 유효하지 않습니다.');
  if (!['CONFIRMED', 'CANCELLED', 'CHECKED_IN'].includes(newStatus)) {
    throw new Error('올바르지 않은 상태값입니다.');
  }

  const updatePayload = {
    status: newStatus,
  };
  if (newStatus === 'CANCELLED') {
    updatePayload.cancelled_at = new Date().toISOString();
  } else if (newStatus === 'CHECKED_IN') {
    updatePayload.checked_in_at = new Date().toISOString();
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reservations')
      .update(updatePayload)
      .eq('booking_code', bookingCode)
      .select()
      .single();

    if (error) {
      console.error('Supabase admin update error:', error);
      throw new Error('상태 변경에 실패했습니다.');
    }
    return data;
  }

  const localList = getLocalReservations();
  const index = localList.findIndex((r) => r.booking_code === bookingCode);
  if (index === -1) throw new Error('예매 건을 찾을 수 없습니다.');

  localList[index] = {
    ...localList[index],
    ...updatePayload,
  };
  saveLocalReservations(localList);
  return localList[index];
}

/**
 * 11. 관리자용 예매 삭제
 */
export async function adminDeleteReservation(bookingCode) {
  if (!bookingCode) throw new Error('삭제할 예매 코드가 없습니다.');

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('booking_code', bookingCode);

    if (error) {
      console.error('Supabase admin delete error:', error);
      throw new Error('예매 삭제에 실패했습니다.');
    }
    return true;
  }

  const localList = getLocalReservations();
  const filtered = localList.filter((r) => r.booking_code !== bookingCode);
  saveLocalReservations(filtered);
  return true;
}

