import { AuditLogEvent, ChannelType, Client, Guild } from "discord.js";

import { InitializeBase } from "@vertix-base/bases/initialize-base";

import { GuildModel } from "@vertix/models";

import { TopGGManager } from "@vertix/managers/top-gg-manager";
import { DirectMessageManager } from "@vertix/managers/direct-message-manager";
import { MasterChannelManager } from "@vertix/managers/master-channel-manager";
import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
import { GuildDataManager } from "@vertix/managers/guild-data-manager";

import { DEFAULT_GUILD_SETTINGS_KEY_BADWORDS, DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE } from "@vertix/definitions/guild";

import {
    DEFAULT_BADWORDS,
    DEFAULT_BADWORDS_INITIAL_VALUE,
    DEFAULT_BADWORDS_SEPARATOR
} from "@vertix/definitions/badwords";

import { badwordsSomeUsed } from "@vertix/utils/badwords";

const DEFAULT_UPDATE_STATS_DEBOUNCE_DELAY = 1000 * 60 * 10; // 10 minutes.

export class GuildManager extends InitializeBase {
    private static instance: GuildManager;

    private guildModel: GuildModel;

    private readonly updateStatsBound: OmitThisParameter<() => void>;

    public static getName(): string {
        return "Vertix/Managers/Guild";
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

            await UIAdapterManager.$.get( "Vertix/UI-V2/WelcomeAdapter" )?.send( defaultChannel, {
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

        await DirectMessageManager.$.sendLeaveMessageToOwner( guild );

        // Updating that the bot is no longer in the guild.
        await this.guildModel.update( guild, false );

        // Remove leftovers of the guild.
        await MasterChannelManager.$.removeLeftOvers( guild );

        this.debounce( this.updateStatsBound, DEFAULT_UPDATE_STATS_DEBOUNCE_DELAY );
    }

    public async getBadwords( guildId: string ): Promise<string[]> {
        const badwordsDB = await GuildDataManager.$.getData( {
            ownerId: guildId,
            key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
            default: null,
            cache: true,
        }, true );

        if ( badwordsDB?.values ) {
            return badwordsDB.values;
        }

        return DEFAULT_BADWORDS;
    }

    public async getBadwordsFormatted( guildId: string ): Promise<string> {
        return ( await this.getBadwords( guildId ) )
                .join( DEFAULT_BADWORDS_SEPARATOR ) || DEFAULT_BADWORDS_INITIAL_VALUE;
    }

    public async setBadwords( guild: Guild, badwords: string[] | undefined, shouldAdminLog = true ): Promise<void> {
        const oldBadwords =  shouldAdminLog || await this.getBadwordsFormatted( guild.id );

        if ( ! badwords?.length ) {
            try {
                await GuildDataManager.$.deleteData( {
                    ownerId: guild.id,
                    key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
                }, true );
            } catch ( e ) {
                this.logger.error( this.setBadwords, "", e );
            }

            return;
        }

        await GuildDataManager.$.setData( {
            ownerId: guild.id,
            key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
            default: badwords,
        }, true );

        if ( shouldAdminLog ) {
            this.logger.admin( this.setBadwords,
                `🔧 Bad Words filter has been modified - "${ oldBadwords }" -> "${ badwords }" (${ guild.name }) (${ guild.memberCount })`
            );
        }
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

    public async hasSomeBadword( guildId: string, content: string ): Promise<string | null> {
        return badwordsSomeUsed( content, await this.getBadwords( guildId ) );
    }

    private updateStats() {
        TopGGManager.$.updateStats();

        this.logger.debug( this.updateStats, "Stats updated via debounce" );
    }
}
