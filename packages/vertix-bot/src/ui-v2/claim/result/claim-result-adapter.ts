import { ChannelType, PermissionsBitField } from "discord.js";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui-v2/claim/result/claim-result-component";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-execution-steps-base";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

export class ClaimResultAdapter extends UIAdapterExecutionStepsBase<VoiceChannel, ButtonInteraction<"cached">> {
    public static getName() {
        return "VertixBot/UI-V2/ClaimResultAdapter";
    }

    public static getComponent() {
        return ClaimResultComponent;
    }

    protected static getExecutionSteps() {
        return {
            "VertixBot/UI-V2/ClaimResultOwnerStop": {
                embedsGroup: "VertixBot/UI-V2/ClaimResultOwnerStopEmbedGroup",
            },

            "VertixBot/UI-V2/ClaimResultAddedSuccessfully": {
                embedsGroup: "VertixBot/UI-V2/ClaimResultStepInEmbedGroup",
            },
            "VertixBot/UI-V2/ClaimResultAlreadyAdded": {
                embedsGroup: "VertixBot/UI-V2/ClaimResultStepAlreadyInEmbedGroup",
            },

            "VertixBot/UI-V2/ClaimResultVoteAlreadySelfVoted": {
                embedsGroup: "VertixBot/UI-V2/ClaimResultVoteSelfEmbedGroup",
            },
            "VertixBot/UI-V2/ClaimResultVotedSuccessfully": {
                embedsGroup: "VertixBot/UI-V2/ClaimResultVotedEmbedGroup",
            },
            "VertixBot/UI-V2/ClaimResultVoteAlreadyVotedSame": {
                embedsGroup: "VertixBot/UI-V2/ClaimResultVotedSameEmbedGroup",
            },
            "VertixBot/UI-V2/ClaimResultVoteUpdatedSuccessfully": {
                embedsGroup: "VertixBot/UI-V2/ClaimResultVoteUpdatedEmbedGroup",
            },
        };
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( 0n );
    }

    public getChannelTypes() {
        return [
            ChannelType.GuildVoice
        ];
    }

    protected async getStartArgs() {
        return {};
    }

    protected async getReplyArgs( interaction: ButtonInteraction<"cached">, argsFromManager: UIArgs ) {
        const args: UIArgs = {};

        switch ( this.getCurrentExecutionStep().name ) {
            case "VertixBot/UI-V2/ClaimResultOwnerStop":
                args.absentInterval = DynamicChannelClaimManager.$.getChannelOwnershipTimeout();
                break;

            case "VertixBot/UI-V2/ClaimResultVotedSuccessfully":
            case "VertixBot/UI-V2/ClaimResultVoteAlreadyVotedSame":
                args.userDisplayName = await guildGetMemberDisplayName( interaction.guild, argsFromManager.targetId );
                args.userId = argsFromManager.targetId;
                break;

            case "VertixBot/UI-V2/ClaimResultVoteUpdatedSuccessfully":
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
