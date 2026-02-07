/**
 * Interface for embed customization overrides.
 * Allows overriding embed properties like color, title, description per guild.
 */
export interface EmbedOverrides {
    readonly [ key: string ]: string | number | undefined;
    title?: string;
    description?: string;
    color?: number;
}

/**
 * Interface for component customization.
 * Contains embed overrides and optional variable overrides.
 */
export interface ComponentCustomization {
    readonly [ key: string ]: EmbedOverrides | Record<string, string> | undefined;
    embedOverrides?: EmbedOverrides;
    variables?: Record<string, string>;
}

/**
 * Interface for guild customization data.
 * Contains all customizations for a specific guild.
 */
export interface GuildCustomizationData {
    guildId: string;
    components: Record<string, ComponentCustomization>;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
