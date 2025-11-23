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

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelClearChatFlow";

const STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;
const STATE_SUCCESS = `${ FLOW_NAME }/States/Success`;
const STATE_NOTHING = `${ FLOW_NAME }/States/NothingToClear`;
const STATE_ERROR = `${ FLOW_NAME }/States/Error`;

const TRANSITION_SUCCESS = `${ FLOW_NAME }/Transitions/ClearSuccess`;
const TRANSITION_NOTHING = `${ FLOW_NAME }/Transitions/ClearNothing`;
const TRANSITION_ERROR = `${ FLOW_NAME }/Transitions/ClearError`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_DEFAULT ]: [ TRANSITION_SUCCESS, TRANSITION_NOTHING, TRANSITION_ERROR ],
    [ STATE_SUCCESS ]: [],
    [ STATE_NOTHING ]: [],
    [ STATE_ERROR ]: []
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_SUCCESS ]: STATE_SUCCESS,
    [ TRANSITION_NOTHING ]: STATE_NOTHING,
    [ TRANSITION_ERROR ]: STATE_ERROR
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelClearChatFlowData )[]> = {
    [ TRANSITION_SUCCESS ]: [ "ownerDisplayName", "totalMessages" ],
    [ TRANSITION_NOTHING ]: [],
    [ TRANSITION_ERROR ]: []
};

/**
 * Flow that reports the outcome of clearing the dynamic channel chat history.
 */
export class DynamicChannelClearChatFlow extends UIFlowBase<string, string, DynamicChannelClearChatFlowData> {
    public static override getName(): string {
        return FLOW_NAME;
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return FLOW_TRANSITIONS;
    }

    public static getNextStates(): Record<string, string> {
        return NEXT_STATES;
    }

    public static getRequiredData(): Record<string, ( keyof DynamicChannelClearChatFlowData )[]> {
        return REQUIRED_DATA;
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
        return STATE_DEFAULT;
    }

    protected override getInitialData(): DynamicChannelClearChatFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( FLOW_TRANSITIONS ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return FLOW_TRANSITIONS[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = NEXT_STATES[ transition ];
        if ( !next ) {
            throw new Error( `${ FLOW_NAME }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof DynamicChannelClearChatFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelClearChatFlow;

