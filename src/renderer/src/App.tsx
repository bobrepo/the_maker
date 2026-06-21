import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useGraphStore } from './store/useGraphStore';
import CustomNode from './components/nodes/CustomNode';
import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import TopBar from './components/TopBar';
import { registerNodes } from './registry';

const nodeTypes = {
  custom: CustomNode,
};

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [logs, setLogs] = useState<string>('Ready.');

  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
  const onConnect = useGraphStore((state) => state.onConnect);
  const addNode = useGraphStore((state) => state.addNode);

  useEffect(() => {
    registerNodes();
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: crypto.randomUUID(),
        type: 'custom',
        position,
        data: { type, properties: {} },
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      <TopBar setLogs={setLogs} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: '#0f172a' }}
          >
            <Background color="#334155" gap={20} />
            <Controls />
          </ReactFlow>
        </div>

        <PropertiesPanel />
      </div>

      <div className="h-32 bg-slate-950 border-t border-slate-700 p-4 font-mono text-xs overflow-y-auto whitespace-pre-wrap text-slate-400">
        <div className="text-slate-500 mb-1 border-b border-slate-800 pb-1 uppercase tracking-widest text-[10px]">Logs</div>
        {logs}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
