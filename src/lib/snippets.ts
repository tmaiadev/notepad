export type SnippetId =
  | 'unordered'
  | 'ordered'
  | 'definition'
  | 'task'
  | 'horizontal-rule'
  | 'link'
  | 'image'
  | 'table'
  | 'fenced-code-block'

export const SNIPPETS: Record<SnippetId, string> = {
  unordered: '- Item 1\n- Item 2',
  ordered: '1. Item 1\n2. Item 2',
  definition: 'Term\n: Definition',
  task: '[ ] Item 1\n[x] Item 2',
  'horizontal-rule': '---',
  link: '[link text](url)',
  image: '![alt text](url)',
  table: '| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell     | Cell     |',
  'fenced-code-block': '```\ncode here\n```',
}

export interface CheatSheetEntry {
  feature: string
  usage: readonly string[]
}

export const CHEAT_SHEET: readonly CheatSheetEntry[] = [
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
