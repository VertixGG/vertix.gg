import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelMetaClearChatComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-component";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface DynamicChannelMetaClearChatFlowData extends UIFlowDataBase {
    ownerDisplayName?: string;
    totalMessages?: number;
}

export class DynamicChannelMetaClearChatFlow extends UIFlowBase<string, string, DynamicChannelMetaClearChatFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/Default": [
                "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearSuccess",
                "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearNothing",
                "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearError"
            ],
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/Success": [],
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/NothingToClear": [],
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/Error": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearSuccess": "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/Success",
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearNothing": "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/NothingToClear",
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearError": "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelMetaClearChatFlowData )[]> {
        return {
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearSuccess": [ "ownerDisplayName", "totalMessages" ],
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearNothing": [],
            "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/Transitions/ClearError": []
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelMetaClearChatComponent ];
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
        return "VertixBot/UI-V2/DynamicChannelMetaClearChatFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelMetaClearChatFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelMetaClearChatFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelMetaClearChatFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelMetaClearChatFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelMetaClearChatFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelMetaClearChatFlowData )[] {
        return DynamicChannelMetaClearChatFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelMetaClearChatFlow;
