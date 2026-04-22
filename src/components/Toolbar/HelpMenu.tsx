import { useState } from 'react'
import { AlertDialog, Button, Dropdown, Label, Table } from '@heroui/react'
import { CHEAT_SHEET } from '../../lib/snippets'

const SOURCE_URL = 'https://github.com/tmaiadev/notepad'

export function HelpMenu() {
  const [showCheatSheet, setShowCheatSheet] = useState(false)

  function handleAction(key: string | number) {
    if (key === 'cheat-sheet') setShowCheatSheet(true)
    if (key === 'source-code') window.open(SOURCE_URL, '_blank')
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
