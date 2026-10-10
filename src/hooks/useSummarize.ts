'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Memo } from '@/types/memo'
import { SummarizeErrorResponse, SummarizeResponse } from '@/types/summary'

export function useSummarize() {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setSummary(null)
    setError(null)
    setLoading(false)
  }, [])

  const summarize = useCallback(async (memo: Memo) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError(null)
    setSummary(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: memo.title, content: memo.content }),
        signal: controller.signal,
      })
      const data: SummarizeResponse | SummarizeErrorResponse =
        await response.json()

      if (!response.ok || !('summary' in data)) {
        throw new Error('error' in data ? data.error : '요약에 실패했습니다.')
      }
      setSummary(data.summary)
    } catch (e) {
      if (controller.signal.aborted) return
      console.error('Failed to summarize memo:', e)
      setError(e instanceof Error ? e.message : '요약에 실패했습니다.')
    } finally {
      if (controllerRef.current === controller) {
        setLoading(false)
      }
    }
  }, [])

  // 언마운트 시 진행 중인 요청 취소
  useEffect(() => () => controllerRef.current?.abort(), [])

  return { summary, loading, error, summarize, reset }
}
