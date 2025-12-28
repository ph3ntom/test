// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './lib/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 세션 쿠키 확인
  const sessionCookie = request.cookies.get('connect.sid');
  const hasSession = !!sessionCookie;

  // 인증 관련 페이지 여부
  const isAuthPage = pathname.startsWith('/auth');

  // 질문 수정 페이지 체크 (/questions/[id]/edit)
  const isQuestionEditPage = /^\/questions\/[^/]+\/edit/.test(pathname);

  // 보호된 라우트 여부 체크
  let isProtectedRoute = ROUTES.PROTECTED.some((route) =>
    pathname.startsWith(route),
  );

  // 질문 수정 페이지는 무조건 보호됨
  if (isQuestionEditPage) {
    isProtectedRoute = true;
  }

  // 보호된 라우트인데 세션 없음 → 로그인 페이지로 리다이렉트
  if (isProtectedRoute && !hasSession) {
    console.log(`🚫 Unauthorized access attempt to: ${pathname} - Redirecting to login`);
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 세션이 있는 경우 접근 허용
  if (isProtectedRoute && hasSession) {
    console.log(`✅ Authorized access to protected route: ${pathname}`);
  }

  // 회원가입 페이지는 세션 있어도 접근 가능 (로그인 페이지도 접근 허용)
  // 사용자가 다른 계정으로 로그인하거나 재로그인할 수 있도록 허용

  return NextResponse.next();
}

// Middleware 적용 경로 설정
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, logo, placeholder (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
