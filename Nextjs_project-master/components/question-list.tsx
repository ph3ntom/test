"use client"

import Link from "next/link"
import { memo, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import UserInfo from "./user-info"
import type { Question, Answer } from "@/types"

const QuestionList = memo(function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnswers = async (questionIds: number[]) => {
    try {
      const answerPromises = questionIds.map(async (questionId) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${questionId}/answers`)
        if (!response.ok) {
          throw new Error(`Failed to fetch answers for question ${questionId}`)
        }
        return response.json()
      })
      
      const answersData = await Promise.all(answerPromises)
      const flattenedAnswers = answersData.flat()
      setAnswers(flattenedAnswers)
    } catch (err) {
      console.error('Error fetching answers:', err)
    }
  }

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`)
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }
        const data = await response.json()
        setQuestions(data)
        
        // Questions를 가져온 후 answers도 가져옴
        if (data.length > 0) {
          const questionIds = data.map((q: Question) => q.id)
          await fetchAnswers(questionIds)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading questions...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground min-w-[80px]">
                <div>{question.votes} votes</div>
                <div>{question.answers} answers</div>
                <div>{question.views} views</div>
              </div>
              <div className="flex-1 space-y-2">
                <Link href={`/questions/${question.id}`} className="text-lg font-medium hover:text-primary">
                  {question.title}
                </Link>
                <div
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <Badge key={tag} className="bg-accent">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="ml-auto">
                    <UserInfo user={question.user} askedTime={question.askedTime} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

export default QuestionList

