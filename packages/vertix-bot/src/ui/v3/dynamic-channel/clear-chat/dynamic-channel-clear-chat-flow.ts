import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelClearChatComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelClearChatFlowData extends UIFlowData {
    ownerDisplayName?: string;
    totalMessages?: number;
}

/**
 * Flow that reports the outcome of clearing the dynamic channel chat history.
 */
export class DynamicChannelClearChatFlow extends UIFlowBase<string, string, DynamicChannelClearChatFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/DynamicChannelClearChatFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Default": [
                "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearSuccess",
                "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearNothing",
                "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearError"
            ],
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Success": [],
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/NothingToClear": [],
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Error": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearSuccess": "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Success",
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearNothing": "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/NothingToClear",
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearError": "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Error"
        };
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelClearChatFlowData )[]> {
        return {
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearSuccess": [ "ownerDisplayName", "totalMessages" ],
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearNothing": [],
            "VertixBot/UI-V3/DynamicChannelClearChatFlow/Transitions/ClearError": []
        };
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ DynamicChannelClearChatComponent ];
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
        return "VertixBot/UI-V3/DynamicChannelClearChatFlow/States/Default";
    }

    protected override getInitialData(): DynamicChannelClearChatFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( DynamicChannelClearChatFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return DynamicChannelClearChatFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = DynamicChannelClearChatFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ DynamicChannelClearChatFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelClearChatFlowData )[] {
        return DynamicChannelClearChatFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default DynamicChannelClearChatFlow;

