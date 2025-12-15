import type { Node } from "@xyflow/react";
import type { UIExportedFlow } from "@vertix.gg/definitions/src/ui-export-definitions";
import type { ComponentPreview } from "@vertix.gg/dashboard/src/lib/component-helpers";

export interface ButtonModalTrigger {
    buttonName: string;
    modalName: string;
    handlePosition: "left" | "right" | "bottom" | "top";
}

export interface ButtonFlowTrigger {
    buttonName: string;
    targetFlowName: string;
    handlePosition: "left" | "right" | "bottom" | "top";
}

export interface StateTransitionTrigger {
    elementName: string;
    handlePosition: "left" | "right" | "bottom" | "top";
}

export function createModuleNode( moduleName: string, fullName: string ): Node {
    const shortName = moduleName.split( "/" ).pop() ?? moduleName;
    const moduleNodeId = `module-${ shortName }`;

    return {
        id: moduleNodeId,
        type: "moduleNode",
        position: { x: 0, y: 0 },
        data: {
            label: shortName,
            fullName,
            type: "module"
        }
    };
}

export function createFlowNode( flow: UIExportedFlow, isSystemFlow: boolean ): Node {
    const flowShortName = flow.name.split( "/" ).pop() ?? flow.name;
    const flowId = `flow-${ flow.name }`;

    return {
        id: flowId,
        type: "flowNode",
        position: { x: 0, y: 0 },
        data: {
            label: flowShortName,
            type: "flow",
            isSystemFlow
        }
    };
}

export function createComponentNode(
    compId: string,
    compPreview: ComponentPreview,
    buttonModalTriggers: ButtonModalTrigger[],
    buttonFlowTriggers: ButtonFlowTrigger[],
    stateTransitionTriggers: StateTransitionTrigger[] = [],
    label?: string,
    stateKey?: string
): Node {
    return {
        id: compId,
        type: "componentNode",
        position: { x: 0, y: 0 },
        data: {
            label: label ?? compPreview.name,
            type: "component",
            embed: compPreview.embed,
            elementRows: compPreview.elementRows,
            buttonModalTriggers,
            buttonFlowTriggers,
            stateTransitionTriggers,
            stateKey
        }
    };
}

export function createModalNode(
    modalId: string,
    modalName: string,
    modalDef?: { title?: string; inputs?: Array<{ name: string; label?: string; placeholder?: string; style?: "short" | "paragraph" }> }
): Node {
    const modalShortName = modalName.split( "/" ).pop()?.replace( /Modal$/, "" ) ?? modalName;

    return {
        id: modalId,
        type: "modalNode",
        position: { x: 0, y: 0 },
        data: {
            label: modalShortName,
            type: "modal",
            title: modalDef?.title,
            inputs: modalDef?.inputs
        }
    };
}
