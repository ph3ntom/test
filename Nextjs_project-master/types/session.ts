// types/session.ts

export interface User {
  userId: string;
  mbrId: number;
  points?: number;
  sessionId?: string;
}

export interface LoginResponse {
  message: string;
  userId: string;
  mbrId: number;
  point: number;
  sessionId: string;
  expiresAt: number;
  code: string;
}

export interface SessionValidationResponse {
  valid: boolean;
  userId: string;
  mbrId: number;
  expiresAt: number;
}

export interface LogoutResponse {
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export interface SessionState {
  isLoggedIn: boolean;
  user: User | null;
  lastActivity: number;
  showWarning: boolean;
  isValidating: boolean;
}

export type ActivityEvent =
  | 'mousedown'
  | 'keydown'
  | 'scroll'
  | 'touchstart'
  | 'click';
