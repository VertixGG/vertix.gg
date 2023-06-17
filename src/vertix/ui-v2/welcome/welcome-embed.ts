import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export class WelcomeEmbed extends UIEmbedBase {
    private static vars = {};

    public static getName() {
        return "Vertix/UI-V2/WelcomeEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Static;
    }

    protected getColor() {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage() {
        return "https://i.imgur.com/x8jMguN.gif";
    }

    protected getTitle(): string {
        return "༄ Vertix is here, let's get started!";
    }

    protected getDescription() {
        return "Welcome to Vertix, an incredible addition to your server!\n" +
            "Let's collaborate and make your server even better.\n\n" +

            "**Bot Welcome**\n" +
            "Setting up the bot is a breeze! Just follow these simple steps:\n" +
            "- Type `/setup` to create your first master channel.\n" +
            "- Click on `(➕ Create Master Channel)`.\n" +
            "- Set default channel names or click \"`(▶ Next)`\" to proceed.\n" +
            "- Choose channel buttons or continue with all features, then click \"`(✔ Finish)`\".\n\n" +
            "You can always edit the configurations by using the `/setup` command.\n\n" +

            "**Dynamic Channels and Master Channel**\n" +
            "Dynamic channels inherit all settings from the Master Channel.\n" +
            "To Set the default settings of dynamic channels, simply adjust the settings of the Master Channel `(➕ New Channel)`.\n\n" +

            "**Buttons Interface**\n" +
            "Please note that the buttons interface is located **inside** the dynamic channel.\n" +
            "You can access it by opening the chat box of the dynamic channel.\n\n" +

            "If you need assistance or have any suggestions, feel free to join our Discord community server! We would be glad to help you and hear your feedback.\n" +
            "Join us at: https://discord.gg/dEwKeQefUU";
    }
}
