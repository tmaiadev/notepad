import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Tab, TabInitOptions, TextEdit, ViewMode } from '../types'
import { isCursorEdit } from '../types'
import { syncFile } from '../lib/fileSystem'
import { EditorContext, STORAGE_KEY, type EditorContextValue } from './editorContext'

interface History {
  stack: string[]
  index: number
}

interface PersistedState {
  tabs: Array<{ id: string; fileName: string; text: string }>
  activeTabId: string
}

let idCounter = 0
function generateId() { return `tab-${++idCounter}` }

function createTab(fileName: string, text = '', fileHandle: FileSystemFileHandle | null = null): Tab {
  return { id: generateId(), fileName, text, fileHandle, savedText: fileHandle ? text : null }
}

function loadInitialState(): { tabs: Tab[]; activeTabId: string } {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const tab = createTab('Untitled')
    return { tabs: [tab], activeTabId: tab.id }
  }
  try {
    const parsed = JSON.parse(stored) as PersistedState
    if (parsed.tabs && Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
      const tabs = parsed.tabs.map(t => ({ ...t, fileHandle: null, savedText: null }))
      return { tabs, activeTabId: parsed.activeTabId ?? tabs[0]!.id }
    }
  } catch {
    // old plain-text format
  }
  const tab = createTab('Untitled', stored)
  return { tabs: [tab], activeTabId: tab.id }
}

interface EditorProviderProps {
  children: ReactNode
}

export function EditorProvider({ children }: EditorProviderProps) {
  const initial = useMemo(() => loadInitialState(), [])
  const [tabs, setTabs] = useState<Tab[]>(initial.tabs)
  const [activeTabId, setActiveTabId] = useState<string>(initial.activeTabId)
  const [viewMode, setViewMode] = useState<ViewMode>('raw')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const historiesRef = useRef<Map<string, History>>(new Map())
  const untitledCounterRef = useRef(0)

  // Initialize histories for tabs loaded from storage
  useEffect(() => {
    tabs.forEach(tab => {
      if (!historiesRef.current.has(tab.id)) {
        historiesRef.current.set(tab.id, { stack: [tab.text], index: 0 })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist all tabs to localStorage
  useEffect(() => {
    const persisted: PersistedState = {
      tabs: tabs.map(({ id, fileName, text }) => ({ id, fileName, text })),
      activeTabId,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  }, [tabs, activeTabId])

  // Auto-sync active tab text to its file handle (debounced)
  useEffect(() => {
    const activeTab = tabs.find(t => t.id === activeTabId)
    if (!activeTab?.fileHandle || activeTab.text === activeTab.savedText) return
    const handle = activeTab.fileHandle
    const textToWrite = activeTab.text
    const tabId = activeTab.id
    const timeout = setTimeout(async () => {
      try {
        await syncFile(textToWrite, handle)
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, savedText: textToWrite } : t))
      } catch {
        // ignore — user will see unsaved dot and can save manually
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [tabs, activeTabId])

  function getOrCreateHistory(tabId: string, initialText = ''): History {
    if (!historiesRef.current.has(tabId)) {
      historiesRef.current.set(tabId, { stack: [initialText], index: 0 })
    }
    return historiesRef.current.get(tabId)!
  }

  function nextUntitledName() {
    const n = ++untitledCounterRef.current
    return n === 1 ? 'Untitled' : `Untitled ${n}`
  }

  const activeTab = useMemo(
    () => tabs.find(t => t.id === activeTabId) ?? tabs[0]!,
    [tabs, activeTabId],
  )

  const writeText = useCallback((value: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, text: value } : t))
  }, [activeTabId])

  const setText = useCallback((value: string) => {
    const history = getOrCreateHistory(activeTabId)
    const newStack = history.stack.slice(0, history.index + 1)
    newStack.push(value)
    historiesRef.current.set(activeTabId, { stack: newStack, index: newStack.length - 1 })
    writeText(value)
  }, [activeTabId, writeText])

  const clearText = useCallback(() => {
    const history = getOrCreateHistory(activeTabId)
    const newStack = history.stack.slice(0, history.index + 1)
    newStack.push('')
    historiesRef.current.set(activeTabId, { stack: newStack, index: newStack.length - 1 })
    writeText('')
  }, [activeTabId, writeText])

  const focusTextarea = useCallback(() => {
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [])

  const undo = useCallback(() => {
    const history = getOrCreateHistory(activeTabId)
    const { stack, index } = history
    if (index === 0) return
    historiesRef.current.set(activeTabId, { stack, index: index - 1 })
    writeText(stack[index - 1]!)
    focusTextarea()
  }, [activeTabId, writeText, focusTextarea])

  const redo = useCallback(() => {
    const history = getOrCreateHistory(activeTabId)
    const { stack, index } = history
    if (index >= stack.length - 1) return
    historiesRef.current.set(activeTabId, { stack, index: index + 1 })
    writeText(stack[index + 1]!)
    focusTextarea()
  }, [activeTabId, writeText, focusTextarea])

  const applyEdit = useCallback((edit: TextEdit) => {
    setText(edit.newValue)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      if (isCursorEdit(edit)) {
        el.setSelectionRange(edit.newCursorPos, edit.newCursorPos)
      } else {
        el.setSelectionRange(edit.newSelectionStart, edit.newSelectionEnd)
      }
    })
  }, [setText])

  const newTab = useCallback(() => {
    const tab = createTab(nextUntitledName())
    historiesRef.current.set(tab.id, { stack: [''], index: 0 })
    setTabs(prev => [...prev, tab])
    setActiveTabId(tab.id)
  }, [])

  const openTab = useCallback((options?: TabInitOptions) => {
    const text = options?.text ?? ''
    const fileHandle = options?.fileHandle ?? null
    const fileName = options?.fileName ?? nextUntitledName()

    setTabs(prev => {
      const active = prev.find(t => t.id === activeTabId)
      if (active && !active.fileHandle && active.text === '') {
        // Replace the empty untitled tab
        historiesRef.current.set(active.id, { stack: [text], index: 0 })
        return prev.map(t => t.id === activeTabId
          ? { ...t, fileName, text, fileHandle, savedText: fileHandle ? text : null }
          : t)
      }
      // Open in a new tab
      const tab = createTab(fileName, text, fileHandle)
      historiesRef.current.set(tab.id, { stack: [text], index: 0 })
      setActiveTabId(tab.id)
      return [...prev, tab]
    })
  }, [activeTabId])

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      historiesRef.current.delete(id)
      if (prev.length === 1) {
        const tab = createTab(nextUntitledName())
        historiesRef.current.set(tab.id, { stack: [''], index: 0 })
        setActiveTabId(tab.id)
        return [tab]
      }
      const idx = prev.findIndex(t => t.id === id)
      const remaining = prev.filter(t => t.id !== id)
      if (id === activeTabId) {
        const newActive = remaining[idx === prev.length - 1 ? idx - 1 : idx]!
        setActiveTabId(newActive.id)
      }
      return remaining
    })
  }, [activeTabId])

  const switchTab = useCallback((id: string) => {
    setActiveTabId(id)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [])

  const updateActiveTab = useCallback((updates: Partial<Pick<Tab, 'fileHandle' | 'fileName' | 'savedText'>>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t))
  }, [activeTabId])

  const value = useMemo<EditorContextValue>(
    () => ({
      text: activeTab.text,
      fileName: activeTab.fileName,
      fileHandle: activeTab.fileHandle,
      viewMode,
      textareaRef,
      setText,
      clearText,
      setViewMode,
      undo,
      redo,
      applyEdit,
      tabs,
      activeTabId,
      newTab,
      openTab,
      closeTab,
      switchTab,
      updateActiveTab,
    }),
    [activeTab, viewMode, setText, clearText, undo, redo, applyEdit,
     tabs, activeTabId, newTab, openTab, closeTab, switchTab, updateActiveTab],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
