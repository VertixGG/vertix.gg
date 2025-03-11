import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";

import { rolesGetEveryoneRoleMention } from "@vertix.gg/bot/src/utils/roles";

import type { Guild } from "discord.js";

export const GUILD_DEFAULT_BASIC_ROLE_PREFIX = "<@&",
    GUILD_DEFAULT_BASIC_ROLE_SUFFIX = ">",
    GUILD_DEFAULT_BASIC_ROLE_SEPARATOR = ", ";

export const guildGetBasicRolesIds = async( guildId: string ): Promise<string[]> => {
    const basicRolesIdsDB = await GuildDataManager.$.getData(
        {
            ownerId: guildId,
            key: "basicRolesIds",
            default: null,
            cache: true
        },
        true
    );

    if ( basicRolesIdsDB?.values ) {
        return basicRolesIdsDB.values;
    }

    return [];
};

export const guildGetBasicRolesFormatted = async( guild: Guild, roleIds: string[] ): Promise<string> => {
    return roleIds?.length
        ? roleIds
              .map( ( i: string ) => GUILD_DEFAULT_BASIC_ROLE_PREFIX + i + GUILD_DEFAULT_BASIC_ROLE_SUFFIX )
              .join( GUILD_DEFAULT_BASIC_ROLE_SEPARATOR )
        : rolesGetEveryoneRoleMention( guild );
};
