import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'
import {
  SUMMARIZE_MAX_CONTENT_LENGTH,
  SummarizeErrorResponse,
  SummarizeRequest,
  SummarizeResponse,
} from '@/types/summary'

const MODEL = 'gemini-3.1-flash-lite'

const SYSTEM_INSTRUCTION =
  '당신은 메모 요약 도우미다. 주어진 메모를 한국어로 3문장 이내로 핵심만 요약하라. ' +
  '원문에 없는 내용은 추가하지 말고, 제목이나 머리말 없이 요약문만 출력하라.'

const errorResponse = (error: string, status: number) =>
  NextResponse.json<SummarizeErrorResponse>({ error }, { status })

export async function POST(request: Request) {
  let body: Partial<SummarizeRequest>
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다.', 400)
  }

  const title = typeof body.title === 'string' ? body.title : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''

  if (!content) {
    return errorResponse('요약할 메모 내용이 없습니다.', 400)
  }
  if (content.length > SUMMARIZE_MAX_CONTENT_LENGTH) {
    return errorResponse(
      `메모가 너무 깁니다. ${SUMMARIZE_MAX_CONTENT_LENGTH.toLocaleString('ko-KR')}자 이하만 요약할 수 있습니다.`,
      400
    )
  }

  if (!process.env.GEMINI_API_KEY) {
    return errorResponse('서버에 GEMINI_API_KEY가 설정되지 않았습니다.', 500)
  }

  try {
    const ai = new GoogleGenAI({})
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `제목: ${title}\n\n내용:\n${content}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    })

    const summary = response.text?.trim()
    if (!summary) {
      return errorResponse('요약 결과를 받지 못했습니다.', 502)
    }

    return NextResponse.json<SummarizeResponse>({ summary })
  } catch (error) {
    const status = (error as { status?: number }).status
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('Gemini summarize failed:', status, message)
    return errorResponse(
      '요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      502
    )
  }
}
