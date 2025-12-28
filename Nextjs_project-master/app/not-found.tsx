'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            오류
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            요청을 처리하는 중 문제가 발생했습니다.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.back()}
            className="w-full"
            variant="default"
          >
            다시 시도
          </Button>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          문제가 계속되면 관리자에게 문의해주세요.
        </p>
      </div>
    </div>
  )
}
