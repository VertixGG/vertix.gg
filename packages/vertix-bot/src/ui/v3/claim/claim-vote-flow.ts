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

/**
 * Flow that orchestrates voting interactions when a channel is claimed.
 */
export class ClaimVoteFlow extends UIFlowBase<string, string, ClaimVoteFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/ClaimVoteFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/ClaimVoteFlow/States/StepIn": [
                "VertixBot/UI-V3/ClaimVoteFlow/Transitions/StartVote",
                "VertixBot/UI-V3/ClaimVoteFlow/Transitions/AddCandidate"
            ],
            "VertixBot/UI-V3/ClaimVoteFlow/States/VoteProcess": [
                "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSelf",
                "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSuccess",
                "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSame",
                "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteUpdated"
            ],
            "VertixBot/UI-V3/ClaimVoteFlow/States/VoteWon": [],
            "VertixBot/UI-V3/ClaimVoteFlow/States/VoteAlreadySelf": [],
            "VertixBot/UI-V3/ClaimVoteFlow/States/VoteSuccess": [],
            "VertixBot/UI-V3/ClaimVoteFlow/States/VoteSameChoice": [],
            "VertixBot/UI-V3/ClaimVoteFlow/States/VoteUpdated": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/StartVote": "VertixBot/UI-V3/ClaimVoteFlow/States/VoteProcess",
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/AddCandidate": "VertixBot/UI-V3/ClaimVoteFlow/States/StepIn",
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSelf": "VertixBot/UI-V3/ClaimVoteFlow/States/VoteAlreadySelf",
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSuccess": "VertixBot/UI-V3/ClaimVoteFlow/States/VoteSuccess",
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSame": "VertixBot/UI-V3/ClaimVoteFlow/States/VoteSameChoice",
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteUpdated": "VertixBot/UI-V3/ClaimVoteFlow/States/VoteUpdated"
        };
    }

    public static getRequiredData(): Record<string, ( keyof ClaimVoteFlowData )[]> {
        return {
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSuccess": [ "targetId" ],
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSame": [ "targetId" ],
            "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteUpdated": [ "prevUserId", "currentUserId" ]
        };
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
        return "VertixBot/UI-V3/ClaimVoteFlow/States/StepIn";
    }

    protected override getInitialData(): ClaimVoteFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( ClaimVoteFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return ClaimVoteFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = ClaimVoteFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ ClaimVoteFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof ClaimVoteFlowData )[] {
        return ClaimVoteFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default ClaimVoteFlow;

