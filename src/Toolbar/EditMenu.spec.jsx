import { render, screen } from '@testing-library/react'
import EditMenu from './EditMenu'

describe('EditMenu', () => {
  it('renders "Edit" button and all items', () => {
    render(<EditMenu />)
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Cut')).toBeInTheDocument()
    expect(screen.getByText('Paste')).toBeInTheDocument()
    expect(screen.getByText('Heading')).toBeInTheDocument()
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('Italic')).toBeInTheDocument()
    expect(screen.getByText('Strikethrough')).toBeInTheDocument()
    expect(screen.getByText('Highlight')).toBeInTheDocument()
    expect(screen.getByText('Blockquote')).toBeInTheDocument()
    expect(screen.getByText('Undo')).toBeInTheDocument()
    expect(screen.getByText('Redo')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
  })

  it('renders Separators between menu groups', () => {
    render(<EditMenu />)
    expect(screen.getAllByTestId('Separator')).toHaveLength(2)
  })

  it('renders keyboard shortcuts', () => {
    render(<EditMenu />)
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getAllByText('Z')).toHaveLength(2)
    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('I')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})
