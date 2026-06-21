import React from 'react';
import { nodeRegistry } from '../registry/nodeRegistry';
import { NodeDefinition } from '../types/node';

const Sidebar = () => {
  const categories = nodeRegistry.getByCategory();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col p-4 overflow-y-auto">
      <div className="text-lg font-bold mb-6 text-slate-200">Nodes</div>
      
      <div className="space-y-6">
        {(Object.entries(categories) as [string, NodeDefinition[]][]).map(([category, nodes]) => (
          <div key={category}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {category}
            </div>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-slate-800 p-2 rounded border border-slate-700 hover:border-blue-500 cursor-grab transition-colors text-sm text-slate-300 flex items-center gap-2"
                  onDragStart={(event) => onDragStart(event, node.id)}
                  draggable
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {node.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
