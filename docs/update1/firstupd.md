# Update 1 - Custom Methods & Enhanced Workflow

This update introduces custom Python method management, dynamic method calling, and quality-of-life improvements for the graph editor.

## New Features

### 1. Custom Method Definition Block
- **Category:** Methods
- **Functionality:** Allows users to define a custom Python method.
- **Cursor Integration:** A button on the block opens the corresponding `.py` file in **Cursor** for editing.
- **Dynamic Signature Sync:** Users can edit the method signature directly in Cursor (e.g., adding parameters like `def my_method(a, b, c):` or return statements). Clicking the **"Sync Ports with Cursor Code"** button in the Properties Panel automatically updates the block's data ports to match the new signature.
- **Persistence:** Methods are saved in a dedicated `methods/` folder in the project root.
- **Visuals:** Minimalist design with no execution flow points (declarative only).

### 2. Method Call Block
- **Category:** Methods
- **Functionality:** Calls a previously defined custom method.
- **Dynamic Selection:** A dropdown in the Properties Panel allows selecting from available methods in the `methods/` folder.
- **Automatic Port Generation:** Dynamically generates input ports for method arguments and an output port for the return value based on the method's signature.
- **Custom Call Override:** Users can now manually type a custom command in the Properties Panel to override the automatic generation (e.g., to pass specific named arguments or handle complex assignments).
- **Visual Style:** Features a thick white outline/border with a glow effect to distinguish it as an external call block.
- **Code Generation:** Injects the method call into the final Python script, including variable assignment for return values.

### 3. Build to Desktop
- The **Build** button in the TopBar now automatically saves the generated `main.py` script directly to the user's Desktop for quick access.

### 4. Delete Functionality
- Users can now delete selected nodes and edges by pressing the **Delete** or **Backspace** key on their keyboard. Focus protection ensures that typing in property fields doesn't accidentally trigger deletion.

## Architectural Changes

### Main Process (`src/main/index.ts`)
- Added `methods:list`: Scans the `methods/` folder and parses files.
- Added `methods:create-or-update`: Manages method file creation and updates.
- Added `methods:open-vscode`: Launches VS Code for a specific method file.
- Added `build-python`: Handles saving code to the Desktop.
- Implemented `parsePythonMethod` helper to extract signature using regex.

### Graph Engine (`src/renderer/src/engine/GraphEngine.ts`)
- Converted `generateCode` to an `async` function.
- Implemented method code injection: All custom methods used in the graph are prepended to the final script.
- Enhanced data flow resolution: The engine now resolves connections to data ports, allowing method calls to receive values from other nodes.

### State Management (`src/renderer/src/store/useGraphStore.ts`)
- Added `deleteSelected` action to handle bulk removal of selected elements.

### UI Components
- **CustomNode:** Added support for dynamic ports, special border styles, and VS Code launch buttons.
- **PropertiesPanel:** Added method discovery logic, dynamic port refresh, and method selection dropdowns.
- **App:** Added global keyboard event listeners for deletion.

---
*Date: Sunday, June 21, 2026*
