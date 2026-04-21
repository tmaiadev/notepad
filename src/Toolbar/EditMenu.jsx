import { Button, Dropdown, Kbd, Label, Separator } from '@heroui/react'

function EditMenu() {
  return (
    <Dropdown>
      <Button size="sm" variant="ghost">Edit</Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
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
              <Kbd.Content>-</Kbd.Content>
            </Kbd>
          </Dropdown.Item>
          <Dropdown.Item id="highlight" textValue="Highlight">
            <Label>Highlight</Label>
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

export default EditMenu
