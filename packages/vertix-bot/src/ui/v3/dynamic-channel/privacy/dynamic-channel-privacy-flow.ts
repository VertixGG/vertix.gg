import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPrivacyComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

type DynamicChannelPrivacyFlowData = UIFlowDataBase;
type FlowState =
    | "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default"
    | "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Public"
    | "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Private"
    | "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Hidden";
type FlowTransition =
    | "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Public"
    | "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Private"
    | "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Hidden";

/**
 * Flow that captures privacy toggles for a dynamic channel.
 */
export class DynamicChannelPrivacyFlow extends UIFlowBase<FlowState, FlowTransition, DynamicChannelPrivacyFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelPrivacyFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<FlowState, FlowTransition[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default": [
                "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Public",
                "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Private",
                "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Hidden"
            ],
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Public": [],
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Private": [],
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Hidden": []
        };
    }

    public static getNextStates(): Record<FlowTransition, FlowState> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Public":
                "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Public",
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Private":
                "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Private",
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Hidden":
                "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Hidden"
        };
    }

    public static getRequiredData(): Record<FlowTransition, ( keyof DynamicChannelPrivacyFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Public": [ "state" ],
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Private": [ "state" ],
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/Transitions/UpdatePrivacyState/Hidden": [ "state" ]
        };
    }

    public static getStateOptions(): Record<FlowState, Record<string, string | Record<string, string>>> {
        return {
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default": {
                component: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
            },
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Public": {
                component: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
                previewDefaultVars: {
                    state: "🌐 Public",
                    stateMessage: "Everyone can join your channel.",
                }
            },
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Private": {
                component: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
                previewDefaultVars: {
                    state: "🚫 Private",
                    stateMessage: "Only trusted users can join your channel.",
                }
            },
            "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Hidden": {
                component: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelPrivacyComponent",
                previewDefaultVars: {
                    state: "🙈 Hidden",
                    stateMessage: "Only trusted users can see and join your channel.",
                }
            }
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelPrivacyComponent ];
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField();
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildVoice ];
    }

    protected override getInitialState(): FlowState {
        return "VertixBot/UI-V3/DynamicChannelPrivacyFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelPrivacyFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        const flowTransitions = DynamicChannelPrivacyFlow.getFlowTransitions();
        (
            Object.entries( flowTransitions ) as Array<
                [
                    FlowState,
                    FlowTransition[]
                ]
            >
        ).forEach( ( [ flowState, flowStateTransitions ] ) => {
            this.setTransitionsForState( flowState, new Set( flowStateTransitions ) );
        } );
    }

    public override getAvailableTransitions(): FlowTransition[] {
        return DynamicChannelPrivacyFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: FlowTransition ): FlowState {
        const next = DynamicChannelPrivacyFlow.getNextStates()[ transition as FlowTransition ];
        if ( next ) {
            return next;
        }

        throw new Error( `${ DynamicChannelPrivacyFlow.getName() }: unknown transition '${ transition }'` );
    }

    public override getRequiredData( transition: FlowTransition ): ( keyof DynamicChannelPrivacyFlowData )[] {
        return DynamicChannelPrivacyFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelPrivacyFlow;

