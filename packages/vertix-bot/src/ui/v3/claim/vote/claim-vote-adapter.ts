import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { ClaimVoteComponent } from "@vertix.gg/bot/src/ui/v3/claim/vote/claim-vote-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs, UIExecutionConditionArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { ButtonInteraction, Message, VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

const CLAIM_VOTE_STEPS = {
    "VertixBot/UI-V3/ClaimStepIn": {
        embedsGroup: "VertixBot/UI-V3/ClaimVoteStepInEmbedGroup",
        elementsGroup: "VertixBot/UI-V3/ClaimVoteStepInButtonGroup",
        getConditions: ( { context }: UIExecutionConditionArgs ) =>
            [ "starting", "active" ].includes(
                DynamicChannelVoteManager.$.getState( context.channelId as string )
            ) && DynamicChannelVoteManager.$.getCandidatesCount( context.channelId as string ) < 2
    },
    "VertixBot/UI-V3/ClaimVoteProcess": {
        embedsGroup: "VertixBot/UI-V3/ClaimVoteEmbedGroup",
        elementsGroup: "VertixBot/UI-V3/ClaimVoteElementsGroup",
        getConditions: ( { context }: UIExecutionConditionArgs ) =>
            DynamicChannelVoteManager.$.getState( context.channelId as string ) === "active" &&
            DynamicChannelVoteManager.$.getCandidatesCount( context.channelId as string ) > 1
    },
    "VertixBot/UI-V3/ClaimVoteWon": {
        embedsGroup: "VertixBot/UI-V3/ClaimVoteWonEmbedGroup",
        getConditions: ( { context }: UIExecutionConditionArgs ) =>
            DynamicChannelVoteManager.$.isTimeExpired( context.channelId as string )
    },

    bypass: {
        markdownGroup: "VertixBot/UI-V3/ClaimVoteResultsMarkdownGroup"
    }
} as const;

async function setBasicArgs(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    carrier: DefaultInteraction | Message<true>,
    args: UIArgs
) {
    args.userInitiatorId = DynamicChannelVoteManager.$.getInitiatorId( carrier.channelId );
    args.userInitiatorDisplayName = await guildGetMemberDisplayName( carrier.guild, args.userInitiatorId );
    args.timeEnd = DynamicChannelVoteManager.$.getEndTime( carrier.channelId );
    return args;
}

async function getAllArgs(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    carrier: DefaultInteraction | Message<true>
) {
    const args: UIArgs = {};
    const stepName = context.getCurrentExecutionStep( carrier as any )?.name;

    switch ( stepName ) {
        case "VertixBot/UI-V3/ClaimStepIn":
            await setBasicArgs( context, carrier, args );
            break;

        case "VertixBot/UI-V3/ClaimVoteProcess":
            await setBasicArgs( context, carrier, args );

            args.results = DynamicChannelVoteManager.$.getResults( carrier.channelId );
            args.candidateDisplayNames = {};

            await Promise.all(
                Object.keys( args.results ).map( async( userId ) => {
                    args.candidateDisplayNames[ userId ] = await guildGetMemberDisplayName( carrier.guild, userId );
                } )
            );
            break;

        case "VertixBot/UI-V3/ClaimVoteWon":
            const dynamicChannelDB = await ChannelModel.$.getByChannelId( carrier.channelId );

            if ( !dynamicChannelDB ) {
                throw new Error( "Master channel not found." );
            }

            const winnerId = DynamicChannelVoteManager.$.getWinnerId( carrier.channelId );

            args.userWonId = winnerId;
            args.userWonDisplayName = await guildGetMemberDisplayName( carrier.guild, winnerId );

            args.elapsedTime = Date.now() - DynamicChannelVoteManager.$.getStartTime( carrier.channelId );

            args.previousOwnerId = dynamicChannelDB.userOwnerId;
            args.previousOwnerDisplayName = await guildGetMemberDisplayName(
                carrier.guild,
                dynamicChannelDB.userOwnerId
            );

            args.results = DynamicChannelVoteManager.$.getResults( carrier.channelId );

            if ( Object.keys( args.results ).length > 1 ) {
                args.id = carrier.id;
                args.guildId = carrier.guildId;
                args.channelId = carrier.channelId;
                args.markdownCode = ( args.channelId + args.id + args.guildId ).substring( 0, 100 );

                const wonMember =
                    carrier.guild?.members.cache.get( args.userWonId ) ||
                    ( await carrier.guild?.members.fetch( args.userWonId ) );

                args.userWonDisplayAvatarURL = wonMember.displayAvatarURL( {
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

const ClaimVoteAdapter = new ExecutionAdapterBuilder<
    VoiceChannel,
    DefaultInteraction,
    UIArgs
>( "VertixBot/UI-V3/ClaimVoteAdapter" )
    .setComponent( ClaimVoteComponent )
    .setExecutionSteps( CLAIM_VOTE_STEPS )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildVoice ] )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => getAllArgs( context, interaction ) )
    .getEditMessageArgs( async( context, message ) => getAllArgs( context, message as Message<true> ) )
    .onEntityMap( async( { bindButton } ) => {
        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V3/ClaimVoteStepInButton",
            async( _context, interaction ) => {
                const voiceInteraction = interaction as unknown as DefaultInteraction;
                handleVoteRequest( voiceInteraction );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/ClaimVoteFlow",
                        transition: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/StartVote",
                        navigation: {
                            targetState: "VertixBot/UI-V3/ClaimVoteFlow/States/VoteProcess",
                            executionStep: "VertixBot/UI-V3/ClaimResultAddedSuccessfully"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/ClaimVoteFlow",
                        transition: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/AddCandidate",
                        navigation: {
                            targetState: "VertixBot/UI-V3/ClaimVoteFlow/States/StepIn",
                            executionStep: "VertixBot/UI-V3/ClaimResultAlreadyAdded"
                        }
                    }
                ]
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V3/ClaimVoteAddButton",
            async( _context, interaction ) => {
                const voiceInteraction = interaction as unknown as DefaultInteraction;
                handleVoteRequest( voiceInteraction );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/ClaimVoteFlow",
                        transition: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSelf",
                        navigation: {
                            targetState: "VertixBot/UI-V3/ClaimVoteFlow/States/VoteAlreadySelf",
                            executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/ClaimVoteFlow",
                        transition: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSuccess",
                        navigation: {
                            targetState: "VertixBot/UI-V3/ClaimVoteFlow/States/VoteSuccess",
                            executionStep: "VertixBot/UI-V3/ClaimResultVotedSuccessfully"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/ClaimVoteFlow",
                        transition: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSame",
                        navigation: {
                            targetState: "VertixBot/UI-V3/ClaimVoteFlow/States/VoteSameChoice",
                            executionStep: "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame"
                        }
                    },
                    {
                        flowName: "VertixBot/UI-V3/ClaimVoteFlow",
                        transition: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteUpdated",
                        navigation: {
                            targetState: "VertixBot/UI-V3/ClaimVoteFlow/States/VoteUpdated",
                            executionStep: "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully"
                        }
                    }
                ]
            }
        );
    } )
    .onStep( async( context, stepName, interaction ) => {
        switch ( stepName ) {
            case "VertixBot/UI-V3/ClaimVoteWon":
                const args = await getAllArgs( context, interaction );

                DynamicChannelClaimManager.get( "VertixBot/UI-V3/DynamicChannelClaimManager" ).unmarkChannelAsClaimable(
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
    .onBeforeBuildPrototype( async( context, args, _from, interaction ) => {
        const stepName = context.getCurrentExecutionStep( interaction )?.name;

        if ( args.results && stepName === "VertixBot/UI-V3/ClaimVoteWon" && Object.keys( args.results ).length > 1 ) {
            context.getComponent().switchMarkdownsGroup( "VertixBot/UI-V3/ClaimVoteResultsMarkdownGroup" );
        }
    } )
    .build();

async function handleVoteRequest( interaction: DefaultInteraction ) {
    await DynamicChannelClaimManager.get( "VertixBot/UI-V3/DynamicChannelClaimManager" ).handleVoteRequest( interaction );
}

export { ClaimVoteAdapter };
