import { useMemo, useState } from 'react'
import { marked } from 'marked'
import Toolbar from './Toolbar'

function App() {
  const [text, setText] = useState(() => localStorage.getItem('notepad') ?? '')
  const [viewMode, setViewMode] = useState('raw')

  function handleTextChange(value) {
    setText(value)
    localStorage.setItem('notepad', value)
  }

  function handleChange(e) {
    handleTextChange(e.target.value)
  }

  const html = useMemo(() => {
    if (viewMode !== 'visualizer') return ''
    return marked.parse(text).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  }, [text, viewMode])

  return (
    <div className="flex h-full flex-col">
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} text={text} onTextChange={handleTextChange} />
      {viewMode === 'raw' ? (
        <textarea
          className="notepad"
          placeholder="Start typing..."
          value={text}
          onChange={handleChange}
        />
      ) : (
        <div
          className="notepad prose max-w-none overflow-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}

export default App
