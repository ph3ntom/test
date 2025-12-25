"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ShoppingCart, Star, Plus } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

interface Product {
  id: number
  name: string
  image: string
  points: number
  category: string
  rating: number
  description: string
}

interface Coupon {
  id: number
  couponCode: string
  points: number
  isUsed: boolean
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "DevForum 티셔츠",
    image: "/placeholder-product.jpg",
    points: 1500,
    category: "의류",
    rating: 4.8,
    description: "고급 코튼 소재의 DevForum 로고 티셔츠"
  },
  {
    id: 2,
    name: "프로그래밍 머그컵",
    image: "/placeholder-product.jpg", 
    points: 800,
    category: "생활용품",
    rating: 4.5,
    description: "코딩하며 마시는 커피를 위한 특별한 머그컵"
  },
  {
    id: 3,
    name: "개발자 스티커팩",
    image: "/placeholder-product.jpg",
    points: 500,
    category: "문구",
    rating: 4.9,
    description: "노트북을 꾸밀 수 있는 개발 관련 스티커 세트"
  },
  {
    id: 4,
    name: "키보드 청소 키트",
    image: "/placeholder-product.jpg",
    points: 1200,
    category: "도구",
    rating: 4.3,
    description: "기계식 키보드 전용 청소 도구 세트"
  },
  {
    id: 5,
    name: "DevForum 에코백",
    image: "/placeholder-product.jpg",
    points: 1000,
    category: "의류",
    rating: 4.6,
    description: "환경을 생각하는 개발자를 위한 에코백"
  },
  {
    id: 6,
    name: "코딩 노트",
    image: "/placeholder-product.jpg",
    points: 700,
    category: "문구",
    rating: 4.7,
    description: "아이디어를 기록하는 개발자 전용 노트"
  }
]

export default function PointShopContainer() {
  const [products] = useState<Product[]>(sampleProducts)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<string>("")
  const [isCharging, setIsCharging] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [usedCoupons, setUsedCoupons] = useState<Set<string>>(new Set())
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const { user } = useAuth()

  // 사용자 포인트 조회
  const fetchUserPoints = useCallback(async () => {
    if (!user?.mbrId) return
    
    try {
      console.log('포인트 조회 시작:', user.mbrId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/points/${user.mbrId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('API 응답 상태:', response.status)
      if (response.ok) {
        const data = await response.json()
        setUserPoints(data.points)
        setForceUpdate(prev => prev + 1)
        console.log('setUserPoints 호출됨:', data.points)
      }
    } catch (error) {
      console.error('포인트 조회 실패:', error)
    }
  }, [user?.mbrId])

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      // 쿠폰 목록 가져오기
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons`)
        if (response.ok) {
          const couponData = await response.json()
          setCoupons(couponData)
        }
      } catch (error) {
        console.error('쿠폰 목록 가져오기 실패:', error)
      }
      
      await fetchUserPoints()
    }
    
    if (user?.mbrId) {
      console.log('Auth Error')
      fetchData()
    }
  }, [user?.mbrId])

  const handleCouponUse = async () => {
    if (!selectedCoupon || isCharging) return
    
    setIsCharging(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          couponCode: selectedCoupon,
          mbrId: user?.mbrId || 0
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        // 포인트 정보 재조회
        await fetchUserPoints()
        // 사용된 쿠폰을 목록에서 제거 (프론트엔드에서만)
        setUsedCoupons(prev => new Set([...prev, selectedCoupon]))
        setSelectedCoupon("")
        setIsDialogOpen(false)
        alert(result.message)
      } else {
        const error = await response.json()
        alert(error.message || '쿠폰 사용에 실패했습니다.')
      }
    } catch (error) {
      console.error('쿠폰 사용 오류:', error)
      alert('쿠폰 사용 중 오류가 발생했습니다.')
    } finally {
      setIsCharging(false)
    }
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">PointShop</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-accent/50 p-3 rounded-md">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold" key={userPoints}>{userPoints ?? 0} P</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  포인트 충전하기
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>포인트 충전</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ 쿠폰은 선착순 1회성입니다. 한 번 사용하면 다시 사용할 수 없습니다.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">사용 가능한 쿠폰 선택:</label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {coupons
                        .filter(coupon => !usedCoupons.has(coupon.couponCode))
                        .map((coupon) => (
                        <div
                          key={coupon.id}
                          className={`border rounded-md p-3 cursor-pointer transition-colors ${
                            selectedCoupon === coupon.couponCode
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedCoupon(coupon.couponCode)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-mono text-sm">{coupon.couponCode}</div>
                              <div className="text-xs text-muted-foreground">
                                {coupon.points} 포인트 쿠폰
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold">{coupon.points}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCouponUse}
                      disabled={!selectedCoupon || isCharging}
                      className="flex-1"
                    >
                      {isCharging ? "충전 중..." : "포인트 충전"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-muted-foreground">
          포인트로 다양한 개발 관련 상품을 구매하세요. 질문과 답변 활동으로 포인트를 적립할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
                <div className="text-sm">상품 이미지 영역</div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm ml-1">{product.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold text-lg">{product.points.toLocaleString()} P</span>
                  </div>
                  
                  <Button 
                    size="sm"
                    disabled={true}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    구매하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}