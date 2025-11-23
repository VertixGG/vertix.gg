import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui/v3/claim/result/claim-result-component";
import { ClaimVoteComponent } from "@vertix.gg/bot/src/ui/v3/claim/vote/claim-vote-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

interface ClaimVoteFlowData extends UIFlowData {
    targetId?: string;
    prevUserId?: string;
    currentUserId?: string;
}

const FLOW_NAME = "VertixBot/UI-V3/ClaimVoteFlow";

const STATE_STEP_IN = `${ FLOW_NAME }/States/StepIn`;
const STATE_VOTE_PROCESS = `${ FLOW_NAME }/States/VoteProcess`;
const STATE_VOTE_WON = `${ FLOW_NAME }/States/VoteWon`;
const STATE_VOTE_ALREADY_SELF = `${ FLOW_NAME }/States/VoteAlreadySelf`;
const STATE_VOTE_SUCCESS = `${ FLOW_NAME }/States/VoteSuccess`;
const STATE_VOTE_SAME = `${ FLOW_NAME }/States/VoteSameChoice`;
const STATE_VOTE_UPDATED = `${ FLOW_NAME }/States/VoteUpdated`;

const TRANSITION_START_VOTE = `${ FLOW_NAME }/Transitions/StartVote`;
const TRANSITION_ADD_CANDIDATE = `${ FLOW_NAME }/Transitions/AddCandidate`;
const TRANSITION_VOTE_SELF = `${ FLOW_NAME }/Transitions/VoteSelf`;
const TRANSITION_VOTE_SUCCESS = `${ FLOW_NAME }/Transitions/VoteSuccess`;
const TRANSITION_VOTE_SAME = `${ FLOW_NAME }/Transitions/VoteSame`;
const TRANSITION_VOTE_UPDATED = `${ FLOW_NAME }/Transitions/VoteUpdated`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_STEP_IN ]: [ TRANSITION_START_VOTE, TRANSITION_ADD_CANDIDATE ],
    [ STATE_VOTE_PROCESS ]: [
        TRANSITION_VOTE_SELF,
        TRANSITION_VOTE_SUCCESS,
        TRANSITION_VOTE_SAME,
        TRANSITION_VOTE_UPDATED
    ],
    [ STATE_VOTE_WON ]: [],
    [ STATE_VOTE_ALREADY_SELF ]: [],
    [ STATE_VOTE_SUCCESS ]: [],
    [ STATE_VOTE_SAME ]: [],
    [ STATE_VOTE_UPDATED ]: []
};

const NEXT_STATES: Record<string, string> = {
    [ TRANSITION_START_VOTE ]: STATE_VOTE_PROCESS,
    [ TRANSITION_ADD_CANDIDATE ]: STATE_STEP_IN,
    [ TRANSITION_VOTE_SELF ]: STATE_VOTE_ALREADY_SELF,
    [ TRANSITION_VOTE_SUCCESS ]: STATE_VOTE_SUCCESS,
    [ TRANSITION_VOTE_SAME ]: STATE_VOTE_SAME,
    [ TRANSITION_VOTE_UPDATED ]: STATE_VOTE_UPDATED
};

const REQUIRED_DATA: Record<string, ( keyof ClaimVoteFlowData )[]> = {
    [ TRANSITION_VOTE_SUCCESS ]: [ "targetId" ],
    [ TRANSITION_VOTE_SAME ]: [ "targetId" ],
    [ TRANSITION_VOTE_UPDATED ]: [ "prevUserId", "currentUserId" ]
};

/**
 * Flow that orchestrates voting interactions when a channel is claimed.
 */
export class ClaimVoteFlow extends UIFlowBase<string, string, ClaimVoteFlowData> {
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

    public static getRequiredData(): Record<string, ( keyof ClaimVoteFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ ClaimVoteComponent, ClaimResultComponent ];
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
        return STATE_STEP_IN;
    }

    protected override getInitialData(): ClaimVoteFlowData {
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

    public override getRequiredData( transition: string ): ( keyof ClaimVoteFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default ClaimVoteFlow;

