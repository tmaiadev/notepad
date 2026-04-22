import { screen, fireEvent, act } from '@testing-library/react'
import { EditMenu } from './EditMenu'
import { makeTextareaStub, renderWithEditor } from '../../test-utils'

const flush = () => act(() => new Promise((r) => setTimeout(r, 0)))

function stubRef(value = 'hello world', selectionStart = 6, selectionEnd = 11) {
  const stub = makeTextareaStub(value, selectionStart, selectionEnd)
  return { current: stub as unknown as HTMLTextAreaElement } as React.RefObject<HTMLTextAreaElement | null>
}

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn().mockResolvedValue(undefined),
      readText: jest.fn().mockResolvedValue('pasted'),
    },
    writable: true,
    configurable: true,
  })
})

describe('EditMenu', () => {
  it('renders "Edit" button and all items', () => {
    renderWithEditor(<EditMenu />)
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Cut')).toBeInTheDocument()
    expect(screen.getByText('Paste')).toBeInTheDocument()
    expect(screen.getByText('Heading')).toBeInTheDocument()
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('Italic')).toBeInTheDocument()
    expect(screen.getByText('Strikethrough')).toBeInTheDocument()
    expect(screen.getByText('Blockquote')).toBeInTheDocument()
    expect(screen.getByText('Undo')).toBeInTheDocument()
    expect(screen.getByText('Redo')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
  })

  it('renders Separators between menu groups', () => {
    renderWithEditor(<EditMenu />)
    expect(screen.getAllByTestId('Separator')).toHaveLength(2)
  })

  it('renders keyboard shortcuts', () => {
    renderWithEditor(<EditMenu />)
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getAllByText('X')).toHaveLength(2)
    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getAllByText('Z')).toHaveLength(2)
    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('I')).toBeInTheDocument()
    expect(screen.queryByText('-')).not.toBeInTheDocument()
  })

  describe('keyboard shortcuts', () => {
    it('Cmd+Z calls undo', () => {
      const undo = jest.fn()
      renderWithEditor(<EditMenu />, { undo })
      fireEvent.keyDown(document, { key: 'z', metaKey: true })
      expect(undo).toHaveBeenCalled()
    })

    it('Ctrl+Z calls undo (Windows/Linux)', () => {
      const undo = jest.fn()
      renderWithEditor(<EditMenu />, { undo })
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true })
      expect(undo).toHaveBeenCalled()
    })

    it('Cmd+Shift+Z calls redo', () => {
      const redo = jest.fn()
      renderWithEditor(<EditMenu />, { redo })
      fireEvent.keyDown(document, { key: 'Z', metaKey: true, shiftKey: true })
      expect(redo).toHaveBeenCalled()
    })

    it('Cmd+B wraps selected text with **', () => {
      const textareaRef = stubRef('hello world', 6, 11)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.keyDown(document, { key: 'b', metaKey: true })
      expect(editor.applyEdit).toHaveBeenCalledWith(expect.objectContaining({ newValue: 'hello **world**' }))
    })

    it('Cmd+I wraps selected text with *', () => {
      const textareaRef = stubRef('hello world', 6, 11)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.keyDown(document, { key: 'i', metaKey: true })
      expect(editor.applyEdit).toHaveBeenCalledWith(expect.objectContaining({ newValue: 'hello *world*' }))
    })

    it('Cmd+Shift+X wraps selected text with ~~', () => {
      const textareaRef = stubRef('hello world', 6, 11)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.keyDown(document, { key: 'X', metaKey: true, shiftKey: true })
      expect(editor.applyEdit).toHaveBeenCalledWith(expect.objectContaining({ newValue: 'hello ~~world~~' }))
    })

    it('Cmd+Shift+H cycles heading on current line', () => {
      const textareaRef = stubRef('foo', 0, 0)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.keyDown(document, { key: 'H', metaKey: true, shiftKey: true })
      expect(editor.applyEdit).toHaveBeenCalledWith(expect.objectContaining({ newValue: '# foo' }))
    })

    it('ignores keypresses without modifier key', () => {
      const undo = jest.fn()
      renderWithEditor(<EditMenu />, { undo })
      fireEvent.keyDown(document, { key: 'z' })
      expect(undo).not.toHaveBeenCalled()
    })

    it('ignores unmapped modifier combinations', () => {
      const undo = jest.fn()
      const redo = jest.fn()
      renderWithEditor(<EditMenu />, { undo, redo })
      fireEvent.keyDown(document, { key: 'q', metaKey: true })
      expect(undo).not.toHaveBeenCalled()
      expect(redo).not.toHaveBeenCalled()
    })
  })

  describe('Blockquote action', () => {
    it('calls applyEdit with "> " prepended', () => {
      const textareaRef = stubRef('foo', 0, 0)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.click(screen.getByText('Blockquote').closest('li')!)
      expect(editor.applyEdit).toHaveBeenCalledWith(expect.objectContaining({ newValue: '> foo' }))
    })

    it('does not modify value when line already starts with >', () => {
      const textareaRef = stubRef('> foo', 0, 0)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.click(screen.getByText('Blockquote').closest('li')!)
      expect(editor.applyEdit).toHaveBeenCalledWith(expect.objectContaining({ newValue: '> foo' }))
    })
  })

  describe('Heading action', () => {
    it('applies cycleHeading via applyEdit', () => {
      const textareaRef = stubRef('foo', 0, 0)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.click(screen.getByText('Heading').closest('li')!)
      expect(editor.applyEdit).toHaveBeenCalledWith(expect.objectContaining({ newValue: '# foo' }))
    })
  })

  describe.each([
    ['Bold', '**'],
    ['Italic', '*'],
    ['Strikethrough', '~~'],
    ['Code', '`'],
  ])('%s action', (label, marker) => {
    it(`wraps selected text with ${marker}`, () => {
      const textareaRef = stubRef('hello world', 6, 11)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.click(screen.getByText(label).closest('li')!)
      expect(editor.applyEdit).toHaveBeenCalledWith(expect.objectContaining({
        newValue: `hello ${marker}world${marker}`,
      }))
    })
  })

  describe('Undo action', () => {
    it('calls undo when Undo is clicked', () => {
      const undo = jest.fn()
      renderWithEditor(<EditMenu />, { undo })
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      expect(undo).toHaveBeenCalled()
    })
  })

  describe('Redo action', () => {
    it('calls redo when Redo is clicked', () => {
      const redo = jest.fn()
      renderWithEditor(<EditMenu />, { redo })
      fireEvent.click(screen.getByText('Redo').closest('li')!)
      expect(redo).toHaveBeenCalled()
    })
  })

  describe('Copy action', () => {
    it('writes selected text to clipboard', async () => {
      const textareaRef = stubRef('hello world', 6, 11)
      renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.click(screen.getByText('Copy').closest('li')!)
      await flush()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('world')
    })

    it('does nothing when textareaRef has no current', async () => {
      const textareaRef = { current: null } as React.RefObject<HTMLTextAreaElement | null>
      renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.click(screen.getByText('Copy').closest('li')!)
      await flush()
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
    })
  })

  describe('Cut action', () => {
    it('writes selected text to clipboard and removes it via applyEdit', async () => {
      const textareaRef = stubRef('hello world', 6, 11)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.click(screen.getByText('Cut').closest('li')!)
      await flush()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('world')
      expect(editor.applyEdit).toHaveBeenCalledWith({
        newValue: 'hello ',
        newCursorPos: 6,
      })
    })
  })

  describe('Paste action', () => {
    it('reads from clipboard and inserts at cursor, replacing selection', async () => {
      const textareaRef = stubRef('hello world', 6, 11)
      const { editor } = renderWithEditor(<EditMenu />, { textareaRef })
      fireEvent.click(screen.getByText('Paste').closest('li')!)
      await flush()
      expect(navigator.clipboard.readText).toHaveBeenCalled()
      expect(editor.applyEdit).toHaveBeenCalledWith({
        newValue: 'hello pasted',
        newCursorPos: 12,
      })
    })
  })
})
