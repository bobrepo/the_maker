# MSTT - Application Control Flow

This document maps the sequential control flow of the application from startup to the fully initialized state.

## Application Lifecycle Overview

The application follows a standard Electron lifecycle, split into a **Main Process** (Node.js) and a **Renderer Process** (React).

---

## 1. Main Process Startup (`src/main/index.ts`)

1.  **Entry Point:** The Electron runtime executes the main entry point defined in `package.json`.
2.  **`app.whenReady()`**:
    *   Once initialized, `app.whenReady()` triggers.
    *   **IPC Registration**: It sets up `ipcMain` handlers (`run-python`, `save-python`, `save-graph`, `load-graph`) that allow the renderer to communicate with the operating system (e.g., file system, executing commands).
    *   **Window Creation**: `createWindow()` is called.
3.  **`createWindow()`**:
    *   Creates a `BrowserWindow`.
    *   Configures `webPreferences` to include the **Preload Script** (`src/preload/index.ts`).
    *   Loads the renderer UI (either from a development server URL or `index.html` in production).

---

## 2. Preload Phase (`src/preload/index.ts`)

1.  **Context Isolation**: Before the renderer process executes, this script runs in a privileged context.
2.  **API Exposure**: It uses `contextBridge` to securely expose specific Electron/IPC APIs to the renderer's `window` object (e.g., `window.electron` and `window.api`). This ensures the renderer does not have direct, insecure access to Node.js primitives.

---

## 3. Renderer Process Startup (`src/renderer/src/main.tsx`)

1.  **Root Rendering**: The browser loads `index.html`, which imports `src/renderer/src/main.tsx`.
2.  **App Mount**: `main.tsx` renders the `<App />` component into the DOM root element.

---

## 4. Application Initialization (`src/renderer/src/App.tsx`)

1.  **ReactFlow Setup**: `App.tsx` wraps the UI in `ReactFlowProvider`, ensuring the ReactFlow state context is available.
2.  **Registry Initialization**: The `App` component uses an `useEffect` hook to call `registerNodes()`.
3.  **`src/renderer/src/registry/index.ts`**:
    *   This function executes and sequentially calls `nodeRegistry.register()` for each node defined in the project (`StartNode`, `PrintHelloWorldNode`, `ForLoopNode`, `AgeCheckNode`).
    *   This populates the `nodeRegistry` singleton, making all nodes available to the Sidebar and PropertiesPanel.
4.  **UI Render**: The UI (Sidebar, Flow canvas, PropertiesPanel) is rendered and becomes interactive. The application is now ready for user input.
