import { render, screen, fireEvent } from '@testing-library/react'
import FileMenu from './FileMenu'

describe('FileMenu', () => {
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
    it('calls showSaveFilePicker with correct options when available', async () => {
      const writeFn = jest.fn().mockResolvedValue(undefined)
      const closeFn = jest.fn().mockResolvedValue(undefined)
      const mockHandle = {
        createWritable: jest.fn().mockResolvedValue({ write: writeFn, close: closeFn }),
      }
      window.showSaveFilePicker = jest.fn().mockResolvedValue(mockHandle)

      render(<FileMenu text="hello world" />)
      fireEvent.click(screen.getByText('Save'))

      await new Promise(r => setTimeout(r, 0))

      expect(window.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: 'untitled.txt',
        types: [
          {
            description: 'Text Files',
            accept: { 'text/plain': ['.txt', '.md'] },
          },
        ],
      })
      expect(writeFn).toHaveBeenCalledWith('hello world')
      expect(closeFn).toHaveBeenCalled()

      delete window.showSaveFilePicker
    })

    it('falls back to download link when showSaveFilePicker is unavailable', async () => {
      delete window.showSaveFilePicker

      const mockUrl = 'blob:http://localhost/fake'
      const createObjectURL = jest.fn().mockReturnValue(mockUrl)
      const revokeObjectURL = jest.fn()
      global.URL.createObjectURL = createObjectURL
      global.URL.revokeObjectURL = revokeObjectURL

      const clickSpy = jest.fn()
      const origCreateElement = document.createElement.bind(document)
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        const el = origCreateElement(tag)
        if (tag === 'a') {
          el.click = clickSpy
        }
        return el
      })

      render(<FileMenu text="fallback content" />)
      fireEvent.click(screen.getByText('Save'))

      await new Promise(r => setTimeout(r, 0))

      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      const blob = createObjectURL.mock.calls[0][0]
      const blobText = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsText(blob)
      })
      expect(blobText).toBe('fallback content')
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURL).toHaveBeenCalledWith(mockUrl)

      document.createElement.mockRestore()
    })
  })
})
