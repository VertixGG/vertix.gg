import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui/v3/claim/result/claim-result-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

type Interaction = ButtonInteraction<"cached">;

const ClaimResultAdapter = new ExecutionAdapterBuilder<
    VoiceChannel,
    Interaction,
    UIArgs
>( "VertixBot/UI-V3/ClaimResultAdapter" )
    .setComponent( ClaimResultComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildVoice ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            // Result states - these are shown based on claim action outcomes
            .addState( "Default", {
                executionStep: "VertixBot/UI-V3/ClaimResultOwnerStop",
                previewDefaultVars: { absentInterval: "300000", absentMinutes: "5.0" },
                embedsGroup: "VertixBot/UI-V3/ClaimResultOwnerStopEmbedGroup"
            } )
            .addState( "OwnerStop", {
                executionStep: "VertixBot/UI-V3/ClaimResultOwnerStop",
                navigationType: "ephemeral",
                previewDefaultVars: { absentInterval: "300000", absentMinutes: "5.0" },
                embedsGroup: "VertixBot/UI-V3/ClaimResultOwnerStopEmbedGroup"
            } )
            .addState( "AddedSuccessfully", {
                executionStep: "VertixBot/UI-V3/ClaimResultAddedSuccessfully",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/ClaimResultStepInEmbedGroup"
            } )
            .addState( "AlreadyAdded", {
                executionStep: "VertixBot/UI-V3/ClaimResultAlreadyAdded",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/ClaimResultStepAlreadyInEmbedGroup"
            } )
            .addState( "VoteAlreadySelfVoted", {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/ClaimResultVoteSelfEmbedGroup"
            } )
            .addState( "VotedSuccessfully", {
                executionStep: "VertixBot/UI-V3/ClaimResultVotedSuccessfully",
                navigationType: "ephemeral",
                previewDefaultVars: { userDisplayName: "User", userId: "123456789" },
                embedsGroup: "VertixBot/UI-V3/ClaimResultVotedEmbedGroup"
            } )
            .addState( "VoteAlreadyVotedSame", {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame",
                navigationType: "ephemeral",
                previewDefaultVars: { userDisplayName: "User", userId: "123456789" },
                embedsGroup: "VertixBot/UI-V3/ClaimResultVotedSameEmbedGroup"
            } )
            .addState( "VoteUpdatedSuccessfully", {
                executionStep: "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully",
                navigationType: "ephemeral",
                previewDefaultVars: { prevUserId: "123456789", currentUserId: "987654321" },
                embedsGroup: "VertixBot/UI-V3/ClaimResultVoteUpdatedEmbedGroup"
            } )
            // Transitions - triggered by external claim manager
            //
            // Nothing here is reached by pressing anything: the claim manager decides which of the
            // seven answers a person gets and sends that one. The preview conditions restate that
            // decision, keyed on the manager's own names for the outcomes, so a demonstration picks
            // the same answer it would. The bot never reads them.
            .addTransition( "ShowOwnerStop", {
                from: "Default",
                to: "OwnerStop",
                previewCondition: { field: "claimResult", operator: "equals", value: "OwnerStop" }
            } )
            .addTransition( "ShowAddedSuccessfully", {
                from: "Default",
                to: "AddedSuccessfully",
                previewCondition: { field: "claimResult", operator: "equals", value: "AddedSuccessfully" }
            } )
            .addTransition( "ShowAlreadyAdded", {
                from: "Default",
                to: "AlreadyAdded",
                previewCondition: { field: "claimResult", operator: "equals", value: "AlreadyAdded" }
            } )
            .addTransition( "ShowVoteAlreadySelfVoted", {
                from: "Default",
                to: "VoteAlreadySelfVoted",
                previewCondition: { field: "claimResult", operator: "equals", value: "VoteAlreadySelf" }
            } )
            .addTransition( "ShowVotedSuccessfully", {
                from: "Default",
                to: "VotedSuccessfully",
                mutations: [ { type: "set", path: [ "targetId" ] } ],
                previewCondition: { field: "claimResult", operator: "equals", value: "VoteSuccess" }
            } )
            .addTransition( "ShowVoteAlreadyVotedSame", {
                from: "Default",
                to: "VoteAlreadyVotedSame",
                mutations: [ { type: "set", path: [ "targetId" ] } ],
                previewCondition: { field: "claimResult", operator: "equals", value: "VoteSameChoice" }
            } )
            .addTransition( "ShowVoteUpdatedSuccessfully", {
                from: "Default",
                to: "VoteUpdatedSuccessfully",
                mutations: [
                    { type: "set", path: [ "prevUserId" ] },
                    { type: "set", path: [ "currentUserId" ] }
                ],
                previewCondition: { field: "claimResult", operator: "equals", value: "VoteUpdated" }
            } );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args: UIArgs = {};
        const step = context.getCurrentExecutionStep( interaction )?.name;

        switch ( step ) {
            case "VertixBot/UI-V3/ClaimResultOwnerStop":
                args.absentInterval = await DynamicChannelClaimManager.get(
                    "VertixBot/UI-V3/DynamicChannelClaimManager"
                ).getChannelOwnershipTimeout( interaction.guildId );
                break;

            case "VertixBot/UI-V3/ClaimResultVotedSuccessfully":
            case "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame":
                args.userDisplayName = await guildGetMemberDisplayName( interaction.guild, argsFromManager.targetId );
                args.userId = argsFromManager.targetId;
                break;

            case "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully":
                args.prevUserId = argsFromManager.prevUserId;
                args.currentUserId = argsFromManager.currentUserId;
                break;
        }

        return args;
    } )
    .shouldDeletePreviousReply( () => true )
    .build();

export { ClaimResultAdapter };
