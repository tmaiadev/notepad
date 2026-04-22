import React from 'react'

const AlertDialogCloseContext = React.createContext<(() => void) | null>(null)

type AnyProps = Record<string, unknown> & { children?: React.ReactNode }

export function Button({ children, onPress, size: _size, variant, isIconOnly: _isIconOnly, slot, ...props }: AnyProps & {
  onPress?: () => void
  variant?: string
  isIconOnly?: boolean
  slot?: string
  size?: string
}) {
  const closeFn = React.useContext(AlertDialogCloseContext)
  function handleClick() {
    if (slot === 'close' && closeFn) closeFn()
    if (onPress) onPress()
  }
  const attrs = { ...props, variant: variant as string | undefined } as Record<string, unknown>
  return <button onClick={handleClick} {...attrs}>{children}</button>
}

function ButtonGroupSeparator({ children, ...props }: AnyProps) {
  return <span data-testid="ButtonGroup.Separator" {...props}>{children}</span>
}
export function ButtonGroup({ children, size: _size, variant: _variant, ...props }: AnyProps & { size?: string; variant?: string }) {
  return <div data-testid="ButtonGroup" {...props}>{children}</div>
}
ButtonGroup.Separator = ButtonGroupSeparator

function DropdownPopover({ children, ...props }: AnyProps) {
  return <div data-testid="Dropdown.Popover" {...props}>{children}</div>
}
function DropdownMenu({ children, onAction, ...props }: AnyProps & { onAction?: (id: string) => void }) {
  return (
    <ul data-testid="Dropdown.Menu" data-onaction={onAction ? 'true' : undefined} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && onAction) {
          return React.cloneElement(child as React.ReactElement<{ _onAction?: (id: string) => void }>, { _onAction: onAction })
        }
        return child
      })}
    </ul>
  )
}
function DropdownItem({ children, textValue: _textValue, id, _onAction, ...props }: AnyProps & { id?: string; textValue?: string; _onAction?: (id: string) => void }) {
  return <li data-testid="Dropdown.Item" onClick={() => _onAction && id && _onAction(id)} {...props}>{children}</li>
}
function DropdownSubmenuTrigger({ children, ...props }: AnyProps) {
  return <div data-testid="Dropdown.SubmenuTrigger" {...props}>{children}</div>
}
function DropdownSubmenuIndicator({ children, ...props }: AnyProps) {
  return <span data-testid="Dropdown.SubmenuIndicator" {...props}>{children}</span>
}

export function Dropdown({ children, ...props }: AnyProps) {
  return <div data-testid="Dropdown" {...props}>{children}</div>
}
Dropdown.Popover = DropdownPopover
Dropdown.Menu = DropdownMenu
Dropdown.Item = DropdownItem
Dropdown.SubmenuTrigger = DropdownSubmenuTrigger
Dropdown.SubmenuIndicator = DropdownSubmenuIndicator

function KbdAbbr({ keyValue, children, ...props }: AnyProps & { keyValue?: string }) {
  return <abbr data-testid="Kbd.Abbr" data-key={keyValue} {...props}>{children}</abbr>
}
function KbdContent({ children, ...props }: AnyProps) {
  return <span data-testid="Kbd.Content" {...props}>{children}</span>
}
export function Kbd({ children, slot: _slot, variant: _variant, ...props }: AnyProps & { slot?: string; variant?: string }) {
  return <kbd data-testid="Kbd" {...props}>{children}</kbd>
}
Kbd.Abbr = KbdAbbr
Kbd.Content = KbdContent

function TableScrollContainer({ children, ...props }: AnyProps) {
  return <div data-testid="Table.ScrollContainer" {...props}>{children}</div>
}
function TableContent({ children, ...props }: AnyProps) {
  return <table data-testid="Table.Content" {...props}>{children}</table>
}
function TableHeader({ children, ...props }: AnyProps) {
  return <thead data-testid="Table.Header" {...props}>{children}</thead>
}
function TableColumn({ children, ...props }: AnyProps) {
  return <th data-testid="Table.Column" {...props}>{children}</th>
}
function TableBody({ children, ...props }: AnyProps) {
  return <tbody data-testid="Table.Body" {...props}>{children}</tbody>
}
function TableRow({ children, ...props }: AnyProps) {
  return <tr data-testid="Table.Row" {...props}>{children}</tr>
}
function TableCell({ children, ...props }: AnyProps) {
  return <td data-testid="Table.Cell" {...props}>{children}</td>
}
export function Table({ children, ...props }: AnyProps) {
  return <div data-testid="Table" {...props}>{children}</div>
}
Table.ScrollContainer = TableScrollContainer
Table.Content = TableContent
Table.Header = TableHeader
Table.Column = TableColumn
Table.Body = TableBody
Table.Row = TableRow
Table.Cell = TableCell

export function Label({ children, ...props }: AnyProps) {
  return <span data-testid="Label" {...props}>{children}</span>
}

export function Separator({ children: _children, ...props }: AnyProps) {
  return <hr data-testid="Separator" {...props} />
}

function AlertDialogBackdrop({ children, isOpen, onOpenChange, ...props }: AnyProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  if (!isOpen) return null
  const close = () => onOpenChange && onOpenChange(false)
  return (
    <AlertDialogCloseContext.Provider value={close}>
      <div data-testid="AlertDialog.Backdrop" {...props}>{children}</div>
    </AlertDialogCloseContext.Provider>
  )
}
function AlertDialogContainer({ children, ...props }: AnyProps) {
  return <div data-testid="AlertDialog.Container" {...props}>{children}</div>
}
function AlertDialogDialog({ children, role, ...props }: AnyProps & { role?: string }) {
  return <div data-testid="AlertDialog.Dialog" role={role || 'alertdialog'} {...props}>{children}</div>
}
function AlertDialogHeader({ children, ...props }: AnyProps) {
  return <div data-testid="AlertDialog.Header" {...props}>{children}</div>
}
function AlertDialogHeading({ children, ...props }: AnyProps) {
  return <h2 data-testid="AlertDialog.Heading" {...props}>{children}</h2>
}
function AlertDialogBody({ children, ...props }: AnyProps) {
  return <div data-testid="AlertDialog.Body" {...props}>{children}</div>
}
function AlertDialogFooter({ children, ...props }: AnyProps) {
  return <div data-testid="AlertDialog.Footer" {...props}>{children}</div>
}

export function AlertDialog({ children, ...props }: AnyProps) {
  return <div data-testid="AlertDialog" {...props}>{children}</div>
}
AlertDialog.Backdrop = AlertDialogBackdrop
AlertDialog.Container = AlertDialogContainer
AlertDialog.Dialog = AlertDialogDialog
AlertDialog.Header = AlertDialogHeader
AlertDialog.Heading = AlertDialogHeading
AlertDialog.Body = AlertDialogBody
AlertDialog.Footer = AlertDialogFooter
