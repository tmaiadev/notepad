import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { TextEdit, ViewMode } from '../types'
import { isCursorEdit } from '../types'
import { EditorContext, STORAGE_KEY, type EditorContextValue } from './editorContext'

interface History {
  stack: string[]
  index: number
}

interface EditorProviderProps {
  children: ReactNode
}

export function EditorProvider({ children }: EditorProviderProps) {
  const [text, setTextState] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? '')
  const [viewMode, setViewMode] = useState<ViewMode>('raw')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const historyRef = useRef<History>({ stack: [text], index: 0 })

  const writeText = useCallback((value: string) => {
    setTextState(value)
    localStorage.setItem(STORAGE_KEY, value)
  }, [])

  const setText = useCallback((value: string) => {
    const { stack, index } = historyRef.current
    const newStack = stack.slice(0, index + 1)
    newStack.push(value)
    historyRef.current = { stack: newStack, index: newStack.length - 1 }
    writeText(value)
  }, [writeText])

  const clearText = useCallback(() => {
    setText('')
    localStorage.removeItem(STORAGE_KEY)
  }, [setText])

  const focusTextarea = useCallback(() => {
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [])

  const undo = useCallback(() => {
    const { stack, index } = historyRef.current
    if (index === 0) return
    historyRef.current = { stack, index: index - 1 }
    writeText(stack[index - 1]!)
    focusTextarea()
  }, [writeText, focusTextarea])

  const redo = useCallback(() => {
    const { stack, index } = historyRef.current
    if (index >= stack.length - 1) return
    historyRef.current = { stack, index: index + 1 }
    writeText(stack[index + 1]!)
    focusTextarea()
  }, [writeText, focusTextarea])

  const applyEdit = useCallback((edit: TextEdit) => {
    setText(edit.newValue)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      if (isCursorEdit(edit)) {
        el.setSelectionRange(edit.newCursorPos, edit.newCursorPos)
      } else {
        el.setSelectionRange(edit.newSelectionStart, edit.newSelectionEnd)
      }
    })
  }, [setText])

  const value = useMemo<EditorContextValue>(
    () => ({
      text,
      viewMode,
      textareaRef,
      setText,
      clearText,
      setViewMode,
      undo,
      redo,
      applyEdit,
    }),
    [text, viewMode, setText, clearText, undo, redo, applyEdit],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
