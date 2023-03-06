import * as process from "process";

import { Client } from "discord.js";

import { Commands } from "@dynamico/interactions/commands";

import GlobalLogger from "../global-logger";

import PrismaInstance from "@internal/prisma";
import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";
import ChannelManager from "@dynamico/managers/channel";

const logger = GlobalLogger.getInstance();

async function botReady( client: Client, callback: Function ) {
    if ( ! client.user || ! client.application ) {
        logger.error( botReady, "Client is not ready" );
        process.exit( 1 );
        return;
    }

    await client.application.commands.set( Commands );

    logger.log( botReady, `Ready handle is set, Bot '${ client.user.username }' is online, commands is set.` );

    await callback();

    // Get all dynamic channels.
    const prisma = await PrismaInstance.getClient(),
        channels = await prisma.channel.findMany( {
            where: {
                internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL
            }
        } );

    for ( const channel of channels ) {
        const channelCache = client.guilds.cache.get( channel.guildId )?.channels.cache.get( channel.channelId );

        if ( channelCache?.members && channelCache.isVoiceBased() ) {
            if ( 0 === channelCache.members.size ) {
                await ChannelManager.getInstance().onChannelDelete( channelCache );
            }
        } else {
            // Delete from db.
            await prisma.channel.delete( {
                where: {
                    id: channel.id
                }
            } );
            logger.debug( botReady, `Channel '${ channel.channelId }' is deleted from db.`);
        }
    }
}

export async function readyHandler( client: Client ) {
    return new Promise( ( resolve ) => {
        const initialClient = client;

        // Sometimes but connected so fast that the ready event is not fired.
        if ( client.isReady() ) {
            botReady( client, resolve );
            return;
        }

        initialClient.on( "ready", async () => {
            await botReady( initialClient, resolve );
        } );
    } );
}
