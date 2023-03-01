import { Client, Guild } from "discord.js";

import InitializeBase from "@internal/bases/initialize-base";

import MasterChannelManager from "./master-channel";

import GuildModel from "../models/guild";

export default class GuildManager extends InitializeBase {
    private static instance: GuildManager;

    private guildModel: GuildModel;

    private masterChannelManager: MasterChannelManager;

    public static getName(): string {
        return "Discord/Managers/Guild";
    }

    public static getInstance(): GuildManager {
        if ( ! GuildManager.instance ) {
            GuildManager.instance = new GuildManager();
        }

        return GuildManager.instance;
    }

    constructor() {
        super();

        this.guildModel = GuildModel.getInstance();

        this.masterChannelManager = MasterChannelManager.getInstance();
    }

    public async onJoin( client: Client, guild: Guild ) {
        this.logger.info(  this.onJoin, `Dynamico Joined guild '${ guild.name }'` );

        // Determine if the guild is already in the database.
        if ( await this.guildModel.isExisting( guild ) ) {
            // Updating that the bot is now in the guild.
            await this.guildModel.update( guild, true );
        } else {
            await this.guildModel.create( guild );
        }

        return this.masterChannelManager.createCreateChannel( { guild } );
    }

    public async onLeave( client: Client, guild: Guild ) {
        this.logger.info( this.onLeave, `Dynamico Left guild '${ guild.name }'` );

        // Updating that the bot is no longer in the guild.
        await this.guildModel.update( guild, false );

        // Remove leftovers of the guild.
        await this.masterChannelManager.removeLeftOvers( guild );
    }
}
