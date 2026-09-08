import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import type {
    ComponentCustomization,
    CustomizationTarget,
    GuildCustomizationRow
} from "@vertix.gg/definitions/src/ui-customization-definitions";

/**
 * What the api hands back: the guild asked for, and every override that applies to it - its own
 * rows and the default layer's.
 */
export interface CustomizationData {
    guildId: string;
    rows: GuildCustomizationRow[];
}

function specificity( row: GuildCustomizationRow ): number {
    let score = 0;

    if ( DEFAULT_CUSTOMIZATION_GUILD_ID !== row.guildId ) {
        score += 4;
    }

    if ( row.state ) {
        score += 2;
    }

    if ( row.language ) {
        score += 1;
    }

    return score;
}

function applies( row: GuildCustomizationRow, target: CustomizationTarget ): boolean {
    if ( row.component !== target.component ) {
        return false;
    }

    // A row without a state or a language applies to all of them.
    if ( row.state && row.state !== target.state ) {
        return false;
    }

    return !row.language || row.language === target.language;
}

/**
 * Function resolveCustomization() :: What a component looks like once every override that applies
 * to it has been laid down, broadest first.
 *
 * The same resolution the bot performs, so the editor shows what a member will see rather than
 * only the row that happens to match exactly.
 */
export function resolveCustomization(
    data: CustomizationData | null,
    target: CustomizationTarget
): ComponentCustomization | null {
    const applicable = ( data?.rows ?? [] )
        .filter( ( row ) => applies( row, target ) )
        .sort( ( a, b ) => specificity( a ) - specificity( b ) );

    if ( !applicable.length ) {
        return null;
    }

    return applicable.reduce<ComponentCustomization>( ( merged, row ) => ( {
        embedOverrides: { ...merged.embedOverrides, ...row.embedOverrides },
        elementOverrides: { ...merged.elementOverrides, ...row.elementOverrides },
        modalOverrides: { ...merged.modalOverrides, ...row.modalOverrides },
        variables: { ...merged.variables, ...row.variables }
    } ), {} );
}

/**
 * Function findOwnRow() :: The row this guild wrote itself, if any.
 *
 * What an editor needs when the question is "what did I set here", as opposed to "what will be
 * rendered" - the inherited default layer is somebody else's row.
 */
export function findOwnRow(
    data: CustomizationData | null,
    guildId: string,
    target: CustomizationTarget
): GuildCustomizationRow | null {
    return ( data?.rows ?? [] ).find( ( row ) =>
        row.guildId === guildId
        && row.component === target.component
        && ( row.state ?? null ) === ( target.state ?? null )
        && ( row.language ?? null ) === ( target.language ?? null )
    ) ?? null;
}
