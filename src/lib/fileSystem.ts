const TEXT_FILE_TYPES: FilePickerAcceptType[] = [
  {
    description: 'Text Files',
    accept: { 'text/plain': ['.txt', '.md'] },
  },
]

const DEFAULT_FILENAME = 'untitled.txt'

const SAVE_PICKER_OPTS: SaveFilePickerOptions = {
  suggestedName: DEFAULT_FILENAME,
  types: TEXT_FILE_TYPES,
}

const OPEN_PICKER_OPTS: OpenFilePickerOptions = {
  types: TEXT_FILE_TYPES,
  multiple: false,
}

export interface OpenResult {
  content: string
  handle: FileSystemFileHandle | null
}

export async function openFile(): Promise<OpenResult | null> {
  if (typeof window.showOpenFilePicker === 'function') {
    const [handle] = await window.showOpenFilePicker(OPEN_PICKER_OPTS)
    if (!handle) return null
    const file = await handle.getFile()
    return { content: await file.text(), handle }
  }

  return openWithFallbackInput()
}

function openWithFallbackInput(): Promise<OpenResult | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt,.md'
    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      resolve({ content: await file.text(), handle: null })
    })
    input.click()
  })
}

export async function saveFile(
  text: string,
  existingHandle: FileSystemFileHandle | null,
): Promise<FileSystemFileHandle | null> {
  if (existingHandle) {
    await writeToHandle(existingHandle, text)
    return existingHandle
  }
  return saveFileAs(text)
}

export async function saveFileAs(text: string): Promise<FileSystemFileHandle | null> {
  if (typeof window.showSaveFilePicker === 'function') {
    const handle = await window.showSaveFilePicker(SAVE_PICKER_OPTS)
    await writeToHandle(handle, text)
    return handle
  }
  downloadFallback(text)
  return null
}

export async function syncFile(text: string, handle: FileSystemFileHandle): Promise<void> {
  return writeToHandle(handle, text)
}

async function writeToHandle(handle: FileSystemFileHandle, text: string): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(text)
  await writable.close()
}

function downloadFallback(text: string): void {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = DEFAULT_FILENAME
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
