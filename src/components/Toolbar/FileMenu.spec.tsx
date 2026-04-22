import { screen, fireEvent, act } from '@testing-library/react'
import { FileMenu } from './FileMenu'
import { renderWithEditor } from '../../test-utils'

interface MockHandle {
  handle: FileSystemFileHandle
  writeFn: jest.Mock
  closeFn: jest.Mock
}

function createMockHandle(): MockHandle {
  const writeFn = jest.fn().mockResolvedValue(undefined)
  const closeFn = jest.fn().mockResolvedValue(undefined)
  const handle = {
    createWritable: jest.fn().mockResolvedValue({ write: writeFn, close: closeFn }),
  } as unknown as FileSystemFileHandle
  return { handle, writeFn, closeFn }
}

function createMockReadHandle(content: string) {
  return {
    getFile: jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(content),
    }),
  } as unknown as FileSystemFileHandle & {
    createWritable?: jest.Mock
  }
}

interface FallbackMocks {
  createObjectURL: jest.Mock
  revokeObjectURL: jest.Mock
  clickSpy: jest.Mock
  mockUrl: string
}

function setupFallbackMocks(): FallbackMocks {
  const mockUrl = 'blob:http://localhost/fake'
  const createObjectURL = jest.fn().mockReturnValue(mockUrl)
  const revokeObjectURL = jest.fn()
  ;(global as { URL: typeof URL }).URL.createObjectURL = createObjectURL
  ;(global as { URL: typeof URL }).URL.revokeObjectURL = revokeObjectURL

  const clickSpy = jest.fn()
  const origCreateElement = document.createElement.bind(document)
  jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    const el = origCreateElement(tag as 'a')
    if (tag === 'a') (el as HTMLAnchorElement).click = clickSpy
    return el
  })

  return { createObjectURL, revokeObjectURL, clickSpy, mockUrl }
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsText(blob)
  })
}

const flush = () => act(() => new Promise((r) => setTimeout(r, 0)))

describe('FileMenu', () => {
  afterEach(() => {
    ;(window as unknown as Record<string, unknown>).showSaveFilePicker = undefined
    ;(window as unknown as Record<string, unknown>).showOpenFilePicker = undefined
    ;(document.createElement as jest.Mock & typeof document.createElement).mockRestore?.()
    localStorage.clear()
  })

  it('renders "File" button and all 4 items', () => {
    renderWithEditor(<FileMenu />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Save As')).toBeInTheDocument()
  })

  it('renders keyboard shortcuts only for Save and Save As', () => {
    renderWithEditor(<FileMenu />)
    expect(screen.queryByText('N')).not.toBeInTheDocument()
    expect(screen.queryByText('O')).not.toBeInTheDocument()
    expect(screen.getAllByText('S')).toHaveLength(2)
  })

  it('renders shift modifier for Save As', () => {
    renderWithEditor(<FileMenu />)
    const abbrs = screen.getAllByTestId('Kbd.Abbr')
    const shiftAbbr = abbrs.find((el) => el.getAttribute('data-key') === 'shift')
    expect(shiftAbbr).toBeTruthy()
  })

  describe('keyboard shortcuts', () => {
    it('Cmd+S triggers save', async () => {
      const { clickSpy } = setupFallbackMocks()
      renderWithEditor(<FileMenu />, { text: 'my content' })
      fireEvent.keyDown(document, { key: 's', metaKey: true })
      await flush()
      expect(clickSpy).toHaveBeenCalled()
    })

    it('Ctrl+S triggers save (Windows/Linux)', async () => {
      const { clickSpy } = setupFallbackMocks()
      renderWithEditor(<FileMenu />, { text: 'my content' })
      fireEvent.keyDown(document, { key: 's', ctrlKey: true })
      await flush()
      expect(clickSpy).toHaveBeenCalled()
    })

    it('Cmd+Shift+S triggers save as', async () => {
      const { clickSpy } = setupFallbackMocks()
      renderWithEditor(<FileMenu />, { text: 'my content' })
      fireEvent.keyDown(document, { key: 'S', metaKey: true, shiftKey: true })
      await flush()
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('New action', () => {
    it('clears immediately when text is empty', () => {
      const clearText = jest.fn()
      renderWithEditor(<FileMenu />, { text: '', clearText })
      fireEvent.click(screen.getByText('New'))
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
      expect(clearText).toHaveBeenCalled()
    })

    it('shows confirmation dialog when text is not empty', () => {
      renderWithEditor(<FileMenu />, { text: 'some content' })
      fireEvent.click(screen.getByText('New'))
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
      expect(screen.getByText(/Do you want to save your changes/)).toBeInTheDocument()
    })

    it('Cancel closes dialog without changing anything', () => {
      const clearText = jest.fn()
      renderWithEditor(<FileMenu />, { text: 'keep me', clearText })
      fireEvent.click(screen.getByText('New'))
      expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Cancel'))
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
      expect(clearText).not.toHaveBeenCalled()
    })

    it('No discards content and closes dialog', () => {
      const clearText = jest.fn()
      renderWithEditor(<FileMenu />, { text: 'old stuff', clearText })
      fireEvent.click(screen.getByText('New'))
      fireEvent.click(screen.getByText('No'))
      expect(clearText).toHaveBeenCalled()
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
    })

    it('Yes saves then clears content and closes dialog', async () => {
      const { handle, writeFn } = createMockHandle()
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = jest.fn().mockResolvedValue(handle)
      const clearText = jest.fn()
      renderWithEditor(<FileMenu />, { text: 'save me', clearText })
      fireEvent.click(screen.getByText('New'))
      fireEvent.click(screen.getByText('Yes'))
      await flush()
      expect((window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker).toHaveBeenCalled()
      expect(writeFn).toHaveBeenCalledWith('save me')
      expect(clearText).toHaveBeenCalled()
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
    })

    it('Yes + Save clears the stored handle so next Save prompts picker', async () => {
      const { handle: firstHandle, writeFn: firstWriteFn } = createMockHandle()
      const { handle: secondHandle } = createMockHandle()
      const pickerMock = jest.fn()
        .mockResolvedValueOnce(firstHandle)
        .mockResolvedValueOnce(secondHandle)
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = pickerMock
      renderWithEditor(<FileMenu />, { text: 'content' })

      fireEvent.click(screen.getByText('New'))
      fireEvent.click(screen.getByText('Yes'))
      await flush()
      expect(firstWriteFn).toHaveBeenCalledWith('content')

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(pickerMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('Open action', () => {
    it('opens file via showOpenFilePicker and sets text', async () => {
      const readHandle = createMockReadHandle('file content here')
      ;(window as typeof window & { showOpenFilePicker: jest.Mock }).showOpenFilePicker = jest.fn().mockResolvedValue([readHandle])
      const setText = jest.fn()

      renderWithEditor(<FileMenu />, { text: '', setText })
      fireEvent.click(screen.getByText('Open'))
      await flush()

      expect((window as typeof window & { showOpenFilePicker: jest.Mock }).showOpenFilePicker).toHaveBeenCalledWith({
        types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt', '.md'] } }],
        multiple: false,
      })
      expect(readHandle.getFile).toHaveBeenCalled()
      expect(setText).toHaveBeenCalledWith('file content here')
    })

    it('stores opened file handle so Save reuses it', async () => {
      const readHandle = createMockReadHandle('opened text')
      const writeFn = jest.fn().mockResolvedValue(undefined)
      const closeFn = jest.fn().mockResolvedValue(undefined)
      readHandle.createWritable = jest.fn().mockResolvedValue({ write: writeFn, close: closeFn })
      ;(window as typeof window & { showOpenFilePicker: jest.Mock }).showOpenFilePicker = jest.fn().mockResolvedValue([readHandle])
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = jest.fn()

      renderWithEditor(<FileMenu />, { text: 'opened text' })

      fireEvent.click(screen.getByText('Open'))
      await flush()

      fireEvent.click(screen.getByText('Save'))
      await flush()

      expect((window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker).not.toHaveBeenCalled()
      expect(writeFn).toHaveBeenCalledWith('opened text')
      expect(closeFn).toHaveBeenCalled()
    })

    it('falls back to file input when showOpenFilePicker is unavailable', async () => {
      const setText = jest.fn()
      const clickSpy = jest.fn()
      const origCreateElement = document.createElement.bind(document)
      const spy = jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = origCreateElement(tag as 'input')
        if (tag === 'input') {
          ;(el as HTMLInputElement).click = clickSpy
          Object.defineProperty(el, 'files', {
            get: () => [{ text: () => Promise.resolve('fallback file content') }],
          })
        }
        return el
      })

      renderWithEditor(<FileMenu />, { text: '', setText })
      fireEvent.click(screen.getByText('Open'))
      await flush()

      expect(clickSpy).toHaveBeenCalled()

      const inputCall = spy.mock.calls.find(([tag]) => tag === 'input')
      expect(inputCall).toBeTruthy()

      const inputEl = spy.mock.results.find((_r, i) => spy.mock.calls[i]![0] === 'input')!.value as HTMLInputElement
      fireEvent.change(inputEl)
      await flush()

      expect(setText).toHaveBeenCalledWith('fallback file content')
    })

    it('falls back to file input and does nothing when user cancels', async () => {
      const setText = jest.fn()
      const clickSpy = jest.fn()
      const origCreateElement = document.createElement.bind(document)
      const spy = jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = origCreateElement(tag as 'input')
        if (tag === 'input') {
          ;(el as HTMLInputElement).click = clickSpy
          Object.defineProperty(el, 'files', { get: () => [] })
        }
        return el
      })

      renderWithEditor(<FileMenu />, { text: '', setText })
      fireEvent.click(screen.getByText('Open'))
      await flush()

      const inputEl = spy.mock.results.find((_r, i) => spy.mock.calls[i]![0] === 'input')!.value as HTMLInputElement
      fireEvent.change(inputEl)
      await flush()

      expect(setText).not.toHaveBeenCalled()
    })
  })

  describe('Save action', () => {
    it('prompts file picker on first save and writes content', async () => {
      const { handle, writeFn, closeFn } = createMockHandle()
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = jest.fn().mockResolvedValue(handle)

      renderWithEditor(<FileMenu />, { text: 'hello world' })
      fireEvent.click(screen.getByText('Save'))
      await flush()

      expect((window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: 'untitled.txt',
        types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt', '.md'] } }],
      })
      expect(writeFn).toHaveBeenCalledWith('hello world')
      expect(closeFn).toHaveBeenCalled()
    })

    it('reuses stored handle on subsequent saves without prompting', async () => {
      const { handle, writeFn } = createMockHandle()
      const pickerMock = jest.fn().mockResolvedValue(handle)
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = pickerMock
      renderWithEditor(<FileMenu />, { text: 'first save' })

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(pickerMock).toHaveBeenCalledTimes(1)
      expect(writeFn).toHaveBeenCalledWith('first save')

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(pickerMock).toHaveBeenCalledTimes(1)
      expect(writeFn).toHaveBeenCalledTimes(2)
    })

    it('falls back to download link when showSaveFilePicker is unavailable', async () => {
      const { createObjectURL, revokeObjectURL, clickSpy, mockUrl } = setupFallbackMocks()

      renderWithEditor(<FileMenu />, { text: 'fallback content' })
      fireEvent.click(screen.getByText('Save'))
      await flush()

      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      const blobText = await readBlob(createObjectURL.mock.calls[0]![0] as Blob)
      expect(blobText).toBe('fallback content')
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })
  })

  describe('Save As action', () => {
    it('always prompts file picker even when a handle exists', async () => {
      const { handle: firstHandle, writeFn: firstWriteFn } = createMockHandle()
      const { handle: secondHandle, writeFn: secondWriteFn } = createMockHandle()
      const pickerMock = jest.fn()
        .mockResolvedValueOnce(firstHandle)
        .mockResolvedValueOnce(secondHandle)
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = pickerMock

      renderWithEditor(<FileMenu />, { text: 'my text' })

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(firstWriteFn).toHaveBeenCalledWith('my text')

      fireEvent.click(screen.getByText('Save As'))
      await flush()
      expect(pickerMock).toHaveBeenCalledTimes(2)
      expect(secondWriteFn).toHaveBeenCalledWith('my text')
    })

    it('updates stored handle so next Save uses the new file', async () => {
      const { handle: firstHandle, writeFn: firstWriteFn } = createMockHandle()
      const { handle: secondHandle, writeFn: secondWriteFn } = createMockHandle()
      const pickerMock = jest.fn()
        .mockResolvedValueOnce(firstHandle)
        .mockResolvedValueOnce(secondHandle)
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = pickerMock

      renderWithEditor(<FileMenu />, { text: 'content' })

      fireEvent.click(screen.getByText('Save'))
      await flush()

      fireEvent.click(screen.getByText('Save As'))
      await flush()

      fireEvent.click(screen.getByText('Save'))
      await flush()
      expect(pickerMock).toHaveBeenCalledTimes(2)
      expect(firstWriteFn).toHaveBeenCalledTimes(1)
      expect(secondWriteFn).toHaveBeenCalledTimes(2)
    })

    it('falls back to download link when showSaveFilePicker is unavailable', async () => {
      const { createObjectURL, revokeObjectURL, clickSpy, mockUrl } = setupFallbackMocks()

      renderWithEditor(<FileMenu />, { text: 'save as fallback' })
      fireEvent.click(screen.getByText('Save As'))
      await flush()

      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      const blobText = await readBlob(createObjectURL.mock.calls[0]![0] as Blob)
      expect(blobText).toBe('save as fallback')
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })
  })
})
