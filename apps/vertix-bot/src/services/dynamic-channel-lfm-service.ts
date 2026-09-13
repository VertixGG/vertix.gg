import "@vertix.gg/prisma/bot-client";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";
import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";

import { DynamicChannelLfmCooldownModel } from "@vertix.gg/data/src/models/channel/dynamic-channel-lfm-cooldown-model";
import { DynamicChannelLfmPingCooldownModel } from "@vertix.gg/data/src/models/channel/dynamic-channel-lfm-ping-cooldown-model";
import { DynamicChannelLfmPostModel } from "@vertix.gg/data/src/models/channel/dynamic-channel-lfm-post-model";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ChannelType, EmbedBuilder } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import {
    dynamicChannelLfmCooldownRemaining,
    dynamicChannelLfmTimingsResolve
} from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

import { DynamicChannelLfmManager } from "@vertix.gg/bot/src/managers/dynamic-channel-lfm-manager";

import { DynamicChannelLfmPostResultCode } from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { Client, Guild, GuildMember, TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";

import type {
    DynamicChannelLfmTimingsInterface
} from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

import type { ChannelExtended } from "@vertix.gg/data/src/models/channel/channel-client-extend";

import type { IDynamicChannelLfmStoredPost } from "@vertix.gg/data/src/interfaces/dynamic-channel-lfm";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { ILfmDestinationOption } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/dynamic-channel-lfm-channel-menu";

import type { IDynamicChannelLfmPostResult } from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

import type { IDynamicChannelLfmPost } from "@vertix.gg/bot/src/managers/dynamic-channel-lfm-manager";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { DynamicChannelStatusService } from "@vertix.gg/bot/src/services/dynamic-channel-status-service";

export interface IDynamicChannelLfmPostArgs {
    channelId: string;
    channelName: string;
    ownerId: string;
    memberCount: number;
    userLimit: number;
    gameName: string | null;
}

export class DynamicChannelLfmService extends ServiceWithDependenciesBase<{
    dynamicChannelService: DynamicChannelService;
    dynamicChannelStatusService: DynamicChannelStatusService;
}> {
    private readonly debugger: Debugger;

    private readonly refreshDebounceMap = new Map<string, NodeJS.Timeout>();

    public static getName() {
        return "VertixBot/Services/DynamicChannelLfm";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", DynamicChannelLfmService.getName() ) );
    }

    public getDependencies() {
        return {
            dynamicChannelService: "VertixBot/Services/DynamicChannel",
            dynamicChannelStatusService: "VertixBot/Services/DynamicChannelStatus"
        };
    }

    protected async initialize() {
        await super.initialize();

        EventBus.$.on( "VertixBot/Services/App", "onReady", this.onBotReady.bind( this ) );

        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", this.onJoin.bind( this ) );
        EventBus.$.on( "VertixBot/Services/Channel", "onLeave", this.onLeave.bind( this ) );

        EventBus.$.on(
            "VertixBot/Services/DynamicChannel",
            "onLeaveDynamicChannelEmpty",
            this.onLeaveDynamicChannelEmpty.bind( this )
        );

        // The same state changes the voice status reflects, for the same reason: a post describing
        // a room nobody can join any more comes down rather than going stale.
        [
            "editUserLimit",
            "editChannelState",
            "editChannelVisibilityState",
            "editChannelPrivacyState",
            "resetChannel"
        ].forEach( ( methodName ) => {
            EventBus.$.on( "VertixBot/Services/DynamicChannel", methodName, ( ...args: unknown[] ) => {
                const channel = args[ 1 ];

                if ( channel ) {
                    void this.refreshDebounce( channel as VoiceChannel );
                }
            } );
        } );
    }

    private async getMasterChannel( channel: VoiceChannel ) {
        const dynamicChannelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! dynamicChannelDB?.ownerChannelId ) {
            return null;
        }

        return ChannelModel.$.getByChannelId( dynamicChannelDB.ownerChannelId );
    }

    /**
     * Function getTimings() :: The clocks this room's generator runs its posts on.
     *
     * A room whose generator cannot be found falls back to the shared defaults rather than
     * refusing: the post it is being asked about already exists, and leaving it without an expiry
     * would strand it.
     */
    public async getTimings( channel: VoiceChannel | VoiceBasedChannel ): Promise<DynamicChannelLfmTimingsInterface> {
        const masterChannelDB = await this.getMasterChannel( channel as VoiceChannel );

        if ( ! masterChannelDB ) {
            return dynamicChannelLfmTimingsResolve();
        }

        return MasterChannelDataManager.$.getChannelLfmTimings( masterChannelDB );
    }

    public async getLfmChannelIds( channel: VoiceChannel ): Promise<string[]> {
        const masterChannelDB = await this.getMasterChannel( channel );

        if ( ! masterChannelDB ) {
            return [];
        }

        const settings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );

        return settings.dynamicChannelLfmChannelIds ?? [];
    }

    /**
     * Whether the room itself still belongs on the board, ignoring whether it is already there.
     *
     * Kept apart from `getEligibility()` because a standing post asks the same question for the
     * opposite reason: the press asks whether it may post, and the refresh asks whether what it
     * posted is still true.
     */
    public async getChannelEligibility( channel: VoiceChannel ): Promise<DynamicChannelLfmPostResultCode> {
        const lfmChannelIds = await this.getLfmChannelIds( channel );

        if ( ! lfmChannelIds.length ) {
            return DynamicChannelLfmPostResultCode.NotConfigured;
        }

        if ( "hidden" === await this.services.dynamicChannelService.getChannelVisibilityState( channel ) ) {
            return DynamicChannelLfmPostResultCode.ChannelHidden;
        }

        if ( "private" === await this.services.dynamicChannelService.getChannelState( channel ) ) {
            return DynamicChannelLfmPostResultCode.ChannelPrivate;
        }

        if ( channel.userLimit > 0 && channel.members.size >= channel.userLimit ) {
            return DynamicChannelLfmPostResultCode.ChannelFull;
        }

        return DynamicChannelLfmPostResultCode.Success;
    }

    /**
     * Function resolvePingContent() :: The mentions this post should carry, if any.
     *
     * Empty whenever this generator pinged the destination recently, so a quiet post still goes up
     * rather than being refused - the cooldown limits the noise, not the feature.
     *
     * Takes the generator rather than looking it up, because the caller has already resolved it to
     * answer two other questions about the same post.
     */
    private async resolvePingContent(
        channel: VoiceChannel,
        lfmChannelId: string,
        masterChannelDB: ChannelExtended | null
    ) {
        if ( ! masterChannelDB ) {
            return "";
        }

        if ( ! await DynamicChannelLfmPingCooldownModel.$.canPing( masterChannelDB.id, lfmChannelId ) ) {
            return "";
        }

        const roleIds = await MasterChannelDataManager.$.getChannelLfmPingRoleIds( masterChannelDB );

        const mentions = roleIds
            .filter( ( roleId ) => channel.guild.roles.cache.has( roleId ) )
            .map( ( roleId ) => `<@&${ roleId }>` );

        return mentions.join( " " );
    }

    public async getEligibility( channel: VoiceChannel ): Promise<DynamicChannelLfmPostResultCode> {
        const channelEligibility = await this.getChannelEligibility( channel );

        if ( DynamicChannelLfmPostResultCode.Success !== channelEligibility ) {
            return channelEligibility;
        }

        if ( DynamicChannelLfmManager.$.getPost( channel.id ) ) {
            return DynamicChannelLfmPostResultCode.AlreadyPosted;
        }

        if ( await this.getCooldownRemaining( channel ) ) {
            return DynamicChannelLfmPostResultCode.Cooldown;
        }

        return DynamicChannelLfmPostResultCode.Success;
    }

    /**
     * Function refreshDebounce() :: Schedules a refresh, and drops the ones that pile up behind it.
     *
     * The standing post check stays first and stays in memory, because this runs on every voice
     * move in every guild: only the handful of rooms actually holding a post get as far as asking
     * their generator how long to wait.
     */
    public async refreshDebounce( channel: VoiceChannel, delay?: number ) {
        if ( ! DynamicChannelLfmManager.$.getPost( channel.id ) ) {
            return;
        }

        const resolvedDelay = delay ?? ( await this.getTimings( channel ) ).occupancyDebounce;

        const key = channel.id;

        const existingTimeoutId = this.refreshDebounceMap.get( key );

        if ( existingTimeoutId ) {
            this.refreshDebounceMap.delete( key );

            clearTimeout( existingTimeoutId );
        }

        this.refreshDebounceMap.set( key, setTimeout( () => {
            this.refreshDebounceMap.delete( key );

            void this.refresh( channel ).catch( ( error: unknown ) =>
                this.logger.error( this.refreshDebounce, "", error )
            );
        }, resolvedDelay ) );
    }

    /**
     * Function refresh() :: Brings a standing post back in line with the room it describes.
     *
     * A room that filled up, went private, went hidden, or whose generator lost its lfm channels
     * has the post taken down instead of rewritten - a board of rooms nobody can join is worse
     * than an empty one.
     */
    /**
     * Function tickCountdown() :: Redraws a standing post so its countdown moves.
     *
     * The countdown is rendered when the message is built, so without this it would sit on
     * whatever it said when the post went up - the same number half an hour later, which reads as
     * a frozen post rather than a live one.
     */
    private tickCountdown( channel: VoiceChannel ) {
        void this.refresh( channel ).catch( ( error: unknown ) =>
            this.logger.error( this.tickCountdown, "", error )
        );
    }

    public async refresh( channel: VoiceChannel ) {
        const post = DynamicChannelLfmManager.$.getPost( channel.id );

        if ( ! post ) {
            return;
        }

        if ( DynamicChannelLfmPostResultCode.Success !== await this.getChannelEligibility( channel ) ) {
            await this.remove( channel );

            return;
        }

        const args = await this.composePostArgs( channel );

        if ( ! args ) {
            return;
        }

        const message = await this.fetchPostMessage( channel.guild, post.lfmChannelId, post.messageId );

        if ( ! message ) {
            DynamicChannelLfmManager.$.release( channel.id );

            await this.forgetPost( channel );

            return;
        }

        // The mentions it went out with, kept as they were sent: an edit never notifies anybody
        // again, and dropping them would rewrite the post into one that never pinged at all.
        await this.getPostAdapter()?.rerenderMessage(
            message,
            {
                ...this.toSendArgs( channel, args, await this.renderNote( channel, post.note ), post.expiresAt ),
                pingContent: post.pingContent
            }
        );

        this.debugger.log( this.refresh, `Channel id: '${ channel.id }' - Post refreshed` );
    }

    public async remove( channel: VoiceChannel ) {
        const post = DynamicChannelLfmManager.$.release( channel.id );

        if ( ! post ) {
            return;
        }

        await this.deleteMessage( channel.guild, post.lfmChannelId, post.messageId );

        await this.forgetPost( channel );

        void this.logToGuild( channel, `🔎 The LFM post in <#${ post.lfmChannelId }> was taken down` );

        this.debugger.log( this.remove, `Channel id: '${ channel.id }' - Post removed` );
    }

    public async getDestinations( channel: VoiceChannel, member: GuildMember ): Promise<ILfmDestinationOption[]> {
        const lfmChannelIds = await this.getLfmChannelIds( channel );

        const destinations: ILfmDestinationOption[] = [];

        lfmChannelIds.forEach( ( lfmChannelId ) => {
            const lfmChannel = channel.guild.channels.cache.get( lfmChannelId );

            if ( ! lfmChannel || ChannelType.GuildText !== lfmChannel.type ) {
                return;
            }

            // The member's own view, not the bot's: an admin can allowlist a channel half the
            // server cannot see, and offering it would post somewhere the poster cannot read.
            if ( ! member.permissionsIn( lfmChannel ).has( "ViewChannel" ) ) {
                return;
            }

            destinations.push( { id: lfmChannel.id, name: lfmChannel.name } );
        } );

        const suggested = this.suggestDestination(
            destinations,
            this.services.dynamicChannelStatusService.getChannelGame( channel )
        );

        if ( suggested ) {
            suggested.isSuggested = true;
        }

        return destinations;
    }

    /**
     * Function suggestDestination() :: The channel a room playing this game most likely belongs in.
     *
     * Matched on the name rather than on anything an admin has to configure - a guild that keeps
     * `#valorant-lfg` next to `#cs2-lfg` has already said which is which, and asking them to say it
     * again in a mapping screen is a setup step to answer a question their channel names answer.
     *
     * Only ever a preselection: it is wrong sometimes, and the menu it lands in is one click away
     * from whatever the owner actually wanted.
     */
    private suggestDestination( destinations: ILfmDestinationOption[], gameName: string | null ) {
        if ( ! gameName || destinations.length < 2 ) {
            return null;
        }

        const normalize = ( value: string ) => value.toLowerCase().replace( /[^a-z0-9]/g, "" );

        const game = normalize( gameName );

        if ( ! game ) {
            return null;
        }

        return destinations.find( ( destination ) => {
            const name = normalize( destination.name );

            return Boolean( name ) && ( name.includes( game ) || game.includes( name ) );
        } ) ?? null;
    }

    public async post(
        channel: VoiceChannel,
        lfmChannelId: string,
        note: string | null = null,
        initiator?: GuildMember
    ): Promise<IDynamicChannelLfmPostResult> {
        if ( "accepted" !== DynamicChannelLfmManager.$.request( channel.id ) ) {
            return { code: DynamicChannelLfmPostResultCode.AlreadyPosted };
        }

        try {
            // Asked here rather than trusted from the caller's own eligibility check, because a
            // destination menu is still clickable after the check that opened it stopped being
            // true - and this is the one door every post comes through.
            const cooldownRemaining = await this.getCooldownRemaining( channel );

            if ( cooldownRemaining ) {
                DynamicChannelLfmManager.$.abort( channel.id );

                return {
                    code: DynamicChannelLfmPostResultCode.Cooldown,
                    retryAfterMs: cooldownRemaining
                };
            }

            const lfmChannel = channel.guild.channels.cache.get( lfmChannelId );

            if ( ! lfmChannel || ChannelType.GuildText !== lfmChannel.type ) {
                return this.abortPost( channel.id );
            }

            const args = await this.composePostArgs( channel );

            if ( ! args ) {
                return this.abortPost( channel.id );
            }

            // Resolved once and handed down: the expiry, the ping allowance and the ping cooldown
            // are all this generator's to answer, and looking it up three times would ask the same
            // question of the database three times.
            const masterChannelDB = await this.getMasterChannel( channel );

            const timings = masterChannelDB
                ? await MasterChannelDataManager.$.getChannelLfmTimings( masterChannelDB )
                : dynamicChannelLfmTimingsResolve();

            const pingContent = await this.resolvePingContent( channel, lfmChannelId, masterChannelDB );

            const expiresAt = Date.now() + timings.postExpiry;

            const message = await this.getPostAdapter()?.send(
                lfmChannel as TextChannel,
                {
                    ...this.toSendArgs( channel, args, await this.renderNote( channel, note ), expiresAt ),
                    pingContent
                }
            );

            if ( ! message ) {
                return this.abortPost( channel.id );
            }

            // The note is kept as it was typed rather than as it was rendered, so a `{game}` in it
            // follows the room on every refresh instead of freezing on whatever was playing when
            // somebody pressed the button.
            const post = {
                lfmChannelId,
                messageId: message.id,
                note,
                pingContent,
                expiresAt
            };

            DynamicChannelLfmManager.$.register(
                channel.id,
                post,
                ( expired ) => {
                    void this.deleteMessage( channel.guild, expired.lfmChannelId, expired.messageId );
                    void this.forgetPost( channel );
                },
                () => this.tickCountdown( channel )
            );

            await this.rememberPost( channel, post );

            if ( masterChannelDB ) {
                await this.rememberCooldown( masterChannelDB, timings.postCooldown );
            }

            if ( pingContent && masterChannelDB ) {
                await DynamicChannelLfmPingCooldownModel.$.setPingCooldown(
                    masterChannelDB.id,
                    lfmChannelId,
                    Date.now() + timings.pingCooldown
                );
            }

            this.debugger.log( this.post, `Channel id: '${ channel.id }' - Posted to '${ lfmChannelId }'` );

            this.logger.admin(
                this.post,
                `🔎 LFM post - "${ channel.guild.name }" (${ channel.guild.memberCount }) ` +
                    `channel: "${ channel.name }" destination: "${ lfmChannelId }" pinged: "${ Boolean( pingContent ) }"`
            );

            void this.logToGuild(
                channel,
                `🔎 **${ initiator?.displayName ?? "Someone" }** posted this channel to <#${ lfmChannelId }>` +
                    ( pingContent ? ", pinging " + pingContent : "" )
            );

            return { code: DynamicChannelLfmPostResultCode.Success, postedChannelId: lfmChannelId };
        } catch( error ) {
            this.logger.error( this.post, "", error );

            return this.abortPost( channel.id );
        }
    }

    private abortPost( channelId: string ): IDynamicChannelLfmPostResult {
        DynamicChannelLfmManager.$.abort( channelId );

        return { code: DynamicChannelLfmPostResultCode.Error };
    }

    private getPostAdapter() {
        return ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-V2/DynamicChannelLfmPostAdapter" );
    }

    /**
     * Function renderNote() :: The owner's note as it should read right now.
     *
     * Tokens are expanded against the room as it stands, and badwords are masked rather than
     * refused - a note is a throwaway line on a post that outlives it by half an hour at most, and
     * sending somebody back to a modal over one word costs more than covering it.
     */
    private async renderNote( channel: VoiceChannel, note: string | null ) {
        const trimmed = note?.trim();

        if ( ! trimmed ) {
            return null;
        }

        const expanded = await this.services.dynamicChannelStatusService.expandChannelVars( channel, trimmed );

        return GuildDataManager.$.maskBadwords( channel.guildId, expanded );
    }

    /**
     * The raw numbers rather than a composed line: how occupancy is drawn is the embed's business,
     * and the embed is the half a guild can rewrite from the dashboard.
     */
    private toSendArgs(
        channel: VoiceChannel,
        args: IDynamicChannelLfmPostArgs,
        note: string | null,
        expiresAt: number
    ) {
        const owner = channel.guild.members.cache.get( args.ownerId );

        return {
            note,
            channelId: args.channelId,
            channelName: args.channelName,
            ownerId: args.ownerId,
            gameName: args.gameName,
            memberCount: args.memberCount,
            userLimit: args.userLimit,

            // Always resolvable: the bot's own avatar stands in when the owner is not cached, so
            // the thumbnail never renders as a broken url.
            ownerAvatarUrl: owner?.displayAvatarURL() ?? channel.client.user.displayAvatarURL(),

            // Milliseconds, as the elapsed-time embed reads it - the post used to hand discord a
            // unix timestamp to count down itself, and nothing needs seconds any more.
            expiresAt
        };
    }

    /**
     * Function onBotReady() :: Picks the standing posts back up, or takes them down.
     *
     * Every timer this feature runs on lives in the process, so a post that outlived one has
     * nobody left to refresh or expire it. Restored where the room it advertises is still there,
     * deleted where it is not - a post for a channel that no longer exists is the litter this
     * whole record exists to prevent.
     */
    private async onBotReady( client: Client<true> ) {
        const stored = await DynamicChannelLfmPostModel.$.getAllPosts().catch( ( error: unknown ) => {
            this.logger.error( this.onBotReady, "", error );

            return [];
        } );

        if ( ! stored.length ) {
            return;
        }

        this.logger.log( this.onBotReady, `Restoring '${ stored.length }' lfm post(s)` );

        for ( const post of stored ) {
            await this.restorePost( client, post ).catch( ( error: unknown ) =>
                this.logger.error( this.onBotReady, "", error )
            );
        }
    }

    private async restorePost( client: Client<true>, stored: IDynamicChannelLfmStoredPost ) {
        const channel = client.channels.cache.get( stored.channelId );

        if ( ! channel || ChannelType.GuildVoice !== channel.type ) {
            const lfmChannel = client.channels.cache.get( stored.lfmChannelId );

            if ( lfmChannel && ChannelType.GuildText === lfmChannel.type ) {
                await lfmChannel.messages.delete( stored.messageId ).catch( () => {} );
            }

            await DynamicChannelLfmPostModel.$.removePost( stored.channelId ).catch( () => {} );

            return;
        }

        DynamicChannelLfmManager.$.register(
            channel.id,
            {
                lfmChannelId: stored.lfmChannelId,
                messageId: stored.messageId,
                note: stored.note,
                pingContent: stored.pingContent,
                expiresAt: stored.expiresAt
            },
            ( expired ) => {
                void this.deleteMessage( channel.guild, expired.lfmChannelId, expired.messageId );
                void this.forgetPost( channel );
            },
            () => this.tickCountdown( channel as VoiceChannel )
        );

        await this.refresh( channel );
    }

    /**
     * Function logToGuild() :: Writes an lfm action into the generator's logs channel.
     *
     * Its own rather than the channel service's: that one switches on its own methods to decide
     * what a line says, so it can only ever describe actions belonging to it.
     *
     * Logged at all because this is the one feature that writes into channels the whole server
     * reads. Admins already get a line when somebody renames a room; they should not have to guess
     * who advertised it and where.
     */
    private async logToGuild( channel: VoiceChannel, message: string ) {
        const masterChannelDB = await this.getMasterChannel( channel );

        if ( ! masterChannelDB ) {
            return;
        }

        const logsChannelId = await MasterChannelDataManager.$.getChannelLogsChannelId( masterChannelDB );

        if ( ! logsChannelId ) {
            return;
        }

        const logsChannel = channel.guild.channels.cache.get( logsChannelId );

        if ( ! logsChannel || ChannelType.GuildText !== logsChannel.type ) {
            return;
        }

        const embed = new EmbedBuilder()
            .setTimestamp( new Date() )
            .setDescription( "❯❯ " + message )
            .setColor( VERTIX_DEFAULT_COLOR_BRAND )
            .setFooter( {
                text: `Channel: \`${ channel.name }\` masterChannelId: \`${ masterChannelDB.channelId }\``
            } );

        await logsChannel.send( { embeds: [ embed ] } ).catch( ( error: unknown ) =>
            this.logger.error( this.logToGuild, "", error )
        );
    }

    private async rememberPost( channel: VoiceChannel, post: IDynamicChannelLfmPost ) {
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! channelDB ) {
            return;
        }

        await DynamicChannelLfmPostModel.$.setPost( channelDB.id, { channelId: channel.id, ...post } );
    }

    private async forgetPost( channel: VoiceChannel | VoiceBasedChannel ) {
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! channelDB ) {
            return;
        }

        await DynamicChannelLfmPostModel.$.removePost( channelDB.id ).catch( () => {} );
    }

    /**
     * Function getCooldownRemaining() :: How long this room's generator still owes, in
     * milliseconds.
     *
     * Asked of the generator rather than the room, so leaving a room and taking a fresh one out of
     * the same generator answers the same thing - the room is deleted the moment it empties, and a
     * clock kept on it would be a clock anybody could reset at will.
     *
     * Zero once the moment has passed, so a caller never has to tell "no cooldown" apart from "a
     * cooldown that finished" - and the stale row is left to be overwritten by the next post
     * rather than cleaned up on a read.
     *
     * Answered against the generator's cooldown as it is set now rather than as it was set when
     * the row was written, so shortening it - or turning it off - takes effect on the rest already
     * running instead of on the one after it.
     */
    public async getCooldownRemaining( channel: VoiceChannel | VoiceBasedChannel ) {
        const masterChannelDB = await this.getMasterChannel( channel as VoiceChannel );

        if ( ! masterChannelDB ) {
            return 0;
        }

        const stored = await DynamicChannelLfmCooldownModel.$.getCooldown( masterChannelDB.id );

        if ( ! stored ) {
            return 0;
        }

        const { postCooldown } = await MasterChannelDataManager.$.getChannelLfmTimings( masterChannelDB );

        return dynamicChannelLfmCooldownRemaining( stored, postCooldown );
    }

    /**
     * Function rememberCooldown() :: Starts the generator's rest now that a post has gone up.
     *
     * Counted from the post going up rather than coming down, because a generator has many rooms
     * and each may hold a post at once: a clock started on release would let every room post
     * together and only then begin resting, which is the opposite of what it is for.
     *
     * The moment it began is written alongside the deadline it produces, because the deadline on
     * its own cannot say which setting it came from - and so cannot be reworked when that setting
     * changes.
     */
    private async rememberCooldown( masterChannelDB: ChannelExtended, postCooldown: number ) {
        if ( ! postCooldown ) {
            return;
        }

        const startedAt = Date.now();

        await DynamicChannelLfmCooldownModel.$.setCooldown( masterChannelDB.id, {
            masterChannelId: masterChannelDB.channelId,
            startedAt,
            until: startedAt + postCooldown
        } ).catch( ( error: unknown ) => this.logger.error( this.rememberCooldown, "", error ) );
    }

    private async deleteMessage( guild: Guild, lfmChannelId: string, messageId: string ) {
        const lfmChannel = guild.channels.cache.get( lfmChannelId );

        if ( ! lfmChannel || ChannelType.GuildText !== lfmChannel.type ) {
            return;
        }

        await lfmChannel.messages.delete( messageId ).catch( () => {} );
    }

    private async fetchPostMessage( guild: Guild, lfmChannelId: string, messageId: string ) {
        const lfmChannel = guild.channels.cache.get( lfmChannelId );

        if ( ! lfmChannel || ChannelType.GuildText !== lfmChannel.type ) {
            return null;
        }

        return lfmChannel.messages.fetch( messageId ).catch( () => null );
    }

    /**
     * No `isDynamic()` check on the way in, unlike the status service.
     *
     * These fire for every voice move in every guild, and asking the database whether the channel
     * is dynamic would cost a lookup per move to answer a question only the handful of channels
     * holding a post can act on. `refreshDebounce()` drops the rest against an in memory map, and
     * a channel holding a post is dynamic by construction - nothing else can post one.
     */
    private onJoin( args: IChannelEnterGenericArgs ) {
        const { newState } = args;

        if ( newState.channel ) {
            void this.refreshDebounce( newState.channel as VoiceChannel );
        }
    }

    private onLeave( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args;

        // An emptied channel is deleted, and `onLeaveDynamicChannelEmpty` takes its post down.
        if ( ! oldState.channel?.members.size ) {
            return;
        }

        void this.refreshDebounce( oldState.channel as VoiceChannel );
    }

    /**
     * The channel is going away, so its post goes with it - and everything held for it is dropped
     * rather than released, since a cooldown on an id that can never come back is dead weight.
     */
    private async onLeaveDynamicChannelEmpty( channel: VoiceBasedChannel, _channelDB: unknown, guild: Guild ) {
        const post = DynamicChannelLfmManager.$.getPost( channel.id );

        DynamicChannelLfmManager.$.clearChannel( channel.id );

        const timeout = this.refreshDebounceMap.get( channel.id );

        if ( timeout ) {
            clearTimeout( timeout );

            this.refreshDebounceMap.delete( channel.id );
        }

        if ( post ) {
            await this.deleteMessage( guild, post.lfmChannelId, post.messageId );
        }

        await this.forgetPost( channel );
    }

    public async composePostArgs( channel: VoiceChannel ): Promise<IDynamicChannelLfmPostArgs | null> {
        const dynamicChannelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! dynamicChannelDB?.userOwnerId ) {
            return null;
        }

        const gameName = this.services.dynamicChannelStatusService.getChannelGame(
            channel,
            dynamicChannelDB.userOwnerId
        );

        const args: IDynamicChannelLfmPostArgs = {
            channelId: channel.id,
            channelName: channel.name,
            ownerId: dynamicChannelDB.userOwnerId,
            memberCount: channel.members.size,
            userLimit: channel.userLimit,
            gameName
        };

        this.debugger.log( this.composePostArgs, `Channel id: '${ channel.id }' - Post args composed` );

        return args;
    }
}

export default DynamicChannelLfmService;
