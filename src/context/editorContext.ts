import { createContext } from 'react'
import type { RefObject } from 'react'
import type { Tab, TabInitOptions, TextEdit, ViewMode } from '../types'

export interface EditorContextValue {
  text: string
  fileName: string
  fileHandle: FileSystemFileHandle | null
  viewMode: ViewMode
  textareaRef: RefObject<HTMLTextAreaElement | null>
  setText: (value: string) => void
  clearText: () => void
  setViewMode: (mode: ViewMode) => void
  undo: () => void
  redo: () => void
  applyEdit: (edit: TextEdit) => void
  tabs: Tab[]
  activeTabId: string
  newTab: () => void
  openTab: (options?: TabInitOptions) => void
  closeTab: (id: string) => void
  switchTab: (id: string) => void
  updateActiveTab: (updates: Partial<Pick<Tab, 'fileHandle' | 'fileName' | 'savedText'>>) => void
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export const STORAGE_KEY = 'notepad'
