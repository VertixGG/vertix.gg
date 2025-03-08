import { ChannelType, PermissionsBitField } from "discord.js";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui/v3/claim/result/claim-result-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

export class ClaimResultAdapter extends UIAdapterExecutionStepsBase<VoiceChannel, ButtonInteraction<"cached">> {
    public static getName() {
        return "Vertix/UI-V3/ClaimResultAdapter";
    }

    public static getComponent() {
        return ClaimResultComponent;
    }

    protected static getExecutionSteps() {
        return {
            "Vertix/UI-V3/ClaimResultOwnerStop": {
                embedsGroup: "Vertix/UI-V3/ClaimResultOwnerStopEmbedGroup"
            },

            "Vertix/UI-V3/ClaimResultAddedSuccessfully": {
                embedsGroup: "Vertix/UI-V3/ClaimResultStepInEmbedGroup"
            },
            "Vertix/UI-V3/ClaimResultAlreadyAdded": {
                embedsGroup: "Vertix/UI-V3/ClaimResultStepAlreadyInEmbedGroup"
            },

            "Vertix/UI-V3/ClaimResultVoteAlreadySelfVoted": {
                embedsGroup: "Vertix/UI-V3/ClaimResultVoteSelfEmbedGroup"
            },
            "Vertix/UI-V3/ClaimResultVotedSuccessfully": {
                embedsGroup: "Vertix/UI-V3/ClaimResultVotedEmbedGroup"
            },
            "Vertix/UI-V3/ClaimResultVoteAlreadyVotedSame": {
                embedsGroup: "Vertix/UI-V3/ClaimResultVotedSameEmbedGroup"
            },
            "Vertix/UI-V3/ClaimResultVoteUpdatedSuccessfully": {
                embedsGroup: "Vertix/UI-V3/ClaimResultVoteUpdatedEmbedGroup"
            }
        };
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField(0n);
    }

    public getChannelTypes() {
        return [ChannelType.GuildVoice];
    }

    protected async getStartArgs() {
        return {};
    }

    protected async getReplyArgs(interaction: ButtonInteraction<"cached">, argsFromManager: UIArgs) {
        const args: UIArgs = {};

        switch (this.getCurrentExecutionStep().name) {
            case "Vertix/UI-V3/ClaimResultOwnerStop":
                args.absentInterval = DynamicChannelClaimManager.get(
                    "Vertix/UI-V3/DynamicChannelClaimManager"
                ).getChannelOwnershipTimeout();
                break;

            case "Vertix/UI-V3/ClaimResultVotedSuccessfully":
            case "Vertix/UI-V3/ClaimResultVoteAlreadyVotedSame":
                args.userDisplayName = await guildGetMemberDisplayName(interaction.guild, argsFromManager.targetId);
                args.userId = argsFromManager.targetId;
                break;

            case "Vertix/UI-V3/ClaimResultVoteUpdatedSuccessfully":
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
