import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { GuildModel } from "@vertix.gg/base/src/models/guild-model";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { AuditLogEvent, ChannelType } from "discord.js";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

import type { DirectMessageService } from "@vertix.gg/bot/src/services/direct-message-service";

import type { MasterChannelService } from "@vertix.gg/bot/src/services/master-channel-service";
import type { UIVersioningAdapterService } from "@vertix.gg/gui/src/ui-versioning-adapter-service";
import type { Client, Guild, TextChannel, User } from "discord.js";

const DEFAULT_UPDATE_STATS_DEBOUNCE_DELAY = 1000 * 60 * 10; // 10 minutes.

export class GuildManager extends InitializeBase {
    private static instance: GuildManager;

    private uiAdapterVersioningService: UIVersioningAdapterService;

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

        this.uiAdapterVersioningService = ServiceLocator.$.get( "VertixGUI/UIAdapterService" );

        this.dmService = ServiceLocator.$.get( "VertixBot/Services/DirectMessage" );

        this.masterChannelService = ServiceLocator.$.get( "VertixBot/Services/MasterChannel" );

        this.guildModel = GuildModel.getInstance();

        this.updateStatsBound = this.updateStats.bind( this );

        EventBus.$.register( this, [
            this.onJoined.bind( this ),
        ] );
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

        const defaultChannel = guild?.systemChannel || guild?.channels.cache.find( ( channel ) => {
            return channel.type === ChannelType.GuildText;
        } );

        if ( ! defaultChannel || defaultChannel.type !== ChannelType.GuildText ) {
            this.logger.warn( this.onJoin,
                `Guild id: '${ guild.id }' - Default channel not found`
            );
            return;
        }

        let user: User | undefined;

        if ( entry?.executor?.id ) {
            user = await client.users.fetch( entry.executor.id );
        }

        await this.onJoined( guild, defaultChannel, user );

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

    public async onJoined( guild: Guild, defaultChannel: TextChannel, user?: User ) {
        const welcomeAdapter = await this.uiAdapterVersioningService
            .get( "Vertix/WelcomeAdapter", guild );

        welcomeAdapter?.send( defaultChannel, user ? {
            userId: user.id,
        } : undefined );
    }

    private updateStats() {
        TopGGManager.$.updateStats();

        this.logger.debug( this.updateStats, "Stats updated via debounce" );
    }
}
