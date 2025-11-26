import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelTransferOwnerFlowData extends UIFlowData {
    userDisplayName?: string;
}

/**
 * Flow that guides an owner through transferring a dynamic channel.
 */
export class DynamicChannelTransferOwnerFlow extends UIFlowBase<
    string,
    string,
    DynamicChannelTransferOwnerFlowData
> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/Initial": [
                "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/Open"
            ],
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/SelectUser": [
                "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/UserSelected",
                "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/Cancel"
            ],
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/Confirm": [
                "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/Confirm",
                "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/Cancel"
            ],
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/Success": [],
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/Cancelled": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/Open": "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/SelectUser",
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/UserSelected": "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/Confirm",
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/Confirm": "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/Success",
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/Cancel": "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/Cancelled"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelTransferOwnerFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/Transitions/UserSelected": [ "userDisplayName" ]
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelTransferOwnerComponent ];
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
        return "VertixBot/UI-V3/DynamicChannelTransferOwnerFlow/States/Initial";
    }

    protected override getInitialData(): DynamicChannelTransferOwnerFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelTransferOwnerFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelTransferOwnerFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelTransferOwnerFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelTransferOwnerFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelTransferOwnerFlowData )[] {
        return DynamicChannelTransferOwnerFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelTransferOwnerFlow;

