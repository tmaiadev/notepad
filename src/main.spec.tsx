let listeners: Array<(e: { matches: boolean }) => void>
let matchesDark: boolean

jest.mock('react-dom/client', () => ({
  createRoot: () => ({ render: jest.fn() }),
}))

jest.mock('./App', () => () => null)

function mockMatchMedia(matches: boolean) {
  matchesDark = matches
  listeners = []
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn(() => ({
      matches: matchesDark,
      addEventListener: jest.fn((_event: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb)),
    })),
  })
}

beforeEach(() => {
  document.documentElement.classList.remove('dark')
  jest.resetModules()
})

describe('dark mode system preference', () => {
  it('adds .dark class when system prefers dark', () => {
    mockMatchMedia(true)
    require('./main')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('does not add .dark class when system prefers light', () => {
    mockMatchMedia(false)
    require('./main')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('updates .dark class when system preference changes', () => {
    mockMatchMedia(false)
    require('./main')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    listeners.forEach((cb) => cb({ matches: true }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    listeners.forEach((cb) => cb({ matches: false }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
