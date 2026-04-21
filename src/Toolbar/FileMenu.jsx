import { useRef, useState } from 'react'
import { AlertDialog, Button, Dropdown, Kbd, Label } from '@heroui/react'

const fileTypes = [
  {
    description: 'Text Files',
    accept: { 'text/plain': ['.txt', '.md'] },
  },
]

const pickerOpts = {
  suggestedName: 'untitled.txt',
  types: fileTypes,
}

async function writeToHandle(handle, text) {
  const writable = await handle.createWritable()
  await writable.write(text)
  await writable.close()
}

function downloadFallback(text) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'untitled.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function FileMenu({ text, onTextChange }) {
  const fileHandleRef = useRef(null)
  const [showNewDialog, setShowNewDialog] = useState(false)

  function resetFile() {
    fileHandleRef.current = null
    onTextChange('')
    localStorage.removeItem('notepad')
  }

  async function handleNew() {
    if (text.length > 0) {
      setShowNewDialog(true)
    } else {
      resetFile()
    }
  }

  async function handleNewSave() {
    await handleSave()
    resetFile()
    setShowNewDialog(false)
  }

  function handleNewDiscard() {
    resetFile()
    setShowNewDialog(false)
  }

  async function handleOpen() {
    if (typeof window.showOpenFilePicker === 'function') {
      const [handle] = await window.showOpenFilePicker({
        types: fileTypes,
        multiple: false,
      })
      const file = await handle.getFile()
      const content = await file.text()
      fileHandleRef.current = handle
      onTextChange(content)
    } else {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.txt,.md'
      input.addEventListener('change', async () => {
        const file = input.files[0]
        if (file) {
          const content = await file.text()
          onTextChange(content)
        }
      })
      input.click()
    }
  }

  async function handleSave() {
    if (fileHandleRef.current) {
      await writeToHandle(fileHandleRef.current, text)
    } else if (typeof window.showSaveFilePicker === 'function') {
      const handle = await window.showSaveFilePicker(pickerOpts)
      fileHandleRef.current = handle
      await writeToHandle(handle, text)
    } else {
      downloadFallback(text)
    }
  }

  async function handleSaveAs() {
    if (typeof window.showSaveFilePicker === 'function') {
      const handle = await window.showSaveFilePicker(pickerOpts)
      fileHandleRef.current = handle
      await writeToHandle(handle, text)
    } else {
      downloadFallback(text)
    }
  }

  function handleAction(id) {
    if (id === 'new') handleNew()
    if (id === 'open') handleOpen()
    if (id === 'save') handleSave()
    if (id === 'save-as') handleSaveAs()
  }

  return (
    <>
      <Dropdown>
        <Button size="sm" variant="ghost">File</Button>
        <Dropdown.Popover>
          <Dropdown.Menu onAction={handleAction}>
            <Dropdown.Item id="new" textValue="New">
              <Label>New</Label>
              <Kbd className="ms-auto" slot="keyboard" variant="light">
                <Kbd.Abbr keyValue="command" />
                <Kbd.Content>N</Kbd.Content>
              </Kbd>
            </Dropdown.Item>
            <Dropdown.Item id="open" textValue="Open">
              <Label>Open</Label>
              <Kbd className="ms-auto" slot="keyboard" variant="light">
                <Kbd.Abbr keyValue="command" />
                <Kbd.Content>O</Kbd.Content>
              </Kbd>
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

      <AlertDialog.Backdrop isOpen={showNewDialog} onOpenChange={setShowNewDialog}>
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
              <Button variant="ghost" onPress={handleNewDiscard}>No</Button>
              <Button variant="primary" onPress={handleNewSave}>Yes</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  )
}

export default FileMenu
