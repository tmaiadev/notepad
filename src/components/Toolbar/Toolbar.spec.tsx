import { screen, fireEvent } from '@testing-library/react'
import { Toolbar } from './Toolbar'
import { renderWithEditor } from '../../test-utils'

describe('Toolbar', () => {
  it('renders all four menu labels', () => {
    renderWithEditor(<Toolbar />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Insert')).toBeInTheDocument()
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('renders Edit and Formatted Document icon buttons', () => {
    renderWithEditor(<Toolbar />)
    expect(screen.getByLabelText('Edit')).toBeInTheDocument()
    expect(screen.getByLabelText('Formatted Document')).toBeInTheDocument()
  })

  it('gives Edit button variant="secondary" when viewMode is "raw"', () => {
    renderWithEditor(<Toolbar />, { viewMode: 'raw' })
    expect(screen.getByLabelText('Edit')).toHaveAttribute('variant', 'secondary')
    expect(screen.getByLabelText('Formatted Document')).toHaveAttribute('variant', 'ghost')
  })

  it('gives Formatted Document button variant="secondary" when viewMode is "visualizer"', () => {
    renderWithEditor(<Toolbar />, { viewMode: 'visualizer' })
    expect(screen.getByLabelText('Edit')).toHaveAttribute('variant', 'ghost')
    expect(screen.getByLabelText('Formatted Document')).toHaveAttribute('variant', 'secondary')
  })

  it('clicking Edit button sets view mode to "raw"', () => {
    const setViewMode = jest.fn()
    renderWithEditor(<Toolbar />, { viewMode: 'visualizer', setViewMode })
    fireEvent.click(screen.getByLabelText('Edit'))
    expect(setViewMode).toHaveBeenCalledWith('raw')
  })

  it('clicking Formatted Document button sets view mode to "visualizer"', () => {
    const setViewMode = jest.fn()
    renderWithEditor(<Toolbar />, { viewMode: 'raw', setViewMode })
    fireEvent.click(screen.getByLabelText('Formatted Document'))
    expect(setViewMode).toHaveBeenCalledWith('visualizer')
  })
})
