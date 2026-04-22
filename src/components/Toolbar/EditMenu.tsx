import { Button, Dropdown, Kbd, Label, Separator } from '@heroui/react'
import { useEditor } from '../../context/useEditor'
import { useHotkeys } from '../../hooks/useHotkeys'
import { cycleHeading, toggleBlockquote, wrapSelection } from '../../lib/markdown'

type WrapMarker = 'bold' | 'italic' | 'strikethrough' | 'code'
type EditAction =
  | 'copy' | 'cut' | 'paste'
  | 'undo' | 'redo'
  | 'heading' | 'blockquote'
  | WrapMarker

const WRAP_MARKERS: Record<WrapMarker, string> = {
  bold: '**',
  italic: '*',
  strikethrough: '~~',
  code: '`',
}

const ALL_EDIT_ACTIONS: readonly EditAction[] = [
  'copy', 'cut', 'paste', 'undo', 'redo', 'heading', 'blockquote',
  'bold', 'italic', 'strikethrough', 'code',
]

function isEditAction(key: string | number): key is EditAction {
  return typeof key === 'string' && (ALL_EDIT_ACTIONS as readonly string[]).includes(key)
}

function isWrapMarker(id: EditAction): id is WrapMarker {
  return id === 'bold' || id === 'italic' || id === 'strikethrough' || id === 'code'
}

export function EditMenu() {
  const { textareaRef, applyEdit, undo, redo } = useEditor()

  async function handleAction(key: string | number) {
    if (!isEditAction(key)) return
    const id: EditAction = key
    if (id === 'undo') { undo(); return }
    if (id === 'redo') { redo(); return }

    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd, value } = textarea

    if (id === 'copy') {
      await navigator.clipboard.writeText(value.slice(selectionStart, selectionEnd))
      return
    }

    if (id === 'cut') {
      await navigator.clipboard.writeText(value.slice(selectionStart, selectionEnd))
      applyEdit({
        newValue: value.slice(0, selectionStart) + value.slice(selectionEnd),
        newCursorPos: selectionStart,
      })
      return
    }

    if (id === 'paste') {
      const clip = await navigator.clipboard.readText()
      applyEdit({
        newValue: value.slice(0, selectionStart) + clip + value.slice(selectionEnd),
        newCursorPos: selectionStart + clip.length,
      })
      return
    }

    if (isWrapMarker(id)) {
      applyEdit(wrapSelection(value, selectionStart, selectionEnd, WRAP_MARKERS[id]))
      return
    }

    if (id === 'blockquote') {
      applyEdit(toggleBlockquote(value, selectionStart, selectionEnd))
      return
    }

    if (id === 'heading') {
      applyEdit(cycleHeading(value, selectionStart, selectionEnd))
    }
  }

  useHotkeys([
    { key: 'z', handler: () => handleAction('undo') },
    { key: 'z', shift: true, handler: () => handleAction('redo') },
    { key: 'h', shift: true, handler: () => handleAction('heading') },
    { key: 'b', handler: () => handleAction('bold') },
    { key: 'i', handler: () => handleAction('italic') },
    { key: 'x', shift: true, handler: () => handleAction('strikethrough') },
  ])

  return (
    <Dropdown>
      <Button size="sm" variant="ghost">Edit</Button>
      <Dropdown.Popover>
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="copy" textValue="Copy">
            <Label>Copy</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>C</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="cut" textValue="Cut">
            <Label>Cut</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>X</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="paste" textValue="Paste">
            <Label>Paste</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>V</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Separator />
          <Dropdown.Item id="undo" textValue="Undo">
            <Label>Undo</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>Z</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="redo" textValue="Redo">
            <Label>Redo</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Abbr keyValue="shift" />
              <Kbd.Content>Z</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Separator />
          <Dropdown.Item id="heading" textValue="Heading">
            <Label>Heading</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Abbr keyValue="shift" />
              <Kbd.Content>H</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="bold" textValue="Bold">
            <Label>Bold</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>B</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="italic" textValue="Italic">
            <Label>Italic</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>I</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="strikethrough" textValue="Strikethrough">
            <Label>Strikethrough</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Abbr keyValue="shift" />
              <Kbd.Content>X</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="blockquote" textValue="Blockquote">
            <Label>Blockquote</Label>
          </Dropdown.Item>
          <Dropdown.Item id="code" textValue="Code">
            <Label>Code</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
