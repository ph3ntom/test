// hooks/use-activity-tracker.ts

import { useEffect, useCallback, useRef } from 'react';
import { ACTIVITY_EVENTS, DEBOUNCE_DELAY } from '@/lib/constants';

interface UseActivityTrackerOptions {
  onActivity: () => void;
  enabled: boolean;
  debounceDelay?: number;
}

export function useActivityTracker({
  onActivity,
  enabled,
  debounceDelay = DEBOUNCE_DELAY,
}: UseActivityTrackerOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  // ⭐ Debounced 활동 핸들러
  const handleActivity = useCallback(() => {
    if (!enabled) return;

    // 기존 타임아웃 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새 타임아웃 설정
    timeoutRef.current = setTimeout(() => {
      onActivity();
    }, debounceDelay);
  }, [enabled, onActivity, debounceDelay]);

  useEffect(() => {
    if (!enabled) return;

    // ⭐ 이벤트 리스너 등록
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // ⭐ 클린업
    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, handleActivity]);
}
