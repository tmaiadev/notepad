import { render, screen } from '@testing-library/react'
import HelpMenu from './HelpMenu'

describe('HelpMenu', () => {
  it('renders "Help" button and both menu items', () => {
    render(<HelpMenu />)
    expect(screen.getByText('Help')).toBeInTheDocument()
    expect(screen.getByText('Cheat Sheet')).toBeInTheDocument()
    expect(screen.getByText('Source Code')).toBeInTheDocument()
  })
})
