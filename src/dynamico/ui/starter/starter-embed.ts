import UIEmbed from "@dynamico/ui/_base/ui-embed";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { DYNAMICO_DEFAULT_COLOR_BRAND } from "@dynamico/constants/dynamico";

export class StarterEmbed extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/StarterEmbed";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getColor(): number {
        return DYNAMICO_DEFAULT_COLOR_BRAND;
    }

    protected getTitle(): string {
        return "🌀 Dynamico has landed, ready to assist!";
    }

    protected getDescription() {
        return "Thank you for inviting Dynamico to this incredible server!\n" +
            "Let's work together to make it even better.\n\n" +

            "**Setup**\n" +
            "By using the `/setup` command, you will go through 2 steps:\n" +
            "• Step 1 - Setting up a template for dynamic channels names\n" +
            "• Step 2 - Filter out \"bad words\" from dynamic channels names\n\n" +

            "You can always modify this configurations by using `/config` command.\n\n" +

            "**Modify default settings of dynamic channels**\n" +
            "Dynamic channels inherits all settings from the Master Channel.\n" +
            "To modify the default settings of dynamic channels, simply adjust the settings of the Master Channel `(➕ New Channel)`.\n\n" +

            "**Buttons Interface**\n" +
            "Pay attention! The buttons interface is **inside** the dynamic channel!\n" +
            "You can reach it by opening the dynamic channel's chat box.\n\n" +

            "**Need help?**\n" +
            "Feel free to join our discord's community support and ask for anything you need!\n" +
            "https://discord.gg/Dynamico";
    }

    protected getArgsFields(): string[] {
        return [];
    }

    protected getLogicFields(): string[] {
        return [];
    }
}
