import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

export class WelcomeEmbed extends UIEmbedBase {
    private static vars = {};

    public static getName() {
        return "VertixBot/UI-V2/WelcomeEmbed";
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

    protected getThumbnail() {
        return {
            url: "https://s11.gifyu.com/images/SuW5n.gif",
        };
    }

    protected getDescription() {
        return "Welcome to Vertix, an incredible addition to your server!\n" +
            "Let's collaborate and make your server even better.\n\n" +

            "**Bot Setup**\n" +
            "- Type `/setup` or press `(🛠 Setup)` button.\n" +
            "- Click on `(➕ Create Master Channel)`\n" +
            "- Follow the steps.\n\n" +
            "Still not sure? Check out our [step by step](https://vertix.gg/posts/how-to-setup) guide.\n\n" +
            "You can always edit the configurations by using the `/setup` command.\n\n" +

            "If you need assistance or have any suggestions, feel free to join our Discord community server! We would be glad to help you and hear your feedback.\n\n" +
            "Join us at: https://discord.gg/dEwKeQefUU";
    }
}
