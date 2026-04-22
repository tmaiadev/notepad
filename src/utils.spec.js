import { insertSnippet, wrapSelection, toggleBlockquote, cycleHeading, continueList } from './utils'

describe('continueList', () => {
  describe('task list (GFM: - [ ])', () => {
    it('continues an unchecked task item', () => {
      const text = '- [ ] buy milk'
      const { newValue, newCursorPos } = continueList(text, text.length, text.length)
      expect(newValue).toBe('- [ ] buy milk\n- [ ] ')
      expect(newCursorPos).toBe(newValue.length)
    })

    it('continues a checked task item as unchecked', () => {
      const text = '- [x] done'
      const { newValue } = continueList(text, text.length, text.length)
      expect(newValue).toBe('- [x] done\n- [ ] ')
    })

    it('works with * prefix', () => {
      const { newValue } = continueList('* [ ] item', 10, 10)
      expect(newValue).toBe('* [ ] item\n* [ ] ')
    })
  })

  describe('app task format ([ ] without dash)', () => {
    it('continues [ ] format', () => {
      const text = '[ ] item'
      const { newValue } = continueList(text, text.length, text.length)
      expect(newValue).toBe('[ ] item\n[ ] ')
    })

    it('continues [x] format as unchecked', () => {
      const { newValue } = continueList('[x] done', 8, 8)
      expect(newValue).toBe('[x] done\n[ ] ')
    })
  })

  describe('unordered list', () => {
    it('continues a dash list', () => {
      const text = '- item'
      const { newValue } = continueList(text, text.length, text.length)
      expect(newValue).toBe('- item\n- ')
    })

    it('continues an asterisk list', () => {
      const { newValue } = continueList('* item', 6, 6)
      expect(newValue).toBe('* item\n* ')
    })

    it('continues a plus list', () => {
      const { newValue } = continueList('+ item', 6, 6)
      expect(newValue).toBe('+ item\n+ ')
    })

    it('preserves indentation', () => {
      const { newValue } = continueList('  - item', 8, 8)
      expect(newValue).toBe('  - item\n  - ')
    })
  })

  describe('ordered list', () => {
    it('increments the number', () => {
      const { newValue } = continueList('1. first', 8, 8)
      expect(newValue).toBe('1. first\n2. ')
    })

    it('increments from any number', () => {
      const { newValue } = continueList('5. fifth', 8, 8)
      expect(newValue).toBe('5. fifth\n6. ')
    })

    it('preserves indentation', () => {
      const { newValue } = continueList('  3. item', 9, 9)
      expect(newValue).toBe('  3. item\n  4. ')
    })
  })

  describe('empty list item (exit list)', () => {
    it('removes unordered prefix when item is empty', () => {
      const text = '- Item 1\n- '
      const { newValue, newCursorPos } = continueList(text, text.length, text.length)
      expect(newValue).toBe('- Item 1\n')
      expect(newCursorPos).toBe('- Item 1\n'.length)
    })

    it('removes task prefix when item is empty', () => {
      const text = '- [x] Item 1\n- [ ] Item 2\n- [ ] '
      const { newValue, newCursorPos } = continueList(text, text.length, text.length)
      expect(newValue).toBe('- [x] Item 1\n- [ ] Item 2\n')
      expect(newCursorPos).toBe('- [x] Item 1\n- [ ] Item 2\n'.length)
    })

    it('removes ordered prefix when item is empty', () => {
      const text = '1. Item 1\n2. '
      const { newValue, newCursorPos } = continueList(text, text.length, text.length)
      expect(newValue).toBe('1. Item 1\n')
      expect(newCursorPos).toBe('1. Item 1\n'.length)
    })

    it('removes app-format task prefix when item is empty', () => {
      const { newValue } = continueList('[ ] Item 1\n[ ] ', 15, 15)
      expect(newValue).toBe('[ ] Item 1\n')
    })

    it('does not exit when the item has content', () => {
      const { newValue } = continueList('- item', 6, 6)
      expect(newValue).toBe('- item\n- ')
    })

    it('does not exit when cursor is after prefix but line has trailing content', () => {
      // cursor right after "- " but "text" still exists on the line
      const { newValue } = continueList('- text', 2, 2)
      expect(newValue).toBe('- \n- text')
    })
  })

  describe('non-list lines', () => {
    it('returns null for plain text', () => {
      expect(continueList('just text', 9, 9)).toBeNull()
    })

    it('returns null for an empty string', () => {
      expect(continueList('', 0, 0)).toBeNull()
    })

    it('returns null for a heading', () => {
      expect(continueList('# heading', 9, 9)).toBeNull()
    })
  })

  describe('multi-line text', () => {
    it('detects the list from the current line only', () => {
      const text = 'intro\n- item'
      const { newValue } = continueList(text, text.length, text.length)
      expect(newValue).toBe('intro\n- item\n- ')
    })

    it('inserts after selectionStart and removes selected text', () => {
      const text = '- item text'
      const { newValue, newCursorPos } = continueList(text, 7, 11)
      expect(newValue).toBe('- item \n- ')
      expect(newCursorPos).toBe('- item \n- '.length)
    })

    it('works on the first of many lines', () => {
      const text = '- first\n- second'
      const { newValue } = continueList(text, 7, 7)
      expect(newValue).toBe('- first\n- \n- second')
    })
  })
})

describe('insertSnippet', () => {
  it('inserts snippet on a new line below the current line', () => {
    expect(insertSnippet('hello\nworld', 2, '---').newValue).toBe('hello\n---\nworld')
  })

  it('appends snippet at the end when cursor is on the last line', () => {
    expect(insertSnippet('hello', 2, '---').newValue).toBe('hello\n---')
  })

  it('works on an empty string', () => {
    expect(insertSnippet('', 0, '---').newValue).toBe('\n---')
  })

  it('places cursor at the end of the inserted snippet', () => {
    expect(insertSnippet('hello', 0, '---').newCursorPos).toBe(9)
  })

  it('inserts below the line even when cursor is at line start', () => {
    expect(insertSnippet('abc\ndef', 0, '---').newValue).toBe('abc\n---\ndef')
  })

  it('inserts multi-line snippets correctly', () => {
    const { newValue } = insertSnippet('title', 0, '- a\n- b')
    expect(newValue).toBe('title\n- a\n- b')
  })
})

describe('wrapSelection', () => {
  it('wraps selected text with the given marker', () => {
    expect(wrapSelection('hello world', 6, 11, '**').newValue).toBe('hello **world**')
  })

  it('wraps with single-char marker (italic)', () => {
    expect(wrapSelection('foo', 0, 3, '*').newValue).toBe('*foo*')
  })

  it('wraps an empty selection (no text selected)', () => {
    expect(wrapSelection('foo', 1, 1, '**').newValue).toBe('f****oo')
  })

  it('places cursor inside markers when selection is empty', () => {
    const { newSelectionStart, newSelectionEnd } = wrapSelection('foo', 1, 1, '**')
    expect(newSelectionStart).toBe(3)
    expect(newSelectionEnd).toBe(3)
  })

  it('keeps selection spanning the original text after wrapping', () => {
    const { newSelectionStart, newSelectionEnd } = wrapSelection('hello world', 6, 11, '**')
    expect(newSelectionStart).toBe(8)
    expect(newSelectionEnd).toBe(13)
  })

  it('works at the start of the string', () => {
    expect(wrapSelection('foo', 0, 3, '~~').newValue).toBe('~~foo~~')
  })

  it('works at the end of the string', () => {
    expect(wrapSelection('foo', 3, 3, '`').newValue).toBe('foo``')
  })

  it('works with == marker (highlight)', () => {
    expect(wrapSelection('mark this', 5, 9, '==').newValue).toBe('mark ==this==')
  })
})

describe('toggleBlockquote', () => {
  it('prepends "> " to a plain line', () => {
    expect(toggleBlockquote('foo', 0, 0).newValue).toBe('> foo')
  })

  it('does nothing if the line already starts with >', () => {
    expect(toggleBlockquote('> foo', 0, 0).newValue).toBe('> foo')
  })

  it('only affects the line containing the cursor in multi-line text', () => {
    const text = 'first\nsecond\nthird'
    expect(toggleBlockquote(text, 6, 6).newValue).toBe('first\n> second\nthird')
  })

  it('does not affect surrounding lines', () => {
    const text = 'before\ntarget\nafter'
    expect(toggleBlockquote(text, 7, 7).newValue).toBe('before\n> target\nafter')
  })

  it('shifts cursor forward by 2 when prefix is added', () => {
    const { newSelectionStart, newSelectionEnd } = toggleBlockquote('foo', 1, 3)
    expect(newSelectionStart).toBe(3)
    expect(newSelectionEnd).toBe(5)
  })

  it('leaves cursor unchanged when line already starts with >', () => {
    const { newSelectionStart, newSelectionEnd } = toggleBlockquote('> foo', 2, 4)
    expect(newSelectionStart).toBe(2)
    expect(newSelectionEnd).toBe(4)
  })

  it('handles an empty line', () => {
    expect(toggleBlockquote('', 0, 0).newValue).toBe('> ')
  })
})

describe('cycleHeading', () => {
  describe('heading level cycling', () => {
    it('adds # to a plain line (level 0 → 1)', () => {
      expect(cycleHeading('foo', 0, 0).newValue).toBe('# foo')
    })

    it('advances from # to ## (level 1 → 2)', () => {
      expect(cycleHeading('# foo', 0, 0).newValue).toBe('## foo')
    })

    it('advances from ## to ### (level 2 → 3)', () => {
      expect(cycleHeading('## foo', 0, 0).newValue).toBe('### foo')
    })

    it('removes ### and returns plain text (level 3 → 0)', () => {
      expect(cycleHeading('### foo', 0, 0).newValue).toBe('foo')
    })

    it('handles an empty line', () => {
      expect(cycleHeading('', 0, 0).newValue).toBe('# ')
    })

    it('treats a line starting with #### as plain (not in cycle)', () => {
      expect(cycleHeading('#### foo', 0, 0).newValue).toBe('# #### foo')
    })
  })

  describe('multi-line text', () => {
    it('only transforms the line containing the cursor', () => {
      const text = 'first\n## second\nthird'
      const { newValue } = cycleHeading(text, 8, 8)
      expect(newValue).toBe('first\n### second\nthird')
    })

    it('does not affect surrounding lines when removing a heading', () => {
      const text = 'before\n### target\nafter'
      const cursor = 'before\n### '.length
      const { newValue } = cycleHeading(text, cursor, cursor)
      expect(newValue).toBe('before\ntarget\nafter')
    })

    it('correctly targets the first line', () => {
      const text = 'first\nsecond'
      const { newValue } = cycleHeading(text, 0, 0)
      expect(newValue).toBe('# first\nsecond')
    })

    it('correctly targets the last line', () => {
      const text = 'first\nsecond'
      const { newValue } = cycleHeading(text, text.length, text.length)
      expect(newValue).toBe('first\n# second')
    })
  })

  describe('cursor adjustment', () => {
    it('moves cursor forward when hashes are added', () => {
      const { newSelectionStart, newSelectionEnd } = cycleHeading('foo', 1, 1)
      expect(newSelectionStart).toBe(3)
      expect(newSelectionEnd).toBe(3)
    })

    it('moves cursor forward by 1 when advancing an existing heading', () => {
      const { newSelectionStart } = cycleHeading('# foo', 3, 3)
      expect(newSelectionStart).toBe(4)
    })

    it('moves cursor backward when hashes are removed, clamped to line start', () => {
      const { newSelectionStart, newSelectionEnd } = cycleHeading('### foo', 1, 1)
      expect(newSelectionStart).toBe(0)
      expect(newSelectionEnd).toBe(0)
    })

    it('preserves a selection spanning text content', () => {
      const { newSelectionStart, newSelectionEnd } = cycleHeading('foo bar', 0, 3)
      expect(newSelectionStart).toBe(2)
      expect(newSelectionEnd).toBe(5)
    })
  })
})
