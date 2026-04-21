import { insertSnippet, wrapSelection, toggleBlockquote, cycleHeading } from './utils'

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
