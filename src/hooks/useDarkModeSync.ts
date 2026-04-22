export function syncDarkMode(): void {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  apply(query.matches)
  query.addEventListener('change', (e) => apply(e.matches))
}

function apply(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark)
}
