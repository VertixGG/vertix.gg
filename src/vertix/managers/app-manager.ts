import process from "process";
import * as fs from "fs";
import * as path from "path";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";
import { ChannelType, Client } from "discord.js";

import { CategoryManager } from "@vertix/managers/category-manager";
import { ChannelManager } from "@vertix/managers/channel-manager";
import { DynamicChannelClaimManager } from "@vertix/managers/dynamic-channel-claim-manager";

import { CURRENT_VERSION } from "@vertix/definitions/version";

import { InitializeBase } from "@internal/bases/initialize-base";
import { PrismaInstance } from "@internal/prisma";

interface PackageJson {
    version: string;

    [ key: string ]: any;
}

const packageJsonPath = path.resolve( "./package.json" );
const packageJsonString = fs.readFileSync( packageJsonPath, { encoding: "utf8" } );
const packageJson: PackageJson = JSON.parse( packageJsonString );

export class AppManager extends InitializeBase {
    private static instance: AppManager;

    private client!: Client<true>;

    public static getName() {
        return "Vertix/Managers/App";
    }

    public static getInstance() {
        if ( ! AppManager.instance ) {
            AppManager.instance = new AppManager();
        }

        return AppManager.instance;
    }

    public static get $() {
        return AppManager.getInstance();
    }

    public static getVersion() {
        return CURRENT_VERSION;
    }

    public static getBuildVersion() {
        return packageJson.version;
    }

    public static isDebugOn( debugType: string, entityName: string ) {
        return !! process.env[ `DEBUG_${ debugType }` ]?.includes( entityName );
    }

    public constructor() {
        super();

        this.printVersion();
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

        const { Commands } = ( await import( "@vertix/commands" ) );

        await client.application.commands.set( Commands );

        setTimeout( () => {
            this.handleChannels( client );

            // TODO: Should run on background.
            this.updateGuilds();
        } );

        await this.ensureBackwardCompatibility();

        const username = client.user.username,
            id = client.user.id;

        this.logger.log( this.onReady,
            `Ready handle is set, bot: '${ username }', id: '${ id }' is online, commands is set.` );
    }

    public handleChannels( client: Client ) {
        const promises = [
            this.removeNonExistMasterChannelsFromDB( client ),
            this.removeEmptyChannels( client ),
            this.removeEmptyCategories( client ),
        ];

        Promise.all( promises ).then( () => {
            this.logger.info( this.handleChannels, "All channels are handled." );

            DynamicChannelClaimManager.$.handleAbandonedChannels( client ).then( () => {
                this.logger.info( this.handleChannels, "Abandoned channels are handled." );
            } );
        } );
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

            if ( guildCache && channelCache?.members && channelCache.isVoiceBased() ) {
                if ( 0 === channelCache.members.size ) {
                    await ChannelManager.$.delete( {
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
                `Channel id: '${ channel.channelId }' is deleted from db.`
            );
        }
    }

    public async removeNonExistMasterChannelsFromDB( client: Client ) {
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

                this.logger.info( this.removeNonExistMasterChannelsFromDB,
                    `Master channel id: '${ channel.channelId }' is deleted from db.`
                );
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
                    await CategoryManager.$.delete( categoryCache ).catch( ( error: any ) => {
                        this.logger.error( this.removeEmptyCategories, "", error );
                    } );
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
                `Category id: '${ category.categoryId }' is deleted from database`
            );
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

            prisma.guild.update( {
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
            } ).then( () => {
                this.logger.info( this.updateGuilds,
                    `Guild id: '${ guild.guildId }' - Updated, name: '${ name }', isInGuild: '${ isInGuild }'`
                );
            } );
        }
    }

    private async ensureBackwardCompatibility() {
    }

    private printVersion() {
        this.logger.info( this.printVersion,
            `Version: '${ AppManager.getVersion() }' Build version: ${ AppManager.getBuildVersion() }'`
        );
    }
}
