import { useRef } from 'react'
import { Button, Dropdown, Kbd, Label } from '@heroui/react'

const pickerOpts = {
  suggestedName: 'untitled.txt',
  types: [
    {
      description: 'Text Files',
      accept: { 'text/plain': ['.txt', '.md'] },
    },
  ],
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

function FileMenu({ text }) {
  const fileHandleRef = useRef(null)

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
    if (id === 'save') handleSave()
    if (id === 'save-as') handleSaveAs()
  }

  return (
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
  )
}

export default FileMenu
