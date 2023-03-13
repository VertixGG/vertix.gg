import { Client, Guild } from "discord.js";

import MasterChannelManager from "./master-channel";

import GuildModel from "../models/guild";

import Permissions from "@dynamico/utils/permissions";

import guiManager from "@dynamico/managers/gui";

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

        const owner = await client.users.fetch( guild.ownerId ),
            permissions = Permissions.getMissingPermissions( guild );

        if ( permissions.length > 0 ) {
            await guiManager.get( "Dynamico/UI/NotifyPermissions" ).sendUser( owner, {
                botName: owner.client.user.username,
                permissions
            } );

            return;
        }

        // Determine if the guild is already in the database.
        if ( await this.guildModel.isExisting( guild ) ) {
            // Updating that the bot is now in the guild.
            await this.guildModel.update( guild, true );
        } else {
            await this.guildModel.create( guild );
        }

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
