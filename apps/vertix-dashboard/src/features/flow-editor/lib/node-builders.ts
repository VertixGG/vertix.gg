import type { Node } from "@xyflow/react";
import type { UIExportedFlow } from "@vertix.gg/definitions/src/ui-export-definitions";
import type { ComponentPreview } from "@vertix.gg/dashboard/src/features/flow-editor/lib/component-helpers";

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

/**
 * Function createModuleNode() :: The card naming a module the canvas is drawing.
 *
 * Named after the segment before the trailing `Module` - `UI-V3` - which is what the module
 * selector calls it, and what tells one apart from the next. The trailing segment is `Module` for
 * every one of them, so a canvas carrying all three drew three cards reading `Module` under a
 * single id, and two of the three were dropped as repeats of the first.
 */
export function createModuleNode( moduleName: string, fullName: string ): Node {
    const parts = moduleName.split( "/" ),
        shortName = 2 <= parts.length ? parts[ parts.length - 2 ] : moduleName,
        moduleNodeId = `module-${ moduleName }`;

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

function extractFlowVersion( flowName: string ): string | null {
    const versionMatch = flowName.match( /UI-(V\d+)/ );
    return versionMatch ? versionMatch[ 1 ] : null;
}

export function createFlowNode( flow: UIExportedFlow, isSystemFlow: boolean ): Node {
    const flowShortName = flow.name.split( "/" ).pop() ?? flow.name;
    const flowId = `flow-${ flow.name }`;
    const version = extractFlowVersion( flow.name );

    return {
        id: flowId,
        type: "flowNode",
        position: { x: 0, y: 0 },
        data: {
            label: flowShortName,
            type: "flow",
            isSystemFlow,
            flowName: flow.name,
            version
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
    stateKey?: string,
    flowName?: string,
    selfTransitions: string[] = [],
    sharedControls: string[] = []
): Node {
    return {
        id: compId,
        type: "componentNode",
        position: { x: 0, y: 0 },
        data: {
            label: label ?? compPreview.name,
            type: "component",
            // What an override written here applies to. The component keeps its own name and the
            // state is stored as the transitions name it - nothing is composed into a string that
            // the bot would then have to spell the same way.
            component: compPreview.fullName,
            state: stateKey ?? null,
            embedName: compPreview.embedName,
            embed: compPreview.embed,
            embedDefinition: compPreview.embedDefinition,
            allEmbedDefinitions: compPreview.allEmbedDefinitions,
            previewVars: compPreview.previewVars,
            elementRows: compPreview.elementRows,
            ephemeral: compPreview.ephemeral,
            renderAsContainer: compPreview.renderAsContainer,
            buttonModalTriggers,
            buttonFlowTriggers,
            stateTransitionTriggers,
            /*
             * The moves this screen makes to itself.
             *
             * Carried on the screen rather than drawn beside it: a fifth of everything a flow
             * declares is a transition whose from and to are the same state - picking an option,
             * clearing an override, updating channels. They are the commonest thing a member does
             * and an arrow from a box back to itself shows none of them.
             */
            selfTransitions,
            /*
             * The flow's chrome: controls standing on this screen whose line is drawn from another.
             *
             * A control on four or more of a flow's screens, leading to the same one place from
             * each, is the frame around the flow rather than a step in it - a templates panel's
             * Apply, Manage, Capture and Back sit on every screen it has. Drawn from each of them
             * it was five lines saying one thing, running the height of the canvas because the
             * screens they leave are the ones laid out furthest from what they lead to.
             *
             * So the line is drawn once, from the screen the flow reaches first, and every other
             * screen says here what it carries. Which is the whole of what was being read off those
             * lines anyway: that this button is on this screen, and where it goes.
             */
            sharedControls,
            stateKey,
            flowName
        }
    };
}

export function createModalNode(
    modalId: string,
    modalName: string,
    modalDef?: { title?: string; inputs?: Array<{ name: string; label?: string; placeholder?: string; style?: "short" | "paragraph" }> },
    flowName?: string,
    stateKey?: string
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
            inputs: modalDef?.inputs,
            flowName,
            modalName,
            component: modalName,
            state: stateKey ?? null
        }
    };
}
