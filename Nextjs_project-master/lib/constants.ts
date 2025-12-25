// lib/constants.ts

export const SESSION_CONFIG = {
  // 세션 만료 시간 (30분)
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '1800000'),

  // 경고 표시 시간 (만료 5분 전)
  WARNING_TIME: parseInt(
    process.env.NEXT_PUBLIC_SESSION_WARNING_TIME || '300000',
  ),

  // 클라이언트 타임아웃 체크 주기 (1분)
  CHECK_INTERVAL: parseInt(
    process.env.NEXT_PUBLIC_SESSION_CHECK_INTERVAL || '60000',
  ),

  // 서버 세션 검증 주기 (5분)
  VALIDATION_INTERVAL: parseInt(
    process.env.NEXT_PUBLIC_SESSION_VALIDATION_INTERVAL || '300000',
  ),
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  PREFIX: '', // ⭐ PREFIX는 이미 BASE_URL에 포함됨
  TIMEOUT: 10000, // 10초
} as const;

export const ROUTES = {
  // 공개 라우트 (인증 불필요)
  PUBLIC: ['/auth/login', '/auth/signup', '/', '/questions'],

  // 보호된 라우트 (인증 필요)
  // ⭐ 질문 작성(/ask-question), 질문 수정(/questions/*/edit), 포인트샵
  // ⭐ 질문 목록(/questions), 질문 상세(/questions/[id])는 공개
  PROTECTED: ['/ask-question', '/pointshop'],

  // 로그인 페이지
  LOGIN: '/auth/login',
} as const;

export const STORAGE_KEYS = {
  USER: 'user',
  IS_LOGGED_IN: 'isLoggedIn',
  RETURN_URL: 'returnUrl',
  LAST_ACTIVITY: 'lastActivity',
} as const;

// 활동 추적 이벤트 목록
export const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const;

// Debounce 시간 (ms)
export const DEBOUNCE_DELAY = 300;
