import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { GuildActivityModel, toUtcDay } from "@vertix.gg/data/src/models/guild-activity-model";
import { GuildVoiceMemberModel } from "@vertix.gg/data/src/models/guild-voice-member-model";

import {
    GUILD_VOICE_MEMBERS_KEEP_DAYS,
    GUILD_VOICE_MEMBERS_SWEEP_INTERVAL_MS
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

import type { IChannelEnterGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";
import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";

/** The channels that are a server setting the bot up - a generator of either kind, or a team lobby. */
const SETUP_CHANNEL_TYPES: readonly string[] = [ "MASTER_CREATE_CHANNEL", "MASTER_SCALING_CHANNEL", "MASTER_LOBBY_CHANNEL" ];

/**
 * The channel a member makes by joining a generator.
 *
 * Only these count as use. An auto-scaling pool opens rooms ahead of anybody needing them, so its
 * rooms say how the pool is configured rather than whether anybody came.
 */
const ROOM_CHANNEL_TYPES: readonly string[] = [ "DYNAMIC_CHANNEL" ];

/**
 * Writes down what each server does with the bot after adding it.
 *
 * Its first generator, its first room, how many rooms a day its members make and from which generator,
 * and how many of its members are in its rooms - which is what tells an install that became a server
 * running on the bot from one that was added and forgotten. The owner measures growth by it and the
 * server's own home page is drawn from it, so it listens rather than being called: nothing that creates
 * a channel or moves a member has to know it exists, and a failure here never delays either. It also
 * deletes the members' days once nothing counts back over them.
 *
 * A room no longer starts the server's free trial - its owner does, from the dashboard's
 * Subscription page. Nothing here gives one.
 */
export class GuildActivationService extends ServiceWithDependenciesBase<{
    channelService: ChannelService;
}> {
    /**
     * The members already noted today, as `<guild>:<member>` - so a member hopping between rooms is
     * one write a day rather than one a move. Emptied when the UTC day turns.
     */
    private notedToday = new Set<string>();

    private notedDay = 0;

    public static getName() {
        return "VertixBot/Services/GuildActivation";
    }

    public getDependencies() {
        return {
            channelService: "VertixBot/Services/Channel"
        };
    }

    protected async initialize() {
        await super.initialize();

        // Subscribed once the channel service is up - the event bus refuses a listener for an object
        // it has not registered yet.
        EventBus.$.on( "VertixBot/Services/Channel", "onChannelCreated", (
            guildId: string,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES,
            ownerChannelId: string | null,
            userOwnerId: string
        ) => {
            this.record( guildId, internalType, ownerChannelId, userOwnerId ).catch( ( error ) => {
                this.logger.error( this.initialize, `Guild id: '${ guildId }' - Could not record '${ internalType }'`, error );
            } );
        } );

        // Every process deletes the same old days; deleting what is already gone costs nothing.
        const forget = () => this.forgetOldMembers().catch( ( error ) => {
            this.logger.error( this.initialize, "Could not delete the members' old days in rooms", error );
        } );

        setInterval( forget, GUILD_VOICE_MEMBERS_SWEEP_INTERVAL_MS );
        void forget();

        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", ( args: IChannelEnterGenericArgs ) => {
            this.notePresence( args ).catch( ( error ) => {
                this.logger.error( this.initialize, `Guild id: '${ args.newState.guild.id }' - Could not note a member in a room`, error );
            } );
        } );
    }

    /**
     * Function record() :: Note a channel the bot made, if it is one that says something.
     *
     * A room is counted under the generator that made it as well - `ownerChannelId` is that generator's
     * discord id on a room a member made - and the member it was made for is noted as in a room. They
     * are noted here rather than when they join it: they are moved in before the room's row is written,
     * so their join cannot yet be told for a room's.
     */
    public async record(
        guildId: string,
        internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES,
        ownerChannelId: string | null = null,
        userOwnerId: string | null = null
    ) {
        const at = new Date();

        if ( SETUP_CHANNEL_TYPES.includes( internalType ) ) {
            await GuildActivityModel.$.markSetup( guildId, at );

            return;
        }

        if ( ! ROOM_CHANNEL_TYPES.includes( internalType ) ) {
            return;
        }

        await GuildActivityModel.$.markRoomCreated( guildId, at, ownerChannelId );

        if ( userOwnerId ) {
            await this.noteMember( guildId, userOwnerId, at );
        }
    }

    /**
     * Function notePresence() :: Note a member who came into one of the server's rooms.
     *
     * Any room the bot keeps counts here, a pool's as well: a pool opens its rooms ahead of anybody, so
     * they are not counted as rooms made, but a member in one is a member using the bot all the same.
     * Bots are not members anybody is counting.
     */
    public async notePresence( args: IChannelEnterGenericArgs ) {
        const { newState } = args;

        if ( ! newState.channelId || newState.member?.user.bot || this.isNotedToday( newState.guild.id, newState.id, new Date() ) ) {
            return;
        }

        const channel = await ChannelModel.$.getByChannelId( newState.channelId );

        if ( ! channel?.isDynamic && ! channel?.isScaling ) {
            return;
        }

        await this.noteMember( newState.guild.id, newState.id, new Date() );
    }

    /**
     * Function forgetOldMembers() :: Delete the members' days in rooms that nothing counts back over any more.
     */
    public async forgetOldMembers( now: Date = new Date() ) {
        await GuildVoiceMemberModel.$.deleteBefore(
            new Date( toUtcDay( now ).getTime() - GUILD_VOICE_MEMBERS_KEEP_DAYS * 24 * 60 * 60 * 1000 )
        );
    }

    /**
     * Function noteMember() :: Note a member as in one of the server's rooms today, unless they were already.
     */
    private async noteMember( guildId: string, userId: string, at: Date ) {
        if ( this.isNotedToday( guildId, userId, at ) ) {
            return;
        }

        await GuildVoiceMemberModel.$.markPresent( guildId, userId, toUtcDay( at ) );

        // Only once it is written, so a member whose note failed is tried again at their next join.
        this.notedToday.add( `${ guildId }:${ userId }` );
    }

    private isNotedToday( guildId: string, userId: string, at: Date ) {
        const day = toUtcDay( at ).getTime();

        if ( day !== this.notedDay ) {
            this.notedDay = day;
            this.notedToday.clear();
        }

        return this.notedToday.has( `${ guildId }:${ userId }` );
    }
}

export default GuildActivationService;
