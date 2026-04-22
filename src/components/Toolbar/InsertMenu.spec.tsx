import { screen, fireEvent } from '@testing-library/react'
import { InsertMenu } from './InsertMenu'
import { makeTextareaStub, renderWithEditor } from '../../test-utils'

function stubRef(value = 'hello', selectionStart = 0) {
  const stub = makeTextareaStub(value, selectionStart, selectionStart)
  return { current: stub as unknown as HTMLTextAreaElement } as React.RefObject<HTMLTextAreaElement | null>
}

describe('InsertMenu', () => {
  it('renders "Insert" button and all top-level items', () => {
    renderWithEditor(<InsertMenu />)
    expect(screen.getByText('Insert')).toBeInTheDocument()
    expect(screen.getByText('List')).toBeInTheDocument()
    expect(screen.getByText('Horizontal Rule')).toBeInTheDocument()
    expect(screen.getByText('Link')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Table')).toBeInTheDocument()
    expect(screen.getByText('Fenced Code Block')).toBeInTheDocument()
  })

  it('renders List submenu with sub-items', () => {
    renderWithEditor(<InsertMenu />)
    expect(screen.getByText('Unordered')).toBeInTheDocument()
    expect(screen.getByText('Ordered')).toBeInTheDocument()
    expect(screen.getByText('Definition')).toBeInTheDocument()
    expect(screen.getByText('Task')).toBeInTheDocument()
  })

  it('renders SubmenuTrigger and SubmenuIndicator', () => {
    renderWithEditor(<InsertMenu />)
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
    it('calls applyEdit with the snippet inserted below the current line', () => {
      const textareaRef = stubRef('hello', 0)
      const { editor } = renderWithEditor(<InsertMenu />, { textareaRef })
      fireEvent.click(screen.getByText(label).closest('li')!)
      const expectedPos = 'hello'.length + 1 + snippet.length
      expect(editor.applyEdit).toHaveBeenCalledWith({
        newValue: 'hello\n' + snippet,
        newCursorPos: expectedPos,
      })
    })
  })

  it('does nothing when textareaRef has no current', () => {
    const textareaRef = { current: null } as React.RefObject<HTMLTextAreaElement | null>
    const { editor } = renderWithEditor(<InsertMenu />, { textareaRef })
    fireEvent.click(screen.getByText('Horizontal Rule').closest('li')!)
    expect(editor.applyEdit).not.toHaveBeenCalled()
  })

  it('does nothing when item id is not a valid snippet', () => {
    const textareaRef = stubRef('hello', 0)
    const { editor } = renderWithEditor(<InsertMenu />, { textareaRef })
    fireEvent.click(screen.getByText('List').closest('li')!)
    expect(editor.applyEdit).not.toHaveBeenCalled()
  })
})
