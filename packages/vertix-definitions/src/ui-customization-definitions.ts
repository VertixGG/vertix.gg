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
 * Interface for select option customization override.
 */
export type SelectOptionOverride = {
    label?: string;
    description?: string;
    emoji?: string;
}

/**
 * Interface for element customization overrides.
 * Allows overriding element properties like label, emoji, style per guild.
 */
export type ElementOverride = {
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
 * Interface for modal input customization override.
 * Allows overriding input properties like label and placeholder per guild.
 */
export type ModalInputOverride = {
    label?: string;
    placeholder?: string;
}

/**
 * Interface for modal customization overrides.
 * Allows overriding modal title and per-input properties.
 */
export type ModalOverrides = {
    title?: string;
    inputOverrides?: Record<string, ModalInputOverride>;
}

/**
 * String-typed fields of ModalInputOverride.
 * Used for iterating over modal input override fields when diffing or applying overrides.
 */
export const MODAL_INPUT_OVERRIDE_FIELDS = [ "label", "placeholder" ] as const;

/**
 * Interface for component customization.
 * Contains embed overrides, variable overrides, element overrides, and modal overrides.
 */
export interface ComponentCustomization {
    embedOverrides?: EmbedOverrides;
    variables?: Record<string, string>;
    elementOverrides?: Record<string, ElementOverride>;
    modalOverrides?: ModalOverrides;
}

/**
 * What an override applies to.
 *
 * The component is its own name, as `getName()` returns it - never shortened, since
 * `UI-V2/DynamicChannel` and `UI-V3/DynamicChannel` are different components that would otherwise
 * collapse into one. A null state or language means "every one of them".
 */
export interface CustomizationTarget {
    component: string;
    state?: string | null;
    language?: string | null;
}

/**
 * One stored override: what it applies to, and what it changes.
 */
export interface GuildCustomizationRow extends CustomizationTarget, ComponentCustomization {
    guildId: string;
}

/**
 * The guild whose overrides are the base layer under every other guild's.
 */
export const DEFAULT_CUSTOMIZATION_GUILD_ID = "__default__";
