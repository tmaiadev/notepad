import { render, screen, fireEvent } from '@testing-library/react'
import { TabBar } from './TabBar'
import type { Tab } from '../types'

function makeTab(overrides: Partial<Tab> = {}): Tab {
  return {
    id: 'tab-1',
    fileName: 'Untitled',
    text: '',
    fileHandle: null,
    savedText: null,
    ...overrides,
  }
}

describe('TabBar', () => {
  it('renders all tab file names', () => {
    const tabs = [
      makeTab({ id: 'a', fileName: 'todo.txt' }),
      makeTab({ id: 'b', fileName: 'notes.md' }),
    ]
    render(<TabBar tabs={tabs} activeTabId="a" onSwitch={jest.fn()} onClose={jest.fn()} onNew={jest.fn()} />)
    expect(screen.getByText('todo.txt')).toBeInTheDocument()
    expect(screen.getByText('notes.md')).toBeInTheDocument()
  })

  it('marks the active tab with aria-selected', () => {
    const tabs = [
      makeTab({ id: 'a', fileName: 'A.txt' }),
      makeTab({ id: 'b', fileName: 'B.txt' }),
    ]
    render(<TabBar tabs={tabs} activeTabId="b" onSwitch={jest.fn()} onClose={jest.fn()} onNew={jest.fn()} />)
    const tabEls = screen.getAllByRole('tab')
    expect(tabEls[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabEls[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onSwitch when a tab is clicked', () => {
    const onSwitch = jest.fn()
    const tabs = [makeTab({ id: 'a', fileName: 'A.txt' }), makeTab({ id: 'b', fileName: 'B.txt' })]
    render(<TabBar tabs={tabs} activeTabId="a" onSwitch={onSwitch} onClose={jest.fn()} onNew={jest.fn()} />)
    fireEvent.click(screen.getByText('B.txt'))
    expect(onSwitch).toHaveBeenCalledWith('b')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    const tabs = [makeTab({ id: 'a', fileName: 'A.txt' })]
    render(<TabBar tabs={tabs} activeTabId="a" onSwitch={jest.fn()} onClose={onClose} onNew={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close A.txt' }))
    expect(onClose).toHaveBeenCalledWith('a')
  })

  it('does not call onSwitch when clicking the close button', () => {
    const onSwitch = jest.fn()
    const tabs = [makeTab({ id: 'a', fileName: 'A.txt' })]
    render(<TabBar tabs={tabs} activeTabId="a" onSwitch={onSwitch} onClose={jest.fn()} onNew={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close A.txt' }))
    expect(onSwitch).not.toHaveBeenCalled()
  })

  it('calls onNew when the + button is clicked', () => {
    const onNew = jest.fn()
    const tabs = [makeTab()]
    render(<TabBar tabs={tabs} activeTabId="tab-1" onSwitch={jest.fn()} onClose={jest.fn()} onNew={onNew} />)
    fireEvent.click(screen.getByRole('button', { name: 'New tab' }))
    expect(onNew).toHaveBeenCalled()
  })

  it('shows unsaved dot when tab has a file handle and text differs from savedText', () => {
    const mockHandle = {} as FileSystemFileHandle
    const tabs = [makeTab({ id: 'a', fileName: 'dirty.txt', fileHandle: mockHandle, text: 'modified', savedText: 'original' })]
    render(<TabBar tabs={tabs} activeTabId="a" onSwitch={jest.fn()} onClose={jest.fn()} onNew={jest.fn()} />)
    expect(screen.getByLabelText('unsaved changes')).toBeInTheDocument()
  })

  it('does not show unsaved dot when savedText matches text', () => {
    const mockHandle = {} as FileSystemFileHandle
    const tabs = [makeTab({ id: 'a', fileHandle: mockHandle, text: 'same', savedText: 'same' })]
    render(<TabBar tabs={tabs} activeTabId="a" onSwitch={jest.fn()} onClose={jest.fn()} onNew={jest.fn()} />)
    expect(screen.queryByLabelText('unsaved changes')).not.toBeInTheDocument()
  })

  it('does not show unsaved dot for tabs without a file handle', () => {
    const tabs = [makeTab({ id: 'a', text: 'anything', savedText: null })]
    render(<TabBar tabs={tabs} activeTabId="a" onSwitch={jest.fn()} onClose={jest.fn()} onNew={jest.fn()} />)
    expect(screen.queryByLabelText('unsaved changes')).not.toBeInTheDocument()
  })
})
