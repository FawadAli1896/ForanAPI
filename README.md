# ForanAPI ⚡

> A lightweight, fast, local-first desktop API testing tool inspired by Bruno. Built with **Electron**, **React**, and **TypeScript**.

---

https://raw.githubusercontent.com/FawadAli1896/ForanAPI/refs/heads/main/public/icon.ico

## 🚀 Features

- **⚡ Full HTTP Method Support**: Execute `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS` requests natively without CORS restrictions.
- **🛠️ Rich Request Configuration**:
  - **Dynamic URL Bar**: Real-time variable interpolation (e.g., `{{baseUrl}}/posts`).
  - **Query Parameters**: Tabular key-value editor synced bidirectionally with the URL query string.
  - **Headers**: Multi-row headers editor with enable/disable toggles.
  - **Authentication**: Built-in support for **Bearer Token**, **Basic Auth** (username/password), **API Key** (in header or query), and **No Auth**.
  - **Request Body**: JSON editor with live syntax validation and one-click beautification, plus raw text mode.
- **📊 Intuitive Response Inspector**:
  - Status code pill with color coding (`2xx` green, `3xx` blue, `4xx` amber, `5xx`/error red).
  - Exact latency (ms) and payload size calculation.
  - Sub-views: **Pretty** (syntax-highlighted JSON with line numbers and in-payload search), **Raw** text, and **Response Headers** table.
  - One-click copy and file download for responses.
- **📁 Collections & Folders**:
  - Organize requests hierarchically in collections and nested folders.
  - Create, rename, duplicate, and delete requests.
  - Multi-tab workspace allowing multiple requests to be edited and executed simultaneously.
  - JSON import and export for sharing collections.
- **🌐 Environment Variables (`{{variable}}`)**:
  - Manage multiple environments (e.g. *Development*, *Production*, *Staging*).
  - Define key-value pairs with masking support for sensitive tokens/secrets.
  - Switch active environments on the fly from the top bar.
- **🌓 Responsive Modern UI**:
  - Developer-focused, minimalist aesthetics inspired by Bruno.
  - Dark mode and light mode toggle.
  - Keyboard shortcuts: `Ctrl + Enter` to Send, `Ctrl + S` to Save.
- **🔒 Local-First & Secure**:
  - All data is stored locally on your device (`userData/foranapi-store.json`).
  - Native Node HTTP engine bypasses browser sandbox limitations while keeping context isolation secure.

---

## 🏗️ Project Architecture

```
ForanAPI/
├── electron/
│   ├── main.ts         # Electron window creation & IPC handlers (HTTP execution, dialogs, store)
│   ├── preload.ts      # ContextBridge exposing typed window.foranAPI
│   └── store.ts        # Local-first filesystem persistence in user AppData
├── src/
│   ├── components/     # UI components (Header, Sidebar, TabBar, RequestPane, ResponsePane, etc.)
│   ├── context/        # AppContext with reactive state, tabs, and auto-save
│   ├── types/          # TypeScript interfaces for requests, collections, environments
│   ├── utils/          # cURL generator, variable resolver, default collections
│   ├── App.tsx         # Main layout container
│   ├── main.tsx        # React root
│   └── index.css       # Design tokens, color system, and themes
├── vite.config.mjs     # Vite configuration
├── tsconfig.json       # Frontend TS config
└── tsconfig.electron.json # Electron TS config
```

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (Node 20+ recommended)
- `npm`

### Installation

```bash
# Clone or navigate to the workspace
cd c:\laragon\www\API

# Install dependencies
npm install
```

### Running in Development

To start the full desktop Electron application with hot reloading:

```bash
npm run dev
```

To run the web UI preview in your browser:

```bash
npm run dev:web
```

### Building for Production

Compile both the Electron backend and the Vite frontend:

```bash
npm run build
```

To launch the compiled desktop app:

```bash
npm start
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Enter` | Send active HTTP request |
| `Ctrl + S` | Save current request changes |
