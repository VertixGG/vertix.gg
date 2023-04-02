import { Client, EmbedBuilder, Guild } from "discord.js";

import { Prisma } from ".prisma/client";

import GuildModel from "../models/guild";

import { masterChannelManager } from "@dynamico/managers/index";

import { ManagerCacheBase } from "@internal/bases/manager-cache-base";

import GuildDelegate = Prisma.GuildDelegate;
import RejectPerOperation = Prisma.RejectPerOperation;
import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";

export class GuildManager extends ManagerCacheBase<GuildDelegate<RejectPerOperation>> {
    private static instance: GuildManager;

    private guildModel: GuildModel;

    public static getName(): string {
        return "Dynamico/Managers/Guild";
    }

    public static getInstance(): GuildManager {
        if ( ! GuildManager.instance ) {
            GuildManager.instance = new GuildManager();
        }

        return GuildManager.instance;
    }

    public constructor( shouldDebugCache = !! process.env.debug_cache_guild || false ) {
        super( shouldDebugCache );

        this.guildModel = GuildModel.getInstance();
    }

    public async onJoin( client: Client, guild: Guild ) {
        this.logger.info( this.onJoin, `Dynamico joined guild: '${ guild.name }' guildId: '${ guild.id }'` );

        // Determine if the guild is already in the database.
        if ( await this.guildModel.isExisting( guild ) ) {
            // Updating that the bot is now in the guild.
            await this.guildModel.update( guild, true );
        } else {
            await this.guildModel.create( guild );
        }
    }

    public async onLeave( client: Client, guild: Guild ) {
        this.logger.info( this.onLeave, `Dynamico Left guild '${ guild.name }' guildId: '${ guild.id }'` );

        const embed = new EmbedBuilder();

        embed.setColor( DYNAMICO_DEFAULT_COLOR_BRAND );
        embed.setTitle( "Hello there! 👋" );
        embed.setDescription( "I noticed that I've been removed from your server.\n" +
            "If there was anything wrong with my functionality or if there's something I could improve upon, please let me know!\n" +
            "\n" +
            "**Your reply to this message will be directly sent to the developers.**");

        await ( await client.users.fetch( guild.ownerId ))?.send( { embeds: [ embed ] } ).catch( ( e ) => {
            this.logger.error( this.onLeave, `Failed to send message to guild owner: '${ guild.ownerId }' guildId: '${ guild.id }'` );
        } );

        // Updating that the bot is no longer in the guild.
        await this.guildModel.update( guild, false );

        // Remove leftovers of the guild.
        await masterChannelManager.removeLeftOvers( guild );
    }
}

export default GuildManager;
