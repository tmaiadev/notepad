import { useState } from 'react'
import { AlertDialog, Button, Dropdown, Label, Table } from '@heroui/react'

const CHEAT_SHEET = [
  { feature: 'Heading 1',       usage: ['# heading 1'] },
  { feature: 'Heading 2',       usage: ['## heading 2'] },
  { feature: 'Heading 3',       usage: ['### heading 3'] },
  { feature: 'Bold',            usage: ['**bold**'] },
  { feature: 'Italic',          usage: ['*italic*'] },
  { feature: 'Strikethrough',   usage: ['~~strikethrough~~'] },
  { feature: 'Blockquote',      usage: ['> blockquote'] },
  { feature: 'Ordered List',    usage: ['1. Item 1', '2. Item 2'] },
  { feature: 'Unordered List',  usage: ['- Item 1', '- Item 2'] },
  { feature: 'Task List',       usage: ['- [ ] Task 1', '- [x] Task 2'] },
  { feature: 'Code',            usage: ['`code`'] },
  { feature: 'Code Block',      usage: ['```', 'code block', '```'] },
  { feature: 'Horizontal Rule', usage: ['---'] },
  { feature: 'Link',            usage: ['[title](https://www.example.com)'] },
  { feature: 'Image',           usage: ['![alt text](https://url.com/image.jpg)'] },
  { feature: 'Table',           usage: ['| Col 1 | Col 2 |', '| ----- | ----- |', '| Cell  | Cell  |'] },
  { feature: 'Footnote',        usage: ["Here's a sentence[^1]", '[^1]: Footnote text'] },
]

function HelpMenu() {
  const [showCheatSheet, setShowCheatSheet] = useState(false)

  function handleAction(id) {
    if (id === 'cheat-sheet') setShowCheatSheet(true)
  }

  return (
    <>
      <Dropdown>
        <Button size="sm" variant="ghost">Help</Button>
        <Dropdown.Popover>
          <Dropdown.Menu onAction={handleAction}>
            <Dropdown.Item id="cheat-sheet" textValue="Cheat Sheet">
              <Label>Cheat Sheet</Label>
            </Dropdown.Item>
            <Dropdown.Item id="source-code" textValue="Source Code">
              <Label>Source Code</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <AlertDialog.Backdrop isOpen={showCheatSheet} onOpenChange={setShowCheatSheet}>
        <AlertDialog.Container>
          <AlertDialog.Dialog role="dialog">
            <AlertDialog.Header>
              <AlertDialog.Heading>Cheat Sheet</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <Table>
                <Table.ScrollContainer>
                  <Table.Content aria-label="Markdown cheat sheet">
                    <Table.Header>
                      <Table.Column isRowHeader>Feature</Table.Column>
                      <Table.Column>Usage</Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {CHEAT_SHEET.map(({ feature, usage }) => (
                        <Table.Row key={feature}>
                          <Table.Cell className="whitespace-nowrap">{feature}</Table.Cell>
                          <Table.Cell>
                            <code>
                              {usage.map((line, i) => (
                                <span key={i}>{line}{i < usage.length - 1 && <br />}</span>
                              ))}
                            </code>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="primary" slot="close">Close</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  )
}

export default HelpMenu
