import { screen, fireEvent, act } from '@testing-library/react'
import { FileMenu } from './FileMenu'
import { renderWithEditor } from '../../test-utils'

interface MockHandle {
  handle: FileSystemFileHandle
  writeFn: jest.Mock
  closeFn: jest.Mock
}

function createMockHandle(name = 'untitled.txt'): MockHandle {
  const writeFn = jest.fn().mockResolvedValue(undefined)
  const closeFn = jest.fn().mockResolvedValue(undefined)
  const handle = {
    name,
    createWritable: jest.fn().mockResolvedValue({ write: writeFn, close: closeFn }),
  } as unknown as FileSystemFileHandle
  return { handle, writeFn, closeFn }
}

function createMockReadHandle(content: string, name = 'file.txt') {
  return {
    name,
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
    it('calls newTab when File->New is clicked', () => {
      const newTab = jest.fn()
      renderWithEditor(<FileMenu />, { newTab })
      fireEvent.click(screen.getByText('New'))
      expect(newTab).toHaveBeenCalled()
    })

    it('calls newTab even when text is non-empty', () => {
      const newTab = jest.fn()
      renderWithEditor(<FileMenu />, { text: 'some content', newTab })
      fireEvent.click(screen.getByText('New'))
      expect(newTab).toHaveBeenCalled()
      expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
    })
  })

  describe('Open action', () => {
    it('opens file via showOpenFilePicker and calls openTab', async () => {
      const readHandle = createMockReadHandle('file content here', 'notes.txt')
      ;(window as typeof window & { showOpenFilePicker: jest.Mock }).showOpenFilePicker = jest.fn().mockResolvedValue([readHandle])
      const openTab = jest.fn()

      renderWithEditor(<FileMenu />, { openTab })
      fireEvent.click(screen.getByText('Open'))
      await flush()

      expect(openTab).toHaveBeenCalledWith({
        fileName: 'notes.txt',
        text: 'file content here',
        fileHandle: readHandle,
      })
    })

    it('falls back to file input when showOpenFilePicker is unavailable', async () => {
      const openTab = jest.fn()
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

      renderWithEditor(<FileMenu />, { openTab })
      fireEvent.click(screen.getByText('Open'))
      await flush()

      expect(clickSpy).toHaveBeenCalled()

      const inputEl = spy.mock.results.find((_r, i) => spy.mock.calls[i]![0] === 'input')!.value as HTMLInputElement
      fireEvent.change(inputEl)
      await flush()

      expect(openTab).toHaveBeenCalledWith({
        fileName: 'Untitled',
        text: 'fallback file content',
        fileHandle: null,
      })
    })

    it('falls back to file input and does nothing when user cancels', async () => {
      const openTab = jest.fn()
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

      renderWithEditor(<FileMenu />, { openTab })
      fireEvent.click(screen.getByText('Open'))
      await flush()

      const inputEl = spy.mock.results.find((_r, i) => spy.mock.calls[i]![0] === 'input')!.value as HTMLInputElement
      fireEvent.change(inputEl)
      await flush()

      expect(openTab).not.toHaveBeenCalled()
    })
  })

  describe('Save action', () => {
    it('prompts file picker on first save and calls updateActiveTab', async () => {
      const { handle, writeFn, closeFn } = createMockHandle('untitled.txt')
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = jest.fn().mockResolvedValue(handle)
      const updateActiveTab = jest.fn()

      renderWithEditor(<FileMenu />, { text: 'hello world', updateActiveTab })
      fireEvent.click(screen.getByText('Save'))
      await flush()

      expect(writeFn).toHaveBeenCalledWith('hello world')
      expect(closeFn).toHaveBeenCalled()
      expect(updateActiveTab).toHaveBeenCalledWith({
        fileHandle: handle,
        fileName: 'untitled.txt',
        savedText: 'hello world',
      })
    })

    it('reuses stored handle on subsequent saves without prompting', async () => {
      const { handle, writeFn } = createMockHandle()
      const pickerMock = jest.fn().mockResolvedValue(handle)
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = pickerMock
      const updateActiveTab = jest.fn()

      renderWithEditor(<FileMenu />, { text: 'first save', fileHandle: handle, updateActiveTab })
      fireEvent.click(screen.getByText('Save'))
      await flush()

      expect(pickerMock).not.toHaveBeenCalled()
      expect(writeFn).toHaveBeenCalledWith('first save')
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
    it('always prompts file picker and calls updateActiveTab', async () => {
      const { handle, writeFn } = createMockHandle('my-file.txt')
      ;(window as typeof window & { showSaveFilePicker: jest.Mock }).showSaveFilePicker = jest.fn().mockResolvedValue(handle)
      const updateActiveTab = jest.fn()

      renderWithEditor(<FileMenu />, { text: 'my text', updateActiveTab })
      fireEvent.click(screen.getByText('Save As'))
      await flush()

      expect(writeFn).toHaveBeenCalledWith('my text')
      expect(updateActiveTab).toHaveBeenCalledWith({
        fileHandle: handle,
        fileName: 'my-file.txt',
        savedText: 'my text',
      })
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
