import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { DynamicChannelResetChannelComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface DynamicChannelResetChannelFlowData extends UIFlowData {
    result?: string;
}

const FLOW_NAME = "VertixBot/UI-V3/DynamicChannelResetChannelFlow";

const STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;
const STATE_SUCCESS = `${ FLOW_NAME }/States/Success`;
const STATE_VOTE_REQUIRED = `${ FLOW_NAME }/States/VoteRequired`;
const STATE_ERROR = `${ FLOW_NAME }/States/Error`;

const TRANSITION_SUCCESS = `${ FLOW_NAME }/Transitions/ResetSuccess`;
const TRANSITION_VOTE_REQUIRED = `${ FLOW_NAME }/Transitions/ResetVoteRequired`;
const TRANSITION_ERROR = `${ FLOW_NAME }/Transitions/ResetError`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_DEFAULT ]: [ TRANSITION_SUCCESS, TRANSITION_VOTE_REQUIRED, TRANSITION_ERROR ],
    [ STATE_SUCCESS ]: [],
    [ STATE_VOTE_REQUIRED ]: [],
    [ STATE_ERROR ]: []
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_SUCCESS ]: STATE_SUCCESS,
    [ TRANSITION_VOTE_REQUIRED ]: STATE_VOTE_REQUIRED,
    [ TRANSITION_ERROR ]: STATE_ERROR
};

const REQUIRED_DATA: Record<string, ( keyof DynamicChannelResetChannelFlowData )[]> = {
    [ TRANSITION_SUCCESS ]: [ "result" ],
    [ TRANSITION_VOTE_REQUIRED ]: [],
    [ TRANSITION_ERROR ]: []
};

/**
 * Flow that communicates the outcome of resetting a dynamic channel.
 */
export class DynamicChannelResetChannelFlow extends UIFlowBase<
    string,
    string,
    DynamicChannelResetChannelFlowData
> {
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

    public static getRequiredData(): Record<string, ( keyof DynamicChannelResetChannelFlowData )[]> {
        return REQUIRED_DATA;
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
        return STATE_DEFAULT;
    }

    protected override getInitialData(): DynamicChannelResetChannelFlowData {
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

    public override getRequiredData( transition: string ): ( keyof DynamicChannelResetChannelFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default DynamicChannelResetChannelFlow;

