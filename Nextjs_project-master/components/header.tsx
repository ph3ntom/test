"use client"

import Link from "next/link"
import { Search, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "./mode-toggle"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function Header() {
  const { theme } = useTheme()
  const { user, isLoggedIn, logout, isHydrated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center gap-2">
            <div suppressHydrationWarning>
              {!mounted ? (
                <Image src="/logo-light.svg" alt="DevForum Logo" width={30} height={30} className="h-8 w-8" />
              ) : theme === "dark" ? (
                <Image src="/logo-dark.svg" alt="DevForum Logo" width={30} height={30} className="h-8 w-8" />
              ) : (
                <Image src="/logo-light.svg" alt="DevForum Logo" width={30} height={30} className="h-8 w-8" />
              )}
            </div>
            <span className="hidden font-bold sm:inline-block" suppressHydrationWarning>DevForum</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium">
            About
          </Link>
          <Link href="/products" className="text-sm font-medium">
            Products
          </Link>
          <Link href="/overflow" className="text-sm font-medium">
            DevFlow!
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
          <ModeToggle />
          {mounted && isHydrated ? (
            isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user?.userId}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </>
            )
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

