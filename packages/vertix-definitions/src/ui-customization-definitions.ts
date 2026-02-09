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
 * Interface for select option customization override.
 */
export interface SelectOptionOverride {
    label?: string;
    description?: string;
    emoji?: string;
}

/**
 * Interface for element customization overrides.
 * Allows overriding element properties like label, emoji, style per guild.
 */
export interface ElementOverride {
    label?: string;
    emoji?: string;
    style?: string;
    disabled?: boolean;
    url?: string;
    placeholder?: string;
    selectOptions?: Record<string, SelectOptionOverride>;
}

/**
 * String-typed fields of ElementOverride (excludes `disabled` which is boolean).
 * Used for iterating over element override fields when diffing or applying overrides.
 */
export const ELEMENT_OVERRIDE_STRING_FIELDS = [ "label", "emoji", "style", "url", "placeholder" ] as const;

/**
 * Interface for component customization.
 * Contains embed overrides, variable overrides, and element overrides.
 */
export interface ComponentCustomization {
    readonly [ key: string ]: EmbedOverrides | Record<string, string> | Record<string, ElementOverride> | undefined;
    embedOverrides?: EmbedOverrides;
    variables?: Record<string, string>;
    elementOverrides?: Record<string, ElementOverride>;
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
