import { Node, Edge } from 'reactflow';
import { nodeRegistry } from '../registry/nodeRegistry';
import { NodeContext } from '../types/node';

export class GraphEngine {
  static generateCode(nodes: Node[], edges: Edge[]): { code: string; errors: string[] } {
    const errors: string[] = [];
    const startNode = nodes.find(n => n.data.type === 'core.start');

    if (!startNode) {
      errors.push('No Start node found.');
      return { code: '', errors };
    }

    const codeLines: string[] = [];
    let currentNode: Node | undefined = startNode;
    const visited = new Set<string>();

    while (currentNode) {
      if (visited.has(currentNode.id)) {
        errors.push('Circular dependency detected.');
        break;
      }
      visited.add(currentNode.id);

      const nodeDef = nodeRegistry.get(currentNode.data.type);
      if (nodeDef) {
        const context: NodeContext = {
          properties: currentNode.data.properties || {},
          inputs: {} // Data flow inputs would be resolved here in future
        };

        const nodeCode = nodeDef.codeGenerator(context);
        if (nodeCode) {
          codeLines.push(nodeCode);
        }

        // Find next node via execution flow
        const edge = edges.find(e => e.source === currentNode?.id && e.sourceHandle === 'flow');
        if (edge) {
          currentNode = nodes.find(n => n.id === edge.target);
        } else {
          currentNode = undefined;
        }
      } else {
        errors.push(`Unknown node type: ${currentNode.data.type}`);
        break;
      }
    }

    return { code: codeLines.join('\n'), errors };
  }
}
