import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { nodeRegistry } from '../../registry/nodeRegistry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CustomNode = ({ data, selected }: NodeProps) => {
  const nodeDef = nodeRegistry.get(data.type);

  if (!nodeDef) return <div>Unknown Node</div>;

  const isMethodDef = data.type === 'custom.method';
  const isMethodCall = data.type === 'custom.methodCall';

  const inputs = data.inputs || nodeDef.inputs;
  const outputs = data.outputs || nodeDef.outputs;

  const borderClass = isMethodCall
    ? (selected ? "border-white border-4 shadow-[0_0_15px_#fff]" : "border-slate-100 border-[3px] shadow-[0_0_8px_rgba(255,255,255,0.3)]")
    : (selected ? "border-blue-500" : "border-slate-700");

  const handleOpenCursor = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileName = data.properties?.fileName;
    if (!fileName) return;
    try {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('methods:open-cursor', { fileName });
    } catch (err) {
      console.error('Error launching Cursor:', err);
    }
  };

  return (
    <div className={cn(
      "bg-slate-800 border-2 rounded-lg p-3 min-w-[150px] shadow-xl transition-colors",
      borderClass
    )}>
      <div className="text-sm font-bold text-slate-200 mb-2 border-b border-slate-700 pb-1">
        {data.properties?.fileName ? `${isMethodCall ? 'Call: ' : 'Def: '}${data.properties.fileName.replace('.py', '')}` : nodeDef.name}
      </div>

      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          {inputs.map((input) => (
            <div key={input.id} className="relative flex items-center gap-2 h-6">
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                style={{
                  background: input.type === 'execution' ? '#fff' : '#3b82f6',
                  width: '10px',
                  height: '10px',
                  left: '-18px'
                }}
              />
              <span className="text-xs text-slate-400">{input.name}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 items-end">
          {outputs.map((output) => (
            <div key={output.id} className="relative flex items-center gap-2 h-6">
              <span className="text-xs text-slate-400">{output.name}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                style={{
                  background: output.type === 'execution' ? '#fff' : '#3b82f6',
                  width: '10px',
                  height: '10px',
                  right: '-18px'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {isMethodDef && data.properties?.fileName && (
        <div className="mt-2 flex flex-col gap-1 border-t border-slate-700 pt-2">
          <button
            onClick={handleOpenCursor}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            Edit in Cursor
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomNode;
