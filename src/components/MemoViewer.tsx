'use client'

import { useEffect } from 'react'
import MarkdownPreview from './MarkdownPreview'
import { useSummarize } from '@/hooks/useSummarize'
import { Memo, MEMO_CATEGORIES, CATEGORY_COLORS } from '@/types/memo'

interface MemoViewerProps {
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function MemoViewer({
  memo,
  onClose,
  onEdit,
  onDelete,
}: MemoViewerProps) {
  const isOpen = memo !== null
  const memoId = memo?.id
  const { summary, loading, error, summarize, reset } = useSummarize()

  // 다른 메모를 열거나 닫을 때 이전 요약 초기화
  useEffect(() => {
    reset()
  }, [memoId, reset])

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!memo) return null

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      data-testid="memo-viewer-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="메모 상세 보기"
        data-testid="memo-viewer"
        onClick={e => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-6">
          <div className="min-w-0 flex-1">
            <h2 className="mb-2 break-words text-xl font-semibold text-gray-900">
              {memo.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${CATEGORY_COLORS[memo.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other}`}
              >
                {MEMO_CATEGORIES[
                  memo.category as keyof typeof MEMO_CATEGORIES
                ] || memo.category}
              </span>
              <span className="text-xs text-gray-500">
                수정 {formatDate(memo.updatedAt)}
              </span>
              <span className="text-xs text-gray-500">
                작성 {formatDate(memo.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            data-testid="memo-viewer-close-btn"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div
              className="mb-4 flex items-center rounded-lg bg-blue-50 p-4"
              data-testid="memo-viewer-summary-loading"
            >
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-700">
                메모를 요약하는 중...
              </span>
            </div>
          )}
          {error && (
            <div
              role="alert"
              data-testid="memo-viewer-summary-error"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
            >
              {error}
            </div>
          )}
          {summary && (
            <div
              data-testid="memo-viewer-summary"
              className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4"
            >
              <p className="mb-1 text-xs font-medium text-blue-700">AI 요약</p>
              <p className="whitespace-pre-wrap break-words text-sm text-gray-900">
                {summary}
              </p>
            </div>
          )}
          <div data-testid="memo-viewer-content">
            <MarkdownPreview source={memo.content} className="!text-sm" />
          </div>
          {memo.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {memo.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
          <button
            onClick={() => summarize(memo)}
            disabled={loading}
            aria-label="메모 요약"
            data-testid="memo-viewer-summarize-btn"
            className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '요약 중...' : '요약'}
          </button>
          <button
            onClick={() => onEdit(memo)}
            data-testid="memo-viewer-edit-btn"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            편집
          </button>
          <button
            onClick={handleDelete}
            data-testid="memo-viewer-delete-btn"
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
