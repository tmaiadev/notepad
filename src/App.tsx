import { Editor } from './components/Editor'
import { TabBar } from './components/TabBar'
import { Toolbar } from './components/Toolbar'
import { EditorProvider } from './context/EditorProvider'
import { useEditor } from './context/useEditor'

function AppContent() {
  const { tabs, activeTabId, switchTab, closeTab, newTab } = useEditor()
  return (
    <div className="flex h-full flex-col">
      {tabs.length > 1 && (
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitch={switchTab}
          onClose={closeTab}
          onNew={newTab}
        />
      )}
      <Toolbar />
      <Editor />
    </div>
  )
}

export default function App() {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  )
}
