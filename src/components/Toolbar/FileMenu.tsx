import { Button, Dropdown, Kbd, Label } from '@heroui/react'
import { useEditor } from '../../context/useEditor'
import { useHotkeys } from '../../hooks/useHotkeys'
import { openFile, saveFile, saveFileAs } from '../../lib/fileSystem'

type FileAction = 'new' | 'open' | 'save' | 'save-as'

function isFileAction(key: string | number): key is FileAction {
  return key === 'new' || key === 'open' || key === 'save' || key === 'save-as'
}

export function FileMenu() {
  const { text, fileName, fileHandle, updateActiveTab, newTab, openTab } = useEditor()

  async function handleSave() {
    const handle = await saveFile(text, fileHandle)
    if (handle) updateActiveTab({ fileHandle: handle, fileName: handle.name ?? fileName, savedText: text })
  }

  async function handleSaveAs() {
    const handle = await saveFileAs(text)
    if (handle) updateActiveTab({ fileHandle: handle, fileName: handle.name ?? fileName, savedText: text })
  }

  async function handleOpen() {
    const result = await openFile()
    if (!result) return
    const name = result.handle?.name ?? 'Untitled'
    openTab({ fileName: name, text: result.content, fileHandle: result.handle })
  }

  function handleNew() {
    newTab()
  }

  function handleAction(key: string | number) {
    if (!isFileAction(key)) return
    if (key === 'new') handleNew()
    if (key === 'open') handleOpen()
    if (key === 'save') handleSave()
    if (key === 'save-as') handleSaveAs()
  }

  useHotkeys([
    { key: 's', handler: handleSave },
    { key: 's', shift: true, handler: handleSaveAs },
  ])

  return (
    <Dropdown>
      <Button size="sm" variant="ghost">File</Button>
      <Dropdown.Popover>
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Item id="new" textValue="New">
            <Label>New</Label>
          </Dropdown.Item>
          <Dropdown.Item id="open" textValue="Open">
            <Label>Open</Label>
          </Dropdown.Item>
          <Dropdown.Item id="save" textValue="Save">
            <Label>Save</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>S</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="save-as" textValue="Save As">
            <Label>Save As</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Abbr keyValue="shift" />
              <Kbd.Content>S</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
