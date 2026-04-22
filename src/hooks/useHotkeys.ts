import { useEffect, useRef } from 'react'

export interface Hotkey {
  key: string
  shift?: boolean
  handler: () => void
}

export function useHotkeys(hotkeys: Hotkey[]): void {
  const latest = useRef(hotkeys)
  useEffect(() => {
    latest.current = hotkeys
  })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.metaKey && !e.ctrlKey) return
      const pressed = e.key.toLowerCase()
      for (const hk of latest.current) {
        if (hk.key !== pressed) continue
        if (!!hk.shift !== e.shiftKey) continue
        e.preventDefault()
        hk.handler()
        return
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
