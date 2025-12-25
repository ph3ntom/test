"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QuestionList from "@/components/question-list"
import RightSidebar from "@/components/right-sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { isLoggedIn, isHydrated } = useAuth()
  return (
    <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Newest Questions</h1>
          {isLoggedIn && isHydrated && (
            <Button asChild>
              <Link href="/ask-question">Ask Question</Link>
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">24,249,510 questions</p>
          <Tabs defaultValue="newest">
            <TabsList>
              <TabsTrigger value="newest">Newest</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="bountied">
                Bountied
                <Badge className="ml-1 bg-blue-500" variant="secondary">
                  24
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
              <TabsTrigger value="more">More</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <QuestionList />
      </div>
      <div className="col-span-1">
        <RightSidebar />
      </div>
    </div>
  )
}

