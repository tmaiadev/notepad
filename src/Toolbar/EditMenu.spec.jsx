import { render, screen, fireEvent, act } from '@testing-library/react'
import EditMenu from './EditMenu'

const flush = () => act(() => new Promise(r => setTimeout(r, 0)))

function makeTextareaRef(value = 'hello world', selectionStart = 6, selectionEnd = 11) {
  return {
    current: {
      value,
      selectionStart,
      selectionEnd,
      focus: jest.fn(),
      setSelectionRange: jest.fn(),
    },
  }
}

describe('EditMenu', () => {
  beforeEach(() => {
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => { cb(); return 0 })
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
        readText: jest.fn().mockResolvedValue('pasted'),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    global.requestAnimationFrame.mockRestore()
  })

  it('renders "Edit" button and all items', () => {
    render(<EditMenu />)
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Cut')).toBeInTheDocument()
    expect(screen.getByText('Paste')).toBeInTheDocument()
    expect(screen.getByText('Heading')).toBeInTheDocument()
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('Italic')).toBeInTheDocument()
    expect(screen.getByText('Strikethrough')).toBeInTheDocument()
    expect(screen.getByText('Highlight')).toBeInTheDocument()
    expect(screen.getByText('Blockquote')).toBeInTheDocument()
    expect(screen.getByText('Undo')).toBeInTheDocument()
    expect(screen.getByText('Redo')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
  })

  it('renders Separators between menu groups', () => {
    render(<EditMenu />)
    expect(screen.getAllByTestId('Separator')).toHaveLength(2)
  })

  it('renders keyboard shortcuts', () => {
    render(<EditMenu />)
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getAllByText('Z')).toHaveLength(2)
    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('I')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  describe('Undo action', () => {
    it('calls onUndo when Undo is clicked', () => {
      const onUndo = jest.fn()
      render(<EditMenu onUndo={onUndo} />)
      fireEvent.click(screen.getByText('Undo').closest('li'))
      expect(onUndo).toHaveBeenCalled()
    })

    it('does nothing when onUndo is not provided', () => {
      render(<EditMenu />)
      expect(() => fireEvent.click(screen.getByText('Undo').closest('li'))).not.toThrow()
    })
  })

  describe('Redo action', () => {
    it('calls onRedo when Redo is clicked', () => {
      const onRedo = jest.fn()
      render(<EditMenu onRedo={onRedo} />)
      fireEvent.click(screen.getByText('Redo').closest('li'))
      expect(onRedo).toHaveBeenCalled()
    })

    it('does nothing when onRedo is not provided', () => {
      render(<EditMenu />)
      expect(() => fireEvent.click(screen.getByText('Redo').closest('li'))).not.toThrow()
    })
  })

  describe('Copy action', () => {
    it('writes selected text to clipboard', async () => {
      const textareaRef = makeTextareaRef('hello world', 6, 11)
      render(<EditMenu textareaRef={textareaRef} onTextChange={() => {}} />)
      fireEvent.click(screen.getByText('Copy').closest('li'))
      await flush()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('world')
    })

    it('does nothing when textareaRef has no current', async () => {
      render(<EditMenu textareaRef={{ current: null }} onTextChange={() => {}} />)
      fireEvent.click(screen.getByText('Copy').closest('li'))
      await flush()
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
    })
  })

  describe('Cut action', () => {
    it('writes selected text to clipboard and removes it from value', async () => {
      const onTextChange = jest.fn()
      const textareaRef = makeTextareaRef('hello world', 6, 11)
      render(<EditMenu textareaRef={textareaRef} onTextChange={onTextChange} />)
      fireEvent.click(screen.getByText('Cut').closest('li'))
      await flush()
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('world')
      expect(onTextChange).toHaveBeenCalledWith('hello ')
    })

    it('restores focus and cursor after cut', async () => {
      const textareaRef = makeTextareaRef('hello world', 6, 11)
      render(<EditMenu textareaRef={textareaRef} onTextChange={() => {}} />)
      fireEvent.click(screen.getByText('Cut').closest('li'))
      await flush()
      expect(textareaRef.current.focus).toHaveBeenCalled()
      expect(textareaRef.current.setSelectionRange).toHaveBeenCalledWith(6, 6)
    })
  })

  describe('Paste action', () => {
    it('reads from clipboard and inserts at cursor, replacing selection', async () => {
      const onTextChange = jest.fn()
      const textareaRef = makeTextareaRef('hello world', 6, 11)
      render(<EditMenu textareaRef={textareaRef} onTextChange={onTextChange} />)
      fireEvent.click(screen.getByText('Paste').closest('li'))
      await flush()
      expect(navigator.clipboard.readText).toHaveBeenCalled()
      expect(onTextChange).toHaveBeenCalledWith('hello pasted')
    })

    it('restores focus and positions cursor after pasted text', async () => {
      const textareaRef = makeTextareaRef('hello world', 6, 11)
      render(<EditMenu textareaRef={textareaRef} onTextChange={() => {}} />)
      fireEvent.click(screen.getByText('Paste').closest('li'))
      await flush()
      expect(textareaRef.current.focus).toHaveBeenCalled()
      expect(textareaRef.current.setSelectionRange).toHaveBeenCalledWith(12, 12)
    })
  })
})
