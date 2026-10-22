import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const LOCAL_STORAGE_KEY = 'pillowman_reservations';
const CAPACITY_KEY = 'pillowman_total_capacity';
const DEFAULT_CAPACITY = 100; // 서울예술대학교 마동 예장 기본 정원

const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch (e) {}
    return null;
  },
  setItem: (key, val) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
    } catch (e) {}
  },
};

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
 * 고유 예매 코드 생성 (예매한 일시간분초 기준: YYYYMMDD-HHmmss)
 * 예: 20261022-184512
 */
export function generateBookingCode(date = new Date()) {
  const kst = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, '0');
  const dd = String(kst.getDate()).padStart(2, '0');
  const hh = String(kst.getHours()).padStart(2, '0');
  const min = String(kst.getMinutes()).padStart(2, '0');
  const ss = String(kst.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

/**
 * 로컬스토리지 Mock 데이터 헬퍼
 */
function getLocalReservations() {
  try {
    const raw = safeStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read localStorage reservations:', err);
    return [];
  }
}

function saveLocalReservations(reservations) {
  try {
    safeStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reservations));
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

export const BOOKING_OPEN_ISO = '2026-10-22T20:00:00+09:00';
export const BOOKING_OPEN_TIME = new Date(BOOKING_OPEN_ISO).getTime();

export function isBookingOpen() {
  return Date.now() >= BOOKING_OPEN_TIME;
}

/**
 * 3. 티켓 예매 생성 (인증 완료 필수)
 */
export async function createReservation({
  name,
  nameConfirm,
  phone,
  phoneConfirm,
  agreedAge = true,
  agreedTrigger = true,
  agreedCancellation = true,
}) {
  if (!isBookingOpen()) {
    throw new Error('티켓 예매는 오늘(10/22) 20:00부터 가능합니다.');
  }

  const cleanName = name?.trim();
  const cleanNameConfirm = nameConfirm?.trim();
  const cleanPhone = phone?.replace(/[^0-9]/g, '');
  const cleanPhoneConfirm = phoneConfirm?.replace(/[^0-9]/g, '');

  if (!cleanName) {
    throw new Error('예매자 성함을 입력해 주세요.');
  }

  if (nameConfirm !== undefined && cleanName !== cleanNameConfirm) {
    throw new Error('입력하신 두 성함이 일치하지 않습니다.');
  }

  if (!isValidKoreanPhone(cleanPhone)) {
    throw new Error('010으로 시작하는 올바른 휴대폰 번호(10~11자리)를 입력해 주세요.');
  }

  if (phoneConfirm !== undefined && cleanPhone !== cleanPhoneConfirm) {
    throw new Error('입력하신 두 휴대폰 번호가 일치하지 않습니다.');
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
    // 0. 잔여석 및 정원 확인 (정원 초과 시 강력 차단)
    const stats = await getBookingStats();
    if (stats.isSoldOut || stats.remainingSeats <= 0) {
      throw new Error('준비된 전 좌석이 모두 매진되어 예매가 마감되었습니다.');
    }

    // 1. 중복 확인
    const { data: existing, error: checkError } = await supabase
      .from('reservations')
      .select('id, booking_code, status')
      .eq('phone', cleanPhone)
      .in('status', ['CONFIRMED', 'CHECKED_IN'])
      .maybeSingle();

    if (checkError) {
      console.error('Supabase check error:', checkError);
      throw new Error('예매 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }

    if (existing) {
      throw new Error('이미 예매된 번호입니다.');
    }

    // 2. 신규 예매 삽입 (동일 초 중복 충돌 방지 재시도)
    let inserted = null;
    let currentCode = bookingCode;
    let attempts = 0;

    while (attempts < 3) {
      const payload = {
        ...reservationRecord,
        booking_code: currentCode,
      };

      const { data, error: insertError } = await supabase
        .from('reservations')
        .insert([payload])
        .select()
        .single();

      if (!insertError) {
        inserted = data;
        break;
      }

      // 전화번호 중복 유니크 제약 충돌 감지
      if (
        insertError.message?.includes('idx_unique_active_booking_phone') ||
        (insertError.code === '23505' && insertError.message?.includes('phone'))
      ) {
        throw new Error('이미 예매된 번호입니다.');
      }

      // 동일 초에 다중 예매로 인한 booking_code unique 제약 충돌 시 ms 추가 후 재시도
      if (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('booking_code')) {
        attempts++;
        const ms = String(new Date().getMilliseconds()).padStart(3, '0').slice(0, 2);
        currentCode = `${generateBookingCode()}-${ms}`;
        continue;
      }

      console.error('Supabase insert error:', insertError);
      throw new Error(insertError.message || '예매 처리 중 문제가 발생했습니다.');
    }

    if (!inserted) {
      throw new Error('예매 처리 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }

    // 3. 실시간 잔여석 및 선착순 순위 엄격 검증 (동시 접속 초과 방지)
    const totalCap = stats.totalCapacity;
    const { count: rankCount, error: rankError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['CONFIRMED', 'CHECKED_IN'])
      .neq('status', 'SYSTEM_CONFIG')
      .lte('created_at', inserted.created_at);

    if (!rankError && rankCount > totalCap) {
      // 정원 초과 예매분 즉시 롤백 삭제
      await supabase
        .from('reservations')
        .delete()
        .eq('id', inserted.id);

      throw new Error('준비된 전 좌석이 방금 전 선착순으로 모두 매진되었습니다.');
    }

    return inserted;
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  await new Promise((res) => setTimeout(res, 350));

  const stats = await getBookingStats();
  if (stats.isSoldOut || stats.remainingSeats <= 0) {
    throw new Error('준비된 전 좌석이 모두 매진되어 예매가 마감되었습니다.');
  }

  const localList = getLocalReservations();
  const alreadyBooked = localList.some(
    (r) => r.phone === cleanPhone && (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
  );

  if (alreadyBooked) {
    throw new Error('이미 예매된 번호입니다.');
  }

  let finalCode = bookingCode;
  if (localList.some((r) => r.booking_code === finalCode)) {
    const ms = String(new Date().getMilliseconds()).padStart(3, '0').slice(0, 2);
    finalCode = `${finalCode}-${ms}`;
  }

  const finalRecord = {
    ...reservationRecord,
    booking_code: finalCode,
  };

  localList.push(finalRecord);
  saveLocalReservations(localList);

  return finalRecord;
}

/**
 * 3-1. 휴대폰 번호 중복 예매 여부 확인 (실시간 사전 검증용)
 */
export async function checkPhoneAlreadyBooked(phone) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '');
  if (!cleanPhone || cleanPhone.length < 10) return false;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id')
        .eq('phone', cleanPhone)
        .in('status', ['CONFIRMED', 'CHECKED_IN'])
        .maybeSingle();

      if (!error && data) return true;
    } catch (e) {
      console.warn('checkPhoneAlreadyBooked error:', e);
    }
  }

  const localList = getLocalReservations();
  return localList.some(
    (r) => r.phone === cleanPhone && (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
  );
}

/**
 * 4. 티켓 예매 내역 조회 (성함 및 휴대폰 번호)
 */
export async function lookupReservation({ phone, name }) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '');
  const cleanName = name?.trim();

  if (!isValidKoreanPhone(cleanPhone)) {
    throw new Error('010으로 시작하는 올바른 휴대폰 번호(10~11자리)를 입력해 주세요.');
  }

  // --- Real Supabase Backend Integration ---
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('reservations')
      .select('*')
      .eq('phone', cleanPhone)
      .neq('status', 'DELETED')
      .neq('status', 'TEST_DELETED')
      .neq('status', 'SYSTEM_CONFIG')
      .order('created_at', { ascending: false });

    if (cleanName) {
      query = query.eq('name', cleanName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase lookup error:', error);
      throw new Error('예매 내역 조회 중 오류가 발생했습니다.');
    }

    const validData = (data || []).filter(
      (r) => r.status !== 'DELETED' && r.status !== 'TEST_DELETED' && r.status !== 'SYSTEM_CONFIG'
    );

    if (!validData || validData.length === 0) {
      throw new Error('해당 정보로 등록된 예매 내역이 없습니다.');
    }

    // 활성 상태 예매 우선 반환
    const active = validData.find((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN') || validData[0];
    return active;
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  await new Promise((res) => setTimeout(res, 250));

  const localList = getLocalReservations();
  const foundList = localList.filter((r) => {
    const matchPhone = r.phone === cleanPhone;
    const matchName = cleanName ? r.name === cleanName : true;
    return matchPhone && matchName;
  });

  if (foundList.length === 0) {
    throw new Error('해당 정보로 등록된 예매 내역이 없습니다.');
  }

  const active = foundList.find((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN') || foundList[0];
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

const SYSTEM_CAPACITY_CODE = '__SYSTEM_CONFIG_CAPACITY__';

/**
 * 6. 총 정원 조회 (동적 설정 - Supabase 및 안전 스토리지 동기화)
 */
export async function getTotalCapacity() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('ticket_count')
        .eq('booking_code', SYSTEM_CAPACITY_CODE)
        .maybeSingle();

      if (!error && data?.ticket_count) {
        const parsed = parseInt(data.ticket_count, 10);
        if (!isNaN(parsed) && parsed > 0) {
          safeStorage.setItem(CAPACITY_KEY, String(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load total_capacity from Supabase:', e);
    }
  }

  const stored = safeStorage.getItem(CAPACITY_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_CAPACITY;
}

/**
 * 7. 총 정원 설정 변경 (관리자 전용 - Supabase 실시간 동기화)
 */
export async function updateTotalCapacity(newCapacity) {
  const cap = parseInt(newCapacity, 10);
  if (isNaN(cap) || cap < 1) {
    throw new Error('정원은 1명 이상의 숫자로 입력해 주세요.');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ ticket_count: cap })
        .eq('booking_code', SYSTEM_CAPACITY_CODE)
        .select()
        .maybeSingle();

      if (!data) {
        await supabase
          .from('reservations')
          .insert({
            booking_code: SYSTEM_CAPACITY_CODE,
            name: 'SYSTEM_CAPACITY',
            phone: '00000000000',
            phone_formatted: '000-0000-0000',
            show_title: 'SYSTEM',
            show_date: 'SYSTEM',
            venue: 'SYSTEM',
            seat_type: 'SYSTEM',
            ticket_count: cap,
            status: 'SYSTEM_CONFIG',
            agreed_age: true,
            agreed_trigger: true,
            agreed_cancellation: true,
            created_at: new Date().toISOString(),
          });
      }
    } catch (e) {
      console.error('Failed to update total_capacity in Supabase:', e);
      throw new Error('정원 설정 저장에 실패했습니다: ' + e.message);
    }
  }

  safeStorage.setItem(CAPACITY_KEY, String(cap));
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
      .in('status', ['CONFIRMED', 'CHECKED_IN'])
      .neq('status', 'SYSTEM_CONFIG');

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
    (r) => (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN') && r.status !== 'SYSTEM_CONFIG'
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
      .neq('status', 'SYSTEM_CONFIG')
      .neq('status', 'DELETED')
      .neq('status', 'TEST_DELETED')
      .not('booking_code', 'like', '__%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch all reservations error:', error);
      throw new Error('예매 목록을 불러오는 중 오류가 발생했습니다.');
    }

    let smsSentMap = {};
    try {
      smsSentMap = JSON.parse(safeStorage.getItem('pillowman_admin_sms_sent') || '{}');
    } catch (e) {
      console.warn(e);
    }

    const realReservations = (data || []).filter(
      (item) => item.status !== 'SYSTEM_CONFIG' && item.status !== 'DELETED' && item.status !== 'TEST_DELETED' && !item.booking_code?.startsWith('__')
    );

    return realReservations.map((item) => ({
      ...item,
      sms_sent: item.sms_sent !== undefined ? Boolean(item.sms_sent) : Boolean(smsSentMap[item.booking_code]),
      sms_sent_at: item.sms_sent_at || (smsSentMap[item.booking_code] ? item.created_at : null),
    }));
  }

  const localList = getLocalReservations().filter(
    (item) => item.status !== 'SYSTEM_CONFIG' && item.status !== 'DELETED' && item.status !== 'TEST_DELETED' && !item.booking_code?.startsWith('__')
  );
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
    // 1. Supabase에서 status를 'DELETED'로 즉시 변경 (anon 권한으로 목록/통계에서 즉시 완전 제거)
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'DELETED',
        cancelled_at: new Date().toISOString(),
      })
      .eq('booking_code', bookingCode);

    if (updateError) {
      console.error('Supabase admin delete status error:', updateError);
      throw new Error('예매 삭제에 실패했습니다: ' + updateError.message);
    }

    // 2. 물리적 행 삭제도 함께 시도 (권한 허용 시 레코드 완전 삭제)
    try {
      await supabase
        .from('reservations')
        .delete()
        .eq('booking_code', bookingCode);
    } catch (e) {
      // ignore
    }

    // 3. 로컬 저장소 캐시에서도 확실하게 제거
    const localList = getLocalReservations();
    const filtered = localList.filter((r) => r.booking_code !== bookingCode);
    saveLocalReservations(filtered);

    return true;
  }

  const localList = getLocalReservations();
  const filtered = localList.filter((r) => r.booking_code !== bookingCode);
  saveLocalReservations(filtered);
  return true;
}

/**
 * 12. 관리자용 안내 문자 발송 상태 토글 (체크박스)
 */
export async function adminToggleSmsSent(bookingCode, isSent) {
  if (!bookingCode) throw new Error('예매 코드가 유효하지 않습니다.');

  const updatePayload = {
    sms_sent: Boolean(isSent),
    sms_sent_at: isSent ? new Date().toISOString() : null,
  };

  try {
    const smsSentMap = JSON.parse(safeStorage.getItem('pillowman_admin_sms_sent') || '{}');
    smsSentMap[bookingCode] = Boolean(isSent);
    safeStorage.setItem('pillowman_admin_sms_sent', JSON.stringify(smsSentMap));
  } catch (e) {
    console.warn(e);
  }

  // 1. Supabase 백엔드 연동
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update(updatePayload)
        .eq('booking_code', bookingCode)
        .select()
        .single();

      if (error) {
        console.error('Supabase adminToggleSmsSent error:', error);
        // Supabase DB에 컬럼이 아직 없을 경우의 안내
        if (error.message?.includes('sms_sent') || error.code === '42703') {
          console.warn('Supabase DB에 sms_sent 컬럼이 없습니다. supabase_schema.sql을 실행해 주세요.');
        } else {
          throw new Error(error.message || '문자 발송 상태 변경에 실패했습니다.');
        }
      } else if (data) {
        // 로컬스토리지에도 동기화
        const localList = getLocalReservations();
        const idx = localList.findIndex((r) => r.booking_code === bookingCode);
        if (idx !== -1) {
          localList[idx] = { ...localList[idx], ...updatePayload };
          saveLocalReservations(localList);
        }
        return data;
      }
    } catch (err) {
      console.warn('Supabase SMS update fallback to local:', err);
    }
  }

  // 2. LocalStorage Fallback (Mock/Offline)
  const localList = getLocalReservations();
  const index = localList.findIndex((r) => r.booking_code === bookingCode);
  if (index !== -1) {
    localList[index] = {
      ...localList[index],
      ...updatePayload,
    };
    saveLocalReservations(localList);
    return localList[index];
  }

  return { booking_code: bookingCode, ...updatePayload };
}

