import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelTransferOwnerFlowData extends UIFlowDataBase {
    targetDisplayName?: string;
    targetId?: string;
}

export class DynamicChannelTransferOwnerFlow extends UIFlowBase<string, string, DynamicChannelTransferOwnerFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/Default": [
                "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/SelectUser",
                "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/DisabledWhileClaim",
                "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/Error"
            ],
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/UserSelected": [
                "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/ConfirmTransfer",
                "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/CancelTransfer"
            ],
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/Transferred": [],
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/DisabledWhileClaim": [],
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/Error": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/SelectUser": "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/UserSelected",
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/ConfirmTransfer": "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/Transferred",
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/CancelTransfer": "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/Default",
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/DisabledWhileClaim": "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/DisabledWhileClaim",
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/Error": "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelTransferOwnerFlowData )[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/SelectUser": [ "targetDisplayName", "targetId" ],
            "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/Transitions/ConfirmTransfer": [ "targetDisplayName" ]
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
        return "VertixBot/UI-V2/DynamicChannelTransferOwnerFlow/States/Default";
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
