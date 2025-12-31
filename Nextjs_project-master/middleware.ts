import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './lib/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 세션 쿠키 확인
  const sessionCookie = request.cookies.get('connect.sid');

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

  // 보호된 라우트인 경우 세션 검증
  if (isProtectedRoute) {
    console.log(`🔍 Protected route accessed: ${pathname}`);
    console.log(`🔍 Session cookie exists: ${!!sessionCookie}`);
    console.log(`🔍 Cookie value: ${sessionCookie?.value?.substring(0, 20)}...`);
    // 쿠키가 없으면 바로 리다이렉트
    if (!sessionCookie) {
      console.log(`🚫 No session cookie for: ${pathname} - Redirecting to login`);
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 쿠키가 있으면 백엔드에서 세션 유효성 검증
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/session/validate`, {
        method: 'GET',
        headers: {
          'Cookie': `connect.sid=${sessionCookie.value}`,
        },
        credentials: 'include',
      });

      // 세션이 유효하지 않으면 리다이렉트
      if (!response.ok) {
        console.log(`🚫 Invalid/expired session for: ${pathname} - Redirecting to login`);
        const loginUrl = new URL(ROUTES.LOGIN, request.url);
        loginUrl.searchParams.set('returnUrl', pathname);

        // 응답에서 쿠키 삭제
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.delete('connect.sid');
        return redirectResponse;
      }

      const sessionData = await response.json();
      console.log(`✅ Valid session for ${pathname} - User: ${sessionData.userId}, Remaining: ${sessionData.remainingTime}ms`);
    } catch (error) {
      console.error('❌ Session validation error:', error);
      // 네트워크 에러 등의 경우 로그인으로 리다이렉트
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

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
