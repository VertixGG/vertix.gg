import process from "process";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";
import { ChannelType, Client } from "discord.js";

import { Commands } from "@dynamico/commands";

import CategoryManager from "@dynamico/managers/category";
import ChannelManager from "@dynamico/managers/channel";

import { channelDataManager } from "@dynamico/managers/index";

import InitializeBase from "@internal/bases/initialize-base";
import PrismaInstance from "@internal/prisma";

const VERSION_PHASE_4 = "0.0.1"; // https://github.com/CoffeBuffet/dynamico/pull/44/

export class DynamicoManager extends InitializeBase {
    private static instance: DynamicoManager;

    // TODO: Remove undefined.
    private client: Client | undefined;

    public static getInstance() {
        if ( ! DynamicoManager.instance ) {
            DynamicoManager.instance = new DynamicoManager();
        }

        return DynamicoManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/Dynamico";
    }

    public static getVersion() {
        return VERSION_PHASE_4;
    }

    public static isDebugOn( debugType: string, entityName: string ) {
        return !! process.env[ `DEBUG_${ debugType }` ]?.includes( entityName );
    }

    public getClient() {
        return this.client;
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

        await this.updateGuilds();

        await this.ensureBackwardCompatibility();

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

    public async updateGuilds() {
        // Get all guilds.
        const prisma = await PrismaInstance.getClient(),
            guilds = await prisma.guild.findMany();

        for ( const guild of guilds ) {
            // Check if guild is active.
            const guildCache = this.client?.guilds.cache.get( guild.guildId ),
                name = guildCache?.name || guild.name,
                isInGuild = !! guildCache;

            await prisma.guild.update( {
                where: {
                    id: guild.id
                },
                data: {
                    name,
                    isInGuild,
                    // Do not update `updatedAt` field.
                    updatedAt: guild.updatedAt,
                    updatedAtInternal: new Date(),
                },
            } );

            this.logger.info( this.updateGuilds,
                `Guild id: '${ guild.guildId }' is updated, name: '${ name }', isInGuild: '${ isInGuild }'.` );
        }
    }

    private async ensureBackwardCompatibility() {
        await this.replaceDynamicChannelNameTemplate();
    }

    /**
     * Function replaceDynamicChannelNameTemplate() :: Replace the old template prefix and suffix '%{', '%}' to the new one '{{', '}}'
     * From version `null` to version `0.0.1`.
     */
    private async replaceDynamicChannelNameTemplate() {
        const allData = await channelDataManager.getAllData();

        for ( const data of allData ) {
            if ( null === data.version ) {
                if ( data.object && "settings" === data.key ) {
                    // Assign new one.
                    data.object.dynamicChannelNameTemplate = "{user}'s Channel";

                    // Describe version.
                    data.version = VERSION_PHASE_4;

                    await channelDataManager.setData( {
                        ownerId: data.ownerId,
                        key: data.key,
                        default: data.object,
                    } );
                }
            }
        }
    }
}

export default DynamicoManager;
