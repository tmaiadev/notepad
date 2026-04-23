import type { CursorEdit, SelectionEdit } from '../types'

export function insertSnippet(value: string, selectionStart: number, snippet: string): CursorEdit {
  const rawEnd = value.indexOf('\n', selectionStart)
  const lineEnd = rawEnd === -1 ? value.length : rawEnd
  const insertion = '\n' + snippet
  return {
    newValue: value.slice(0, lineEnd) + insertion + value.slice(lineEnd),
    newCursorPos: lineEnd + insertion.length,
  }
}

export function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  marker: string,
): SelectionEdit {
  const selected = value.slice(selectionStart, selectionEnd)
  const newValue = value.slice(0, selectionStart) + marker + selected + marker + value.slice(selectionEnd)
  return {
    newValue,
    newSelectionStart: selectionStart + marker.length,
    newSelectionEnd: selectionEnd + marker.length,
  }
}

export function toggleBlockquote(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): SelectionEdit {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const rawEnd = value.indexOf('\n', selectionStart)
  const lineEnd = rawEnd === -1 ? value.length : rawEnd
  const line = value.slice(lineStart, lineEnd)

  if (line.startsWith('>')) {
    return { newValue: value, newSelectionStart: selectionStart, newSelectionEnd: selectionEnd }
  }

  return {
    newValue: value.slice(0, lineStart) + '> ' + line + value.slice(lineEnd),
    newSelectionStart: selectionStart + 2,
    newSelectionEnd: selectionEnd + 2,
  }
}

export function continueList(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): CursorEdit | null {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const line = value.slice(lineStart, selectionStart)
  const rawFullLineEnd = value.indexOf('\n', lineStart)
  const fullLineEnd = rawFullLineEnd === -1 ? value.length : rawFullLineEnd

  const prefixes = detectListPrefix(line)
  if (!prefixes) return null

  const { matchedPrefix, nextPrefix } = prefixes

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

function getLineAtCursor(value: string, selectionStart: number): { lineStart: number; line: string } {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const rawLineEnd = value.indexOf('\n', lineStart)
  const lineEnd = rawLineEnd === -1 ? value.length : rawLineEnd
  return { lineStart, line: value.slice(lineStart, lineEnd) }
}

export function isListItemAtCursor(value: string, selectionStart: number): boolean {
  const { line } = getLineAtCursor(value, selectionStart)
  return detectListPrefix(line) !== null
}

export function indentListItem(value: string, selectionStart: number): CursorEdit | null {
  const { lineStart, line } = getLineAtCursor(value, selectionStart)
  if (!detectListPrefix(line)) return null
  return {
    newValue: value.slice(0, lineStart) + '  ' + value.slice(lineStart),
    newCursorPos: selectionStart + 2,
  }
}

export function outdentListItem(value: string, selectionStart: number): CursorEdit | null {
  const { lineStart, line } = getLineAtCursor(value, selectionStart)
  if (!detectListPrefix(line)) return null

  const leadingSpaces = line.match(/^ */)?.[0].length ?? 0
  if (leadingSpaces === 0) return null

  const toRemove = Math.min(2, leadingSpaces)
  return {
    newValue: value.slice(0, lineStart) + value.slice(lineStart + toRemove),
    newCursorPos: Math.max(lineStart, selectionStart - toRemove),
  }
}

function detectListPrefix(line: string): { matchedPrefix: string; nextPrefix: string } | null {
  const taskMatch = line.match(/^(\s*[-*+] \[[ x]\] )/)
  if (taskMatch) {
    const matchedPrefix = taskMatch[1]!
    return { matchedPrefix, nextPrefix: matchedPrefix.replace(/\[[ x]\]/, '[ ]') }
  }

  const appTaskMatch = line.match(/^(\s*\[[ x]\] )/)
  if (appTaskMatch) {
    const matchedPrefix = appTaskMatch[1]!
    return { matchedPrefix, nextPrefix: matchedPrefix.replace(/\[[ x]\]/, '[ ]') }
  }

  const orderedMatch = line.match(/^(\s*)(\d+)\. /)
  if (orderedMatch) {
    const matchedPrefix = orderedMatch[0]
    const nextPrefix = orderedMatch[1]! + (parseInt(orderedMatch[2]!, 10) + 1) + '. '
    return { matchedPrefix, nextPrefix }
  }

  const unorderedMatch = line.match(/^(\s*[-*+] )/)
  if (unorderedMatch) {
    const matchedPrefix = unorderedMatch[1]!
    return { matchedPrefix, nextPrefix: matchedPrefix }
  }

  return null
}

export function cycleHeading(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): SelectionEdit {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const rawEnd = value.indexOf('\n', selectionStart)
  const lineEnd = rawEnd === -1 ? value.length : rawEnd
  const line = value.slice(lineStart, lineEnd)

  const match = line.match(/^(#{1,3}) /)
  const level = match ? match[1]!.length : 0
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
