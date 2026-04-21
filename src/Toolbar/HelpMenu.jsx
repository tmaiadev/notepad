import { Button, Dropdown, Label } from '@heroui/react'

function HelpMenu() {
  return (
    <Dropdown>
      <Button size="sm" variant="ghost">Help</Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item id="cheat-sheet" textValue="Cheat Sheet">
            <Label>Cheat Sheet</Label>
          </Dropdown.Item>
          <Dropdown.Item id="source-code" textValue="Source Code">
            <Label>Source Code</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}

export default HelpMenu
