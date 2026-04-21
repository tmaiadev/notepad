import React from 'react'

// Button maps onPress → onClick
export function Button({ children, onPress, size: _size, variant, isIconOnly: _isIconOnly, ...props }) {
  return <button onClick={onPress} variant={variant} {...props}>{children}</button>
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
function DropdownMenu({ children, ...props }) {
  return <ul data-testid="Dropdown.Menu" {...props}>{children}</ul>
}
function DropdownItem({ children, textValue: _textValue, id: _id, ...props }) {
  return <li data-testid="Dropdown.Item" {...props}>{children}</li>
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

// Label
export function Label({ children, ...props }) {
  return <span data-testid="Label" {...props}>{children}</span>
}

// Separator
export function Separator({ children: _children, ...props }) {
  return <hr data-testid="Separator" {...props} />
}
