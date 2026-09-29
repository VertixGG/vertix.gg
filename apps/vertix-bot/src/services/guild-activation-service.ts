import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { GuildActivityModel } from "@vertix.gg/data/src/models/guild-activity-model";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";

/** The channels that are a server setting the bot up - a generator of either kind. */
const SETUP_CHANNEL_TYPES: readonly string[] = [ "MASTER_CREATE_CHANNEL", "MASTER_SCALING_CHANNEL" ];

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
 * Its first generator, its first room, and how many rooms a day its members make - which is what
 * tells an install that became a server running on the bot from one that was added and forgotten.
 * The owner measures growth by it, so it listens rather than being called: nothing that creates a
 * channel has to know it exists, and a failure here never delays a room.
 */
export class GuildActivationService extends ServiceWithDependenciesBase<{
    channelService: ChannelService;
}> {
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
        EventBus.$.on( "VertixBot/Services/Channel", "onChannelCreated", ( guildId: string, internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES ) => {
            this.record( guildId, internalType ).catch( ( error ) => {
                this.logger.error( this.initialize, `Guild id: '${ guildId }' - Could not record '${ internalType }'`, error );
            } );
        } );
    }

    /**
     * Function record() :: Note a channel the bot made, if it is one that says something.
     */
    public async record( guildId: string, internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES ) {
        const at = new Date();

        if ( SETUP_CHANNEL_TYPES.includes( internalType ) ) {
            await GuildActivityModel.$.markSetup( guildId, at );

            return;
        }

        if ( ROOM_CHANNEL_TYPES.includes( internalType ) ) {
            await GuildActivityModel.$.markRoomCreated( guildId, at );
        }
    }
}

export default GuildActivationService;
