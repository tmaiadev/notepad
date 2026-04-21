import { useMemo, useState } from 'react'
import { marked } from 'marked'
import Toolbar from './Toolbar'

function App() {
  const [text, setText] = useState(() => localStorage.getItem('notepad') ?? '')
  const [viewMode, setViewMode] = useState('raw')

  function handleChange(e) {
    setText(e.target.value)
    localStorage.setItem('notepad', e.target.value)
  }

  const html = useMemo(() => {
    if (viewMode !== 'visualizer') return ''
    return marked.parse(text)
  }, [text, viewMode])

  return (
    <div className="flex h-full flex-col">
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} />
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
