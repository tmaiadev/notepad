import { createContext } from 'react'
import type { RefObject } from 'react'
import type { TextEdit, ViewMode } from '../types'

export interface EditorContextValue {
  text: string
  viewMode: ViewMode
  textareaRef: RefObject<HTMLTextAreaElement | null>
  setText: (value: string) => void
  clearText: () => void
  setViewMode: (mode: ViewMode) => void
  undo: () => void
  redo: () => void
  applyEdit: (edit: TextEdit) => void
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export const STORAGE_KEY = 'notepad'
