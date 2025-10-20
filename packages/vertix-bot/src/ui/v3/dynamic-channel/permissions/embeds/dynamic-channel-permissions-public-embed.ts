import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPermissionsPublicEmbed extends UIEmbedBase {
    private static vars = {};

    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPermissionsPublicEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getColor() {
        return 0x75c8e1; // Same as globe emoji.
    }

    protected getImage(): string {
        return "https://i.imgur.com/NthLO3W.png";
    }

    protected getTitle() {
        return "🌐  The channel is public now";
    }

    protected getDescription() {
        return (
            "Please be aware that your room is currently accessible to anyone.\n\n" +
            "Members **without** access will be able to enter the room unless it is hidden or set to private."
        );
    }
}
