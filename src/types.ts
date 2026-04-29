export type ViewMode = 'raw' | 'visualizer'

export interface Tab {
  id: string
  fileName: string
  text: string
  fileHandle: FileSystemFileHandle | null
  savedText: string | null
}

export interface TabInitOptions {
  fileName?: string
  text?: string
  fileHandle?: FileSystemFileHandle | null
}

export interface SelectionEdit {
  newValue: string
  newSelectionStart: number
  newSelectionEnd: number
}

export interface CursorEdit {
  newValue: string
  newCursorPos: number
}

export type TextEdit = SelectionEdit | CursorEdit

export function isCursorEdit(edit: TextEdit): edit is CursorEdit {
  return 'newCursorPos' in edit
}
