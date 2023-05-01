import { Client, Guild } from "discord.js";
import { AuditLogEvent, ChannelType, Client, Guild } from "discord.js";

import { Prisma } from ".prisma/client";

import GuildModel from "../models/guild";

import { dmManager, masterChannelManager } from "@dynamico/managers/index";

import DynamicoManager from "@dynamico/managers/dynamico";

import { ManagerCacheBase } from "@internal/bases/manager-cache-base";

import GuildDelegate = Prisma.GuildDelegate;
import RejectPerOperation = Prisma.RejectPerOperation;

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

    public constructor( shouldDebugCache = DynamicoManager.isDebugOn( "CACHE", GuildManager.getName() ) ) {
        super( shouldDebugCache );

        this.guildModel = GuildModel.getInstance();
    }

    public async onJoin( client: Client, guild: Guild ) {
        // Find who invited the bot.
        const logs = await guild.fetchAuditLogs().catch( ( e ) => {
                this.logger.warn( this.onJoin, `Guild id: '${ guild.id }' - Error fetching audit logs:`, e );
            } ),
            entry = logs?.entries.find( entry => entry.action === AuditLogEvent.BotAdd && entry.targetId === client.user?.id );

        this.logger.info( this.onJoin, `Guild id: '${ guild.id }' - Dynamico joined guild: '${ guild.name }' was invited by: '${ entry?.executor?.username }'` );
        this.logger.admin( this.onJoin,
            `😍 Dynamico has been invited to a new guild - "${ guild.name }" (${ guild.memberCount })`
        );

        // Determine if the guild is already in the database.
        if ( await this.guildModel.isExisting( guild ) ) {
            // Updating that the bot is now in the guild.
            await this.guildModel.update( guild, true );
        } else {
            await this.guildModel.create( guild );
        }

        if ( entry?.executor?.id ) {
            const user = await client.users.fetch( entry.executor.id );

            const defaultChannel = guild?.systemChannel || guild?.channels.cache.find( ( channel ) => {
                return channel.type === ChannelType.GuildText;
            } );

            if ( ! defaultChannel || defaultChannel.type !== ChannelType.GuildText ) {
                this.logger.warn( this.onJoin,
                    `Guild id: '${ guild.id }' - Default channel not found`
                );
                return;
            }

            // Mention the user.
            await defaultChannel.send( {
                content: `<@${ user.id }>`,
            } ).catch( ( e ) => {
                this.logger.warn( this.onJoin, "", e );

                return;
            } );

            const message = await guiManager.get( "Dynamico/UI/StarterComponent" )
                .getMessage( defaultChannel, {
                    userId: user.id,
                } );

            await defaultChannel.send( message );
        }
    }

    public async onLeave( client: Client, guild: Guild ) {
        this.logger.info( this.onLeave, `Guild id: '${ guild.id }' - Dynamico left guild: '${ guild.name }'` );
        this.logger.admin( this.onLeave,
            `😭 Dynamico has been kicked from a guild - "${ guild.name }" (${ guild.memberCount })`
        );

        await dmManager.sendLeaveMessageToOwner( guild );

        // Updating that the bot is no longer in the guild.
        await this.guildModel.update( guild, false );

        // Remove leftovers of the guild.
        await masterChannelManager.removeLeftOvers( guild );
    }
}

export default GuildManager;
