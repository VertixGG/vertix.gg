import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingStep1Embed extends UIEmbedBase {
    public static getName() {
        return "VertixBot/UI-General/Scaling/SetupScalingStep1Embed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle(): string {
        return "Welcome to Auto-Scaling Channel Setup!";
    }

    protected getDescription(): string {
        return (
            "This wizard will help you set up a category of voice channels that automatically scale with demand.\n\n" +
            "• The bot will create a special `Master Scaling Channel` in a category you choose.\n" +
            "• Based on your settings (channel name prefix and max users per channel), the bot will add new voice channels when needed and can remove them when they are empty.\n\n" +
            "**Next Steps:**\n" +
            "1. Choose or create a category for these auto-scaling channels.\n" +
            "2. Set a name prefix for the channels (e.g., \"Lobby\", \"Game Room\").\n" +
            "3. Define the maximum number of users per channel.\n\n" +
            "Click **( `Next ▶` )** to begin."
        );
    }

    protected getLogic( _args: UIArgs ) {
        return {};
    }
}
