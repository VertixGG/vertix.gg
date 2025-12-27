import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelResetChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase, UIFlowVisualConnection } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelResetChannelFlowData extends UIFlowDataBase {
    result?: string;
}

/**
 * Flow that communicates the outcome of resetting a dynamic channel.
 */
export class DynamicChannelResetChannelFlow extends UIFlowBase<
    string,
    string,
    DynamicChannelResetChannelFlowData
> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelResetChannelFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Default": [
                "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetSuccess",
                "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetVoteRequired",
                "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetError"
            ],
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Success": [],
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/VoteRequired": [],
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Error": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetSuccess": "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Success",
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetVoteRequired": "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/VoteRequired",
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetError": "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Error"
        };
    }

    public static override getEdgeSourceMappings(): UIFlowVisualConnection[] {
        const flowName = DynamicChannelResetChannelFlow.getName();

        return [
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelResetChannelButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetSuccess",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelResetChannelButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetVoteRequired",
                targetFlowName: flowName
            },
            {
                triggeringElementId: "VertixBot/UI-V3/DynamicChannelResetChannelButton",
                transitionName: "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetError",
                targetFlowName: flowName
            }
        ];
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelResetChannelFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetSuccess": [ "result" ],
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetVoteRequired": [],
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/Transitions/ResetError": []
        };
    }

    public static getStateOptions() {
        const previewVars = [
            "resetEmoji",
            "name",
            "nameChanged",
            "userLimit",
            "userLimitChanged",
            "state",
            "stateChanged",
            "visibilityState",
            "visibilityStateChanged",
            "region",
            "regionChanged",
            "primaryMessageChanged",
            "allowedUsers",
            "allowedUsersChanged",
            "blockedUsers",
            "blockedUsersChanged",
            "rateLimited"
        ];

        return {
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Default": {
                component: "VertixBot/UI-V3/DynamicChannelResetChannelComponent",
                executionStep: "default",
                previewVars
            },
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Success": {
                component: "VertixBot/UI-V3/DynamicChannelResetChannelComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelSuccess",
                previewVars
            },
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/VoteRequired": {
                component: "VertixBot/UI-V3/DynamicChannelResetChannelComponent",
                executionStep: "default",
                previewEmbedsGroup: "VertixBot/UI-General/TopGGVoteEmbedGroup"
            },
            "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Error": {
                component: "VertixBot/UI-V3/DynamicChannelResetChannelComponent",
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelError",
                previewEmbedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            }
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelResetChannelComponent ];
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

    protected override getInitialState(): string {
        return "VertixBot/UI-V3/DynamicChannelResetChannelFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelResetChannelFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelResetChannelFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelResetChannelFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelResetChannelFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelResetChannelFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelResetChannelFlowData )[] {
        return DynamicChannelResetChannelFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelResetChannelFlow;
