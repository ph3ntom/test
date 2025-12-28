'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러를 콘솔에만 기록 (사용자에게 노출하지 않음)
    //console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#111827'
            }}>
              오류
            </h1>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2rem',
              color: '#6b7280'
            }}>
              요청을 처리하는 중 문제가 발생했습니다.
            </p>

            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '1rem',
                marginRight: '0.5rem'
              }}
            >
              다시 시도
            </button>

            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e5e7eb',
                color: '#111827',
                border: 'none',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontSize: '1rem',
                display: 'inline-block'
              }}
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
