import { nodeRegistry } from './nodeRegistry';
import { StartNode } from '../nodes/core/StartNode';
import { PrintHelloWorldNode } from '../nodes/output/PrintHelloWorldNode';
import { ForLoopNode } from '../nodes/logic/ForLoopNode';
import { AgeCheckNode } from '../nodes/input/AgeCheckNode';
import { MethodNode, MethodCallNode } from '../nodes/custom/MethodNodes';

export function registerNodes() {
  nodeRegistry.register(StartNode);
  nodeRegistry.register(PrintHelloWorldNode);
  nodeRegistry.register(ForLoopNode);
  nodeRegistry.register(AgeCheckNode);
  nodeRegistry.register(MethodNode);
  nodeRegistry.register(MethodCallNode);
}
