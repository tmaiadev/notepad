import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import type { ReactElement, RefObject } from 'react'
import { EditorContext, type EditorContextValue } from './context/editorContext'
import type { ViewMode } from './types'

interface TextareaStub {
  value: string
  selectionStart: number
  selectionEnd: number
  focus: jest.Mock
  setSelectionRange: jest.Mock
}

export function makeTextareaStub(
  value = '',
  selectionStart = 0,
  selectionEnd = selectionStart,
): TextareaStub {
  return {
    value,
    selectionStart,
    selectionEnd,
    focus: jest.fn(),
    setSelectionRange: jest.fn(),
  }
}

export function makeEditorValue(overrides: Partial<EditorContextValue> = {}): EditorContextValue {
  const { textareaRef, ...rest } = overrides
  const ref: RefObject<HTMLTextAreaElement | null> = textareaRef ?? { current: null }

  return {
    text: '',
    viewMode: 'raw' as ViewMode,
    setText: jest.fn(),
    clearText: jest.fn(),
    setViewMode: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    applyEdit: jest.fn(),
    ...rest,
    textareaRef: ref,
  }
}

export interface EditorRenderResult extends RenderResult {
  editor: EditorContextValue
}

export function renderWithEditor(
  ui: ReactElement,
  contextOverrides: Partial<EditorContextValue> = {},
  options?: RenderOptions,
): EditorRenderResult {
  const editor = makeEditorValue(contextOverrides)
  const result = render(
    <EditorContext.Provider value={editor}>{ui}</EditorContext.Provider>,
    options,
  )
  return Object.assign(result, { editor })
}
