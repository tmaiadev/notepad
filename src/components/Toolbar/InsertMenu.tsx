import { Button, Dropdown, Label } from '@heroui/react'
import { useEditor } from '../../context/useEditor'
import { insertSnippet } from '../../lib/markdown'
import { SNIPPETS, type SnippetId } from '../../lib/snippets'

function isSnippetId(key: string | number): key is SnippetId {
  return typeof key === 'string' && key in SNIPPETS
}

export function InsertMenu() {
  const { textareaRef, applyEdit } = useEditor()

  function handleAction(key: string | number) {
    if (!isSnippetId(key)) return
    const textarea = textareaRef.current
    if (!textarea) return
    applyEdit(insertSnippet(textarea.value, textarea.selectionStart, SNIPPETS[key]))
  }

  return (
    <Dropdown>
      <Button size="sm" variant="ghost">Insert</Button>
      <Dropdown.Popover>
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.SubmenuTrigger>
            <Dropdown.Item id="list" textValue="List">
              <Label>List</Label>
              <Dropdown.SubmenuIndicator />
            </Dropdown.Item>
            <Dropdown.Popover>
              <Dropdown.Menu onAction={handleAction}>
                <Dropdown.Item id="unordered" textValue="Unordered">
                  <Label>Unordered</Label>
                </Dropdown.Item>
                <Dropdown.Item id="ordered" textValue="Ordered">
                  <Label>Ordered</Label>
                </Dropdown.Item>
                <Dropdown.Item id="definition" textValue="Definition">
                  <Label>Definition</Label>
                </Dropdown.Item>
                <Dropdown.Item id="task" textValue="Task">
                  <Label>Task</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown.SubmenuTrigger>
          <Dropdown.Item id="horizontal-rule" textValue="Horizontal Rule">
            <Label>Horizontal Rule</Label>
          </Dropdown.Item>
          <Dropdown.Item id="link" textValue="Link">
            <Label>Link</Label>
          </Dropdown.Item>
          <Dropdown.Item id="image" textValue="Image">
            <Label>Image</Label>
          </Dropdown.Item>
          <Dropdown.Item id="table" textValue="Table">
            <Label>Table</Label>
          </Dropdown.Item>
          <Dropdown.Item id="fenced-code-block" textValue="Fenced Code Block">
            <Label>Fenced Code Block</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
