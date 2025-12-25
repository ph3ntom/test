// components/session-warning-modal.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SESSION_CONFIG } from '@/lib/constants';

interface SessionWarningModalProps {
  open: boolean;
  lastActivity: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionWarningModal({
  open,
  lastActivity,
  onExtend,
  onLogout,
}: SessionWarningModalProps) {
  const [remainingTime, setRemainingTime] = useState(0);

  // ⭐ 남은 시간 계산
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = SESSION_CONFIG.TIMEOUT - elapsed;

      if (remaining <= 0) {
        setRemainingTime(0);
        onLogout();
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, lastActivity, onLogout]);

  // 분:초 포맷
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>세션 만료 경고</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>비활동으로 인해 곧 로그아웃됩니다.</p>
            <p className="text-lg font-semibold text-destructive">
              남은 시간: {formatTime(remainingTime)}
            </p>
            <p className="text-sm text-muted-foreground">
              계속 사용하시려면 "연장하기"를 클릭하세요.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onLogout}>로그아웃</AlertDialogCancel>
          <AlertDialogAction onClick={onExtend}>연장하기</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
