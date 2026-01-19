import type { SecurityQuestion } from 'src/app/api/hooks/use-security'

export type SecurityQuestionCatalogItem = SecurityQuestion

export type SelectedSecurityQuestion = SecurityQuestion

export type SecurityQuestionAnswerInput = {
  questionId: string
  answer: string
}

export type SecurityQuestionAnswerMap = Record<string, string>
