import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { ClaimVoteComponent } from "@vertix.gg/bot/src/ui/v2/claim/vote/claim-vote-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { ButtonInteraction, Message, VoiceChannel } from "discord.js";

import type { UIArgs, UIExecutionConditionArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

const CLAIM_VOTE_STEPS = {
    "VertixBot/UI-V2/ClaimStepIn": {
        embedsGroup: "VertixBot/UI-V2/ClaimVoteStepInEmbedGroup",
        elementsGroup: "VertixBot/UI-V2/ClaimVoteStepInButtonGroup",
        getConditions: ( { context }: UIExecutionConditionArgs ) =>
            [ "starting", "active" ].includes(
                DynamicChannelVoteManager.$.getState( context.channelId as string )
            ) && DynamicChannelVoteManager.$.getCandidatesCount( context.channelId as string ) < 2
    },
    "VertixBot/UI-V2/ClaimVoteProcess": {
        embedsGroup: "VertixBot/UI-V2/ClaimVoteEmbedGroup",
        elementsGroup: "VertixBot/UI-V2/ClaimVoteElementsGroup",
        getConditions: ( { context }: UIExecutionConditionArgs ) =>
            DynamicChannelVoteManager.$.getState( context.channelId as string ) === "active" &&
            DynamicChannelVoteManager.$.getCandidatesCount( context.channelId as string ) > 1
    },
    "VertixBot/UI-V2/ClaimVoteWon": {
        embedsGroup: "VertixBot/UI-V2/ClaimVoteWonEmbedGroup",
        getConditions: ( { context }: UIExecutionConditionArgs ) =>
            DynamicChannelVoteManager.$.isTimeExpired( context.channelId as string )
    },

    bypass: {
        markdownGroup: "VertixBot/UI-V2/ClaimVoteResultsMarkdownGroup"
    }
} as const;

async function handleVoteRequest(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    interaction: DefaultInteraction
) {
    await DynamicChannelClaimManager.get( "VertixBot/UI-V2/DynamicChannelClaimManager" ).handleVoteRequest( interaction );
}

async function getAllArgs( context: IExecutionAdapterContext<DefaultInteraction, UIArgs>, messageOrInteraction: DefaultInteraction | Message<true> ) {
    const args: UIArgs = {};
    const stepName = context.getCurrentExecutionStep( messageOrInteraction as DefaultInteraction )?.name;

    switch ( stepName ) {
        case "VertixBot/UI-V2/ClaimStepIn":
            await setBasicArgs( messageOrInteraction, args );
            break;

        case "VertixBot/UI-V2/ClaimVoteProcess":
            await setBasicArgs( messageOrInteraction, args );

            args.results = DynamicChannelVoteManager.$.getResults( messageOrInteraction.channelId );
            args.candidateDisplayNames = {};

            await Promise.all(
                Object.keys( args.results ).map( async( userId ) => {
                    args.candidateDisplayNames[ userId ] = await guildGetMemberDisplayName( messageOrInteraction.guild!, userId );
                } )
            );
            break;

        case "VertixBot/UI-V2/ClaimVoteWon":
            const dynamicChannelDB = await ChannelModel.$.getByChannelId( messageOrInteraction.channelId );

            if ( !dynamicChannelDB ) {
                throw new Error( "Master channel not found." );
            }

            const winnerId = DynamicChannelVoteManager.$.getWinnerId( messageOrInteraction.channelId );

            args.userWonId = winnerId;
            args.userWonDisplayName = await guildGetMemberDisplayName( messageOrInteraction.guild!, winnerId );

            args.elapsedTime = Date.now() - DynamicChannelVoteManager.$.getStartTime( messageOrInteraction.channelId );

            args.previousOwnerId = dynamicChannelDB.userOwnerId;
            args.previousOwnerDisplayName = await guildGetMemberDisplayName(
                messageOrInteraction.guild!,
                dynamicChannelDB.userOwnerId
            );

            args.results = DynamicChannelVoteManager.$.getResults( messageOrInteraction.channelId );

            // Markdown only if there are results.
            if ( Object.keys( args.results ).length > 1 ) {
                // Required for markdown - TODO: Use constants.
                args.id = messageOrInteraction.id;
                args.guildId = messageOrInteraction.guildId;
                args.channelId = messageOrInteraction.channelId;
                args.markdownCode = ( args.channelId + args.id + args.guildId ).substring( 0, 100 );

                const wonMember =
                    messageOrInteraction.guild?.members.cache.get( args.userWonId ) ||
                    ( await messageOrInteraction.guild?.members.fetch( args.userWonId ) );

                args.userWonDisplayAvatarURL = wonMember?.displayAvatarURL( {
                    size: 128,
                    extension: "png"
                } );
            }

            break;

        default:
            throw new Error( `Unknown step name: '${ stepName }'.` );
    }

    return args;
}

async function setBasicArgs( context: DefaultInteraction | Message<true>, args: UIArgs ) {
    args.userInitiatorId = DynamicChannelVoteManager.$.getInitiatorId( context.channelId );
    args.userInitiatorDisplayName = await guildGetMemberDisplayName( context.guild!, args.userInitiatorId );
    args.timeEnd = DynamicChannelVoteManager.$.getEndTime( context.channelId );

    return args;
}

const ClaimVoteAdapter = new ExecutionAdapterBuilder<VoiceChannel, DefaultInteraction>(
    "VertixBot/UI-V2/ClaimVoteAdapter"
)
    .setComponent( ClaimVoteComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildVoice ] )
    .setExecutionSteps( CLAIM_VOTE_STEPS )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "StepIn" )
            .addState( "StepIn", {
                executionStep: "VertixBot/UI-V2/ClaimStepIn",
                previewDefaultVars: { userInitiatorDisplayName: "Initiator", timeEnd: "1700000000000" }
            } )
            .addState( "VoteProcess", {
                executionStep: "VertixBot/UI-V2/ClaimVoteProcess",
                previewDefaultVars: { userInitiatorDisplayName: "Initiator", timeEnd: "1700000000000" }
            } )
            .addState( "VoteWon", {
                executionStep: "VertixBot/UI-V2/ClaimVoteWon",
                previewDefaultVars: { userWonDisplayName: "Winner", previousOwnerDisplayName: "Previous Owner" }
            } )
            .addTransition( "StartVoting", { from: "StepIn", to: "VoteProcess" } )
            .addTransition( "UpdateVotes", { from: "VoteProcess", to: "VoteProcess" } )
            .addTransition( "AnnounceWinner", { from: "VoteProcess", to: "VoteWon" } )
            .bindButton<DefaultInteraction>( "VertixBot/UI-V2/ClaimVoteStepInButton", "StartVoting", handleVoteRequest )
            .bindButton<DefaultInteraction>( "VertixBot/UI-V2/ClaimVoteAddButton", "StartVoting", handleVoteRequest );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => {
        return getAllArgs( context, interaction );
    } )
    .getEditMessageArgs( async( context, message ) => {
        if ( !message ) {
            return {};
        }
        return getAllArgs( context, message );
    } )
    .onBeforeBuildPrototype( async( context, args, from, interaction ) => {
        const stepName = context.getCurrentExecutionStep( interaction )?.name;

        if ( "run" === from ) {
            // Note: In builder pattern, bindings happen in onEntityMap which runs once,
            // not dynamically per step. The buttons will be bound regardless of step.
        }

        if ( args.results && stepName === "VertixBot/UI-V2/ClaimVoteWon" && Object.keys( args.results ).length > 1 ) {
            context.getComponent().switchMarkdownsGroup( "VertixBot/UI-V2/ClaimVoteResultsMarkdownGroup" );
        }
    } )
    .onStep( async( context, stepName, interaction ) => {
        switch ( stepName ) {
            case "VertixBot/UI-V2/ClaimVoteWon":
                // TODO: Dedicated method
                const args = await getAllArgs( context, interaction );

                DynamicChannelClaimManager.get( "VertixBot/UI-V2/DynamicChannelClaimManager" ).unmarkChannelAsClaimable(
                    interaction.channel
                );

                await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" ).editChannelOwner(
                    args.userWonId,
                    args.previousOwnerId,
                    interaction.channel,
                    "claim"
                );

                break;
        }
    } )
    .build();

export { ClaimVoteAdapter };
