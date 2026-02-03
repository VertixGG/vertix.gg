import { GuildCustomizationManager } from "@vertix.gg/bot/src/managers/guild-customization-manager";

import type { ICustomizationProvider, ComponentCustomization } from "@vertix.gg/gui/src/customization/customization-provider";

/**
 * Bot-side implementation of ICustomizationProvider.
 * Wraps GuildCustomizationManager to provide customizations to the UI layer.
 */
export class BotCustomizationProvider implements ICustomizationProvider {
    public async getComponentCustomization(
        guildId: string,
        customizationKey: string
    ): Promise<ComponentCustomization | null> {
        return GuildCustomizationManager.$.getComponentCustomization( guildId, customizationKey );
    }

    public async getGuildCustomizations(
        guildId: string
    ): Promise<Record<string, ComponentCustomization> | null> {
        const guildData = await GuildCustomizationManager.$.getGuildCustomization( guildId );

        if ( !guildData || !guildData.components ) {
            return null;
        }

        return guildData.components;
    }
}
