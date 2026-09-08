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

/**
 * Interface for customization provider.
 * Implement this interface in vertix-bot to provide guild-specific customizations.
 */
export interface ICustomizationProvider {
    /**
     * Function getComponentCustomization() :: What a guild changed about one component.
     *
     * The target says which component, and how narrowly - a state and a language when the caller
     * is rendering one, null when it is not. The provider resolves the overrides that apply,
     * broadest first, so a guild-wide change and a state-specific one both land.
     */
    getComponentCustomization(
        guildId: string,
        target: CustomizationTarget
    ): Promise<ComponentCustomization | null>;

    /**
     * Function getGuildCustomizations() :: Every override a guild holds, for preloading.
     */
    getGuildCustomizations( guildId: string ): Promise<GuildCustomizationRow[]>;
}

/**
 * Default no-op customization provider.
 * Used when no provider is registered.
 */
export class NoOpCustomizationProvider implements ICustomizationProvider {
    public async getComponentCustomization(): Promise<ComponentCustomization | null> {
        return null;
    }

    public async getGuildCustomizations(): Promise<GuildCustomizationRow[]> {
        return [];
    }
}
