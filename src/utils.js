export function wrapSelection(value, selectionStart, selectionEnd, marker) {
  const selected = value.slice(selectionStart, selectionEnd)
  const newValue = value.slice(0, selectionStart) + marker + selected + marker + value.slice(selectionEnd)
  return {
    newValue,
    newSelectionStart: selectionStart + marker.length,
    newSelectionEnd: selectionEnd + marker.length,
  }
}

export function cycleHeading(value, selectionStart, selectionEnd) {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const rawEnd = value.indexOf('\n', selectionStart)
  const lineEnd = rawEnd === -1 ? value.length : rawEnd
  const line = value.slice(lineStart, lineEnd)

  const match = line.match(/^(#{1,3}) /)
  const level = match ? match[1].length : 0
  const newLevel = level === 3 ? 0 : level + 1

  const body = level > 0 ? line.slice(level + 1) : line
  const newLine = newLevel === 0 ? body : '#'.repeat(newLevel) + ' ' + body

  const delta = newLine.length - line.length
  return {
    newValue: value.slice(0, lineStart) + newLine + value.slice(lineEnd),
    newSelectionStart: Math.max(lineStart, selectionStart + delta),
    newSelectionEnd: Math.max(lineStart, selectionEnd + delta),
  }
}
