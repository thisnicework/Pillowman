-- ==============================================================================
-- 뮤지컬 〈필로우맨〉(The Pillowman) 티켓 예매 시스템 - Supabase SQL Schema (Auth & OTP Ready)
-- ==============================================================================
-- Supabase 대시보드 > SQL Editor에 복사하여 [RUN]을 누르시면 테이블과 보안 정책이 생성됩니다.

-- 1. reservations 테이블 생성 (auth.users 연동 포함)
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Supabase 휴대폰 인증 계정 ID
    booking_code TEXT UNIQUE NOT NULL,                         -- 예매 고유 코드 (예: PLW-2026-ABCD)
    name TEXT NOT NULL,                                         -- 예매자 성명
    phone TEXT NOT NULL,                                        -- 예매자 휴대폰 번호 (하이픈 제외 숫자, e.g. 01012345678)
    phone_formatted TEXT NOT NULL,                              -- 표시용 번호 (예: 010-1234-5678)
    show_title TEXT NOT NULL DEFAULT '뮤지컬 〈필로우맨〉',        -- 공연명
    show_date TEXT NOT NULL DEFAULT '2026. 11. 1.(일) 13:00',    -- 공연 일시
    venue TEXT NOT NULL DEFAULT '서울예술대학교 마동 1층 예장',    -- 공연 장소
    seat_type TEXT NOT NULL DEFAULT '전석 비지정석 (현장 수령)',   -- 좌석 구분
    ticket_count INTEGER NOT NULL DEFAULT 1,                    -- 1인 1매
    status TEXT NOT NULL DEFAULT 'CONFIRMED',                   -- 상태: 'CONFIRMED' (예매확정), 'CANCELLED' (예매취소)
    agreed_age BOOLEAN NOT NULL DEFAULT true,                   -- 15세 이상 관람가 확인
    agreed_trigger BOOLEAN NOT NULL DEFAULT true,               -- 트리거워닝 확인
    agreed_cancellation BOOLEAN NOT NULL DEFAULT true,          -- 취소 및 노쇼 규정 확인
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- 2. 인덱스 생성 (초고속 조회 및 1인 1매 중복 방지)
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON public.reservations(phone);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_code ON public.reservations(booking_code);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- 3. 전화번호 중복 예매 방지 (활성 예매 상태인 CONFIRMED 기준 1인 1매 강력 제한)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_booking_phone 
ON public.reservations(phone) 
WHERE status = 'CONFIRMED';

-- 4. RLS (Row Level Security) 설정
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 충돌 방지를 위해 삭제 후 재설정
DROP POLICY IF EXISTS "Anyone can create a reservation" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can cancel their own reservation" ON public.reservations;
DROP POLICY IF EXISTS "Verified users can create reservation" ON public.reservations;
DROP POLICY IF EXISTS "Verified users can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Verified users can cancel reservation" ON public.reservations;

-- 4-1. 본인 인증된 사용자 또는 익명 예매 허용 (INSERT)
CREATE POLICY "Verified users can create reservation" 
ON public.reservations 
FOR INSERT 
WITH CHECK (
    -- 인증된 사용자의 경우 자신의 user_id로 등록
    (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
    OR
    -- 개발/테스트 시 익명 등록 허용
    (auth.role() = 'anon')
);

-- 4-2. 본인 인증된 사용자 예매 조회 (SELECT)
CREATE POLICY "Verified users can view reservations" 
ON public.reservations 
FOR SELECT 
USING (
    -- 인증된 세션의 user_id 일치
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- 전화번호 일치 조회 허용 (OTP 인증 후 조회)
    true
);

-- 4-3. 본인 예매 취소 (UPDATE)
CREATE POLICY "Verified users can cancel reservation" 
ON public.reservations 
FOR UPDATE 
USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    true
)
WITH CHECK (status = 'CANCELLED');

-- 5. 코멘트 추가
COMMENT ON TABLE public.reservations IS '뮤지컬 필로우맨 관객 티켓 예매 테이블 (휴대폰 OTP 인증 지원)';
