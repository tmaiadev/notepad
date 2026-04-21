import { useState } from 'react'

function App() {
  const [text, setText] = useState(() => localStorage.getItem('notepad') ?? '')

  function handleChange(e) {
    setText(e.target.value)
    localStorage.setItem('notepad', e.target.value)
  }

  return (
    <textarea
      className="notepad"
      placeholder="Start typing..."
      value={text}
      onChange={handleChange}
    />
  )
}

export default App
