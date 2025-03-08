import type { Guild } from "discord.js";

export const rolesGetNamesByIds = (guild: Guild, rolesIds: string[]) => {
    if (!rolesIds?.length) {
        return [];
    }

    return rolesIds.map((roleId: string) => guild?.roles.cache.get(roleId)?.name);
};

export const rolesGetEveryoneRoleMention = (guild: Guild) => {
    return "<@&" + guild?.roles.everyone.id + ">";
};
