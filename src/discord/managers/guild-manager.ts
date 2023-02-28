import { Client, Guild } from "discord.js";

import { Prisma } from "@prisma/client";

import PrismaBase from "@internal/bases/prisma-base";

import MasterChannelManager from "./master-channel-manager";
import Logger from "@internal/modules/logger";

export default class GuildManager extends PrismaBase {
    private static instance: GuildManager;

    private logger: Logger;

    private masterChannelManager: MasterChannelManager;

    public static getName(): string {
        return "Discord/Managers/GuildManager";
    }

    public static getInstance(): GuildManager {
        if ( ! GuildManager.instance ) {
            GuildManager.instance = new GuildManager();
        }

        return GuildManager.instance;
    }

    constructor() {
        super();

        this.logger = new Logger( this );

        this.masterChannelManager = MasterChannelManager.getInstance();
    }

    public async onJoin( client: Client, guild: Guild ) {
        this.logger.info(  this.onJoin, `Dynamico Joined guild '${ guild.name }'` );

        // Determine if the guild is already in the database.
        if ( await this.isExisting( guild ) ) {
            // Updating that the bot is now in the guild.
            await this.update( guild, true );
        } else {
            await this.create( guild );
        }

        return this.masterChannelManager.create( { guild } );
    }

    public async onLeave( client: Client, guild: Guild ) {
        this.logger.info( this.onLeave, `Dynamico Left guild '${ guild.name }'` );

        // Updating that the bot is no longer in the guild.
        try {
            await this.update( guild, false );

            // Remove leftovers of the guild.
            await this.masterChannelManager.removeLeftOvers( guild );
        } catch ( e ) {
            if ( e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025" ) {
                return this.logger.warn( this.onLeave,"Guild not found in database" );
            }

            throw e;
        }
    }

    public async create( guild: Guild ) {
        return this.prisma.guild.create( {
            data: {
                guildId: guild.id,
                name: guild.name,
                isInGuild: true,
            }
        } );
    }

    public async update( guild: Guild, isInGuild: boolean ) {
        return this.prisma.guild.update( {
            where: { guildId: guild.id },
            data: {
                name: guild.name,
                isInGuild,
            }
        } );
    }

    public async isExisting( guild: Guild ) {
        return this.prisma.guild.findUnique( {
            where: { guildId: guild.id }
        } );
    }
}
