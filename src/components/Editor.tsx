import { useMemo } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { marked } from 'marked'
import { useEditor } from '../context/useEditor'
import { continueList, indentListItem, isListItemAtCursor, outdentListItem } from '../lib/markdown'

const UNSAFE_TAGS = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi

export function Editor() {
  const { text, viewMode, textareaRef, setText, applyEdit } = useEditor()

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = e.currentTarget

    if (e.key === 'Enter') {
      const edit = continueList(textarea.value, textarea.selectionStart, textarea.selectionEnd)
      if (!edit) return
      e.preventDefault()
      applyEdit(edit)
      return
    }

    if (e.key === 'Tab') {
      if (!e.shiftKey) {
        const edit = indentListItem(textarea.value, textarea.selectionStart)
        if (edit) {
          e.preventDefault()
          applyEdit(edit)
        }
      } else {
        if (isListItemAtCursor(textarea.value, textarea.selectionStart)) {
          e.preventDefault()
          const edit = outdentListItem(textarea.value, textarea.selectionStart)
          if (edit) applyEdit(edit)
        }
      }
    }
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
