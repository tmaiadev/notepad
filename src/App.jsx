import { useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import Toolbar from './Toolbar'

function App() {
  const [text, setText] = useState(() => localStorage.getItem('notepad') ?? '')
  const [viewMode, setViewMode] = useState('raw')
  const textareaRef = useRef(null)
  const historyRef = useRef(null)
  if (historyRef.current === null) {
    historyRef.current = { stack: [text], index: 0 }
  }

  function applyText(value) {
    setText(value)
    localStorage.setItem('notepad', value)
  }

  function handleTextChange(value) {
    const { stack, index } = historyRef.current
    const newStack = stack.slice(0, index + 1)
    newStack.push(value)
    historyRef.current = { stack: newStack, index: newStack.length - 1 }
    applyText(value)
  }

  function handleChange(e) {
    handleTextChange(e.target.value)
  }

  function handleUndo() {
    const { stack, index } = historyRef.current
    if (index > 0) {
      historyRef.current = { stack, index: index - 1 }
      applyText(stack[index - 1])
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }

  function handleRedo() {
    const { stack, index } = historyRef.current
    if (index < stack.length - 1) {
      historyRef.current = { stack, index: index + 1 }
      applyText(stack[index + 1])
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }

  const html = useMemo(() => {
    if (viewMode !== 'visualizer') return ''
    return marked.parse(text).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  }, [text, viewMode])

  return (
    <div className="flex h-full flex-col">
      <Toolbar viewMode={viewMode} onViewModeChange={setViewMode} text={text} onTextChange={handleTextChange} textareaRef={textareaRef} onUndo={handleUndo} onRedo={handleRedo} />
      {viewMode === 'raw' ? (
        <textarea
          ref={textareaRef}
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
