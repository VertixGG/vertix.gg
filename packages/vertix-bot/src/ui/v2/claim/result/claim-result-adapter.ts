import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

const CLAIM_RESULT_STEPS = {
    "VertixBot/UI-V2/ClaimResultOwnerStop": {
        embedsGroup: "VertixBot/UI-V2/ClaimResultOwnerStopEmbedGroup"
    },

    "VertixBot/UI-V2/ClaimResultAddedSuccessfully": {
        embedsGroup: "VertixBot/UI-V2/ClaimResultStepInEmbedGroup"
    },
    "VertixBot/UI-V2/ClaimResultAlreadyAdded": {
        embedsGroup: "VertixBot/UI-V2/ClaimResultStepAlreadyInEmbedGroup"
    },

    "VertixBot/UI-V2/ClaimResultVoteAlreadySelfVoted": {
        embedsGroup: "VertixBot/UI-V2/ClaimResultVoteSelfEmbedGroup"
    },
    "VertixBot/UI-V2/ClaimResultVotedSuccessfully": {
        embedsGroup: "VertixBot/UI-V2/ClaimResultVotedEmbedGroup"
    },
    "VertixBot/UI-V2/ClaimResultVoteAlreadyVotedSame": {
        embedsGroup: "VertixBot/UI-V2/ClaimResultVotedSameEmbedGroup"
    },
    "VertixBot/UI-V2/ClaimResultVoteUpdatedSuccessfully": {
        embedsGroup: "VertixBot/UI-V2/ClaimResultVoteUpdatedEmbedGroup"
    }
} as const;

const ClaimResultAdapter = new ExecutionAdapterBuilder<VoiceChannel, ButtonInteraction<"cached">>(
    "VertixBot/UI-V2/ClaimResultAdapter"
)
    .setComponent( ClaimResultComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildVoice ] )
    .setExecutionSteps( CLAIM_RESULT_STEPS )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "VertixBot/UI-V2/ClaimResultOwnerStop",
                previewDefaultVars: { absentInterval: "300000" }
            } )
            .addState( "OwnerStop", {
                executionStep: "VertixBot/UI-V2/ClaimResultOwnerStop",
                navigationType: "ephemeral",
                previewDefaultVars: { absentInterval: "300000" }
            } )
            .addState( "AddedSuccessfully", {
                executionStep: "VertixBot/UI-V2/ClaimResultAddedSuccessfully",
                navigationType: "ephemeral"
            } )
            .addState( "AlreadyAdded", {
                executionStep: "VertixBot/UI-V2/ClaimResultAlreadyAdded",
                navigationType: "ephemeral"
            } )
            .addState( "VoteAlreadySelfVoted", {
                executionStep: "VertixBot/UI-V2/ClaimResultVoteAlreadySelfVoted",
                navigationType: "ephemeral"
            } )
            .addState( "VotedSuccessfully", {
                executionStep: "VertixBot/UI-V2/ClaimResultVotedSuccessfully",
                navigationType: "ephemeral",
                previewDefaultVars: { userDisplayName: "User", userId: "123456789" }
            } )
            .addState( "VoteAlreadyVotedSame", {
                executionStep: "VertixBot/UI-V2/ClaimResultVoteAlreadyVotedSame",
                navigationType: "ephemeral",
                previewDefaultVars: { userDisplayName: "User", userId: "123456789" }
            } )
            .addState( "VoteUpdatedSuccessfully", {
                executionStep: "VertixBot/UI-V2/ClaimResultVoteUpdatedSuccessfully",
                navigationType: "ephemeral",
                previewDefaultVars: { prevUserId: "123456789", currentUserId: "987654321" }
            } )
            .addTransition( "ShowOwnerStop", { from: "Default", to: "OwnerStop" } )
            .addTransition( "ShowAddedSuccessfully", { from: "Default", to: "AddedSuccessfully" } )
            .addTransition( "ShowAlreadyAdded", { from: "Default", to: "AlreadyAdded" } )
            .addTransition( "ShowVoteAlreadySelfVoted", { from: "Default", to: "VoteAlreadySelfVoted" } )
            .addTransition( "ShowVotedSuccessfully", {
                from: "Default",
                to: "VotedSuccessfully",
                mutations: [ { type: "set", path: [ "targetId" ] } ]
            } )
            .addTransition( "ShowVoteAlreadyVotedSame", {
                from: "Default",
                to: "VoteAlreadyVotedSame",
                mutations: [ { type: "set", path: [ "targetId" ] } ]
            } )
            .addTransition( "ShowVoteUpdatedSuccessfully", {
                from: "Default",
                to: "VoteUpdatedSuccessfully",
                mutations: [
                    { type: "set", path: [ "prevUserId" ] },
                    { type: "set", path: [ "currentUserId" ] }
                ]
            } );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/ClaimResultOwnerStop":
                args.absentInterval = DynamicChannelClaimManager.get(
                    "VertixBot/UI-V2/DynamicChannelClaimManager"
                ).getChannelOwnershipTimeout();
                break;

            case "VertixBot/UI-V2/ClaimResultVotedSuccessfully":
            case "VertixBot/UI-V2/ClaimResultVoteAlreadyVotedSame":
                args.userDisplayName = await guildGetMemberDisplayName( interaction.guild, argsFromManager?.targetId );
                args.userId = argsFromManager?.targetId;
                break;

            case "VertixBot/UI-V2/ClaimResultVoteUpdatedSuccessfully":
                args.prevUserId = argsFromManager?.prevUserId;
                args.currentUserId = argsFromManager?.currentUserId;
                break;
        }

        return args;
    } )
    .shouldDeletePreviousReply( () => true )
    .build();

export { ClaimResultAdapter };
