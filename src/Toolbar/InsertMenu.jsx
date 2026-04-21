import { Button, Dropdown, Label } from '@heroui/react'
import { insertSnippet } from '../utils'

const SNIPPETS = {
  unordered: '- Item 1\n- Item 2',
  ordered: '1. Item 1\n2. Item 2',
  definition: 'Term\n: Definition',
  task: '[ ] Item 1\n[x] Item 2',
  'horizontal-rule': '---',
  link: '[link text](url)',
  image: '![alt text](url)',
  table: '| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell     | Cell     |',
  'fenced-code-block': '```\ncode here\n```',
}

function InsertMenu({ textareaRef, onTextChange }) {
  function handleAction(id) {
    const snippet = SNIPPETS[id]
    if (!snippet) return

    const textarea = textareaRef?.current
    if (!textarea) return

    const { newValue, newCursorPos } = insertSnippet(textarea.value, textarea.selectionStart, snippet)
    onTextChange(newValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    })
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

export default InsertMenu
