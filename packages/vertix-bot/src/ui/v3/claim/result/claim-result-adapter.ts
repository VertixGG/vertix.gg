import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui/v3/claim/result/claim-result-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

type Interaction = ButtonInteraction<"cached">;

const CLAIM_RESULT_STEPS = {
    "VertixBot/UI-V3/ClaimResultOwnerStop": {
        embedsGroup: "VertixBot/UI-V3/ClaimResultOwnerStopEmbedGroup"
    },

    "VertixBot/UI-V3/ClaimResultAddedSuccessfully": {
        embedsGroup: "VertixBot/UI-V3/ClaimResultStepInEmbedGroup"
    },
    "VertixBot/UI-V3/ClaimResultAlreadyAdded": {
        embedsGroup: "VertixBot/UI-V3/ClaimResultStepAlreadyInEmbedGroup"
    },

    "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted": {
        embedsGroup: "VertixBot/UI-V3/ClaimResultVoteSelfEmbedGroup"
    },
    "VertixBot/UI-V3/ClaimResultVotedSuccessfully": {
        embedsGroup: "VertixBot/UI-V3/ClaimResultVotedEmbedGroup"
    },
    "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame": {
        embedsGroup: "VertixBot/UI-V3/ClaimResultVotedSameEmbedGroup"
    },
    "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully": {
        embedsGroup: "VertixBot/UI-V3/ClaimResultVoteUpdatedEmbedGroup"
    }
} as const;

const ClaimResultAdapter = new ExecutionAdapterBuilder<
        VoiceChannel,
        Interaction,
        UIArgs
    >( "VertixBot/UI-V3/ClaimResultAdapter" )
    .setComponent( ClaimResultComponent )
    .setExecutionSteps( CLAIM_RESULT_STEPS )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildVoice ] )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args: UIArgs = {};
        const step = context.getCurrentExecutionStep( interaction )?.name;

        switch ( step ) {
            case "VertixBot/UI-V3/ClaimResultOwnerStop":
                args.absentInterval = DynamicChannelClaimManager.get(
                    "VertixBot/UI-V3/DynamicChannelClaimManager"
                ).getChannelOwnershipTimeout();
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
