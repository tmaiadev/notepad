import { render, screen, fireEvent, act } from '@testing-library/react'
import FileMenu from './FileMenu'

function createMockHandle() {
  const writeFn = jest.fn().mockResolvedValue(undefined)
  const closeFn = jest.fn().mockResolvedValue(undefined)
  return {
    handle: {
      createWritable: jest.fn().mockResolvedValue({ write: writeFn, close: closeFn }),
    },
    writeFn,
    closeFn,
  }
}

function createMockReadHandle(content) {
  return {
    getFile: jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(content),
    }),
  }
}

function setupFallbackMocks() {
  const mockUrl = 'blob:http://localhost/fake'
  const createObjectURL = jest.fn().mockReturnValue(mockUrl)
  const revokeObjectURL = jest.fn()
  global.URL.createObjectURL = createObjectURL
  global.URL.revokeObjectURL = revokeObjectURL

  const clickSpy = jest.fn()
  const origCreateElement = document.createElement.bind(document)
  jest.spyOn(document, 'createElement').mockImplementation((tag) => {
    const el = origCreateElement(tag)
    if (tag === 'a') el.click = clickSpy
    return el
  })

  return { createObjectURL, revokeObjectURL, clickSpy, mockUrl }
}

async function readBlob(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsText(blob)
  })
}

const flush = () => act(() => new Promise(r => setTimeout(r, 0)))

const defaultProps = { text: '', onTextChange: jest.fn() }

describe('FileMenu', () => {
  afterEach(() => {
    delete window.showSaveFilePicker
    delete window.showOpenFilePicker
    if (document.createElement.mockRestore) document.createElement.mockRestore()
    localStorage.clear()
  })

  it('renders "File" button and all 4 items', () => {
    render(<FileMenu {...defaultProps} />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Save As')).toBeInTheDocument()
  })

  it('renders keyboard shortcuts only for Save and Save As', () => {
    render(<FileMenu {...defaultProps} />)
    expect(screen.queryByText('N')).not.toBeInTheDocument()
    expect(screen.queryByText('O')).not.toBeInTheDocument()
    expect(screen.getAllByText('S')).toHaveLength(2)
  })

  it('renders shift modifier for Save As', () => {
    render(<FileMenu {...defaultProps} />)
    const abbrs = screen.getAllByTestId('Kbd.Abbr')
    const shiftAbbr = abbrs.find(el => el.getAttribute('data-key') === 'shift')
    expect(shiftAbbr).toBeTruthy()
  })

  describe('keyboard shortcuts', () => {
    it('Cmd+S triggers save', async () => {
      const { clickSpy } = setupFallbackMocks()
      render(<FileMenu text="my content" onTextChange={jest.fn()} />)
      fireEvent.keyDown(document, { key: 's', metaKey: true })
      await flush()
      expect(clickSpy).toHaveBeenCalled()
    })

    it('Ctrl+S triggers save (Windows/Linux)', async () => {
      const { clickSpy } = setupFallbackMocks()
      render(<FileMenu text="my content" onTextChange={jest.fn()} />)
      fireEvent.keyDown(document, { key: 's', ctrlKey: true })
      await flush()
      expect(clickSpy).toHaveBeenCalled()
    })

    it('Cmd+Shift+S triggers save as', async () => {
      const { clickSpy } = setupFallbackMocks()
      render(<FileMenu text="my content" onTextChange={jest.fn()} />)
      fireEvent.keyDown(document, { key: 'S', metaKey: true, shiftKey: true })
      await flush()
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('New action', () => {
    it('resets immediately when text is empty', () => {
      const onTextChange = jest.fn()
      localStorage.setItem('notepad', '')

      render(<FileMenu text="" onTextChange={onTextChange} />)
      fireEvent.click(screen.getByText('New'))

      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
      expect(onTextChange).toHaveBeenCalledWith('')
      expect(localStorage.getItem('notepad')).toBeNull()
    })

    it('shows confirmation dialog when text is not empty', () => {
      render(<FileMenu text="some content" onTextChange={jest.fn()} />)
      fireEvent.click(screen.getByText('New'))

      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
      expect(screen.getByText(/Do you want to save your changes/)).toBeInTheDocument()
    })

    it('Cancel closes dialog without changing anything', () => {
      const onTextChange = jest.fn()
      render(<FileMenu text="keep me" onTextChange={onTextChange} />)

      fireEvent.click(screen.getByText('New'))
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Cancel'))
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
      expect(onTextChange).not.toHaveBeenCalled()
    })

    it('No discards content, clears localStorage, and closes dialog', () => {
      const onTextChange = jest.fn()
      localStorage.setItem('notepad', 'old stuff')

      render(<FileMenu text="old stuff" onTextChange={onTextChange} />)
      fireEvent.click(screen.getByText('New'))
      fireEvent.click(screen.getByText('No'))

      expect(onTextChange).toHaveBeenCalledWith('')
      expect(localStorage.getItem('notepad')).toBeNull()
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
    })

    it('Yes saves then resets content, clears localStorage, and closes dialog', async () => {
      const { handle, writeFn } = createMockHandle()
      window.showSaveFilePicker = jest.fn().mockResolvedValue(handle)
      const onTextChange = jest.fn()
      localStorage.setItem('notepad', 'save me')

      render(<FileMenu text="save me" onTextChange={onTextChange} />)
      fireEvent.click(screen.getByText('New'))
      fireEvent.click(screen.getByText('Yes'))
      await flush()

      expect(window.showSaveFilePicker).toHaveBeenCalled()
      expect(writeFn).toHaveBeenCalledWith('save me')
      expect(onTextChange).toHaveBeenCalledWith('')
      expect(localStorage.getItem('notepad')).toBeNull()
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
    })

    it('Yes + Save clears fileHandleRef so next Save prompts picker', async () => {
      const { handle: firstHandle, writeFn: firstWriteFn } = createMockHandle()
      const { handle: secondHandle } = createMockHandle()
      window.showSaveFilePicker = jest.fn()
        .mockResolvedValueOnce(firstHandle)
        .mockResolvedValueOnce(secondHandle)
      const onTextChange = jest.fn()

      render(<FileMenu text="content" onTextChange={onTextChange} />)

      // New → Yes saves and resets
      fireEvent.click(screen.getByText('New'))
      fireEvent.click(screen.getByText('Yes'))
      await flush()
      expect(firstWriteFn).toHaveBeenCalledWith('content')

      // Next Save should prompt picker again since handle was cleared
      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(2)
    })
  })

  describe('Open action', () => {
    it('opens file via showOpenFilePicker and calls onTextChange with content', async () => {
      const readHandle = createMockReadHandle('file content here')
      window.showOpenFilePicker = jest.fn().mockResolvedValue([readHandle])
      const onTextChange = jest.fn()

      render(<FileMenu text="" onTextChange={onTextChange} />)
      fireEvent.click(screen.getByText('Open'))
      await flush()

      expect(window.showOpenFilePicker).toHaveBeenCalledWith({
        types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt', '.md'] } }],
        multiple: false,
      })
      expect(readHandle.getFile).toHaveBeenCalled()
      expect(onTextChange).toHaveBeenCalledWith('file content here')
    })

    it('stores opened file handle so Save reuses it', async () => {
      const readHandle = createMockReadHandle('opened text')
      const writeFn = jest.fn().mockResolvedValue(undefined)
      const closeFn = jest.fn().mockResolvedValue(undefined)
      readHandle.createWritable = jest.fn().mockResolvedValue({ write: writeFn, close: closeFn })
      window.showOpenFilePicker = jest.fn().mockResolvedValue([readHandle])
      window.showSaveFilePicker = jest.fn()

      render(<FileMenu text="opened text" onTextChange={jest.fn()} />)

      fireEvent.click(screen.getByText('Open'))
      await flush()

      fireEvent.click(screen.getByText('Save'))
      await flush()

      expect(window.showSaveFilePicker).not.toHaveBeenCalled()
      expect(writeFn).toHaveBeenCalledWith('opened text')
      expect(closeFn).toHaveBeenCalled()
    })

    it('falls back to file input when showOpenFilePicker is unavailable', async () => {
      const onTextChange = jest.fn()
      const clickSpy = jest.fn()
      const origCreateElement = document.createElement.bind(document)

      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        const el = origCreateElement(tag)
        if (tag === 'input') {
          el.click = clickSpy
          Object.defineProperty(el, 'files', {
            get: () => [{ text: () => Promise.resolve('fallback file content') }],
          })
        }
        return el
      })

      render(<FileMenu text="" onTextChange={onTextChange} />)
      fireEvent.click(screen.getByText('Open'))
      await flush()

      expect(clickSpy).toHaveBeenCalled()

      const createCalls = document.createElement.mock.calls
      const inputCall = createCalls.find(([tag]) => tag === 'input')
      expect(inputCall).toBeTruthy()

      const inputEl = document.createElement.mock.results.find(
        (r, i) => createCalls[i][0] === 'input'
      ).value
      fireEvent.change(inputEl)
      await flush()

      expect(onTextChange).toHaveBeenCalledWith('fallback file content')
    })
  })

  describe('Save action', () => {
    it('prompts file picker on first save and writes content', async () => {
      const { handle, writeFn, closeFn } = createMockHandle()
      window.showSaveFilePicker = jest.fn().mockResolvedValue(handle)

      render(<FileMenu text="hello world" onTextChange={jest.fn()} />)
      fireEvent.click(screen.getByText('Save'))
      await flush()

      expect(window.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: 'untitled.txt',
        types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt', '.md'] } }],
      })
      expect(writeFn).toHaveBeenCalledWith('hello world')
      expect(closeFn).toHaveBeenCalled()
    })

    it('reuses stored handle on subsequent saves without prompting', async () => {
      const { handle, writeFn } = createMockHandle()
      window.showSaveFilePicker = jest.fn().mockResolvedValue(handle)

      render(<FileMenu text="first save" onTextChange={jest.fn()} />)

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(1)
      expect(writeFn).toHaveBeenCalledWith('first save')

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(1)
      expect(writeFn).toHaveBeenCalledTimes(2)
    })

    it('falls back to download link when showSaveFilePicker is unavailable', async () => {
      const { createObjectURL, revokeObjectURL, clickSpy, mockUrl } = setupFallbackMocks()

      render(<FileMenu text="fallback content" onTextChange={jest.fn()} />)
      fireEvent.click(screen.getByText('Save'))
      await flush()

      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      const blobText = await readBlob(createObjectURL.mock.calls[0][0])
      expect(blobText).toBe('fallback content')
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })
  })

  describe('Save As action', () => {
    it('always prompts file picker even when a handle exists', async () => {
      const { handle: firstHandle, writeFn: firstWriteFn } = createMockHandle()
      const { handle: secondHandle, writeFn: secondWriteFn } = createMockHandle()
      window.showSaveFilePicker = jest.fn()
        .mockResolvedValueOnce(firstHandle)
        .mockResolvedValueOnce(secondHandle)

      render(<FileMenu text="my text" onTextChange={jest.fn()} />)

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(firstWriteFn).toHaveBeenCalledWith('my text')

      fireEvent.click(screen.getByText('Save As'))
      await flush()
      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(2)
      expect(secondWriteFn).toHaveBeenCalledWith('my text')
    })

    it('updates stored handle so next Save uses the new file', async () => {
      const { handle: firstHandle, writeFn: firstWriteFn } = createMockHandle()
      const { handle: secondHandle, writeFn: secondWriteFn } = createMockHandle()
      window.showSaveFilePicker = jest.fn()
        .mockResolvedValueOnce(firstHandle)
        .mockResolvedValueOnce(secondHandle)

      render(<FileMenu text="content" onTextChange={jest.fn()} />)

      fireEvent.click(screen.getByText('Save'))
      await flush()

      fireEvent.click(screen.getByText('Save As'))
      await flush()

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(2)
      expect(firstWriteFn).toHaveBeenCalledTimes(1)
      expect(secondWriteFn).toHaveBeenCalledTimes(2)
    })

    it('falls back to download link when showSaveFilePicker is unavailable', async () => {
      const { createObjectURL, revokeObjectURL, clickSpy, mockUrl } = setupFallbackMocks()

      render(<FileMenu text="save as fallback" onTextChange={jest.fn()} />)
      fireEvent.click(screen.getByText('Save As'))
      await flush()

      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      const blobText = await readBlob(createObjectURL.mock.calls[0][0])
      expect(blobText).toBe('save as fallback')
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })
  })
})
