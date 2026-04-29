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

  it('clearText sets active tab text to empty', () => {
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    act(() => { result.current.setText('seed') })
    act(() => { result.current.clearText() })
    expect(result.current.text).toBe('')
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

  it('migrates legacy plain-text localStorage to tab format', () => {
    localStorage.setItem('notepad', 'legacy content')
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    expect(result.current.text).toBe('legacy content')
    expect(result.current.tabs).toHaveLength(1)
  })

  it('persists tabs as JSON to localStorage on text change', () => {
    const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
    act(() => { result.current.setText('hello') })
    const stored = JSON.parse(localStorage.getItem('notepad')!)
    expect(stored.tabs[0].text).toBe('hello')
  })

  describe('tab management', () => {
    it('starts with one Untitled tab', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      expect(result.current.tabs).toHaveLength(1)
      expect(result.current.tabs[0]!.fileName).toBe('Untitled')
    })

    it('newTab creates a new tab and makes it active', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      act(() => { result.current.setText('original') })
      act(() => { result.current.newTab() })
      expect(result.current.tabs).toHaveLength(2)
      expect(result.current.text).toBe('')
    })

    it('switchTab changes the active tab and its text', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      const firstId = result.current.activeTabId
      act(() => { result.current.setText('tab one') })
      act(() => { result.current.newTab() })
      act(() => { result.current.setText('tab two') })
      act(() => { result.current.switchTab(firstId) })
      expect(result.current.text).toBe('tab one')
    })

    it('closeTab removes the tab', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      act(() => { result.current.newTab() })
      const idToClose = result.current.activeTabId
      act(() => { result.current.newTab() })
      act(() => { result.current.closeTab(idToClose) })
      expect(result.current.tabs.some(t => t.id === idToClose)).toBe(false)
    })

    it('closing the last tab creates a fresh Untitled tab', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      const onlyId = result.current.activeTabId
      act(() => { result.current.closeTab(onlyId) })
      expect(result.current.tabs).toHaveLength(1)
      expect(result.current.text).toBe('')
    })

    it('openTab replaces the active empty untitled tab', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      act(() => { result.current.openTab({ fileName: 'notes.txt', text: 'file content' }) })
      expect(result.current.tabs).toHaveLength(1)
      expect(result.current.text).toBe('file content')
      expect(result.current.tabs[0]!.fileName).toBe('notes.txt')
    })

    it('openTab opens a new tab when active tab has content', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      act(() => { result.current.setText('existing') })
      act(() => { result.current.openTab({ fileName: 'new.txt', text: 'new content' }) })
      expect(result.current.tabs).toHaveLength(2)
      expect(result.current.text).toBe('new content')
    })

    it('undo/redo are isolated per tab', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      const firstId = result.current.activeTabId
      act(() => { result.current.setText('hello') })
      act(() => { result.current.newTab() })
      act(() => { result.current.setText('world') })
      // Undo on second tab
      act(() => { result.current.undo() })
      expect(result.current.text).toBe('')
      // Switch back — first tab still has 'hello'
      act(() => { result.current.switchTab(firstId) })
      expect(result.current.text).toBe('hello')
    })

    it('updateActiveTab updates fileHandle and fileName', () => {
      const { result } = renderHook(() => useEditor(), { wrapper: Wrapper })
      const mockHandle = {} as FileSystemFileHandle
      act(() => { result.current.updateActiveTab({ fileHandle: mockHandle, fileName: 'saved.txt', savedText: '' }) })
      expect(result.current.fileHandle).toBe(mockHandle)
      expect(result.current.fileName).toBe('saved.txt')
    })
  })
})
