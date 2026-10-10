'use client'

import dynamic from 'next/dynamic'
import '@uiw/react-markdown-preview/markdown.css'

// 마크다운 렌더러는 브라우저 전용이므로 SSR 비활성화
const Markdown = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default.Markdown),
  { ssr: false }
)

interface MarkdownPreviewProps {
  source: string
  className?: string
}

export default function MarkdownPreview({
  source,
  className = '',
}: MarkdownPreviewProps) {
  return (
    <div data-color-mode="light">
      <Markdown source={source} className={`!bg-transparent ${className}`} />
    </div>
  )
}
