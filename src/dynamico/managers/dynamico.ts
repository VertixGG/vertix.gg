import process from "process";

import { Client } from "discord.js";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import { Commands } from "@dynamico/interactions/commands";

import ChannelManager from "@dynamico/managers/channel";

import InitializeBase from "@internal/bases/initialize-base";

import PrismaInstance from "@internal/prisma";

export class DynamicoManager extends InitializeBase {
    private static instance: DynamicoManager;

    private client: Client | null = null;

    public static getInstance() {
        if ( ! DynamicoManager.instance ) {
            DynamicoManager.instance = new DynamicoManager();
        }

        return DynamicoManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/Dynamico";
    }

    public async onReady( client: Client ) {
        if ( this.client ) {
            this.logger.error( this.onReady, "Client is already set" );
            process.exit( 1 );
            return;
        }

        this.client = client;

        if ( ! client.user || ! client.application ) {
            this.logger.error( this.onReady, "Client is not ready" );
            process.exit( 1 );
            return;
        }

        await client.application.commands.set( Commands );

        await this.removeEmptyChannels( client );

        this.logger.log( this.onReady,
            `Ready handle is set, Bot '${ client.user.username }' is online, commands is set.` );
    }

    private async removeEmptyChannels( client: Client ) {
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
                // Delete only from db.
                await prisma.channel.delete( {
                    where: {
                        id: channel.id
                    }
                } );

                this.logger.debug( this.removeEmptyChannels,
                    `Channel '${ channel.channelId }' is deleted from db.` );
            }
        }
    }
}

export default DynamicoManager;
