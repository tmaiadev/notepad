import React from 'react'

const AlertDialogCloseContext = React.createContext(null)

// Button maps onPress → onClick, slot="close" calls AlertDialog close
export function Button({ children, onPress, size: _size, variant, isIconOnly: _isIconOnly, slot, ...props }) {
  const closeFn = React.useContext(AlertDialogCloseContext)
  function handleClick() {
    if (slot === 'close' && closeFn) closeFn()
    if (onPress) onPress()
  }
  return <button onClick={handleClick} variant={variant} {...props}>{children}</button>
}

// ButtonGroup with Separator sub-component
function ButtonGroupSeparator({ children, ...props }) {
  return <span data-testid="ButtonGroup.Separator" {...props}>{children}</span>
}
export function ButtonGroup({ children, size: _size, variant: _variant, ...props }) {
  return <div data-testid="ButtonGroup" {...props}>{children}</div>
}
ButtonGroup.Separator = ButtonGroupSeparator

// Dropdown compound component
function DropdownPopover({ children, ...props }) {
  return <div data-testid="Dropdown.Popover" {...props}>{children}</div>
}
function DropdownMenu({ children, onAction, ...props }) {
  return <ul data-testid="Dropdown.Menu" data-onaction={onAction ? 'true' : undefined} {...props}>{
    React.Children.map(children, child => {
      if (React.isValidElement(child) && onAction) {
        return React.cloneElement(child, { _onAction: onAction })
      }
      return child
    })
  }</ul>
}
function DropdownItem({ children, textValue: _textValue, id, _onAction, ...props }) {
  return <li data-testid="Dropdown.Item" onClick={() => _onAction && _onAction(id)} {...props}>{children}</li>
}
function DropdownSubmenuTrigger({ children, ...props }) {
  return <div data-testid="Dropdown.SubmenuTrigger" {...props}>{children}</div>
}
function DropdownSubmenuIndicator({ children, ...props }) {
  return <span data-testid="Dropdown.SubmenuIndicator" {...props}>{children}</span>
}

export function Dropdown({ children, ...props }) {
  return <div data-testid="Dropdown" {...props}>{children}</div>
}
Dropdown.Popover = DropdownPopover
Dropdown.Menu = DropdownMenu
Dropdown.Item = DropdownItem
Dropdown.SubmenuTrigger = DropdownSubmenuTrigger
Dropdown.SubmenuIndicator = DropdownSubmenuIndicator

// Kbd compound component
function KbdAbbr({ keyValue, children, ...props }) {
  return <abbr data-testid="Kbd.Abbr" data-key={keyValue} {...props}>{children}</abbr>
}
function KbdContent({ children, ...props }) {
  return <span data-testid="Kbd.Content" {...props}>{children}</span>
}
export function Kbd({ children, slot: _slot, variant: _variant, ...props }) {
  return <kbd data-testid="Kbd" {...props}>{children}</kbd>
}
Kbd.Abbr = KbdAbbr
Kbd.Content = KbdContent

// Table compound component
function TableScrollContainer({ children, ...props }) {
  return <div data-testid="Table.ScrollContainer" {...props}>{children}</div>
}
function TableContent({ children, ...props }) {
  return <table data-testid="Table.Content" {...props}>{children}</table>
}
function TableHeader({ children, ...props }) {
  return <thead data-testid="Table.Header" {...props}>{children}</thead>
}
function TableColumn({ children, ...props }) {
  return <th data-testid="Table.Column" {...props}>{children}</th>
}
function TableBody({ children, ...props }) {
  return <tbody data-testid="Table.Body" {...props}>{children}</tbody>
}
function TableRow({ children, ...props }) {
  return <tr data-testid="Table.Row" {...props}>{children}</tr>
}
function TableCell({ children, ...props }) {
  return <td data-testid="Table.Cell" {...props}>{children}</td>
}
export function Table({ children, ...props }) {
  return <div data-testid="Table" {...props}>{children}</div>
}
Table.ScrollContainer = TableScrollContainer
Table.Content = TableContent
Table.Header = TableHeader
Table.Column = TableColumn
Table.Body = TableBody
Table.Row = TableRow
Table.Cell = TableCell

// Label
export function Label({ children, ...props }) {
  return <span data-testid="Label" {...props}>{children}</span>
}

// Separator
export function Separator({ children: _children, ...props }) {
  return <hr data-testid="Separator" {...props} />
}

// AlertDialog compound component
function AlertDialogBackdrop({ children, isOpen, onOpenChange, ...props }) {
  if (!isOpen) return null
  const close = () => onOpenChange && onOpenChange(false)
  return (
    <AlertDialogCloseContext.Provider value={close}>
      <div data-testid="AlertDialog.Backdrop" {...props}>{children}</div>
    </AlertDialogCloseContext.Provider>
  )
}
function AlertDialogContainer({ children, ...props }) {
  return <div data-testid="AlertDialog.Container" {...props}>{children}</div>
}
function AlertDialogDialog({ children, ...props }) {
  return <div data-testid="AlertDialog.Dialog" role={props.role || 'alertdialog'} {...props}>{children}</div>
}
function AlertDialogHeader({ children, ...props }) {
  return <div data-testid="AlertDialog.Header" {...props}>{children}</div>
}
function AlertDialogHeading({ children, ...props }) {
  return <h2 data-testid="AlertDialog.Heading" {...props}>{children}</h2>
}
function AlertDialogBody({ children, ...props }) {
  return <div data-testid="AlertDialog.Body" {...props}>{children}</div>
}
function AlertDialogFooter({ children, ...props }) {
  return <div data-testid="AlertDialog.Footer" {...props}>{children}</div>
}

export function AlertDialog({ children, ...props }) {
  return <div data-testid="AlertDialog" {...props}>{children}</div>
}
AlertDialog.Backdrop = AlertDialogBackdrop
AlertDialog.Container = AlertDialogContainer
AlertDialog.Dialog = AlertDialogDialog
AlertDialog.Header = AlertDialogHeader
AlertDialog.Heading = AlertDialogHeading
AlertDialog.Body = AlertDialogBody
AlertDialog.Footer = AlertDialogFooter
