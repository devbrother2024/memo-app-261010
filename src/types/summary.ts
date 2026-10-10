export interface SummarizeRequest {
  title: string
  content: string
}

export interface SummarizeResponse {
  summary: string
}

export interface SummarizeErrorResponse {
  error: string
}

export const SUMMARIZE_MAX_CONTENT_LENGTH = 20000
