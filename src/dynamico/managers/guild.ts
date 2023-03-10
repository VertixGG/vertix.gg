import { Client, Guild } from "discord.js";

import MasterChannelManager from "./master-channel";

import GuildModel from "../models/guild";

import InitializeBase from "@internal/bases/initialize-base";

export class GuildManager extends InitializeBase {
    private static instance: GuildManager;

    private guildModel: GuildModel;

    private masterChannelManager: MasterChannelManager;

    public static getName(): string {
        return "Dynamico/Managers/Guild";
    }

    public static getInstance(): GuildManager {
        if ( ! GuildManager.instance ) {
            GuildManager.instance = new GuildManager();
        }

        return GuildManager.instance;
    }

    public constructor() {
        super();

        this.guildModel = GuildModel.getInstance();

        this.masterChannelManager = MasterChannelManager.getInstance();
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

        const owner = await client.users.fetch( guild.ownerId );

        return this.masterChannelManager.createDefaultMasters( guild, owner.id );
    }

    public async onLeave( client: Client, guild: Guild ) {
        this.logger.info( this.onLeave, `Dynamico Left guild '${ guild.name }' guildId: '${ guild.id }'` );

        // Updating that the bot is no longer in the guild.
        await this.guildModel.update( guild, false );

        // Remove leftovers of the guild.
        await this.masterChannelManager.removeLeftOvers( guild );
    }
}

export default GuildManager;
