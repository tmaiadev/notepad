import { render, screen, fireEvent } from '@testing-library/react'
import { marked } from 'marked'
import App from './App'

jest.mock('marked', () => ({
  marked: {
    parse: jest.fn((text) => `<p>${text}</p>`),
  },
}))

beforeEach(() => {
  localStorage.clear()
  marked.parse.mockImplementation((text) => `<p>${text}</p>`)
})

describe('App', () => {
  it('renders textarea in raw mode by default', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Start typing...')).toBeInTheDocument()
  })

  it('initializes text from localStorage', () => {
    localStorage.setItem('notepad', 'saved text')
    render(<App />)
    expect(screen.getByPlaceholderText('Start typing...')).toHaveValue('saved text')
  })

  it('initializes with empty string when localStorage has no item', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Start typing...')).toHaveValue('')
  })

  it('updates text and localStorage on change', () => {
    render(<App />)
    const textarea = screen.getByPlaceholderText('Start typing...')
    fireEvent.change(textarea, { target: { value: 'hello world' } })
    expect(textarea).toHaveValue('hello world')
    expect(localStorage.getItem('notepad')).toBe('hello world')
  })

  it('renders parsed markdown in visualizer mode', () => {
    localStorage.setItem('notepad', 'some markdown')
    render(<App />)
    fireEvent.click(screen.getByLabelText('Formatted Document'))
    expect(screen.getByText('some markdown')).toBeInTheDocument()
  })

  it('strips <script> tags from rendered HTML', () => {
    marked.parse.mockReturnValueOnce('<p>safe</p><script>alert("xss")</script>')
    localStorage.setItem('notepad', 'xss attempt')
    render(<App />)
    fireEvent.click(screen.getByLabelText('Formatted Document'))
    expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument()
    expect(screen.getByText('safe')).toBeInTheDocument()
  })

  it('strips <style> tags from rendered HTML', () => {
    marked.parse.mockReturnValueOnce('<p>content</p><style>body{display:none}</style>')
    localStorage.setItem('notepad', 'style attempt')
    render(<App />)
    fireEvent.click(screen.getByLabelText('Formatted Document'))
    expect(screen.queryByText('body{display:none}')).not.toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})
