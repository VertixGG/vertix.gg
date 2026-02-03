/**
 * Interface for embed customization overrides.
 * Allows overriding embed properties like color, title, description per guild.
 */
export interface EmbedOverrides {
    title?: string;
    description?: string;
    color?: number;
}

/**
 * Interface for component customization.
 * Contains embed overrides and optional variable overrides.
 */
export interface ComponentCustomization {
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
