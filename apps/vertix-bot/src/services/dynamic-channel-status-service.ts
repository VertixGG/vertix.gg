import "@vertix.gg/prisma/bot-client";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { DynamicChannelStatusModel } from "@vertix.gg/data/src/models/channel/dynamic-channel-status-model";

import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";
import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";
import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import {
    DYNAMIC_CHANNEL_STATUS_VARS,
    VAR_DYNAMIC_CHANNEL_GAME,
    VAR_DYNAMIC_CHANNEL_STATE,
    VAR_DYNAMIC_CHANNEL_USER
} from "@vertix.gg/definitions/src/dynamic-channel-vars-definitions";

import { varsReplaceTokens } from "@vertix.gg/base/src/utils/vars-utils";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ActivityType, Routes } from "discord.js";

import {
    DYNAMIC_CHANNEL_STATUS_LIMITS,
    DYNAMIC_CHANNEL_STATUS_PARTS,
    DYNAMIC_CHANNEL_STATUS_ROUTE_SUFFIX,
    DYNAMIC_CHANNEL_STATUS_TIMING,
    DynamicChannelSetStatusResultCode
} from "@vertix.gg/bot/src/definitions/dynamic-channel-status";

import type { MasterChannelConfigInterface } from "@vertix.gg/data/src/interfaces/master-channel-config";

import type { RESTPutAPIChannelVoiceStatusJSONBody } from "discord-api-types/v10";

import type { GuildMember, Presence, VoiceChannel } from "discord.js";

import type { IDynamicChannelSetStatusResult } from "@vertix.gg/bot/src/definitions/dynamic-channel-status";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

/**
 * Owns the voice channel status line of every dynamic channel.
 *
 * The status is composed from the channel state on every change, unless the owner pinned a custom
 * one, in which case the automatic writer stands down until the custom status is cleared.
 *
 * The composing half is a master channel setting, so an admin can leave the status line to the
 * owners alone. A pinned status is written either way - it is the owner asking for it.
 */
export class DynamicChannelStatusService extends ServiceWithDependenciesBase<{
    dynamicChannelService: DynamicChannelService;
}> {
    private readonly debugger: Debugger;

    private readonly writeDebounceMap = new Map<string, NodeJS.Timeout>();

    private config = ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );

    public static getName() {
        return "VertixBot/Services/DynamicChannelStatus";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", DynamicChannelStatusService.getName() ) );
    }

    public getDependencies() {
        return {
            dynamicChannelService: "VertixBot/Services/DynamicChannel"
        };
    }

    protected async initialize() {
        await super.initialize();

        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", this.onJoin.bind( this ) );
        EventBus.$.on( "VertixBot/Services/Channel", "onLeave", this.onLeave.bind( this ) );

        // Every state change that the composed status reflects, `channel` is always the second argument.
        [
            "editUserLimit",
            "editChannelState",
            "editChannelVisibilityState",
            "editChannelPrivacyState",
            "resetChannel"
        ].forEach( ( methodName ) => {
            EventBus.$.on( "VertixBot/Services/DynamicChannel", methodName, ( ...args: any[] ) => {
                const channel = args[ 1 ] as VoiceChannel | undefined;

                if ( channel ) {
                    this.applyDebounce( channel );
                }
            } );
        } );
    }

    /**
     * Function `getStatus()` - Resolves the status a channel should currently be showing.
     */
    public async getStatus( channel: VoiceChannel ): Promise<string | null> {
        const customStatus = await this.getCustomStatus( channel );

        if ( null !== customStatus ) {
            return this.expandStatusVars( channel, customStatus );
        }

        if ( !( await this.isAutoStatusEnabled( channel ) ) ) {
            return null;
        }

        return this.getComposedStatus( channel );
    }

    /**
     * Function `isAutoStatusEnabled()` - Whether the master channel lets the bot compose the status.
     */
    public async isAutoStatusEnabled( channel: VoiceChannel ): Promise<boolean> {
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

        if ( !masterChannelDB ) {
            return false;
        }

        return MasterChannelDataManager.$.getChannelAutoStatus( masterChannelDB );
    }

    /**
     * Function `getCustomStatus()` - The owner-pinned status, `null` when the channel is on automatic.
     */
    public async getCustomStatus( channel: VoiceChannel ): Promise<string | null> {
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( !channelDB?.isDynamic ) {
            return null;
        }

        return DynamicChannelStatusModel.$.getCustomStatus( channelDB.id );
    }

    /**
     * Function `apply()` - Writes the resolved status to Discord.
     */
    public async apply( channel: VoiceChannel ) {
        // An empty channel is on its way to deletion, writing to it is wasted quota.
        if ( !channel.members.size ) {
            return;
        }

        if ( !( await ChannelModel.$.isDynamic( channel.id ) ) ) {
            return;
        }

        const status = await this.getStatus( channel );

        // Nothing to say: no pinned status, and the automatic writer is switched off for this
        // master channel. A status set through Discord's own UI is left where it is.
        if ( null === status ) {
            return;
        }

        // Whatever the line ends up saying is written from here, and most of it never passed the
        // check the owner's own typing did: a game name read off somebody's presence, a display
        // name a token pulled in. Masked rather than refused - there is nobody waiting to be told,
        // and a channel that quietly stops saying anything is worse than one saying it with the
        // word covered.
        const masked = await GuildDataManager.$.maskBadwords( channel.guildId, status );

        await this.write( channel, masked.slice( 0, DYNAMIC_CHANNEL_STATUS_LIMITS.API_MAX_LENGTH ) );
    }

    /**
     * Function `applyDebounce()` - Coalesces a burst of state changes into a single write.
     */
    public applyDebounce( channel: VoiceChannel, delay = DYNAMIC_CHANNEL_STATUS_TIMING.DEBOUNCE_DELAY_MS ) {
        this.debugger.log(
            this.applyDebounce,
            `Guild id: '${ channel.guildId }' - Scheduling status write for channel id: '${ channel.id }'`
        );

        const key = channel.id;

        const existingTimeoutId = this.writeDebounceMap.get( key );

        if ( existingTimeoutId ) {
            this.writeDebounceMap.delete( key );

            clearTimeout( existingTimeoutId );
        }

        const timeoutId = setTimeout( async() => {
            this.writeDebounceMap.delete( key );

            await this.apply( channel ).catch( ( error: unknown ) =>
                this.logger.error(
                    this.applyDebounce,
                    `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to apply status`,
                    error
                )
            );
        }, delay );

        this.writeDebounceMap.set( key, timeoutId );
    }

    /**
     * Function `setCustomStatus()` - Pins an owner-defined status, an empty value clears it.
     */
    public async setCustomStatus( channel: VoiceChannel, status: string ): Promise<IDynamicChannelSetStatusResult> {
        const result: IDynamicChannelSetStatusResult = {
            code: DynamicChannelSetStatusResultCode.Error
        };

        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( !channelDB?.isDynamic ) {
            this.logger.error(
                this.setCustomStatus,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Dynamic channel not found`
            );

            return result;
        }

        const trimmedStatus = status.trim();

        if ( !trimmedStatus.length ) {
            return this.clearCustomStatus( channel );
        }

        const usedBadword = await GuildDataManager.$.hasSomeBadword( channel.guildId, trimmedStatus );

        if ( usedBadword ) {
            result.code = DynamicChannelSetStatusResultCode.Badword;
            result.badword = usedBadword;

            return result;
        }

        await DynamicChannelStatusModel.$.setCustomStatus( channelDB.id, trimmedStatus );

        await this.apply( channel );

        this.logger.info(
            this.setCustomStatus,
            `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Custom status set`
        );

        result.code = DynamicChannelSetStatusResultCode.Success;
        result.status = trimmedStatus;

        return result;
    }

    /**
     * Function `clearCustomStatus()` - Drops the custom status and hands the channel back to the automatic writer.
     */
    public async clearCustomStatus( channel: VoiceChannel ): Promise<IDynamicChannelSetStatusResult> {
        const result: IDynamicChannelSetStatusResult = {
            code: DynamicChannelSetStatusResultCode.Error
        };

        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( !channelDB?.isDynamic ) {
            return result;
        }

        await DynamicChannelStatusModel.$.removeCustomStatus( channelDB.id );

        if ( await this.isAutoStatusEnabled( channel ) ) {
            await this.apply( channel );
        } else {
            // Nothing takes the place of the status that was just dropped, so what the bot wrote
            // has to come off the channel, or the cleared status stays up forever.
            await this.write( channel, "" );
        }

        this.logger.info(
            this.clearCustomStatus,
            `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Custom status cleared`
        );

        result.code = DynamicChannelSetStatusResultCode.Cleared;

        return result;
    }

    /**
     * Function `getComposedStatus()` - Builds the automatic status out of what the channel currently is.
     */
    public async getComposedStatus( channel: VoiceChannel ) {
        const parts: string[] = [];

        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        const gameName = this.getChannelGame( channel, channelDB?.userOwnerId );

        // Leads the line: it is the part that answers "what is this room", and Discord truncates
        // the status from the right.
        if ( gameName ) {
            parts.push( gameName.slice( 0, DYNAMIC_CHANNEL_STATUS_PARTS.GAME_MAX_LENGTH ) );
        }

        parts.push(
            `${ channel.members.size }/${
                channel.userLimit > 0 ? channel.userLimit : DYNAMIC_CHANNEL_STATUS_PARTS.OCCUPANCY_NO_LIMIT
            }`
        );

        // Only states the occupancy cannot express are worth a slot, "open" and "full" are already
        // in the numbers. No marker therefore reads as public and joinable.
        switch ( await this.services.dynamicChannelService.getChannelPrivacyState( channel ) ) {
            case "hidden":
                parts.push( DYNAMIC_CHANNEL_STATUS_PARTS.STATE_HIDDEN );
                break;

            case "private":
                parts.push( DYNAMIC_CHANNEL_STATUS_PARTS.STATE_PRIVATE );
                break;
        }

        // Masked here rather than only on the way out, because this is also what the status modal
        // shows the owner as the line their channel falls back to. The game name in it is read off
        // somebody's presence and can say anything at all.
        return GuildDataManager.$.maskBadwords( channel.guildId, parts.join( DYNAMIC_CHANNEL_STATUS_PARTS.SEPARATOR ) );
    }

    /**
     * Function `expandStatusVars()` - Fills in the tokens a pinned status is allowed to carry.
     *
     * Done on every write rather than once when the status is pinned, which is the whole point of
     * allowing them: a status reading `{game}` follows the room onto whatever it plays next, where
     * a value frozen at the moment somebody typed it would be a claim that quietly stopped being
     * true.
     *
     * A token nobody used costs nothing - the status is returned untouched, and the reads behind
     * each token only happen for the tokens actually present.
     */
    private async expandStatusVars( channel: VoiceChannel, status: string ): Promise<string> {
        if ( !DYNAMIC_CHANNEL_STATUS_VARS.some( ( variable ) => status.includes( variable ) ) ) {
            return status;
        }

        const channelDB = await ChannelModel.$.getByChannelId( channel.id ),
            ownerId = channelDB?.userOwnerId;

        const replacements: Record<string, string> = {};

        if ( status.includes( VAR_DYNAMIC_CHANNEL_USER ) ) {
            // The owner keeps the channel while they step out of it, so the guild cache answers
            // where the channel's own member list no longer does.
            const owner = ownerId
                ? channel.members.get( ownerId ) ?? channel.guild.members.cache.get( ownerId )
                : null;

            replacements[ VAR_DYNAMIC_CHANNEL_USER ] = owner?.displayName ?? "";
        }

        if ( status.includes( VAR_DYNAMIC_CHANNEL_GAME ) ) {
            replacements[ VAR_DYNAMIC_CHANNEL_GAME ] = this.getChannelGame( channel, ownerId ) ?? "";
        }

        if ( status.includes( VAR_DYNAMIC_CHANNEL_STATE ) ) {
            const { constants } = this.config.data;

            // Public and private only, the same two the channel name tells apart - a hidden channel
            // reads as private, since that is what it is to anyone who could not find it.
            replacements[ VAR_DYNAMIC_CHANNEL_STATE ] =
                "private" === await this.services.dynamicChannelService.getChannelState( channel )
                    ? constants.dynamicChannelStatePrivate
                    : constants.dynamicChannelStatePublic;
        }

        return varsReplaceTokens( status, replacements );
    }

    /**
     * Function `getChannelGame()` - The game the room is playing, by plurality of its members.
     *
     * @note Ties are broken towards the owner, so a two-versus-two split reads as the owner's game
     * rather than whichever member the iterator happened to reach first.
     */
    public getChannelGame( channel: VoiceChannel, ownerId?: string ): string | null {
        const playCounts = new Map<string, number>();

        channel.members.forEach( ( member: GuildMember ) => {
            const gameName = this.getPlayingActivityName( member.presence );

            if ( gameName ) {
                playCounts.set( gameName, ( playCounts.get( gameName ) ?? 0 ) + 1 );
            }
        } );

        if ( !playCounts.size ) {
            return null;
        }

        const ownerGameName = ownerId
            ? this.getPlayingActivityName( channel.members.get( ownerId )?.presence )
            : null;

        let result: string | null = null,
            resultCount = 0;

        playCounts.forEach( ( count, gameName ) => {
            if ( count > resultCount ) {
                result = gameName;
                resultCount = count;

                return;
            }

            if ( count === resultCount && gameName === ownerGameName ) {
                result = gameName;
            }
        } );

        return result;
    }

    /**
     * Function `getPlayingActivityName()` - The name of what a member is playing, if anything.
     *
     * @note Returns `null` whenever the `GuildPresences` intent is not granted, since `presence`
     * is then never populated.
     */
    public getPlayingActivityName( presence: Presence | null | undefined ): string | null {
        const activity = presence?.activities.find(
            ( currentActivity ) => ActivityType.Playing === currentActivity.type && !!currentActivity.name
        );

        return activity?.name ?? null;
    }

    private async write( channel: VoiceChannel, status: string ) {
        const body: RESTPutAPIChannelVoiceStatusJSONBody = { status };

        const route = `${ Routes.channel( channel.id ) }${ DYNAMIC_CHANNEL_STATUS_ROUTE_SUFFIX }` as `/${ string }`;

        await channel.client.rest
            .put( route, { body } )
            .then( () =>
                this.debugger.log(
                    this.write,
                    `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Status set to: '${ status }'`
                )
            )
            .catch( ( error: unknown ) =>
                this.logger.error(
                    this.write,
                    `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to set status`,
                    error
                )
            );
    }

    private async onJoin( args: IChannelEnterGenericArgs ) {
        const { newState } = args;

        if ( newState.channel && ( await ChannelModel.$.isDynamic( newState.channel.id ) ) ) {
            this.applyDebounce( newState.channel as VoiceChannel );
        }
    }

    private async onLeave( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args;

        // The channel is deleted once it empties out, there is nothing left to describe.
        if ( !oldState.channel?.members.size ) {
            return;
        }

        if ( await ChannelModel.$.isDynamic( oldState.channel.id ) ) {
            this.applyDebounce( oldState.channel as VoiceChannel );
        }
    }
}

export default DynamicChannelStatusService;
