import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";

import {
    DEFAULT_GUILD_SETTINGS_KEY_BADWORDS,
    DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE,
    DEFAULT_GUILD_SETTINGS_KEY_STAFF_ROLES,
    DEFAULT_GUILD_SETTINGS_KEY_TIMINGS,
    DEFAULT_GUILD_SETTINGS_KEY_VERIFIED_ROLES,
    DEFAULT_GUILD_SETTINGS_KEY_VOICE_ROLE
} from "@vertix.gg/definitions/src/guild-data-keys";

import {
    DEFAULT_BADWORDS,
    DEFAULT_BADWORDS_INITIAL_VALUE,
    DEFAULT_BADWORDS_SEPARATOR
} from "@vertix.gg/definitions/src/badwords-defaults";

import { badwordsMask, badwordsSomeUsed } from "@vertix.gg/base/src/utils/badwords-utils";

import { GUILD_TIMINGS_FIELDS } from "@vertix.gg/definitions/src/guild-timings-definitions";

import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";

import { GuildTimingsConfig } from "@vertix.gg/data/src/config/guild-timings-config";

import { GuildModel } from "@vertix.gg/data/src/models/guild-model";

import { ManagerDataBase } from "@vertix.gg/data/src/bases/manager-data-base";

import type {
    GuildTimingsInterface,
    TGuildTimingsOverrides
} from "@vertix.gg/definitions/src/guild-timings-definitions";

import type { MasterChannelConfigInterface } from "@vertix.gg/data/src/interfaces/master-channel-config";
import type { PrismaBot } from "@vertix.gg/prisma/bot-client";
import type { Guild } from "discord.js";

interface IGuildSettings {
    maxMasterChannels: number;
}

export class GuildDataManager extends ManagerDataBase<GuildModel> {
    /**
     * What each guild chose for itself, remembered including when it chose nothing.
     *
     * `getData()` caches only rows that exist, so a guild that never set its own timings - which
     * is every guild until someone opens the screen - reached the database on every read. These
     * are read while answering an interaction, where the budget is three seconds in total.
     */
    private timingsOverridesCache: Map<string, TGuildTimingsOverrides> = new Map();

    public static getName() {
        return "VertixData/Managers/GuildData";
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
            if ( previousRoleId ) {
                await this.deleteData( { ownerId: guildId, key: DEFAULT_GUILD_SETTINGS_KEY_VOICE_ROLE }, true );
            }
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

    public async getVerifiedRoleIds( guildId: string ): Promise<string[]> {
        return this.getRoleIds( guildId, DEFAULT_GUILD_SETTINGS_KEY_VERIFIED_ROLES );
    }

    /**
     * Function resolveVerifiedRoleIds() :: The audience a guild falls back to.
     *
     * A guild that configured none of its own means `@everyone`, whose role id is the guild id.
     * The single statement of that rule - `getVerifiedRoleIds()` stays empty for an unset guild so
     * the screens can still tell "not configured" apart from "chose `@everyone`".
     */
    public async resolveVerifiedRoleIds( guildId: string ): Promise<string[]> {
        const roleIds = await this.getVerifiedRoleIds( guildId );

        return roleIds.length ? roleIds : [ guildId ];
    }

    public async setVerifiedRoleIds( guildId: string, roleIds: string[], shouldAdminLog = true ) {
        const result = await this.setRoleIds( guildId, DEFAULT_GUILD_SETTINGS_KEY_VERIFIED_ROLES, roleIds );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setVerifiedRoleIds,
                `🛡️  Verified roles modified - guildId: "${ guildId }", "${ result.previousRoleIds }" => "${ result.roleIds }"`
            );
        }

        return result;
    }

    public async getStaffRoleIds( guildId: string ): Promise<string[]> {
        return this.getRoleIds( guildId, DEFAULT_GUILD_SETTINGS_KEY_STAFF_ROLES );
    }

    public async setStaffRoleIds( guildId: string, roleIds: string[], shouldAdminLog = true ) {
        const result = await this.setRoleIds( guildId, DEFAULT_GUILD_SETTINGS_KEY_STAFF_ROLES, roleIds );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setStaffRoleIds,
                `🔑  Staff roles modified - guildId: "${ guildId }", "${ result.previousRoleIds }" => "${ result.roleIds }"`
            );
        }

        return result;
    }

    /**
     * Function getTimings() :: The claim and vote timings a guild runs on.
     *
     * `default: null` keeps `getData` from creating the row on a read, so a guild that never chose
     * its own stays on the environment defaults instead of gaining a row the first time a vote runs.
     */
    public async getTimings( guildId: string ): Promise<GuildTimingsInterface> {
        return GuildTimingsConfig.$.resolve( await this.getTimingsOverrides( guildId ) );
    }

    /**
     * Function getTimingsOverrides() :: Only what the guild chose itself.
     *
     * Which is what the interface shows as set, and what an empty field there clears.
     */
    public async getTimingsOverrides( guildId: string ): Promise<TGuildTimingsOverrides> {
        const cached = this.timingsOverridesCache.get( guildId );

        if ( cached ) {
            return cached;
        }

        const result = await this.getData(
            {
                ownerId: guildId,
                key: DEFAULT_GUILD_SETTINGS_KEY_TIMINGS,
                default: null,
                cache: true
            },
            true
        );

        const overrides = this.readTimingsOverrides( result?.object ?? null );

        this.timingsOverridesCache.set( guildId, overrides );

        return overrides;
    }

    /**
     * Function setTimings() :: Replaces the guild's overrides, and drops the row when none are left.
     *
     * Replaces rather than merges - a field the interface submitted empty is one the guild wants
     * back on the environment default, which a merge would hold onto forever.
     */
    public async setTimings( guildId: string, overrides: TGuildTimingsOverrides, shouldAdminLog = true ) {
        const previousOverrides = await this.getTimingsOverrides( guildId ),
            timings: TGuildTimingsOverrides = {};

        GUILD_TIMINGS_FIELDS.forEach( ( field ) => {
            const value = overrides[ field ];

            if ( undefined !== value && GuildTimingsConfig.$.isWithinBounds( field, value ) ) {
                timings[ field ] = value;
            }
        } );

        if ( ! Object.keys( timings ).length ) {
            if ( Object.keys( previousOverrides ).length ) {
                await this.deleteData( { ownerId: guildId, key: DEFAULT_GUILD_SETTINGS_KEY_TIMINGS }, true );
            }
        } else {
            await this.setData(
                {
                    ownerId: guildId,
                    key: DEFAULT_GUILD_SETTINGS_KEY_TIMINGS,
                    default: timings,
                    cache: true
                },
                true
            );
        }

        this.timingsOverridesCache.delete( guildId );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setTimings,
                `⏱️  Timings modified - guildId: "${ guildId }", ` +
                    `"${ JSON.stringify( previousOverrides ) }" => "${ JSON.stringify( timings ) }"`
            );
        }

        return { previousOverrides, overrides: timings };
    }

    public async hasSomeBadword( guildId: string, content: string ) {
        return badwordsSomeUsed( content, await this.getBadwords( guildId ) );
    }

    public async maskBadwords( guildId: string, content: string ) {
        return badwordsMask( content, await this.getBadwords( guildId ) );
    }

    public removeFromCache( ownerId: string ) {
        this.logger.debug( this.removeFromCache, `Removing guild data from cache for ownerId: '${ ownerId }'` );

        this.timingsOverridesCache.delete( ownerId );

        this.deleteCacheWithPrefix( ownerId );
    }

    /**
     * Function readTimingsOverrides() :: What a stored row actually holds.
     *
     * Anything that is not a number under a field this release knows is left out, so a row written
     * by a different version reads as unset for that field rather than putting a timer on a value
     * it cannot run with.
     */
    private readTimingsOverrides( object: PrismaBot.Prisma.JsonValue | null ): TGuildTimingsOverrides {
        if ( ! object || "object" !== typeof object || Array.isArray( object ) ) {
            return {};
        }

        const overrides: TGuildTimingsOverrides = {};

        GUILD_TIMINGS_FIELDS.forEach( ( field ) => {
            const value = object[ field ];

            if ( "number" === typeof value ) {
                overrides[ field ] = value;
            }
        } );

        return overrides;
    }

    /**
     * Function getRoleIds() :: The role list held under a guild wide settings key, empty when unset.
     *
     * `default: null` keeps `getData` from creating the row on a read, so a guild that never set
     * one stays unset instead of gaining an empty row the first time anything reads it.
     */
    private async getRoleIds( guildId: string, key: string ): Promise<string[]> {
        const result = await this.getData(
            {
                ownerId: guildId,
                key,
                default: null,
                cache: true
            },
            true
        );

        return result?.values ?? [];
    }

    /**
     * Function setRoleIds() :: Stores a role list, and drops the row when the list empties.
     *
     * The row is only deleted when there is one to delete - `deleteData()` reaches prisma directly
     * and throws on a record that is not there.
     */
    private async setRoleIds( guildId: string, key: string, roleIds: string[] ) {
        const previousRoleIds = await this.getRoleIds( guildId, key );

        if ( ! roleIds.length ) {
            if ( previousRoleIds.length ) {
                await this.deleteData( { ownerId: guildId, key }, true );
            }

            return { previousRoleIds, roleIds };
        }

        await this.setData(
            {
                ownerId: guildId,
                key,
                default: roleIds,
                cache: true
            },
            true
        );

        return { previousRoleIds, roleIds };
    }

    protected getSettingsKey() {
        return "settings";
    }

    protected getDataSourceModel() {
        return GuildModel.getInstance();
    }
}
