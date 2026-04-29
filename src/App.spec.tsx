import { render, screen, fireEvent, act } from '@testing-library/react'
import { marked } from 'marked'
import App from './App'

jest.mock('marked', () => ({
  marked: {
    parse: jest.fn((text: string) => `<p>${text}</p>`),
  },
}))

const mockedParse = marked.parse as jest.MockedFunction<typeof marked.parse>

beforeEach(() => {
  localStorage.clear()
  mockedParse.mockImplementation((text: string) => `<p>${text}</p>`)
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
    expect(JSON.parse(localStorage.getItem('notepad')!).tabs[0].text).toBe('hello world')
  })

  it('renders parsed markdown in visualizer mode', () => {
    localStorage.setItem('notepad', 'some markdown')
    render(<App />)
    fireEvent.click(screen.getByLabelText('Formatted Document'))
    expect(screen.getByText('some markdown')).toBeInTheDocument()
  })

  it('strips <script> tags from rendered HTML', () => {
    mockedParse.mockReturnValueOnce('<p>safe</p><script>alert("xss")</script>')
    localStorage.setItem('notepad', 'xss attempt')
    render(<App />)
    fireEvent.click(screen.getByLabelText('Formatted Document'))
    expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument()
    expect(screen.getByText('safe')).toBeInTheDocument()
  })

  it('strips <style> tags from rendered HTML', () => {
    mockedParse.mockReturnValueOnce('<p>content</p><style>body{display:none}</style>')
    localStorage.setItem('notepad', 'style attempt')
    render(<App />)
    fireEvent.click(screen.getByLabelText('Formatted Document'))
    expect(screen.queryByText('body{display:none}')).not.toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  describe('Undo', () => {
    it('restores the previous text state', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...')
      fireEvent.change(textarea, { target: { value: 'hello' } })
      fireEvent.change(textarea, { target: { value: 'hello world' } })
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      expect(textarea).toHaveValue('hello')
    })

    it('updates localStorage on undo', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...')
      fireEvent.change(textarea, { target: { value: 'first' } })
      fireEvent.change(textarea, { target: { value: 'second' } })
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      expect(JSON.parse(localStorage.getItem('notepad')!).tabs[0].text).toBe('first')
    })

    it('does nothing when already at the beginning of history', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...')
      fireEvent.change(textarea, { target: { value: 'only' } })
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      expect(textarea).toHaveValue('')
    })

    it('can undo multiple steps', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...')
      fireEvent.change(textarea, { target: { value: 'a' } })
      fireEvent.change(textarea, { target: { value: 'ab' } })
      fireEvent.change(textarea, { target: { value: 'abc' } })
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      expect(textarea).toHaveValue('a')
    })
  })

  describe('Redo', () => {
    it('re-applies text that was undone', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...')
      fireEvent.change(textarea, { target: { value: 'hello' } })
      fireEvent.change(textarea, { target: { value: 'hello world' } })
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      fireEvent.click(screen.getByText('Redo').closest('li')!)
      expect(textarea).toHaveValue('hello world')
    })

    it('updates localStorage on redo', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...')
      fireEvent.change(textarea, { target: { value: 'v1' } })
      fireEvent.change(textarea, { target: { value: 'v2' } })
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      fireEvent.click(screen.getByText('Redo').closest('li')!)
      expect(JSON.parse(localStorage.getItem('notepad')!).tabs[0].text).toBe('v2')
    })

    it('does nothing when there is nothing to redo', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...')
      fireEvent.change(textarea, { target: { value: 'hello' } })
      fireEvent.click(screen.getByText('Redo').closest('li')!)
      expect(textarea).toHaveValue('hello')
    })

    it('clears redo history when a new change is made after undo', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...')
      fireEvent.change(textarea, { target: { value: 'a' } })
      fireEvent.change(textarea, { target: { value: 'ab' } })
      fireEvent.click(screen.getByText('Undo').closest('li')!)
      fireEvent.change(textarea, { target: { value: 'ax' } })
      fireEvent.click(screen.getByText('Redo').closest('li')!)
      expect(textarea).toHaveValue('ax')
    })
  })

  describe('Enter-to-continue-list', () => {
    it('continues the list on Enter', () => {
      localStorage.setItem('notepad', '- item')
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...') as HTMLTextAreaElement
      textarea.setSelectionRange(6, 6)
      fireEvent.keyDown(textarea, { key: 'Enter' })
      expect(textarea.value).toBe('- item\n- ')
    })

    it('does not intercept Enter for plain text', () => {
      localStorage.setItem('notepad', 'plain text')
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...') as HTMLTextAreaElement
      const before = textarea.value
      fireEvent.keyDown(textarea, { key: 'Enter' })
      expect(textarea.value).toBe(before)
    })

    it('ignores non-Enter keydowns', () => {
      render(<App />)
      const textarea = screen.getByPlaceholderText('Start typing...') as HTMLTextAreaElement
      fireEvent.keyDown(textarea, { key: 'a' })
      expect(textarea.value).toBe('')
    })
  })

  describe('Install prompt', () => {
    function fireInstallEvent(outcome: 'accepted' | 'dismissed') {
      const evt = Object.assign(new Event('beforeinstallprompt'), {
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome }),
      })
      act(() => { fireEvent(window, evt) })
      return evt
    }

    it('renders Install button when the browser fires beforeinstallprompt', () => {
      render(<App />)
      expect(screen.queryByText('Install')).not.toBeInTheDocument()
      fireInstallEvent('accepted')
      expect(screen.getByText('Install')).toBeInTheDocument()
    })

    it('dismisses the button after user accepts the install', async () => {
      render(<App />)
      const evt = fireInstallEvent('accepted')
      await act(async () => {
        fireEvent.click(screen.getByText('Install'))
        await evt.userChoice
      })
      expect(screen.queryByText('Install')).not.toBeInTheDocument()
    })

    it('keeps the button when the user dismisses', async () => {
      render(<App />)
      const evt = fireInstallEvent('dismissed')
      await act(async () => {
        fireEvent.click(screen.getByText('Install'))
        await evt.userChoice
      })
      expect(screen.getByText('Install')).toBeInTheDocument()
    })
  })
})
