import { AuditLogEvent, ChannelType } from "discord.js";

import { DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE } from "@vertix.gg/base/src/definitions/guild-data-keys";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { GuildModel } from "@vertix.gg/base/src/models/guild-model";
import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { MasterChannelService } from "@vertix.gg/bot/src/services/master-channel-service";

import type { Client, Guild } from "discord.js";

import type { DirectMessageService } from "@vertix.gg/bot/src/services/direct-message-service";
import type { UIAdapterService } from "@vertix.gg/gui/src/ui-adapter-service";

const DEFAULT_UPDATE_STATS_DEBOUNCE_DELAY = 1000 * 60 * 10; // 10 minutes.

export class GuildManager extends InitializeBase {
    private static instance: GuildManager;

    private uiAdapterService: UIAdapterService;

    private dmService: DirectMessageService;

    private masterChannelService: MasterChannelService;

    private guildModel: GuildModel;

    private readonly updateStatsBound: OmitThisParameter<() => void>;

    public static getName(): string {
        return "VertixBot/Managers/Guild";
    }

    public static getInstance(): GuildManager {
        if ( ! GuildManager.instance ) {
            GuildManager.instance = new GuildManager();
        }

        return GuildManager.instance;
    }

    public static get $() {
        return GuildManager.getInstance();
    }

    public constructor() {
        super();

        this.uiAdapterService = ServiceLocator.$.get( "VertixGUI/UIAdapterService" );

        this.dmService = ServiceLocator.$.get( "VertixBot/Services/DirectMessage" );

        this.masterChannelService = ServiceLocator.$.get( "VertixBot/Services/MasterChannel" );

        this.guildModel = GuildModel.getInstance();

        this.updateStatsBound = this.updateStats.bind( this );
    }

    public async onJoin( client: Client, guild: Guild ) {
        // Find who invited the bot.
        const logs = await guild.fetchAuditLogs().catch( ( e ) => {
                this.logger.warn( this.onJoin, `Guild id: '${ guild.id }' - Error fetching audit logs:`, e );
            } ),
            entry = logs?.entries.find( entry => entry.action === AuditLogEvent.BotAdd && entry.targetId === client.user?.id );

        this.logger.info( this.onJoin, `Guild id: '${ guild.id }' - Vertix joined guild: '${ guild.name }' was invited by: '${ entry?.executor?.username }'` );

        this.logger.admin( this.onJoin,
            `😍 Vertix has been invited to a new guild - "${ guild.name }" (${ guild.memberCount })`
        );
        this.logger.beep();

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

            await this.uiAdapterService.get( "VertixBot/UI-V2/WelcomeAdapter" )?.send( defaultChannel, {
                userId: user.id,
            } );
        }

        this.debounce( this.updateStatsBound, DEFAULT_UPDATE_STATS_DEBOUNCE_DELAY );
    }

    public async onLeave( client: Client, guild: Guild ) {
        this.logger.info( this.onLeave, `Guild id: '${ guild.id }' - Vertix left guild: '${ guild.name }'` );
        this.logger.admin( this.onLeave,
            `😭 Vertix has been kicked from a guild - "${ guild.name }" (${ guild.memberCount })`
        );

        await this.dmService.sendLeaveMessageToOwner( guild );

        // Updating that the bot is no longer in the guild.
        await this.guildModel.update( guild, false );

        // Remove leftovers of the guild.
        await this.masterChannelService.removeLeftOvers( guild );

        this.debounce( this.updateStatsBound, DEFAULT_UPDATE_STATS_DEBOUNCE_DELAY );
    }

    public async setLanguage( guild: Guild, language: string, shouldAdminLog = true ): Promise<void> {
        await GuildDataManager.$.setData( {
            ownerId: guild.id,
            key: DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE,
            default: language,
            cache: true,
        }, true );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setLanguage,
                `🌍  Language has been modified - "${ language }" (${ guild.name }) (${ guild.memberCount })`
            );
        }
    }

    private updateStats() {
        TopGGManager.$.updateStats();

        this.logger.debug( this.updateStats, "Stats updated via debounce" );
    }
}
