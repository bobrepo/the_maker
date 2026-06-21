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

  return (
    <div className={cn(
      "bg-slate-800 border-2 rounded-lg p-3 min-w-[150px] shadow-xl transition-colors",
      selected ? "border-blue-500" : "border-slate-700"
    )}>
      <div className="text-sm font-bold text-slate-200 mb-2 border-b border-slate-700 pb-1">
        {nodeDef.name}
      </div>

      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          {nodeDef.inputs.map((input) => (
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
          {nodeDef.outputs.map((output) => (
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
    </div>
  );
};

export default CustomNode;
