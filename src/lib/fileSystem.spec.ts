import { openFile } from './fileSystem'

afterEach(() => {
  ;(window as unknown as Record<string, unknown>).showOpenFilePicker = undefined
  ;(window as unknown as Record<string, unknown>).showSaveFilePicker = undefined
})

describe('openFile', () => {
  it('returns null when the picker yields no handle', async () => {
    ;(window as unknown as Record<string, unknown>).showOpenFilePicker = jest.fn().mockResolvedValue([])
    const result = await openFile()
    expect(result).toBeNull()
  })
})
