import { render, screen, fireEvent } from '@testing-library/react'
import Toolbar from './Toolbar'

describe('Toolbar', () => {
  it('renders all four menu labels', () => {
    render(<Toolbar viewMode="raw" onViewModeChange={() => {}} />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Insert')).toBeInTheDocument()
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('gives Raw button variant="secondary" when viewMode is "raw"', () => {
    render(<Toolbar viewMode="raw" onViewModeChange={() => {}} />)
    const rawBtn = screen.getByText('Raw')
    expect(rawBtn).toHaveAttribute('variant', 'secondary')
    const visBtn = screen.getByText('Visualizer')
    expect(visBtn).toHaveAttribute('variant', 'ghost')
  })

  it('gives Visualizer button variant="secondary" when viewMode is "visualizer"', () => {
    render(<Toolbar viewMode="visualizer" onViewModeChange={() => {}} />)
    const rawBtn = screen.getByText('Raw')
    expect(rawBtn).toHaveAttribute('variant', 'ghost')
    const visBtn = screen.getByText('Visualizer')
    expect(visBtn).toHaveAttribute('variant', 'secondary')
  })

  it('clicking Raw calls onViewModeChange with "raw"', () => {
    const handler = jest.fn()
    render(<Toolbar viewMode="visualizer" onViewModeChange={handler} />)
    fireEvent.click(screen.getByText('Raw'))
    expect(handler).toHaveBeenCalledWith('raw')
  })

  it('clicking Visualizer calls onViewModeChange with "visualizer"', () => {
    const handler = jest.fn()
    render(<Toolbar viewMode="raw" onViewModeChange={handler} />)
    fireEvent.click(screen.getByText('Visualizer'))
    expect(handler).toHaveBeenCalledWith('visualizer')
  })
})
