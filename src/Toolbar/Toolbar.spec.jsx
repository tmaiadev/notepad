import { render, screen, fireEvent } from '@testing-library/react'
import Toolbar from './Toolbar'

describe('Toolbar', () => {
  it('renders all four menu labels', () => {
    render(<Toolbar viewMode="raw" onViewModeChange={() => {}} text="" />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Insert')).toBeInTheDocument()
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('renders Edit (pencil) and Formatted Document (eye) icon buttons with correct aria-labels', () => {
    render(<Toolbar viewMode="raw" onViewModeChange={() => {}} text="" />)
    expect(screen.getByLabelText('Edit')).toBeInTheDocument()
    expect(screen.getByLabelText('Formatted Document')).toBeInTheDocument()
  })

  it('gives Edit button variant="secondary" when viewMode is "raw"', () => {
    render(<Toolbar viewMode="raw" onViewModeChange={() => {}} text="" />)
    const editBtn = screen.getByLabelText('Edit')
    expect(editBtn).toHaveAttribute('variant', 'secondary')
    const formattedBtn = screen.getByLabelText('Formatted Document')
    expect(formattedBtn).toHaveAttribute('variant', 'ghost')
  })

  it('gives Formatted Document button variant="secondary" when viewMode is "visualizer"', () => {
    render(<Toolbar viewMode="visualizer" onViewModeChange={() => {}} text="" />)
    const editBtn = screen.getByLabelText('Edit')
    expect(editBtn).toHaveAttribute('variant', 'ghost')
    const formattedBtn = screen.getByLabelText('Formatted Document')
    expect(formattedBtn).toHaveAttribute('variant', 'secondary')
  })

  it('clicking Edit button calls onViewModeChange with "raw"', () => {
    const handler = jest.fn()
    render(<Toolbar viewMode="visualizer" onViewModeChange={handler} text="" />)
    fireEvent.click(screen.getByLabelText('Edit'))
    expect(handler).toHaveBeenCalledWith('raw')
  })

  it('clicking Formatted Document button calls onViewModeChange with "visualizer"', () => {
    const handler = jest.fn()
    render(<Toolbar viewMode="raw" onViewModeChange={handler} text="" />)
    fireEvent.click(screen.getByLabelText('Formatted Document'))
    expect(handler).toHaveBeenCalledWith('visualizer')
  })
})
