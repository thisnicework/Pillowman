import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'pillowman_reservations';
const TOTAL_CAPACITY = 100; // 서울예술대학교 마동 예장 회차당 정원

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
 * 티켓 예매 생성
 */
export async function createReservation({
  name,
  phone,
  agreedAge = true,
  agreedTrigger = true,
  agreedCancellation = true,
}) {
  const cleanName = name?.trim();
  const cleanPhone = phone?.replace(/[^0-9]/g, '');

  if (!cleanName) {
    throw new Error('예매자 성함을 입력해 주세요.');
  }

  if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
    throw new Error('올바른 휴대폰 번호(10~11자리)를 입력해 주세요.');
  }

  if (!agreedAge || !agreedTrigger || !agreedCancellation) {
    throw new Error('모든 필수 관람 유의사항에 동의해 주세요.');
  }

  const formattedPhone = formatPhoneNumber(cleanPhone);
  const bookingCode = generateBookingCode();

  const reservationRecord = {
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
  await new Promise((res) => setTimeout(res, 350)); // 네트워크 딜레이 시뮬레이션

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
 * 티켓 예매 내역 조회
 */
export async function lookupReservation({ name, phone }) {
  const cleanName = name?.trim();
  const cleanPhone = phone?.replace(/[^0-9]/g, '');

  if (!cleanName || !cleanPhone) {
    throw new Error('성함과 휴대폰 번호를 모두 입력해 주세요.');
  }

  // --- Real Supabase Backend Integration ---
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('name', cleanName)
      .eq('phone', cleanPhone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase lookup error:', error);
      throw new Error('예매 내역 조회 중 오류가 발생했습니다.');
    }

    if (!data || data.length === 0) {
      throw new Error('입력하신 정보와 일치하는 예매 내역을 찾을 수 없습니다.');
    }

    // 활성 상태 예매 우선 반환
    const active = data.find((r) => r.status === 'CONFIRMED') || data[0];
    return active;
  }

  // --- LocalStorage Fallback (Mock Mode) ---
  await new Promise((res) => setTimeout(res, 250));

  const localList = getLocalReservations();
  const foundList = localList.filter(
    (r) => r.name === cleanName && r.phone === cleanPhone
  );

  if (foundList.length === 0) {
    throw new Error('입력하신 정보와 일치하는 예매 내역을 찾을 수 없습니다.');
  }

  const active = foundList.find((r) => r.status === 'CONFIRMED') || foundList[0];
  return active;
}

/**
 * 티켓 예매 취소
 */
export async function cancelReservation(bookingCode, { name, phone } = {}) {
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
 * 정원 및 잔여석 통계
 */
export async function getBookingStats() {
  if (isSupabaseConfigured && supabase) {
    const { count, error } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'CONFIRMED');

    const confirmedCount = error ? 0 : count || 0;
    return {
      totalCapacity: TOTAL_CAPACITY,
      confirmedCount,
      remainingSeats: Math.max(0, TOTAL_CAPACITY - confirmedCount),
      isSoldOut: confirmedCount >= TOTAL_CAPACITY,
    };
  }

  const localList = getLocalReservations();
  const confirmedCount = localList.filter((r) => r.status === 'CONFIRMED').length;
  return {
    totalCapacity: TOTAL_CAPACITY,
    confirmedCount,
    remainingSeats: Math.max(0, TOTAL_CAPACITY - confirmedCount),
    isSoldOut: confirmedCount >= TOTAL_CAPACITY,
  };
}
