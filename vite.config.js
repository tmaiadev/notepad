import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Notepad by TMaiaDev',
        short_name: 'Notepad',
        description: 'A simple notepad with offline support',
        theme_color: '#0071e3',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'notepad-macOS-Default-1024x1024@2x.png',
            sizes: '2048x2048',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'notepad-macOS-Default-1024x1024@2x.png',
            sizes: '2048x2048',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
      },
    }),
  ],
})
