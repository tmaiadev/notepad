export function insertSnippet(value, selectionStart, snippet) {
  const rawEnd = value.indexOf('\n', selectionStart)
  const lineEnd = rawEnd === -1 ? value.length : rawEnd
  const insertion = '\n' + snippet
  return {
    newValue: value.slice(0, lineEnd) + insertion + value.slice(lineEnd),
    newCursorPos: lineEnd + insertion.length,
  }
}

export function wrapSelection(value, selectionStart, selectionEnd, marker) {
  const selected = value.slice(selectionStart, selectionEnd)
  const newValue = value.slice(0, selectionStart) + marker + selected + marker + value.slice(selectionEnd)
  return {
    newValue,
    newSelectionStart: selectionStart + marker.length,
    newSelectionEnd: selectionEnd + marker.length,
  }
}

export function toggleBlockquote(value, selectionStart, selectionEnd) {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const rawEnd = value.indexOf('\n', selectionStart)
  const lineEnd = rawEnd === -1 ? value.length : rawEnd
  const line = value.slice(lineStart, lineEnd)

  if (line.startsWith('>')) return { newValue: value, newSelectionStart: selectionStart, newSelectionEnd: selectionEnd }

  return {
    newValue: value.slice(0, lineStart) + '> ' + line + value.slice(lineEnd),
    newSelectionStart: selectionStart + 2,
    newSelectionEnd: selectionEnd + 2,
  }
}

export function continueList(value, selectionStart, selectionEnd) {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const line = value.slice(lineStart, selectionStart)
  const rawFullLineEnd = value.indexOf('\n', lineStart)
  const fullLineEnd = rawFullLineEnd === -1 ? value.length : rawFullLineEnd

  let matchedPrefix = null
  let nextPrefix = null

  const taskMatch = line.match(/^(\s*[-*+] \[[ x]\] )/)
  if (taskMatch) {
    matchedPrefix = taskMatch[1]
    nextPrefix = matchedPrefix.replace(/\[[ x]\]/, '[ ]')
  } else {
    const appTaskMatch = line.match(/^(\s*\[[ x]\] )/)
    if (appTaskMatch) {
      matchedPrefix = appTaskMatch[1]
      nextPrefix = matchedPrefix.replace(/\[[ x]\]/, '[ ]')
    } else {
      const orderedMatch = line.match(/^(\s*)(\d+)\. /)
      if (orderedMatch) {
        matchedPrefix = orderedMatch[0]
        nextPrefix = orderedMatch[1] + (parseInt(orderedMatch[2]) + 1) + '. '
      } else {
        const unorderedMatch = line.match(/^(\s*[-*+] )/)
        if (unorderedMatch) {
          matchedPrefix = unorderedMatch[1]
          nextPrefix = matchedPrefix
        }
      }
    }
  }

  if (!nextPrefix) return null

  // Empty list item — exit by removing the prefix, cursor stays on the now-empty line
  if (fullLineEnd - lineStart === matchedPrefix.length) {
    return {
      newValue: value.slice(0, lineStart) + value.slice(lineStart + matchedPrefix.length),
      newCursorPos: lineStart,
    }
  }

  return {
    newValue: value.slice(0, selectionStart) + '\n' + nextPrefix + value.slice(selectionEnd),
    newCursorPos: selectionStart + 1 + nextPrefix.length,
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
