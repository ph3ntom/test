export interface User {
  name: string
  image: string
  initials: string
  reputation?: number
  badges?: {
    gold: number
    silver: number
    bronze: number
  }
}

export interface Question {
  id: number
  title: string
  description: string
  votes: number
  answers: number
  views: number
  tags: string[]
  user: User
  askedTime: string
  body?: string
  accepted?: boolean
}

export interface Answer {
  id: number
  content: string
  votes: number
  accepted: boolean
  question_id: number
  user_id: number
  createdAt: string
  updatedAt: string
  user: User
  answeredTime: string
}

export interface Tag {
  name: string
  description?: string
  questionsCount: number
  color?: string
}

export interface QuestionFormData {
  title: string
  description: string  // body에서 description으로 변경
  tags: string[]       // 백엔드는 배열을 기대
}

export interface QuestionPreview {
  title: string
  body: string         // 프론트엔드에서는 여전히 body로 사용 (UI용)
  tags: string[]
}

export interface CreateQuestionDto {
  title: string
  description: string
  tags?: string[]
  mbrId?: number
}