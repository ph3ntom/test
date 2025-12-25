"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

interface AnswerFormProps {
  questionId: string
}

export default function AnswerForm({ questionId }: AnswerFormProps) {
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // 입력 검증
    if (answer.length < 10) {
      setError("답변은 최소 10자 이상이어야 합니다.")
      setIsSubmitting(false)
      return
    }

    // 백엔드 API 호출을 위한 데이터 구조
    const answerData = {
      content: answer,
      userId: user?.userId,
      mbrId: user?.mbrId
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '답변 등록에 실패했습니다.')
      }

      const result = await response.json()
      console.log('답변이 성공적으로 등록되었습니다:', result)
      
      // 폼 초기화
      setAnswer("")
      
      // 페이지 새로고침하여 새 답변 표시
      router.refresh()
      
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : '답변 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generatePreview = () => {
    setPreview(answer)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="write">
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview" onClick={generatePreview}>
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-2">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here... You can use Markdown formatting."
            className="min-h-[200px]"
            required
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-2">
          <div className="min-h-[200px] border rounded-md p-4 prose dark:prose-invert max-w-none">
            {preview ? (
              preview.split("\n\n").map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
            ) : (
              <p className="text-muted-foreground">Nothing to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Your Answer"}
        </Button>
        <p className="text-sm text-muted-foreground">
          By clicking "Post Your Answer", you agree to our terms of service and privacy policy.
        </p>
      </div>
    </form>
    </div>
  )
}

