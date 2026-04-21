import { render, screen, fireEvent } from '@testing-library/react'
import InsertMenu from './InsertMenu'

function makeRef(value = 'line one', selectionStart = 0) {
  return {
    current: {
      value,
      selectionStart,
      focus: jest.fn(),
      setSelectionRange: jest.fn(),
    },
  }
}

describe('InsertMenu', () => {
  beforeEach(() => {
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => { cb(); return 0 })
  })

  afterEach(() => {
    global.requestAnimationFrame.mockRestore()
  })

  it('renders "Insert" button and all top-level items', () => {
    render(<InsertMenu />)
    expect(screen.getByText('Insert')).toBeInTheDocument()
    expect(screen.getByText('List')).toBeInTheDocument()
    expect(screen.getByText('Horizontal Rule')).toBeInTheDocument()
    expect(screen.getByText('Link')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Table')).toBeInTheDocument()
    expect(screen.getByText('Fenced Code Block')).toBeInTheDocument()
  })

  it('renders List submenu with sub-items', () => {
    render(<InsertMenu />)
    expect(screen.getByText('Unordered')).toBeInTheDocument()
    expect(screen.getByText('Ordered')).toBeInTheDocument()
    expect(screen.getByText('Definition')).toBeInTheDocument()
    expect(screen.getByText('Task')).toBeInTheDocument()
  })

  it('renders SubmenuTrigger and SubmenuIndicator', () => {
    render(<InsertMenu />)
    expect(screen.getByTestId('Dropdown.SubmenuTrigger')).toBeInTheDocument()
    expect(screen.getByTestId('Dropdown.SubmenuIndicator')).toBeInTheDocument()
  })

  describe.each([
    ['Ordered', '1. Item 1\n2. Item 2'],
    ['Unordered', '- Item 1\n- Item 2'],
    ['Definition', 'Term\n: Definition'],
    ['Task', '[ ] Item 1\n[x] Item 2'],
    ['Horizontal Rule', '---'],
    ['Link', '[link text](url)'],
    ['Image', '![alt text](url)'],
    ['Table', '| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell     | Cell     |'],
    ['Fenced Code Block', '```\ncode here\n```'],
  ])('%s action', (label, snippet) => {
    it('inserts snippet below the current line', () => {
      const onTextChange = jest.fn()
      const ref = makeRef('hello', 0)
      render(<InsertMenu textareaRef={ref} onTextChange={onTextChange} />)
      fireEvent.click(screen.getByText(label).closest('li'))
      expect(onTextChange).toHaveBeenCalledWith('hello\n' + snippet)
    })

    it('restores focus and places cursor at end of snippet', () => {
      const ref = makeRef('hello', 0)
      render(<InsertMenu textareaRef={ref} onTextChange={() => {}} />)
      fireEvent.click(screen.getByText(label).closest('li'))
      expect(ref.current.focus).toHaveBeenCalled()
      const expectedPos = 'hello'.length + 1 + snippet.length
      expect(ref.current.setSelectionRange).toHaveBeenCalledWith(expectedPos, expectedPos)
    })
  })

  it('does nothing when textareaRef has no current', () => {
    const onTextChange = jest.fn()
    render(<InsertMenu textareaRef={{ current: null }} onTextChange={onTextChange} />)
    fireEvent.click(screen.getByText('Horizontal Rule').closest('li'))
    expect(onTextChange).not.toHaveBeenCalled()
  })
})
