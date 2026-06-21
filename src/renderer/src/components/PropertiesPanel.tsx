import React, { useEffect, useState } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { nodeRegistry } from '../registry/nodeRegistry';

const PropertiesPanel = () => {
  const nodes = useGraphStore((state) => state.nodes);
  const updateNodeData = useGraphStore((state) => state.updateNodeData);
  const [methods, setMethods] = useState<any[]>([]);

  const selectedNode = nodes.find((n) => n.selected);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        // @ts-ignore
        const list = await window.electron.ipcRenderer.invoke('methods:list');
        setMethods(list);
      } catch (err) {
        console.error('Failed to fetch methods:', err);
      }
    };

    if (selectedNode) {
      fetchMethods();
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="w-72 bg-slate-900 border-l border-slate-700 p-4 flex flex-col">
        <div className="text-slate-500 text-sm text-center mt-10">Select a node to edit properties</div>
      </div>
    );
  }

  const nodeDef = nodeRegistry.get(selectedNode.data.type);
  if (!nodeDef) return null;

  const isMethodDef = selectedNode.data.type === 'custom.method';
  const isMethodCall = selectedNode.data.type === 'custom.methodCall';

  const handlePropertyChange = async (propertyId: string, value: any) => {
    const currentProperties = selectedNode.data.properties || {};
    const newProperties = {
      ...currentProperties,
      [propertyId]: value
    };

    if (propertyId === 'fileName') {
      try {
        // @ts-ignore
        const method = await window.electron.ipcRenderer.invoke('methods:create-or-update', {
          methodName: value,
          code: null
        });

        // Filter: only show if args > 0 or return exists
        const inputs = (method.args || []).map((arg: string) => ({ id: arg, name: arg, type: 'data' }));
        const outputs = method.returnValue ? [{ id: 'output', name: method.returnValue, type: 'data' }] : [];

        updateNodeData(selectedNode.id, {
          properties: { ...newProperties, methodName: method.methodName, returnValue: method.returnValue },
          inputs: isMethodCall ? [{ id: 'flow', name: 'Flow', type: 'execution' }, ...inputs] : inputs,
          outputs: isMethodCall ? [{ id: 'flow', name: 'Flow', type: 'execution' }, ...outputs] : outputs
        });
        return;
      } catch (err) {
        console.error('Error updating method:', err);
      }
    }

    updateNodeData(selectedNode.id, {
      properties: newProperties
    });
  };

  // Add support for manual parameter overrides in MethodCall if user wants to "customize the whole command"
  const handleCustomCallChange = (newCode: string) => {
    updateNodeData(selectedNode.id, {
      properties: {
        ...selectedNode.data.properties,
        customCall: newCode
      }
    });
  };

  return (
    <div className="w-72 bg-slate-900 border-l border-slate-700 p-4 flex flex-col overflow-y-auto">
      <div className="text-lg font-bold mb-6 text-slate-200">{nodeDef.name} Properties</div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Select Method File</label>
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
            value={selectedNode.data.properties?.fileName || ''}
            onChange={(e) => handlePropertyChange('fileName', e.target.value)}
          >
            <option value="">Select a file...</option>
            {methods.map(m => (
              <option key={m.fileName} value={m.fileName}>{m.fileName}</option>
            ))}
          </select>
        </div>

        {isMethodCall && (
          <div className="space-y-1 mt-4">
            <label className="text-xs font-medium text-slate-400">Custom Call Override (Optional)</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-blue-500 outline-none h-20 font-mono"
              placeholder="e.g. result = my_method(a, b=5)"
              value={selectedNode.data.properties?.customCall || ''}
              onChange={(e) => handleCustomCallChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
