export type PortType = 'execution' | 'data';

export interface PortDefinition {
  id: string;
  name: string;
  type: PortType;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  defaultValue: any;
  options?: { label: string; value: any }[]; // For select type
}

export interface ValidationError {
  message: string;
  nodeId: string;
}

export interface NodeContext {
  properties: Record<string, any>;
  inputs: Record<string, any>;
  nodeId?: string;
  data?: any;
}

export interface NodeDefinition {
  id: string;
  name: string;
  category: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  properties: PropertyDefinition[];
  validate?: (context: NodeContext) => ValidationError[];
  codeGenerator: (context: NodeContext) => string;
}
