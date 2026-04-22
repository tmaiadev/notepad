import { useRef, useState } from 'react'
import { AlertDialog, Button, Dropdown, Kbd, Label } from '@heroui/react'
import { useEditor } from '../../context/useEditor'
import { useHotkeys } from '../../hooks/useHotkeys'
import { openFile, saveFile, saveFileAs } from '../../lib/fileSystem'

type FileAction = 'new' | 'open' | 'save' | 'save-as'

function isFileAction(key: string | number): key is FileAction {
  return key === 'new' || key === 'open' || key === 'save' || key === 'save-as'
}

export function FileMenu() {
  const { text, setText, clearText } = useEditor()
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  function resetFile() {
    fileHandleRef.current = null
    clearText()
  }

  async function handleSave() {
    fileHandleRef.current = await saveFile(text, fileHandleRef.current)
  }

  async function handleSaveAs() {
    fileHandleRef.current = await saveFileAs(text)
  }

  async function handleOpen() {
    const result = await openFile()
    if (!result) return
    fileHandleRef.current = result.handle
    setText(result.content)
  }

  function handleNew() {
    if (text.length > 0) setShowUnsavedDialog(true)
    else resetFile()
  }

  async function handleUnsavedSave() {
    await handleSave()
    resetFile()
    setShowUnsavedDialog(false)
  }

  function handleUnsavedDiscard() {
    resetFile()
    setShowUnsavedDialog(false)
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
    <>
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

      <AlertDialog.Backdrop isOpen={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialog.Container>
          <AlertDialog.Dialog role="alertdialog">
            <AlertDialog.Header>
              <AlertDialog.Heading>Unsaved Changes</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              Do you want to save your changes before creating a new file? Your unsaved changes will be lost.
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="tertiary" slot="close">Cancel</Button>
              <Button variant="ghost" onPress={handleUnsavedDiscard}>No</Button>
              <Button variant="primary" onPress={handleUnsavedSave}>Yes</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  )
}
