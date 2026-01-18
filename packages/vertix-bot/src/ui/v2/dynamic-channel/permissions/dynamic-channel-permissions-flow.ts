import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelPermissionsComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelPermissionsFlowData extends UIFlowDataBase {
    targetDisplayName?: string;
}

export class DynamicChannelPermissionsFlow extends UIFlowBase<string, string, DynamicChannelPermissionsFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V2/DynamicChannelPermissionsFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Default": [
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/SetPrivate",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/SetPublic",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/SetHidden",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/SetShown",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/GrantAccess",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/DenyAccess",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/BlockUser",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/UnblockUser",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/KickUser",
                "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/Error"
            ],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Private": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Public": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Hidden": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Shown": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Granted": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Denied": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Blocked": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Unblocked": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Kicked": [],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Error": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/SetPrivate": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Private",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/SetPublic": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Public",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/SetHidden": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Hidden",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/SetShown": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Shown",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/GrantAccess": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Granted",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/DenyAccess": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Denied",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/BlockUser": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Blocked",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/UnblockUser": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Unblocked",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/KickUser": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Kicked",
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/Error": "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelPermissionsFlowData )[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/GrantAccess": [ "targetDisplayName" ],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/DenyAccess": [ "targetDisplayName" ],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/BlockUser": [ "targetDisplayName" ],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/UnblockUser": [ "targetDisplayName" ],
            "VertixBot/UI-V2/DynamicChannelPermissionsFlow/Transitions/KickUser": [ "targetDisplayName" ]
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelPermissionsComponent ];
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
        return "VertixBot/UI-V2/DynamicChannelPermissionsFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelPermissionsFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelPermissionsFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelPermissionsFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelPermissionsFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelPermissionsFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelPermissionsFlowData )[] {
        return DynamicChannelPermissionsFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelPermissionsFlow;
