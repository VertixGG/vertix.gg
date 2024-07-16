import { ChannelType, PermissionsBitField } from "discord.js";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { ClaimResultComponent } from "@vertix.gg/bot/src/ui-v2/claim/result/claim-result-component";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ButtonInteraction, VoiceChannel } from "discord.js";

export class ClaimResultAdapter extends UIAdapterExecutionStepsBase<VoiceChannel, ButtonInteraction<"cached">> {
    public static getName() {
        return "Vertix/UI-V2/ClaimResultAdapter";
    }

    public static getComponent() {
        return ClaimResultComponent;
    }

    protected static getExecutionSteps() {
        return {
            "Vertix/UI-V2/ClaimResultOwnerStop": {
                embedsGroup: "Vertix/UI-V2/ClaimResultOwnerStopEmbedGroup",
            },

            "Vertix/UI-V2/ClaimResultAddedSuccessfully": {
                embedsGroup: "Vertix/UI-V2/ClaimResultStepInEmbedGroup",
            },
            "Vertix/UI-V2/ClaimResultAlreadyAdded": {
                embedsGroup: "Vertix/UI-V2/ClaimResultStepAlreadyInEmbedGroup",
            },

            "Vertix/UI-V2/ClaimResultVoteAlreadySelfVoted": {
                embedsGroup: "Vertix/UI-V2/ClaimResultVoteSelfEmbedGroup",
            },
            "Vertix/UI-V2/ClaimResultVotedSuccessfully": {
                embedsGroup: "Vertix/UI-V2/ClaimResultVotedEmbedGroup",
            },
            "Vertix/UI-V2/ClaimResultVoteAlreadyVotedSame": {
                embedsGroup: "Vertix/UI-V2/ClaimResultVotedSameEmbedGroup",
            },
            "Vertix/UI-V2/ClaimResultVoteUpdatedSuccessfully": {
                embedsGroup: "Vertix/UI-V2/ClaimResultVoteUpdatedEmbedGroup",
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
            case "Vertix/UI-V2/ClaimResultOwnerStop":
                args.absentInterval =
                    DynamicChannelClaimManager.get( "Vertix/UI-V2/DynamicChannelClaimManager" )
                        .getChannelOwnershipTimeout();
                break;

            case "Vertix/UI-V2/ClaimResultVotedSuccessfully":
            case "Vertix/UI-V2/ClaimResultVoteAlreadyVotedSame":
                args.userDisplayName = await guildGetMemberDisplayName( interaction.guild, argsFromManager.targetId );
                args.userId = argsFromManager.targetId;
                break;

            case "Vertix/UI-V2/ClaimResultVoteUpdatedSuccessfully":
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
