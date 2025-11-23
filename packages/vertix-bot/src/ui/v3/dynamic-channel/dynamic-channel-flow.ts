import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/dynamic-channel-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";

interface DynamicChannelFlowData extends UIFlowData {}

export class DynamicChannelFlow extends UIFlowBase<string, string, DynamicChannelFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelFlow/States/Default": [
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRename",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenLimit",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPermissions",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrivacy",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRegion",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrimaryMessageEdit",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClearChat",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ResetChannel",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClaimChannel",
                "VertixBot/UI-V3/DynamicChannelFlow/Transitions/TransferOwner"
            ]
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRename": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenLimit": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPermissions": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrivacy": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenRegion": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/OpenPrimaryMessageEdit": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClearChat": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ResetChannel": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/ClaimChannel": "VertixBot/UI-V3/DynamicChannelFlow/States/Default",
            "VertixBot/UI-V3/DynamicChannelFlow/Transitions/TransferOwner": "VertixBot/UI-V3/DynamicChannelFlow/States/Default"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelFlowData )[]> {
        return {};
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return {
            "VertixBot/UI-V3/DynamicChannelFlow/States/Default": {
                executionStep: "default"
            }
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelComponent ];
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
        return "VertixBot/UI-V3/DynamicChannelFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelFlowData )[] {
        return [];
    }
}

export default DynamicChannelFlow;

