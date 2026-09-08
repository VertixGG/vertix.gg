import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

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

const client = PrismaBotClient.$.getClient();

type CustomizationRecord = {
    guildId: string;
    component: string;
    state: string | null;
    language: string | null;
    embedOverrides: unknown;
    elementOverrides: unknown;
    modalOverrides: unknown;
    variables: unknown;
};

function toRow( record: CustomizationRecord ): GuildCustomizationRow {
    return {
        guildId: record.guildId,
        component: record.component,
        state: record.state,
        language: record.language,
        embedOverrides: ( record.embedOverrides ?? undefined ) as GuildCustomizationRow[ "embedOverrides" ],
        elementOverrides: ( record.elementOverrides ?? undefined ) as GuildCustomizationRow[ "elementOverrides" ],
        modalOverrides: ( record.modalOverrides ?? undefined ) as GuildCustomizationRow[ "modalOverrides" ],
        variables: ( record.variables ?? undefined ) as GuildCustomizationRow[ "variables" ]
    };
}

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

    const records = await client.guildCustomization.findMany( {
        where: { guildId: { in: guildIds } }
    } );

    return records.map( toRow );
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
    const where = {
        guildId,
        component: target.component,
        state: target.state ?? null,
        language: target.language ?? null
    };

    // Addressed by the four fields rather than by `whereUnique`: the compound carries nullable
    // members, which the mongo connector will not accept as a unique selector.
    const existing = await client.guildCustomization.findFirst( { where } );

    const merged = {
        embedOverrides: { ...( existing?.embedOverrides as object ?? {} ), ...customization.embedOverrides },
        elementOverrides: { ...( existing?.elementOverrides as object ?? {} ), ...customization.elementOverrides },
        modalOverrides: { ...( existing?.modalOverrides as object ?? {} ), ...customization.modalOverrides },
        variables: { ...( existing?.variables as object ?? {} ), ...customization.variables }
    };

    const record = existing
        ? await client.guildCustomization.update( { where: { id: existing.id }, data: merged } )
        : await client.guildCustomization.create( { data: { ...where, ...merged } } );

    return toRow( record );
}

/**
 * Function deleteComponentCustomization() :: Drop one override entirely.
 */
export async function deleteComponentCustomization(
    guildId: string,
    target: CustomizationTarget
): Promise<boolean> {
    const result = await client.guildCustomization.deleteMany( {
        where: {
            guildId,
            component: target.component,
            state: target.state ?? null,
            language: target.language ?? null
        }
    } );

    return result.count > 0;
}
