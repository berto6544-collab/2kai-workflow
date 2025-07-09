# 🧠 2kai Workflow Builder

A custom **React-based visual workflow builder** inspired by [n8n](https://n8n.io), allowing users to create, connect, and execute custom logic flows via a drag-and-drop node system.

<img src="https://github.com/berto6544-collab/2kai-workflow/blob/main/src/assets/Ui.png" width="100%"/>

---

## ✨ Features

- ⚙️ **Custom Node System** – Easily extendable node architecture via `nodeTypes`.
- 🔗 **Connection-Based Flow** – Drag and connect nodes to define execution order.
- 🎛 **Side Panel Configuration** – Select a node to update its config in a dynamic form panel.
- 🧩 **Modular Components** – Fully component-based structure using `NodeComponent`, `RenderFormField`, and utility handlers.
- 💡 **Execution Engine** – Runs nodes sequentially based on topological ordering.
- 🔄 **Interactive Canvas** – Drag, pan, zoom, and reset view for a smooth UX.
- 🗑️ **Safe Deletion** – Confirm before removing nodes (supports `Delete` key).
- 🧰 **Custom Node Execution Logic** – Defined via `NodeFunction`.

---

## 🧱 Architecture Overview
src/
├── components/
│ ├── nodes.js # Renders individual node components (icon, color, config)
│ └── PanelField.js # Generates dynamic config forms for selected nodes
├── util/
│ ├── util.js # Contains the logic to execute nodes in flow order
│ └── nodeArrays.js # Defines node types, schema, icons, and categories
├── N8NWorkflowPlatform.js # Main app UI: canvas, panel, and node management
└── App.js # App entry point that renders the workflow platform


## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/2kai-workflow.git
cd 2kai-workflow

2. Install dependencies

npm install

3. Start the development server

npm run dev

Visit http://localhost:5173 to view it in your browser.
🧩 How to Add a Custom Node

Update nodeArrays.js to define a new node type:

{
  id: 'my-node',
  name: 'My Node',
  icon: SomeIcon,
  color: 'from-indigo-500 to-indigo-600',
  category: 'Custom',
  config: [
    { name: 'apiUrl', type: 'text', label: 'API URL', value: '' }
  ]
}



Define its logic in util.js inside the NodeFunction handler.
🔧 Customization Tips

    Zoom Behavior: Update handleWheel to add pinch zoom or scroll sensitivity.

    Node Output Display: Extend NodeComponent to show result/output in UI.

    Saving Workflows: Use handleSave() to save to backend or localStorage.

    Undo/Redo: Not implemented yet — can be added via state stack management.

    ```

⌨️ Keyboard Shortcuts
Action	Shortcut
Delete Node	Delete key
Pan Canvas	Mouse drag
Zoom In/Out	Mouse scroll
Start Connection	Click "Connect Nodes" button
Save Node Config	Click "Save" in panel
🧪 Example Workflow

    Drag a Trigger Node from the sidebar.

    Connect it to a Webhook Node.

    Select the webhook, configure its URL.

    Press Execute.

    Watch your flow animate through the nodes.

📦 Dependencies

    React – UI library

    lucide-react – Icon set

    Tailwind CSS – Styling framework

    (Optional) Zustand or Redux for global state management if needed

📄 License

MIT License © Roberto D'Amico
