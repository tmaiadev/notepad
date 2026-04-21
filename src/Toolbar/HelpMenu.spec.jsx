import { render, screen, fireEvent } from '@testing-library/react'
import HelpMenu from './HelpMenu'

describe('HelpMenu', () => {
  it('renders "Help" button and both menu items', () => {
    render(<HelpMenu />)
    expect(screen.getByText('Help')).toBeInTheDocument()
    expect(screen.getByText('Cheat Sheet')).toBeInTheDocument()
    expect(screen.getByText('Source Code')).toBeInTheDocument()
  })

  describe('Source Code action', () => {
    it('opens the source code URL in a new tab', () => {
      jest.spyOn(window, 'open').mockImplementation(() => {})
      render(<HelpMenu />)
      fireEvent.click(screen.getByText('Source Code').closest('li'))
      expect(window.open).toHaveBeenCalledWith('https://github.com/tmaiadev/notepad', '_blank')
      window.open.mockRestore()
    })
  })

  describe('Cheat Sheet modal', () => {
    it('opens modal when Cheat Sheet is clicked', () => {
      render(<HelpMenu />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      fireEvent.click(screen.getByText('Cheat Sheet').closest('li'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('displays the Cheat Sheet heading', () => {
      render(<HelpMenu />)
      fireEvent.click(screen.getByText('Cheat Sheet').closest('li'))
      expect(screen.getByText('Cheat Sheet', { selector: 'h2' })).toBeInTheDocument()
    })

    it('renders all cheat sheet features in the table', () => {
      render(<HelpMenu />)
      fireEvent.click(screen.getByText('Cheat Sheet').closest('li'))
      const features = [
        'Heading 1', 'Heading 2', 'Heading 3',
        'Bold', 'Italic', 'Strikethrough',
        'Blockquote', 'Ordered List', 'Unordered List', 'Task List',
        'Code', 'Code Block', 'Horizontal Rule',
        'Link', 'Image', 'Table', 'Footnote',
      ]
      for (const feature of features) {
        expect(screen.getByText(feature)).toBeInTheDocument()
      }
    })

    it('closes modal when Close button is clicked', () => {
      render(<HelpMenu />)
      fireEvent.click(screen.getByText('Cheat Sheet').closest('li'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Close'))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
