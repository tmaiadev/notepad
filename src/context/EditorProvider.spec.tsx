import { act, render, renderHook, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { EditorProvider } from './EditorProvider'
import { useEditor } from './useEditor'

function Wrapper({ children }: { children: ReactNode }) {
  return <EditorProvider>{children}</EditorProvider>
}

beforeEach(() => {
  localStorage.clear()
  jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 0 })
})

afterEach(() => {
  ;(global.requestAnimationFrame as jest.Mock).mockRestore?.()
})

describe('EditorProvider', () => {
  it('throws when useEditor is called outside the provider', () => {
    function Consumer() {
      useEditor()
      return null
    }
    const err = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Consumer />)).toThrow('useEditor must be used within an EditorProvider')
    err.mockRestore()
  })

  it('applies cursor edits by focusing and moving the caret', () => {
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    const el = document.createElement('textarea')
    el.focus = jest.fn()
    el.setSelectionRange = jest.fn()
    result.current.textareaRef.current = el

    act(() => {
      result.current.applyEdit({ newValue: 'abc', newCursorPos: 2 })
    })

    expect(result.current.text).toBe('abc')
    expect(el.focus).toHaveBeenCalled()
    expect(el.setSelectionRange).toHaveBeenCalledWith(2, 2)
  })

  it('applies selection edits by focusing and selecting the range', () => {
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    const el = document.createElement('textarea')
    el.focus = jest.fn()
    el.setSelectionRange = jest.fn()
    result.current.textareaRef.current = el

    act(() => {
      result.current.applyEdit({ newValue: 'hello', newSelectionStart: 1, newSelectionEnd: 4 })
    })

    expect(el.setSelectionRange).toHaveBeenCalledWith(1, 4)
  })

  it('does nothing in applyEdit when the textarea is not mounted', () => {
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    result.current.textareaRef.current = null

    act(() => {
      result.current.applyEdit({ newValue: 'abc', newCursorPos: 2 })
    })

    expect(result.current.text).toBe('abc')
  })

  it('undo without prior edits is a no-op', () => {
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    act(() => { result.current.undo() })
    expect(result.current.text).toBe('')
  })

  it('redo without pending future is a no-op', () => {
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    act(() => { result.current.redo() })
    expect(result.current.text).toBe('')
  })

  it('clearText pushes an empty value and wipes localStorage', () => {
    localStorage.setItem('notepad', 'seed')
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    act(() => { result.current.clearText() })
    expect(result.current.text).toBe('')
    expect(localStorage.getItem('notepad')).toBeNull()
  })

  it('exposes the current text to children', () => {
    localStorage.setItem('notepad', 'hi')
    function Consumer() {
      const { text } = useEditor()
      return <span data-testid="text">{text}</span>
    }
    render(<EditorProvider><Consumer /></EditorProvider>)
    expect(screen.getByTestId('text')).toHaveTextContent('hi')
  })
})
