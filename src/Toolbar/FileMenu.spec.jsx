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

describe('FileMenu', () => {
  afterEach(() => {
    delete window.showSaveFilePicker
    if (document.createElement.mockRestore) document.createElement.mockRestore()
  })

  it('renders "File" button and all 4 items', () => {
    render(<FileMenu text="" />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Save As')).toBeInTheDocument()
  })

  it('renders keyboard shortcuts', () => {
    render(<FileMenu text="" />)
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('O')).toBeInTheDocument()
    const sKeys = screen.getAllByText('S')
    expect(sKeys.length).toBe(2)
  })

  it('renders shift modifier for Save As', () => {
    render(<FileMenu text="" />)
    const abbrs = screen.getAllByTestId('Kbd.Abbr')
    const shiftAbbr = abbrs.find(el => el.getAttribute('data-key') === 'shift')
    expect(shiftAbbr).toBeTruthy()
  })

  describe('Save action', () => {
    it('prompts file picker on first save and writes content', async () => {
      const { handle, writeFn, closeFn } = createMockHandle()
      window.showSaveFilePicker = jest.fn().mockResolvedValue(handle)

      render(<FileMenu text="hello world" />)
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

      render(<FileMenu text="first save" />)

      // First save — should prompt
      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(1)
      expect(writeFn).toHaveBeenCalledWith('first save')

      // Second save — should reuse handle, no prompt
      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(1)
      expect(writeFn).toHaveBeenCalledTimes(2)
    })

    it('falls back to download link when showSaveFilePicker is unavailable', async () => {
      const { createObjectURL, revokeObjectURL, clickSpy, mockUrl } = setupFallbackMocks()

      render(<FileMenu text="fallback content" />)
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

      render(<FileMenu text="my text" />)

      // Save first to store a handle
      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(firstWriteFn).toHaveBeenCalledWith('my text')

      // Save As should still prompt
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

      render(<FileMenu text="content" />)

      // Save → stores firstHandle
      fireEvent.click(screen.getByText('Save'))
      await flush()

      // Save As → stores secondHandle
      fireEvent.click(screen.getByText('Save As'))
      await flush()

      // Save again → should reuse secondHandle, not firstHandle
      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(2)
      expect(firstWriteFn).toHaveBeenCalledTimes(1)
      expect(secondWriteFn).toHaveBeenCalledTimes(2)
    })

    it('falls back to download link when showSaveFilePicker is unavailable', async () => {
      const { createObjectURL, revokeObjectURL, clickSpy, mockUrl } = setupFallbackMocks()

      render(<FileMenu text="save as fallback" />)
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
