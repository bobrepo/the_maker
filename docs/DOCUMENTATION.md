# MSTT - Codebase Documentation

This document provides a comprehensive overview of the MSTT (Visual Programming Prototype) project, covering all files and their respective functions.

## Main Process (`src/main/`)

### `src/main/index.ts`
**Purpose:** Entry point for the Electron main process. Initializes the application and handles IPC (Inter-Process Communication).

*   **`createWindow()`**: Configures and creates the Electron browser window. Sets up preload scripts, security settings, and development/production URL loading.
*   **`app.whenReady().then(...)`**: Executes upon app initialization.
    *   Registers IPC handlers (`ipcMain.handle`):
        *   `run-python`: Saves generated code to a temp file and executes it via `cmd.exe`.
        *   `save-python`: Opens a dialog to save Python code to a file.
        *   `save-graph`: Opens a dialog to save graph structure to a `.json` file.
        *   `load-graph`: Opens a dialog to load graph structure from a `.json` file.
    *   Starts the window creation and activates app logic.
*   **`app.on('window-all-closed', ...)`**: Quits the application when all windows are closed (except on macOS).

## Preload (`src/preload/`)

### `src/preload/index.ts`
**Purpose:** Bridges the gap between the main process and the renderer process safely.

*   **Exposes APIs**: Uses `contextBridge` to expose necessary Electron APIs (`electronAPI`) and custom application APIs to the `window` object in the renderer process without violating context isolation.

## Renderer (`src/renderer/src/`)

### `src/renderer/src/App.tsx`
**Purpose:** Main application component that sets up the layout, ReactFlow canvas, and state.

*   **`Flow` Component**: The core container.
    *   `onDragOver`: Enables drop behavior by preventing default.
    *   `onDrop`: Handles adding new nodes to the canvas based on drag-and-drop events.
*   **`App` Component**: Wraps the `Flow` component in a `ReactFlowProvider` to provide required context.

### `src/renderer/src/main.tsx`
**Purpose:** Entry point for the React application in the renderer process. Renders the `App` component into the DOM.

### Components (`src/renderer/src/components/`)

#### `src/renderer/src/components/PropertiesPanel.tsx`
**Purpose:** Displays and allows editing of node properties.

*   **`PropertiesPanel`**: Finds the selected node, retrieves its definition from the `nodeRegistry`, and renders appropriate input fields based on property types (`string`/`number`).
*   **`handlePropertyChange`**: Updates the node's properties within the global `useGraphStore`.

#### `src/renderer/src/components/Sidebar.tsx`
**Purpose:** Shows available node types for the user to drag into the canvas.

*   **`Sidebar`**: Fetches categorized nodes from `nodeRegistry`.
*   **`onDragStart`**: Prepares drag-and-drop data for the node type being dragged.

#### `src/renderer/src/components/TopBar.tsx`
**Purpose:** Provides global actions (Run, Build, Save, Load).

*   **`handleRun` / `handleBuild`**: Uses `GraphEngine` to generate code, validates, and invokes main process IPC to run or save the Python output.
*   **`handleSaveGraph` / `handleLoadGraph`**: Invokes main process IPC to interact with the file system for JSON-based graph persistence.

#### `src/renderer/src/components/nodes/CustomNode.tsx`
**Purpose:** Renders the visual representation of a node in ReactFlow.

*   **`CustomNode`**: Retrieves node definition from `nodeRegistry`. Renders inputs/outputs as ReactFlow `Handle` components, based on the node's metadata.

### Engine (`src/renderer/src/engine/`)

#### `src/renderer/src/engine/GraphEngine.ts`
**Purpose:** Traverses the graph structure and generates executable code.

*   **`generateCode(nodes, edges)`**: Performs graph traversal (from a 'Start' node), detects cycles, and builds the code by invoking the `codeGenerator` defined in each node type.

### Nodes (`src/renderer/src/nodes/`)

*   **`core/StartNode.ts`**: Defines the 'Start' of a workflow (no inputs).
*   **`input/AgeCheckNode.ts`**: Defines a node that requests age input and checks it.
*   **`logic/ForLoopNode.ts`**: Defines a loop node with a configurable 'count' property.
*   **`output/PrintHelloWorldNode.ts`**: Defines an output node that prints configurable text.
*(Each node exports a `NodeDefinition` containing metadata and a `codeGenerator` function)*.

### Registry (`src/renderer/src/registry/`)

#### `src/renderer/src/registry/nodeRegistry.ts`
**Purpose:** Central repository for all node definitions.

*   **`register` / `get` / `getAll` / `getByCategory`**: Utility methods to manage the registration and retrieval of node types.

#### `src/renderer/src/registry/index.ts`
**Purpose:** Initializes all available nodes.

*   **`registerNodes()`**: Calls `nodeRegistry.register` for each node type.

### Store (`src/renderer/src/store/`)

#### `src/renderer/src/store/useGraphStore.ts`
**Purpose:** Global state management for the graph (nodes, edges, changes).

*   **State actions**: `onNodesChange`, `onEdgesChange`, `onConnect`, `addNode`, `updateNodeData`, `setNodes`, `setEdges` — wrappers for updating Zustand graph state.
