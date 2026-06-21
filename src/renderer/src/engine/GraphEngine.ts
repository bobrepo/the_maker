import { Node, Edge } from 'reactflow';
import { nodeRegistry } from '../registry/nodeRegistry';
import { NodeContext } from '../types/node';

export class GraphEngine {
  static async generateCode(nodes: Node[], edges: Edge[]): Promise<{ code: string; errors: string[] }> {
    const errors: string[] = [];
    const startNode = nodes.find(n => n.data.type === 'core.start');

    if (!startNode) {
      errors.push('No Start node found.');
      return { code: '', errors };
    }

    // 1. Gather ALL Method Definitions (even if not connected to flow)
    const methodDefNodes = nodes.filter(n => n.data.type === 'custom.method');
    const methodCodes: string[] = [];
    
    for (const mNode of methodDefNodes) {
      const fileName = mNode.data.properties?.fileName;
      if (fileName) {
        try {
          // @ts-ignore
          const list = await window.electron.ipcRenderer.invoke('methods:list');
          const method = list.find((m: any) => m.fileName === fileName);
          if (method && method.code) {
            methodCodes.push(method.code);
          }
        } catch (err) {
          console.error('Error fetching method code:', err);
        }
      }
    }

    const codeLines: string[] = [];
    let currentNode: Node | undefined = startNode;
    const visited = new Set<string>();

    // 2. Traverse execution flow to generate calls
    while (currentNode) {
      if (visited.has(currentNode.id)) {
        errors.push('Circular dependency detected.');
        break;
      }
      visited.add(currentNode.id);

      const nodeDef = nodeRegistry.get(currentNode.data.type);
      if (nodeDef) {
        // Resolve Inputs (Data Flow)
        // ... (rest of traversal logic)
        const inputs: Record<string, any> = {};
        const incomingEdges = edges.filter(e => e.target === currentNode?.id && e.targetHandle !== 'flow');
        
        for (const edge of incomingEdges) {
          if (edge.targetHandle) {
            const sourceNode = nodes.find(n => n.id === edge.source);
            if (sourceNode) {
              const shortId = sourceNode.id.split('-')[0];
              const sourceHandleName = edge.sourceHandle || 'output';
              inputs[edge.targetHandle] = `${sourceHandleName}_${shortId}`;
            }
          }
        }

        const context: NodeContext = {
          properties: currentNode.data.properties || {},
          inputs,
          nodeId: currentNode.id,
          data: currentNode.data
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

    const finalCode = [...methodCodes, '', ...codeLines].join('\n');
    return { code: finalCode, errors };
  }
}
