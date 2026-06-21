import { NodeDefinition } from '../../types/node';

export const ForLoopNode: NodeDefinition = {
  id: 'logic.forLoop',
  name: 'For Loop',
  category: 'Logic',
  inputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  outputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  properties: [
    {
      id: 'count',
      name: 'Loop Count',
      type: 'number',
      defaultValue: 10
    }
  ],
  codeGenerator: (context) => {
    const count = context.properties.count ?? 10;
    return `for i in range(${count}):\n    print(i)`;
  }
};
