import { NodeDefinition } from '../../types/node';

export const AgeCheckNode: NodeDefinition = {
  id: 'input.ageCheck',
  name: 'Age Check',
  category: 'Input',
  inputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  outputs: [
    { id: 'flow', name: 'Flow', type: 'execution' }
  ],
  properties: [],
  codeGenerator: () => {
    return `age = int(input("Enter your age: "))\nif age >= 18:\n    print("You are 18 or older")\nelse:\n    print("You are under 18")`;
  }
};
