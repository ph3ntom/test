"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Bookmark } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import AnswerForm from "@/components/answer-form"
import CodeBlock from "@/components/code-block"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import type { Question, Answer } from "@/types"
import { useAuth } from "@/contexts/auth-context"

interface QuestionPageProps {
  params: Promise<{
    id: string
  }>
}

export default function QuestionPage({ params }: QuestionPageProps) {
  const { id } = use(params)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoggedIn, isHydrated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      try {
        // Question 데이터 가져오기
        const questionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`)
        if (!questionResponse.ok) {
          throw new Error('Failed to fetch question')
        }
        const questionData = await questionResponse.json()
        setQuestion(questionData)

        // Question이 성공적으로 가져와지면 Answers도 가져오기
        const answersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}/answers`)
        if (!answersResponse.ok) {
          throw new Error('Failed to fetch answers')
        }
        const answersData = await answersResponse.json()
        setAnswers(answersData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestionAndAnswers()
  }, [id])

  const handleDeleteAnswer = async (answerId: number) => {
    if (!confirm('정말 이 답변을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/${id}/answers/${answerId}/del`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            mbrId: user?.mbrId || 0,
            targetAnswerId: answerId  // 취약점: 파라미터 조작 가능
          })
        }
      );
      
      if (response.ok) {
        setAnswers(answers.filter(answer => answer.id !== answerId));
        alert('답변이 삭제되었습니다.');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 질문을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}/del`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          mbrId: user?.mbrId || 0 
        })
      });
      
      if (response.ok) {
        alert('질문이 삭제되었습니다.');
        router.push('/questions');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="text-center py-8">Loading question...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Question not found</h1>
          <p className="text-muted-foreground">The question you are looking for does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold">{question.title}</h1>
          {isLoggedIn && user?.userId === question.user?.userId && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/questions/${id}/edit`}>수정하기</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                삭제하기
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <div>Asked {question.askedTime}</div>
          <div>Viewed {question.views} times</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
        {/* Voting controls */}
        <div className="flex flex-row md:flex-col items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowUp className="h-6 w-6" />
            <span className="sr-only">Upvote</span>
          </Button>
          <div className="text-xl font-bold">{question.votes}</div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowDown className="h-6 w-6" />
            <span className="sr-only">Downvote</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bookmark className="h-5 w-5" />
            <span className="sr-only">Bookmark</span>
          </Button>
        </div>

        {/* Question content */}
        <div className="space-y-4">
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: question.description }} />
            {question.body && <div dangerouslySetInnerHTML={{ __html: question.body }} />}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-accent">
                {tag}
              </Badge>
            ))}
          </div>

          {/* 첨부파일 표시 */}
          {question.attachment && (
            <div className="mt-4 p-3 border border-border rounded-lg bg-accent/10">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {(() => {
                    const ext = question.attachment.split('.').pop()?.toLowerCase()
                    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️'
                    if (ext === 'pdf') return '📄'
                    if (['doc', 'docx'].includes(ext || '')) return '📝'
                    if (ext === 'txt') return '📃'
                    return '📎'
                  })()}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Attached File</div>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/questions/${question.id}/download`}
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {question.attachment.split('/').pop()?.replace(/^question-\d+-\d+-/, '') || 'attachment'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                Share
              </Button>
              <Button variant="ghost" size="sm">
                Follow
              </Button>
              <Button variant="ghost" size="sm">
                Flag
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-md">
              <div className="text-sm text-muted-foreground">
                Asked {question.askedTime}
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={question.user.image} alt={question.user.name} />
                  <AvatarFallback>{question.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/users/${question.user.name}`} className="text-sm font-medium hover:underline">
                    {question.user.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{question.user.reputation}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{answers.length} Answers</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm">Sorted by:</span>
            <select className="bg-background border rounded-md px-2 py-1 text-sm">
              <option>Highest score (default)</option>
              <option>Trending</option>
              <option>Date modified</option>
              <option>Date created</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`border ${answer.accepted ? "border-green-500 dark:border-green-700" : "border-border"} rounded-md p-4`}
            >
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                {/* Voting controls */}
                <div className="flex flex-row md:flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowUp className="h-6 w-6" />
                    <span className="sr-only">Upvote</span>
                  </Button>
                  <div className="text-xl font-bold">{answer.votes}</div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowDown className="h-6 w-6" />
                    <span className="sr-only">Downvote</span>
                  </Button>
                  {answer.accepted && (
                    <div className="text-green-500 dark:text-green-400 text-xs font-medium mt-2">Accepted</div>
                  )}
                </div>

                {/* Answer content */}
                <div className="space-y-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{answer.content}</p>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Share
                      </Button>
                      <Button variant="ghost" size="sm">
                        Follow
                      </Button>
                      <Button variant="ghost" size="sm">
                        Flag
                      </Button>
                      {isLoggedIn && user?.mbrId === answer.user?.id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteAnswer(answer.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Answered {answer.answeredTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={answer.user.image} alt={answer.user.name} />
                          <AvatarFallback>{answer.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/users/${answer.user.name}`} className="text-sm font-medium hover:underline">
                            {answer.user.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{answer.user.reputation}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer form */}
      {isLoggedIn && isHydrated && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Your Answer</h2>
          <AnswerForm questionId={question.id.toString()} />
        </div>
      )}

      {/* Related questions */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4">Related</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              180
            </Badge>
            <Link href="#" className="text-sm hover:underline">
              How to import a CSS file in a React Component
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent/50 text-foreground border-accent/50">
              404
            </Badge>
            <Link href="#" className="text-sm hover:underline">
              When to use ES6 class based React components vs. ES6 React function components?
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent/50 text-foreground border-accent/50">
              0
            </Badge>
            <Link href="#" className="text-sm hover:underline">
              React Testing library custom setup import test-utils: module not installed. Unable to resolve path
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent/50 text-foreground border-accent/50">
              6
            </Badge>
            <Link href="#" className="text-sm hover:underline">
              Can Shadcn ui be installed for Vite + React with javascript and not typescript?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

