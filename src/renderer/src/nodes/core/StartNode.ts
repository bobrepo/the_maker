import { NodeDefinition } from '../../types/node';

export const StartNode: NodeDefinition = {
  id: 'core.start',
  name: 'Start',
  category: 'Flow',
  inputs: [],
  outputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  properties: [],
  codeGenerator: () => {
    return '';
  }
};
