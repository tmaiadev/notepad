import { Button, ButtonGroup, Dropdown, Kbd, Label, Separator } from '@heroui/react'

function Toolbar({ viewMode, onViewModeChange }) {
  return (
    <div className="toolbar flex w-full items-center justify-between border-b border-border px-2 py-1">
      <div className="flex items-center">
        <FileMenu />
        <EditMenu />
        <InsertMenu />
        <HelpMenu />
      </div>
      <div className="flex items-center">
        <ButtonGroup size="sm" variant="ghost">
          <Button
            variant={viewMode === 'raw' ? 'secondary' : 'ghost'}
            onPress={() => onViewModeChange('raw')}
          >
            Raw
          </Button>
          <Button
            variant={viewMode === 'visualizer' ? 'secondary' : 'ghost'}
            onPress={() => onViewModeChange('visualizer')}
          >
            <ButtonGroup.Separator />
            Visualizer
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

function FileMenu() {
  return (
    <Dropdown>
      <Button size="sm" variant="ghost">File</Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
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

function InsertMenu() {
  return (
    <Dropdown>
      <Button size="sm" variant="ghost">Insert</Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.SubmenuTrigger>
            <Dropdown.Item id="list" textValue="List">
              <Label>List</Label>
              <Dropdown.SubmenuIndicator />
            </Dropdown.Item>
            <Dropdown.Popover>
              <Dropdown.Menu>
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

export default Toolbar
