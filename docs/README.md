# MSTT - Visual Programming Prototype

A visual programming prototype built with Electron, React, TypeScript, and ReactFlow. This application allows users to construct node-based workflows and generate code based on those structures.

## Project Structure

```text
├── electron/           # Main process files
├── src/renderer/       # Renderer process (UI)
│   ├── components/     # UI Components (Sidebar, PropertiesPanel, etc.)
│   ├── engine/         # Core graph execution logic
│   ├── nodes/          # Concrete node implementations
│   ├── registry/       # Node registry management
│   ├── store/          # Zustand state management
│   └── types/          # TypeScript definitions
└── package.json        # Project dependencies and scripts
```

## Detailed Component Analysis

### 1. `src/renderer/src/engine/GraphEngine.ts`
**Purpose:** Orchestrates the transformation of the visual node graph into executable code.

*   **`generateCode(nodes, edges)`**:
    *   Validates graph structure (checks for a 'Start' node).
    *   Iteratively traverses the graph using edge connections.
    *   Detects circular dependencies.
    *   For each node, calls its associated `codeGenerator` defined in the `NodeRegistry` to assemble the final code string.

### 2. `src/renderer/src/registry/nodeRegistry.ts`
**Purpose:** Acts as a central repository for all available node types, their capabilities, and code generation rules.

*   **`register(node)`**: Adds a new `NodeDefinition` (e.g., input, logic, output nodes) to the internal map.
*   **`get(id)`**: Fetches a specific `NodeDefinition` to retrieve its metadata or generation logic.
*   **`getAll()`**: Returns an array of all registered node definitions.
*   **`getByCategory()`**: Organizes all nodes by their `category` property to facilitate rendering categorized menus in the UI.

### 3. `src/renderer/src/store/useGraphStore.ts`
**Purpose:** Manages the global state of the visual programming canvas, facilitating communication between components.

*   **`onNodesChange` / `onEdgesChange`**: Handles ReactFlow lifecycle updates for nodes and edges, ensuring the state remains consistent with UI interactions.
*   **`onConnect(connection)`**: Adds a new edge between two nodes when the user connects them in the UI.
*   **`addNode(node)`**: Appends a new node instance to the graph state.
*   **`updateNodeData(nodeId, data)`**: Updates the properties/data of a specific node (e.g., setting a threshold value in a logic node), triggering a re-render.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Development:**
   ```bash
   npm run dev
   ```

3. **Build:**
   ```bash
   npm run build
   ```

## Tech Stack
- Electron
- React
- TypeScript
- Vite
- ReactFlow
- Zustand
- Tailwind CSS
