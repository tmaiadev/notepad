let listeners
let matchesDark

jest.mock('react-dom/client', () => ({
  createRoot: () => ({ render: jest.fn() }),
}))

jest.mock('./App.jsx', () => () => null)

function mockMatchMedia(matches) {
  matchesDark = matches
  listeners = []
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn(() => ({
      matches: matchesDark,
      addEventListener: jest.fn((event, cb) => listeners.push(cb)),
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
    require('./main.jsx')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('does not add .dark class when system prefers light', () => {
    mockMatchMedia(false)
    require('./main.jsx')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('updates .dark class when system preference changes', () => {
    mockMatchMedia(false)
    require('./main.jsx')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    listeners.forEach((cb) => cb({ matches: true }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    listeners.forEach((cb) => cb({ matches: false }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
