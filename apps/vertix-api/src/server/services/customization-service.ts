import { GuildCustomizationModel } from "@vertix.gg/data/src/models/guild-customization-model";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import type {
    ComponentCustomization,
    CustomizationTarget,
    GuildCustomizationRow
} from "@vertix.gg/definitions/src/ui-customization-definitions";

export type {
    EmbedOverrides,
    ComponentCustomization,
    CustomizationTarget,
    GuildCustomizationRow
} from "@vertix.gg/definitions/src/ui-customization-definitions";

export const DEFAULT_GUILD_ID = DEFAULT_CUSTOMIZATION_GUILD_ID;

/**
 * Function getGuildCustomization() :: Every override that applies to a guild.
 *
 * The default guild's rows come with it, since they are the base layer the bot renders under the
 * guild's own - the dashboard shows the same thing the member will see.
 */
export async function getGuildCustomization( guildId: string ): Promise<GuildCustomizationRow[]> {
    const guildIds = DEFAULT_GUILD_ID === guildId
        ? [ DEFAULT_GUILD_ID ]
        : [ DEFAULT_GUILD_ID, guildId ];

    return GuildCustomizationModel.$.getByGuildIds( guildIds );
}

/**
 * Function updateComponentCustomization() :: Write one override.
 *
 * Addressed by what it applies to rather than by a composed key, so a save cannot land under a
 * name the bot never looks up. Merges into the row that is already there.
 */
export async function updateComponentCustomization(
    guildId: string,
    target: CustomizationTarget,
    customization: ComponentCustomization
): Promise<GuildCustomizationRow> {
    return GuildCustomizationModel.$.upsertComponent( guildId, target, customization );
}

/**
 * Function deleteComponentCustomization() :: Drop one override entirely.
 */
export async function deleteComponentCustomization(
    guildId: string,
    target: CustomizationTarget
): Promise<boolean> {
    return GuildCustomizationModel.$.deleteComponent( guildId, target );
}
