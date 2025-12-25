// lib/api-client.ts

import { API_CONFIG, ROUTES, STORAGE_KEYS } from './constants';
import type {
  LoginResponse,
  SessionValidationResponse,
  LogoutResponse,
  ApiErrorResponse,
} from '@/types/session';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL + API_CONFIG.PREFIX;
  }

  // ⭐ 핵심: Fetch 래퍼
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // ⭐ 쿠키 포함 (필수!)
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT,
      );

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // ⭐ 세션 만료 처리
      if (response.status === 401) {
        this.handleSessionExpired();
        throw new Error('Session expired');
      }

      // 기타 에러 처리
      if (!response.ok) {
        const error: ApiErrorResponse = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // ⭐ 세션 만료 처리
  private handleSessionExpired(): void {
    // 현재 경로 저장 (로그인 후 복귀용)
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!ROUTES.PUBLIC.includes(currentPath)) {
        localStorage.setItem(STORAGE_KEYS.RETURN_URL, currentPath);
      }

      // 로컬 스토리지 정리
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);

      // 로그인 페이지로 리다이렉트
      window.location.href = `${ROUTES.LOGIN}?session=expired`;
    }
  }

  // ===== API 메서드 =====

  // 로그인
  async login(userId: string, password: string): Promise<LoginResponse> {
    return this.fetch<LoginResponse>('/login/loginProcess', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    });
  }

  // 세션 검증
  async validateSession(): Promise<SessionValidationResponse> {
    return this.fetch<SessionValidationResponse>('/auth/session/validate');
  }

  // 로그아웃
  async logout(): Promise<LogoutResponse> {
    return this.fetch<LogoutResponse>('/auth/session/logout', {
      method: 'POST',
    });
  }

  // 세션 연장
  async extendSession(): Promise<{ message: string; expiresAt: number }> {
    return this.fetch('/auth/session/extend', {
      method: 'POST',
    });
  }

  // ⭐ 활동 업데이트 (사용자 활동 시 호출)
  async updateActivity(): Promise<{ message: string }> {
    return this.fetch('/auth/session/activity', {
      method: 'POST',
    });
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient();
