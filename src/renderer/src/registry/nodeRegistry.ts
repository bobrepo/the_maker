import { NodeDefinition } from '../types/node';

class NodeRegistry {
  private nodes: Map<string, NodeDefinition> = new Map();

  register(node: NodeDefinition) {
    this.nodes.set(node.id, node);
  }

  get(id: string): NodeDefinition | undefined {
    return this.nodes.get(id);
  }

  getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  getByCategory(): Record<string, NodeDefinition[]> {
    const categories: Record<string, NodeDefinition[]> = {};
    this.getAll().forEach(node => {
      if (!categories[node.category]) {
        categories[node.category] = [];
      }
      categories[node.category].push(node);
    });
    return categories;
  }
}

export const nodeRegistry = new NodeRegistry();
