// hooks/use-session-timeout.ts

import { useEffect, useState, useCallback } from 'react';
import { SESSION_CONFIG } from '@/lib/constants';
import { apiClient } from '@/lib/api-client';

interface UseSessionTimeoutOptions {
  isLoggedIn: boolean;
  lastActivity: number;
  onLogout: () => void;
}

export function useSessionTimeout({
  isLoggedIn,
  lastActivity,
  onLogout,
}: UseSessionTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // ⭐ 타임아웃 체크 (1분마다)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;

      // 30분 경과 → 로그아웃
      if (timeSinceActivity >= SESSION_CONFIG.TIMEOUT) {
        console.log('⏱️ Session timeout - auto logout');
        onLogout();
      }
      // 25분 경과 (5분 남음) → 경고
      else if (
        timeSinceActivity >=
        SESSION_CONFIG.TIMEOUT - SESSION_CONFIG.WARNING_TIME
      ) {
        setShowWarning(true);
      }
    }, SESSION_CONFIG.CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isLoggedIn, lastActivity, onLogout]);

  // ⭐ 주기적 세션 검증 (10분마다만, 페이지 접근 시에만)
  useEffect(() => {
    if (!isLoggedIn) return;

    const validateSession = async () => {
      if (isValidating) return;

      try {
        setIsValidating(true);
        await apiClient.validateSession();
        console.log('✅ Session validated (10-minute interval)');
      } catch (error) {
        console.error('❌ Session validation failed:', error);
        onLogout();
      } finally {
        setIsValidating(false);
      }
    };

    // ⭐ 10분마다 검증 (즉시 실행하지 않음)
    const interval = setInterval(
      validateSession,
      SESSION_CONFIG.VALIDATION_INTERVAL,
    );

    return () => clearInterval(interval);
  }, [isLoggedIn, isValidating, onLogout]);

  return {
    showWarning,
    setShowWarning,
    isValidating,
  };
}
