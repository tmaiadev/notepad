import type { Tab } from '../types'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onSwitch: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
}

interface TabItemProps {
  tab: Tab
  isActive: boolean
  onSwitch: (id: string) => void
  onClose: (id: string) => void
}

function isDirty(tab: Tab): boolean {
  return tab.fileHandle !== null && tab.text !== tab.savedText
}

function TabItem({ tab, isActive, onSwitch, onClose }: TabItemProps) {
  return (
    <div
      role="tab"
      aria-selected={isActive}
      className={[
        'flex items-center gap-1 px-3 py-1.5 text-sm cursor-pointer select-none border-r border-default-200 shrink-0',
        isActive
          ? 'bg-default-100 text-foreground font-medium border-b-2 border-b-primary'
          : 'bg-background text-default-500 hover:bg-default-100',
      ].join(' ')}
      onClick={() => onSwitch(tab.id)}
    >
      {isDirty(tab) && (
        <span className="text-warning text-xs leading-none" aria-label="unsaved changes">●</span>
      )}
      <span className="max-w-36 truncate">{tab.fileName}</span>
      <button
        aria-label={`Close ${tab.fileName}`}
        className="ml-1 flex items-center justify-center rounded hover:bg-default-300 w-4 h-4 text-default-400 hover:text-foreground"
        onClick={(e) => { e.stopPropagation(); onClose(tab.id) }}
      >
        ×
      </button>
    </div>
  )
}

export function TabBar({ tabs, activeTabId, onSwitch, onClose, onNew }: TabBarProps) {
  return (
    <div role="tablist" className="flex overflow-x-auto border-b border-default-200 bg-default-100">
      {tabs.map(tab => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onSwitch={onSwitch}
          onClose={onClose}
        />
      ))}
      <button
        aria-label="New tab"
        className="px-3 py-1.5 text-default-400 hover:text-foreground hover:bg-default-200 shrink-0"
        onClick={onNew}
      >
        +
      </button>
    </div>
  )
}
