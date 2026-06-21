import { NodeDefinition } from '../../types/node';

export const MethodNode: NodeDefinition = {
  id: 'custom.method',
  name: 'Method Definition',
  category: 'Methods',
  inputs: [],
  outputs: [],
  properties: [
    {
      id: 'fileName',
      name: 'Method File',
      type: 'string',
      defaultValue: ''
    }
  ],
  codeGenerator: () => {
    // Definition nodes themselves don't generate execution code
    return '';
  }
};

export const MethodCallNode: NodeDefinition = {
  id: 'custom.methodCall',
  name: 'Method Call',
  category: 'Methods',
  inputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  outputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  properties: [
    {
      id: 'fileName',
      name: 'Method File',
      type: 'string',
      defaultValue: ''
    }
  ],
  codeGenerator: (context) => {
    // If user provided a custom call override, use it exactly
    if (context.properties.customCall) {
      return context.properties.customCall;
    }

    const methodName = context.properties.methodName;
    if (!methodName) return '# Call error: No method specified';
    
    // Filter dynamic inputs (arguments) and outputs (return value)
    const args = context.data?.inputs?.filter((i: any) => i.type === 'data') || [];
    const outputs = context.data?.outputs?.filter((o: any) => o.type === 'data') || [];

    // Use actual parameter names from the method definition as mapping keys
    const argValues = args.map((arg: any) => context.inputs[arg.id] || 'None').join(', ');

    if (outputs.length > 0) {
      // Use the raw return variable name defined in the method signature
      const retValName = outputs[0].name || 'result';
      return `${retValName} = ${methodName}(${argValues})`;
    } else {
      return `${methodName}(${argValues})`;
    }
  }
};
