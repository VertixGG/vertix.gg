import { ChannelType, PermissionsBitField } from "discord.js";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui/v3/claim/result/claim-result-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

export class ClaimResultAdapter extends UIAdapterExecutionStepsBase<VoiceChannel, ButtonInteraction<"cached">> {
    public static getName() {
        return "VertixBot/UI-V3/ClaimResultAdapter";
    }

    public static getComponent() {
        return ClaimResultComponent;
    }

    protected static getExecutionSteps() {
        return {
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
        };
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( 0n );
    }

    public getChannelTypes() {
        return [ ChannelType.GuildVoice ];
    }

    protected async getStartArgs() {
        return {};
    }

    protected async getReplyArgs( interaction: ButtonInteraction<"cached">, argsFromManager: UIArgs ) {
        const args: UIArgs = {};

        switch ( this.getCurrentExecutionStep().name ) {
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
    }

    protected shouldDeletePreviousReply() {
        return true;
    }
}
