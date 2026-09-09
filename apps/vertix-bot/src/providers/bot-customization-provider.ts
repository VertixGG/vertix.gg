import { GuildCustomizationManager } from "@vertix.gg/data/src/managers/guild-customization-manager";

import type {
    ICustomizationProvider,
    ComponentCustomization,
    CustomizationTarget,
    GuildCustomizationRow
} from "@vertix.gg/gui/src/customization/customization-provider";

/**
 * Bot-side implementation of ICustomizationProvider.
 * Wraps GuildCustomizationManager to provide customizations to the UI layer.
 */
export class BotCustomizationProvider implements ICustomizationProvider {
    public async getComponentCustomization(
        guildId: string,
        target: CustomizationTarget
    ): Promise<ComponentCustomization | null> {
        return GuildCustomizationManager.$.getComponentCustomization( guildId, target );
    }

    public async getGuildCustomizations( guildId: string ): Promise<GuildCustomizationRow[]> {
        return GuildCustomizationManager.$.getGuildCustomizations( guildId );
    }
}
