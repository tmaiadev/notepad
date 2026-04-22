import { Editor } from './components/Editor'
import { Toolbar } from './components/Toolbar'
import { EditorProvider } from './context/EditorProvider'

export default function App() {
  return (
    <EditorProvider>
      <div className="flex h-full flex-col">
        <Toolbar />
        <Editor />
      </div>
    </EditorProvider>
  )
}
