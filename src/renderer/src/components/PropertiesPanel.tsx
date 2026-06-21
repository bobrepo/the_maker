import React from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { nodeRegistry } from '../registry/nodeRegistry';

const PropertiesPanel = () => {
  const nodes = useGraphStore((state) => state.nodes);
  const updateNodeData = useGraphStore((state) => state.updateNodeData);
  
  const selectedNode = nodes.find((n) => n.selected);
  
  if (!selectedNode) {
    return (
      <div className="w-72 bg-slate-900 border-l border-slate-700 p-4 flex flex-col">
        <div className="text-slate-500 text-sm text-center mt-10">Select a node to edit properties</div>
      </div>
    );
  }

  const nodeDef = nodeRegistry.get(selectedNode.data.type);
  if (!nodeDef) return null;

  const handlePropertyChange = (propertyId: string, value: any) => {
    const currentProperties = selectedNode.data.properties || {};
    updateNodeData(selectedNode.id, {
      properties: {
        ...currentProperties,
        [propertyId]: value
      }
    });
  };

  return (
    <div className="w-72 bg-slate-900 border-l border-slate-700 p-4 flex flex-col overflow-y-auto">
      <div className="text-lg font-bold mb-6 text-slate-200">{nodeDef.name} Properties</div>
      
      <div className="space-y-4">
        {nodeDef.properties.map((prop) => (
          <div key={prop.id} className="space-y-1">
            <label className="text-xs font-medium text-slate-400">{prop.name}</label>
            {prop.type === 'string' && (
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
                value={selectedNode.data.properties?.[prop.id] ?? prop.defaultValue}
                onChange={(e) => handlePropertyChange(prop.id, e.target.value)}
              />
            )}
            {prop.type === 'number' && (
              <input
                type="number"
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
                value={selectedNode.data.properties?.[prop.id] ?? prop.defaultValue}
                onChange={(e) => handlePropertyChange(prop.id, Number(e.target.value))}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertiesPanel;
