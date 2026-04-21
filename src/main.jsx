import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

function applyColorScheme(matches) {
  document.documentElement.classList.toggle('dark', matches)
}

applyColorScheme(darkModeQuery.matches)
darkModeQuery.addEventListener('change', (e) => applyColorScheme(e.matches))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
