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

/**
 * Flow that exposes the result embeds for the claim workflow.
 */
export class ClaimResultFlow extends UIFlowBase<string, string, ClaimResultFlowData> {
    public static override getName(): string {
        return "VertixBot/UI-V3/ClaimResultFlow";
    }

    public static override getFlowType(): string {
        return "ui";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        return {
            "VertixBot/UI-V3/ClaimResultFlow/States/OwnerStop": [],
            "VertixBot/UI-V3/ClaimResultFlow/States/AddedSuccessfully": [],
            "VertixBot/UI-V3/ClaimResultFlow/States/AlreadyAdded": [],
            "VertixBot/UI-V3/ClaimResultFlow/States/VoteAlreadySelf": [],
            "VertixBot/UI-V3/ClaimResultFlow/States/VoteSuccess": [],
            "VertixBot/UI-V3/ClaimResultFlow/States/VoteSameChoice": [],
            "VertixBot/UI-V3/ClaimResultFlow/States/VoteUpdated": []
        };
    }

    public static getNextStates(): Record<string, string> {
        return {};
    }

    public static getRequiredData(): Record<string, ( keyof ClaimResultFlowData )[]> {
        return {};
    }

    public static getStateOptions(): Record<string, JsonObject> {
        return {
            "VertixBot/UI-V3/ClaimResultFlow/States/OwnerStop": {
                executionStep: "VertixBot/UI-V3/ClaimResultOwnerStop"
            },
            "VertixBot/UI-V3/ClaimResultFlow/States/AddedSuccessfully": {
                executionStep: "VertixBot/UI-V3/ClaimResultAddedSuccessfully"
            },
            "VertixBot/UI-V3/ClaimResultFlow/States/AlreadyAdded": {
                executionStep: "VertixBot/UI-V3/ClaimResultAlreadyAdded"
            },
            "VertixBot/UI-V3/ClaimResultFlow/States/VoteAlreadySelf": {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted"
            },
            "VertixBot/UI-V3/ClaimResultFlow/States/VoteSuccess": {
                executionStep: "VertixBot/UI-V3/ClaimResultVotedSuccessfully"
            },
            "VertixBot/UI-V3/ClaimResultFlow/States/VoteSameChoice": {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame"
            },
            "VertixBot/UI-V3/ClaimResultFlow/States/VoteUpdated": {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully"
            }
        };
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
        return "VertixBot/UI-V3/ClaimResultFlow/States/OwnerStop";
    }

    protected override getInitialData(): ClaimResultFlowData {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( ClaimResultFlow.getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.setTransitionsForState( state, new Set( transitions ) );
        } );
    }

    public override getAvailableTransitions(): string[] {
        return ClaimResultFlow.getFlowTransitions()[ this.getCurrentState() ] ?? [];
    }

    public override getNextState( transition: string ): string {
        const next = ClaimResultFlow.getNextStates()[ transition ];
        if ( !next ) {
            throw new Error( `${ ClaimResultFlow.getName() }: unknown transition '${ transition }'` );
        }

        return next;
    }

    public override getRequiredData( transition: string ): ( keyof ClaimResultFlowData )[] {
        return ClaimResultFlow.getRequiredData()[ transition ] ?? [];
    }
}

export default ClaimResultFlow;

