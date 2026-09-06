import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import {
    DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
    DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE,
    DEFAULT_GUILD_SETTINGS_KEY_VOICE_ROLE
} from "@vertix.gg/definitions/src/guild-data-keys";

import {
    DEFAULT_BADWORDS,
    DEFAULT_BADWORDS_INITIAL_VALUE,
    DEFAULT_BADWORDS_SEPARATOR
} from "@vertix.gg/definitions/src/badwords-defaults";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { badwordsMask, badwordsSomeUsed } from "@vertix.gg/base/src/utils/badwords-utils";

import { GuildModel } from "@vertix.gg/base/src/models/guild-model";

import { ManagerDataBase } from "@vertix.gg/base/src/bases/manager-data-base";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { Guild } from "discord.js";

interface IGuildSettings {
    maxMasterChannels: number;
}

export class GuildDataManager extends ManagerDataBase<GuildModel> {
    public static getName() {
        return "VertixBase/Managers/GuildData";
    }

    public static get $() {
        return GuildDataManager.getInstance();
    }

    public constructor( shouldDebugCache = isDebugEnabled( "CACHE", GuildDataManager.getName() ) ) {
        super( shouldDebugCache );
    }

    public async getAllSettings( guildId: string, cache = false ): Promise<IGuildSettings> {
        const data = await this.getSettingsData( guildId, null, cache, true );

        if ( data?.object ) {
            return data.object;
        }

        const { constants } = ConfigManager.$.get<MasterChannelConfigInterface>(
            "Vertix/Config/MasterChannel",
            VERSION_UI_V2
        ).data;

        return {
            maxMasterChannels: constants.masterChannelMaximumFreeChannels
        };
    }

    public async getBadwords( guildId: string ): Promise<string[]> {
        const badwordsDB = await this.getData(
            {
                ownerId: guildId,
                key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
                default: null,
                // # Note: We don't want to cache the badwords because we want to be able to update them on the fly.
                cache: false
            },
            true
        );

        if ( badwordsDB?.values ) {
            return badwordsDB.values;
        }

        return DEFAULT_BADWORDS;
    }

    public async getBadwordsFormatted( guildId: string ): Promise<string> {
        return ( await this.getBadwords( guildId ) ).join( DEFAULT_BADWORDS_SEPARATOR ) || DEFAULT_BADWORDS_INITIAL_VALUE;
    }

    public async setBadwords( guildId: string, badwords: string[] | undefined ) {
        const oldBadwords = await this.getBadwordsFormatted( guildId );

        if ( !badwords?.length ) {
            try {
                await this.deleteData(
                    {
                        ownerId: guildId,
                        key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS
                    },
                    true
                );
            } catch( e ) {
                this.logger.error( this.setBadwords, "", e );
            }

            return;
        }

        await this.setData(
            {
                ownerId: guildId,
                key: DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
                default: badwords
            },
            true
        );

        return {
            oldBadwords,
            newBadwords: badwords.join( DEFAULT_BADWORDS_SEPARATOR )
        };
    }

    public async setLanguage( guild: Guild, language: string, shouldAdminLog = true ) {
        await this.setData(
            {
                ownerId: guild.id,
                key: DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE,
                default: language,
                cache: true
            },
            true
        );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setLanguage,
                `🌍  Language has been modified - "${ language }" (${ guild.name }) (${ guild.memberCount })`
            );
        }
    }

    /**
     * Function getVoiceRoleId() :: The guild wide default voice role, or null when unset.
     *
     * `default: null` keeps `getData` from creating the row on a read, so a guild that never set
     * one stays unset instead of gaining an empty row the first time anyone joins a channel.
     */
    public async getVoiceRoleId( guildId: string ): Promise<string | null> {
        const result = await this.getData(
            {
                ownerId: guildId,
                key: DEFAULT_GUILD_SETTINGS_KEY_VOICE_ROLE,
                default: null,
                cache: true
            },
            true
        );

        return result?.values?.[ 0 ] ?? null;
    }

    public async setVoiceRoleId( guildId: string, roleId: string | null, shouldAdminLog = true ) {
        const previousRoleId = await this.getVoiceRoleId( guildId );

        if ( ! roleId ) {
            await this.deleteData( { ownerId: guildId, key: DEFAULT_GUILD_SETTINGS_KEY_VOICE_ROLE }, true );
        } else {
            await this.setData(
                {
                    ownerId: guildId,
                    key: DEFAULT_GUILD_SETTINGS_KEY_VOICE_ROLE,
                    default: roleId,
                    cache: true
                },
                true
            );
        }

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setVoiceRoleId,
                `🎙️  Voice role modified - guildId: "${ guildId }", "${ previousRoleId }" => "${ roleId }"`
            );
        }

        return { previousRoleId, roleId };
    }

    public async hasSomeBadword( guildId: string, content: string ) {
        return badwordsSomeUsed( content, await this.getBadwords( guildId ) );
    }

    public async maskBadwords( guildId: string, content: string ) {
        return badwordsMask( content, await this.getBadwords( guildId ) );
    }

    public removeFromCache( ownerId: string ) {
        this.logger.debug( this.removeFromCache, `Removing guild data from cache for ownerId: '${ ownerId }'` );

        this.deleteCacheWithPrefix( ownerId );
    }

    protected getSettingsKey() {
        return "settings";
    }

    protected getDataSourceModel() {
        return GuildModel.getInstance();
    }
}
