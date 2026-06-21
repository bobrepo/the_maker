import { NodeDefinition } from '../../types/node';

export const PrintHelloWorldNode: NodeDefinition = {
  id: 'output.printHelloWorld',
  name: 'Print Hello World',
  category: 'Output',
  inputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  outputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  properties: [
    {
      id: 'text',
      name: 'Text',
      type: 'string',
      defaultValue: 'Hello World'
    }
  ],
  codeGenerator: (context) => {
    const text = context.properties.text || 'Hello World';
    return `print("${text}")`;
  }
};
