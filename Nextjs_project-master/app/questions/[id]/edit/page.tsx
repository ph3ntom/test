"use client"

import type React from "react"

import { useState, useCallback, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import type { QuestionFormData, QuestionPreview, Question } from "@/types"

interface EditQuestionPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id } = use(params)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [preview, setPreview] = useState<QuestionPreview>({ title: "", body: "", tags: [] })
  const [error, setError] = useState<string | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const router = useRouter()
  const { user, isLoggedIn } = useAuth()

  // 기존 질문 데이터 로딩
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`)
        if (!response.ok) {
          throw new Error('질문을 불러올 수 없습니다.')
        }
        const questionData = await response.json()
        setQuestion(questionData)
        
        // 폼 필드에 기존 데이터 설정
        setTitle(questionData.title || "")
        setBody(questionData.description || questionData.body || "")
        setTags(questionData.tags ? questionData.tags.join(" ") : "")
        
      } catch (error) {
        console.error('Error fetching question:', error)
        setError(error instanceof Error ? error.message : '질문을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestion()
  }, [id])

  // 권한 체크
  useEffect(() => {
    if (!isLoading && question && user && user.userId !== question.user?.userId) {
      setError('이 질문을 수정할 권한이 없습니다.')
    }
  }, [isLoading, question, user])

  // 파일 처리 함수들
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    // 파일 타입 검증
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('허용되지 않는 파일 형식입니다. (JPG, PNG, GIF, PDF, DOC, DOCX, TXT만 가능)')
      return
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB를 초과할 수 없습니다.')
      return
    }

    setSelectedFile(file)
    setError(null)

    // 이미지 파일인 경우 미리보기 생성
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType === 'application/pdf') return '📄'
    if (fileType.includes('word')) return '📝'
    if (fileType === 'text/plain') return '📃'
    return '📎'
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // 입력 검증
    if (title.length < 10) {
      setError("제목은 최소 10자 이상이어야 합니다.")
      setIsSubmitting(false)
      return
    }

    if (body.length < 20) {
      setError("질문 내용은 최소 20자 이상이어야 합니다.")
      setIsSubmitting(false)
      return
    }

    // 태그 처리 및 검증
    const tagsArray = tags.split(' ').filter(tag => tag.trim() !== '')

    try {
      // FormData 사용 (파일 업로드 지원)
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', body)
      formData.append('mbrId', String(user?.mbrId || 0))
      formData.append('targetQuestionId', id)

      // tags를 공백으로 구분된 문자열로 전송 (백엔드에서 파싱)
      if (tagsArray.length > 0) {
        formData.append('tags', tagsArray.join(' '))
      }

      if (selectedFile) {
        formData.append('attachment', selectedFile)
      }

      console.log('전송할 데이터:', {
        title,
        description: body,
        mbrId: user?.mbrId || 0,
        targetQuestionId: id,
        tags: tagsArray,
        hasFile: !!selectedFile
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}/edit`, {
        method: 'POST',
        body: formData, // FormData는 Content-Type을 자동 설정
      })

      console.log('응답 상태:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('에러 응답:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`서버 에러 (${response.status}): ${errorText}`)
        }
        
        throw new Error(errorData.message || `서버 에러 (${response.status})`)
      }

      const result = await response.json()
      console.log('질문이 성공적으로 수정되었습니다:', result)
      
      // 성공 후 질문 상세 페이지로 리디렉션
      router.push(`/questions/${id}`)
      
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : '질문 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }, [title, body, tags, user, router, id, selectedFile])

  const generatePreview = useCallback(() => {
    setPreview({
      title,
      body,
      tags: tags.split(" ").filter((tag) => tag.trim() !== ""),
    })
  }, [title, body, tags])

  // 로딩 중
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="text-center py-8">질문을 불러오는 중...</div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!isLoggedIn || !user) {
    return (
      <div className="container py-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-muted-foreground mb-4">질문을 수정하려면 로그인해야 합니다.</p>
          <Button asChild>
            <Link href="/auth/login">로그인</Link>
          </Button>
        </div>
      </div>
    )
  }

  // 권한이 없는 경우
  if (question && user.userId !== question.user?.userId) {
    return (
      <div className="container py-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">접근 권한 없음</h1>
          <p className="text-muted-foreground mb-4">이 질문을 수정할 권한이 없습니다.</p>
          <Button asChild>
            <Link href={`/questions/${id}`}>질문으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Edit Question</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/questions/${id}`}>취소</Link>
        </Button>
      </div>

      <div className="bg-accent/30 p-4 rounded-md mb-6">
        <h2 className="font-medium mb-2">수정 시 주의사항</h2>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>제목과 내용을 명확하고 구체적으로 작성해주세요</li>
          <li>기존 답변이 있는 경우, 답변과 관련 없는 내용으로 변경하지 마세요</li>
          <li>태그는 질문의 주제와 관련된 것으로 설정해주세요</li>
          <li>마크다운 문법을 사용할 수 있습니다</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">제목 <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How to center a div with Tailwind CSS"
            required
          />
          <p className="text-xs text-muted-foreground">
            구체적이고 명확한 제목을 작성해주세요. (최소 10자)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">내용 <span className="text-red-500">*</span></Label>
          <Tabs defaultValue="write">
            <TabsList>
              <TabsTrigger value="write">작성</TabsTrigger>
              <TabsTrigger value="preview" onClick={generatePreview}>
                미리보기
              </TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-2">
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="문제를 자세히 설명해주세요. 관련 코드가 있다면 포함해주세요."
                className="min-h-[200px]"
                required
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div className="min-h-[200px] border rounded-md p-4 prose dark:prose-invert max-w-none">
                {preview.body ? (
                  preview.body.split("\n\n").map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
                ) : (
                  <p className="text-muted-foreground">미리볼 내용이 없습니다</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <p className="text-xs text-muted-foreground">
            질문에 답변할 수 있는 모든 정보를 포함해주세요. 마크다운 문법을 사용할 수 있습니다. (최소 20자)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">태그 <span className="text-red-500">*</span></Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. javascript react tailwindcss"
            required
          />
          <p className="text-xs text-muted-foreground">
            질문 주제와 관련된 태그를 최대 5개까지 추가할 수 있습니다.
          </p>
        </div>

        {/* 파일 업로드 섹션 */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">
            첨부파일 <span className="text-muted-foreground text-xs">(선택사항)</span>
          </Label>

          {!selectedFile ? (
            <div
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200
                ${isDragging
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/30'
                }
              `}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="space-y-2">
                <div className="text-4xl">📎</div>
                <div className="text-sm font-medium">
                  {isDragging ? (
                    <span className="text-primary">파일을 여기에 놓으세요</span>
                  ) : (
                    <>
                      <span className="text-primary hover:underline">클릭하여 업로드</span>
                      {' '}또는 드래그 앤 드롭
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, PDF, DOC, DOCX, TXT (최대 5MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4 space-y-3">
              {/* 파일 정보 표시 */}
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">
                  {getFileIcon(selectedFile.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="flex-shrink-0 h-8 w-8 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </div>

              {/* 이미지 미리보기 */}
              {filePreview && (
                <div className="mt-3 border rounded-md overflow-hidden">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full max-h-60 object-contain bg-muted"
                  />
                </div>
              )}

              {/* 파일 변경 버튼 */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="w-full"
              >
                파일 변경
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "수정 중..." : "질문 수정"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/questions/${id}`}>취소</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}