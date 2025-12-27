import { StateNode } from "@vertix.gg/dashboard/src/components/flow-nodes/state-node";
import { ModuleNode } from "@vertix.gg/dashboard/src/components/flow-nodes/module-node";
import { FlowNode } from "@vertix.gg/dashboard/src/components/flow-nodes/flow-node";
import { ComponentNode } from "@vertix.gg/dashboard/src/components/flow-nodes/component-node";
import { ModalNode } from "@vertix.gg/dashboard/src/components/flow-nodes/modal-node";

import type { NodeTypes } from "@xyflow/react";

export const nodeTypes: NodeTypes = {
    stateNode: StateNode,
    moduleNode: ModuleNode,
    flowNode: FlowNode,
    componentNode: ComponentNode,
    modalNode: ModalNode
};

export { StateNode, ModuleNode, FlowNode, ComponentNode, ModalNode };

