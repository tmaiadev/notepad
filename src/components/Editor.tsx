import { useMemo } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { marked } from 'marked'
import { useEditor } from '../context/useEditor'
import { continueList } from '../lib/markdown'

const UNSAFE_TAGS = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi

export function Editor() {
  const { text, viewMode, textareaRef, setText, applyEdit } = useEditor()

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return
    const textarea = e.currentTarget
    const edit = continueList(textarea.value, textarea.selectionStart, textarea.selectionEnd)
    if (!edit) return
    e.preventDefault()
    applyEdit(edit)
  }

  const html = useMemo(() => {
    if (viewMode !== 'visualizer') return ''
    return marked.parse(text).toString().replace(UNSAFE_TAGS, '')
  }, [text, viewMode])

  if (viewMode === 'raw') {
    return (
      <textarea
        ref={textareaRef}
        className="notepad"
        placeholder="Start typing..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    )
  }

  return (
    <div
      className="notepad prose max-w-none overflow-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
