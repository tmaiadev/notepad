# Notepad

A lightweight, browser-based Markdown notepad with a classic desktop feel. Write in plain text or Markdown, preview the rendered output, and save files directly to your local filesystem.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (or npm / yarn)

### Install dependencies

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
pnpm build
```

The output is written to `dist/`. Serve it with any static file server:

```bash
pnpm preview
```

### Run tests

```bash
pnpm test
```

## Tech Stack

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [HeroUI](https://heroui.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [marked](https://marked.js.org/) — Markdown parsing

## License

Notepad — a lightweight browser-based Markdown notepad.
Copyright (C) 2026  Thalles Maia

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
