import { nodeRegistry } from './nodeRegistry';
import { StartNode } from '../nodes/core/StartNode';
import { PrintHelloWorldNode } from '../nodes/output/PrintHelloWorldNode';
import { ForLoopNode } from '../nodes/logic/ForLoopNode';
import { AgeCheckNode } from '../nodes/input/AgeCheckNode';

export function registerNodes() {
  nodeRegistry.register(StartNode);
  nodeRegistry.register(PrintHelloWorldNode);
  nodeRegistry.register(ForLoopNode);
  nodeRegistry.register(AgeCheckNode);
}
