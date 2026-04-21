import { render, screen } from '@testing-library/react'
import InsertMenu from './InsertMenu'

describe('InsertMenu', () => {
  it('renders "Insert" button and all top-level items', () => {
    render(<InsertMenu />)
    expect(screen.getByText('Insert')).toBeInTheDocument()
    expect(screen.getByText('List')).toBeInTheDocument()
    expect(screen.getByText('Horizontal Rule')).toBeInTheDocument()
    expect(screen.getByText('Link')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Table')).toBeInTheDocument()
    expect(screen.getByText('Fenced Code Block')).toBeInTheDocument()
  })

  it('renders List submenu with sub-items', () => {
    render(<InsertMenu />)
    expect(screen.getByText('Unordered')).toBeInTheDocument()
    expect(screen.getByText('Ordered')).toBeInTheDocument()
    expect(screen.getByText('Definition')).toBeInTheDocument()
    expect(screen.getByText('Task')).toBeInTheDocument()
  })

  it('renders SubmenuTrigger and SubmenuIndicator', () => {
    render(<InsertMenu />)
    expect(screen.getByTestId('Dropdown.SubmenuTrigger')).toBeInTheDocument()
    expect(screen.getByTestId('Dropdown.SubmenuIndicator')).toBeInTheDocument()
  })
})
