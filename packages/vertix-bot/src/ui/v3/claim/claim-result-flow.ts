import { ChannelType, PermissionsBitField } from "discord.js";

import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui/v3/claim/result/claim-result-component";

import type { UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { JsonObject } from "@vertix.gg/gui/src/runtime/ui-definition-types";

interface ClaimResultFlowData extends UIFlowData {
    targetId?: string;
    prevUserId?: string;
    currentUserId?: string;
}

const FLOW_NAME = "VertixBot/UI-V3/ClaimResultFlow";

const STATE_OWNER_STOP = `${ FLOW_NAME }/States/OwnerStop`;
const STATE_ADDED_SUCCESSFULLY = `${ FLOW_NAME }/States/AddedSuccessfully`;
const STATE_ALREADY_ADDED = `${ FLOW_NAME }/States/AlreadyAdded`;
const STATE_VOTE_ALREADY_SELF = `${ FLOW_NAME }/States/VoteAlreadySelf`;
const STATE_VOTE_SUCCESS = `${ FLOW_NAME }/States/VoteSuccess`;
const STATE_VOTE_SAME_CHOICE = `${ FLOW_NAME }/States/VoteSameChoice`;
const STATE_VOTE_UPDATED = `${ FLOW_NAME }/States/VoteUpdated`;

const FLOW_TRANSITIONS: Record<string, string[]> = {
    [ STATE_OWNER_STOP ]: [],
    [ STATE_ADDED_SUCCESSFULLY ]: [],
    [ STATE_ALREADY_ADDED ]: [],
    [ STATE_VOTE_ALREADY_SELF ]: [],
    [ STATE_VOTE_SUCCESS ]: [],
    [ STATE_VOTE_SAME_CHOICE ]: [],
    [ STATE_VOTE_UPDATED ]: []
};

const NEXT_STATES: Record<string, string> = {};

const REQUIRED_DATA: Record<string, ( keyof ClaimResultFlowData )[]> = {};

const FLOW_STATE_OPTIONS: Record<string, JsonObject> = {
    [ STATE_OWNER_STOP ]: {
        executionStep: "VertixBot/UI-V3/ClaimResultOwnerStop"
    },
    [ STATE_ADDED_SUCCESSFULLY ]: {
        executionStep: "VertixBot/UI-V3/ClaimResultAddedSuccessfully"
    },
    [ STATE_ALREADY_ADDED ]: {
        executionStep: "VertixBot/UI-V3/ClaimResultAlreadyAdded"
    },
    [ STATE_VOTE_ALREADY_SELF ]: {
        executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted"
    },
    [ STATE_VOTE_SUCCESS ]: {
        executionStep: "VertixBot/UI-V3/ClaimResultVotedSuccessfully"
    },
    [ STATE_VOTE_SAME_CHOICE ]: {
        executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame"
    },
    [ STATE_VOTE_UPDATED ]: {
        executionStep: "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully"
    }
};

/**
 * Flow that exposes the result embeds for the claim workflow.
 */
export class ClaimResultFlow extends UIFlowBase<string, string, ClaimResultFlowData> {
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

    public static getRequiredData(): Record<string, ( keyof ClaimResultFlowData )[]> {
        return REQUIRED_DATA;
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return FLOW_STATE_OPTIONS;
    }

    public static override getComponents(): UIComponentConstructor[] {
        return [ ClaimResultComponent ];
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
        return STATE_OWNER_STOP;
    }

    protected override getInitialData(): ClaimResultFlowData {
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

    public override getRequiredData( transition: string ): ( keyof ClaimResultFlowData )[] {
        return REQUIRED_DATA[ transition ] ?? [];
    }
}

export default ClaimResultFlow;

