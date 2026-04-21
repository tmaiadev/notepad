import { render, screen, fireEvent } from '@testing-library/react'
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

const flush = () => new Promise(r => setTimeout(r, 0))

const defaultProps = { text: '', onTextChange: jest.fn() }

describe('FileMenu', () => {
  afterEach(() => {
    delete window.showSaveFilePicker
    delete window.showOpenFilePicker
    if (document.createElement.mockRestore) document.createElement.mockRestore()
  })

  it('renders "File" button and all 4 items', () => {
    render(<FileMenu {...defaultProps} />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Save As')).toBeInTheDocument()
  })

  it('renders keyboard shortcuts', () => {
    render(<FileMenu {...defaultProps} />)
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('O')).toBeInTheDocument()
    const sKeys = screen.getAllByText('S')
    expect(sKeys.length).toBe(2)
  })

  it('renders shift modifier for Save As', () => {
    render(<FileMenu {...defaultProps} />)
    const abbrs = screen.getAllByTestId('Kbd.Abbr')
    const shiftAbbr = abbrs.find(el => el.getAttribute('data-key') === 'shift')
    expect(shiftAbbr).toBeTruthy()
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

      // Open a file
      fireEvent.click(screen.getByText('Open'))
      await flush()

      // Save should reuse the opened handle
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

      // Simulate the change event on the created input
      const createCalls = document.createElement.mock.calls
      const inputCall = createCalls.find(([tag]) => tag === 'input')
      expect(inputCall).toBeTruthy()

      // The input's change listener was added; fire it
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
