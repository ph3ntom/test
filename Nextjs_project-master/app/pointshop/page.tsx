"use client"

import { useAuth } from "@/contexts/auth-context"
import PointShopContainer from "@/components/pointshop-container"

export default function PointShopPage() {
  const { isLoggedIn } = useAuth()
  
  if (!isLoggedIn) {
    return (
      <div className="container py-6">
        <div className="mb-6 p-4 bg-accent/20 border border-accent/40 rounded-md">
          <p className="text-center text-muted-foreground">
            포인트샵을 이용하려면 로그인이 필요합니다.
          </p>
        </div>
      </div>
    )
  }
  
  return <PointShopContainer />
}