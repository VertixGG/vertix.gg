import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPermissionsShownEmbed extends UIEmbedBase {
    private static vars = {};

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsShownEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getColor() {
        return 0xC79D5F; // Same as globe emoji.
    }

    protected getTitle() {
        return "🐵  The channel is visible now";
    }
}
