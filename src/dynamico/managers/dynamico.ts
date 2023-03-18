import process from "process";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";
import { ChannelType, Client } from "discord.js";

import { Commands } from "@dynamico/commands";

import CategoryManager from "@dynamico/managers/category";
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

        await this.removeMasterChannels( client );
        await this.removeEmptyChannels( client );
        await this.removeEmptyCategories( client );

        const username = client.user.username,
            id = client.user.id;

        this.logger.log( this.onReady,
            `Ready handle is set, bot: '${ username }', id: '${ id }' is online, commands is set.` );
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
            const guildCache = client.guilds.cache.get( channel.guildId ),
                channelCache = guildCache?.channels.cache.get( channel.channelId );

            if ( ! guildCache || ! channelCache ) {
                continue;
            }

            if ( channelCache?.members && channelCache.isVoiceBased() ) {
                if ( 0 === channelCache.members.size ) {
                    await ChannelManager.getInstance().delete( {
                        channel: channelCache,
                        guild: guildCache,
                    } );
                }

                continue;
            }

            // Delete only from db.
            await prisma.channel.delete( {
                where: {
                    id: channel.id
                },
                include: {
                    data: true
                }
            } );

            this.logger.info( this.removeEmptyChannels,
                `Channel '${ channel.channelId }' is deleted from db.` );
        }
    }

    public async removeMasterChannels( client: Client ) {
        // Remove non-existing master channels.
        const prisma = await PrismaInstance.getClient(),
            masterChannels = await prisma.channel.findMany( {
                where: {
                    internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL
                }
            } );

        for ( const channel of masterChannels ) {
            const guildCache = client.guilds.cache.get( channel.guildId ),
                channelCache = guildCache?.channels.cache.get( channel.channelId );

            if ( ! guildCache || ! channelCache ) {
                await prisma.channel.delete( {
                    where: {
                        id: channel.id
                    }
                } );

                this.logger.info( this.removeEmptyChannels,
                    `Master channel '${ channel.channelId }' is deleted from db.` );
            }
        }
    }

    public async removeEmptyCategories( client: Client ) {
        // Get all dynamic channels.
        const prisma = await PrismaInstance.getClient(),
            categories = await prisma.category.findMany();

        for ( const category of categories ) {
            const categoryCache = client.guilds.cache.get( category.guildId )?.channels.cache.get( category.categoryId );

            if ( ChannelType.GuildCategory === categoryCache?.type ) {
                if ( 0 === categoryCache.children.cache.size ) {
                    await CategoryManager.getInstance().delete( categoryCache );
                }

                continue;
            }

            // Delete only from db.
            await prisma.category.delete( {
                where: {
                    id: category.id
                }
            } );

            this.logger.info( this.removeEmptyCategories,
                `Category '${ category.categoryId }' is deleted from db.` );
        }
    }
}

export default DynamicoManager;
