import { render, screen } from '@testing-library/react'
import FileMenu from './FileMenu'

describe('FileMenu', () => {
  it('renders "File" button and all 4 items', () => {
    render(<FileMenu />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Save As')).toBeInTheDocument()
  })

  it('renders keyboard shortcuts', () => {
    render(<FileMenu />)
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('O')).toBeInTheDocument()
    const sKeys = screen.getAllByText('S')
    expect(sKeys.length).toBe(2)
  })

  it('renders shift modifier for Save As', () => {
    render(<FileMenu />)
    const abbrs = screen.getAllByTestId('Kbd.Abbr')
    const shiftAbbr = abbrs.find(el => el.getAttribute('data-key') === 'shift')
    expect(shiftAbbr).toBeTruthy()
  })
})
