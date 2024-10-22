import { ChannelType, PermissionsBitField } from "discord.js";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { ClaimVoteComponent } from "@vertix.gg/bot/src/ui-v2/claim/vote/claim-vote-component";

import {
    UIAdapterExecutionStepsBase,
} from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-execution-steps-base";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";
import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { UIArgs, UIExecutionConditionArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { ButtonInteraction, Message, VoiceChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

export class ClaimVoteAdapter extends UIAdapterExecutionStepsBase<VoiceChannel, DefaultInteraction> {
    public static getName() {
        return "VertixBot/UI-V2/ClaimVoteAdapter";
    }

    public static getComponent() {
        return ClaimVoteComponent;
    }

    protected static getExecutionSteps() {
        return {
            "VertixBot/UI-V2/ClaimStepIn": {
                embedsGroup: "VertixBot/UI-V2/ClaimVoteStepInEmbedGroup",
                elementsGroup: "VertixBot/UI-V2/ClaimVoteStepInButtonGroup",
                getConditions: ( { context }: UIExecutionConditionArgs ) =>
                    [ "starting", "active" ].includes( DynamicChannelVoteManager.$.getState( context.channelId as string ) ) &&
                    DynamicChannelVoteManager.$.getCandidatesCount( context.channelId as string ) < 2
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
                markdownGroup: "VertixBot/UI-V2/ClaimVoteResultsMarkdownGroup",
            }
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

    protected async getReplyArgs( interaction: DefaultInteraction ) {
        return this.getAllArgs( interaction );
    }

    protected async getEditMessageArgs( message: Message<true> ): Promise<UIArgs> {
        return this.getAllArgs( message );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async onBeforeBuild( args: UIArgs, from: string, interaction: DefaultInteraction ): Promise<void> {
        const stepName = this.getCurrentExecutionStep()?.name;

        if ( "run" === from ) {
            switch ( stepName ) {
                case "VertixBot/UI-V2/ClaimStepIn":
                    this.bindButton( "VertixBot/UI-V2/ClaimVoteStepInButton", this.handleVoteRequest.bind( this ) );
                    break;

                case "VertixBot/UI-V2/ClaimVoteProcess":
                    this.bindButton( "VertixBot/UI-V2/ClaimVoteStepInButton", this.handleVoteRequest.bind( this ) );
                    this.bindButton( "VertixBot/UI-V2/ClaimVoteAddButton", this.handleVoteRequest.bind( this ) );
                    break;
            }
        }

        if ( stepName === "VertixBot/UI-V2/ClaimVoteWon" && Object.keys( args.results ).length > 1 ) {
            this.getComponent().switchMarkdownsGroup( "VertixBot/UI-V2/ClaimVoteResultsMarkdownGroup" );
        }
    }

    protected async onStep( stepName: string, interaction: DefaultInteraction & {
        channel: VoiceChannel
    } ): Promise<void> {
        switch ( stepName ) {
            case "VertixBot/UI-V2/ClaimVoteWon":
                // TODO: Dedicated method
                const args = await this.getReplyArgs( interaction );

                await DynamicChannelClaimManager.$.unmarkChannelAsClaimable( interaction.channel );

                await this.dynamicChannelService.editChannelOwner( args.userWonId, args.previousOwnerId, interaction.channel, "claim" );
                break;
        }
    }

    protected async handleVoteRequest( interaction: DefaultInteraction ) {
        await DynamicChannelClaimManager.$.handleVoteRequest( interaction );
    }

    private async getAllArgs( context: DefaultInteraction | Message<true> ) {
        const args: UIArgs = {};

        const stepName = this.getCurrentExecutionStep()?.name;

        switch ( stepName ) {
            case "VertixBot/UI-V2/ClaimStepIn":
                await this.setBasicArgs( context, args );
                break;

            case "VertixBot/UI-V2/ClaimVoteProcess":
                await this.setBasicArgs( context, args );

                args.results = DynamicChannelVoteManager.$.getResults( context.channelId );
                args.candidateDisplayNames = {};

                await Promise.all( Object.keys( args.results ).map( async ( userId ) => {
                    args.candidateDisplayNames[ userId ] = await guildGetMemberDisplayName( context.guild, userId );
                } ) );
                break;

            case "VertixBot/UI-V2/ClaimVoteWon":
                const dynamicChannelDB = await ChannelModel.$.getByChannelId( context.channelId );

                if ( ! dynamicChannelDB ) {
                    throw new Error( "Master channel not found." );
                }

                const winnerId = DynamicChannelVoteManager.$.getWinnerId( context.channelId );

                args.userWonId = winnerId;
                args.userWonDisplayName = await guildGetMemberDisplayName( context.guild, winnerId );

                args.elapsedTime = Date.now() - DynamicChannelVoteManager.$.getStartTime( context.channelId );

                args.previousOwnerId = dynamicChannelDB.userOwnerId;
                args.previousOwnerDisplayName = await guildGetMemberDisplayName( context.guild, dynamicChannelDB.userOwnerId );

                args.results = DynamicChannelVoteManager.$.getResults( context.channelId );

                // Markdown only if there are results.
                if ( Object.keys( args.results ).length > 1 ) {
                    // Required for markdown - TODO: Use constants.
                    args.id = context.id;
                    args.guildId = context.guildId;
                    args.channelId = context.channelId;
                    args.markdownCode = ( args.channelId + args.id + args.guildId ).substring( 0, 100 );

                    const wonMember = context.guild?.members.cache.get( args.userWonId ) ||
                        await context.guild?.members.fetch( args.userWonId );

                    args.userWonDisplayAvatarURL = wonMember.displayAvatarURL( {
                        size: 128,
                        extension: "png",
                    } );
                }

                break;

            default:
                throw new Error( `Unknown step name: '${ stepName }'.` );
        }

        return args;
    }

    private async setBasicArgs( context: DefaultInteraction | Message<true>, args: UIArgs ) {
        args.userInitiatorId = DynamicChannelVoteManager.$.getInitiatorId( context.channelId );
        args.userInitiatorDisplayName = await guildGetMemberDisplayName( context.guild, args.userInitiatorId );
        args.timeEnd = DynamicChannelVoteManager.$.getEndTime( context.channelId );

        return args;
    }
}
