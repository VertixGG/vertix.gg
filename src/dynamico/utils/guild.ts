import { Guild } from "discord.js";

import { guildDataManager } from "@dynamico/managers";

import { DATA_CHANNEL_KEY_BADWORDS, DATA_CHANNEL_KEY_BASIC_ROLES } from "@dynamico/constants/data";

import {
    GUILD_DEFAULT_BADWORDS,
    GUILD_DEFAULT_BADWORDS_INITIAL_VALUE,
    GUILD_DEFAULT_BADWORDS_SEPARATOR,
    GUILD_DEFAULT_BASIC_ROLE_PREFIX,
    GUILD_DEFAULT_BASIC_ROLE_SEPARATOR,
    GUILD_DEFAULT_BASIC_ROLE_SUFFIX
} from "@dynamico/constants/guild";

import { rolesGetEveryoneRoleMention } from "@dynamico/utils/roles";
import { badwordsSomeUsed } from "@dynamico/utils/badwords";

export const guildGetBadwords = async ( guildId: string ): Promise<string[]> => {
    const badwordsDB = await guildDataManager.getData( {
        ownerId: guildId,
        key: DATA_CHANNEL_KEY_BADWORDS,
        default: null,
        cache: true,
    }, true );

    if ( badwordsDB?.values ) {
        return badwordsDB.values;
    }

    return GUILD_DEFAULT_BADWORDS;
};

export const guildUsedSomeBadword = async ( guildId: string, word: string ): Promise<string | null> => {
    return badwordsSomeUsed( word, await guildGetBadwords( guildId ) );
};

export const guildGetBadwordsFormatted = async ( guildId: string ): Promise<string> => {
    return (
        ( await guildGetBadwords( guildId ) ).join( GUILD_DEFAULT_BADWORDS_SEPARATOR ) || GUILD_DEFAULT_BADWORDS_INITIAL_VALUE
    );
};

export const guildGetBasicRolesIds = async ( guildId: string ): Promise<string[]> => {
    const basicRolesIdsDB = await guildDataManager.getData( {
        ownerId: guildId,
        key: DATA_CHANNEL_KEY_BASIC_ROLES,
        default: null,
        cache: true,
    }, true );

    if ( basicRolesIdsDB?.values ) {
        return basicRolesIdsDB.values;
    }

    return [];
};

export const guildGetBasicRolesFormatted = async ( guild: Guild, roleIds: string[] ): Promise<string> => {
    return roleIds?.length ? roleIds
        .map( ( i: string ) => GUILD_DEFAULT_BASIC_ROLE_PREFIX + i + GUILD_DEFAULT_BASIC_ROLE_SUFFIX )
        .join( GUILD_DEFAULT_BASIC_ROLE_SEPARATOR ) : rolesGetEveryoneRoleMention( guild );
};

export const guildSetBadwords = async ( guild: Guild, badwords: string[] | undefined ): Promise<void> => {
    if ( ! badwords?.length ) {
        try {
            await guildDataManager.deleteData( {
                ownerId: guild.id,
                key: DATA_CHANNEL_KEY_BADWORDS,
            }, true );
        } catch ( e ) {
            // Ignore
        }

        return;
    }

    await guildDataManager.setData( {
        ownerId: guild.id,
        key: DATA_CHANNEL_KEY_BADWORDS,
        default: badwords,
    }, true );
};
