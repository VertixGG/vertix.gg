import { Guild } from "discord.js";

import { guildDataManager } from "@dynamico/managers";

import {
    DATA_CHANNEL_KEY_BADWORDS,
    DATA_CHANNEL_KEY_BASIC_ROLES
} from "@dynamico/constants/data";

import {
    GUILD_DEFAULT_BADWORDS,
    GUILD_DEFAULT_BADWORDS_INITIAL_VALUE,
    GUILD_DEFAULT_BADWORDS_SEPARATOR,
    GUILD_DEFAULT_BASIC_ROLE_PREFIX,
    GUILD_DEFAULT_BASIC_ROLE_SEPARATOR,
    GUILD_DEFAULT_BASIC_ROLE_SUFFIX
} from "@dynamico/constants/guild";

import { rolesGetEveryoneRoleMention } from "@dynamico/utils/roles";

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

export const guildUsedBadword = async ( guildId: string, word: string ): Promise<string | null> => {
    const badwords = await guildGetBadwords( guildId );

    let usedBadword: string | null = null;

    ( badwords ).some( ( badword ) => {
        if ( badword.length && word.toLowerCase().includes( badword.toString().toLowerCase() ) ) {
            usedBadword = badword;
        }
        return !! usedBadword;
    } );

    return usedBadword;
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
