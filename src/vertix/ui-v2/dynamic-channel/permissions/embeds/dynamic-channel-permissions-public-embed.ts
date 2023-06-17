import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class DynamicChannelPermissionsPublicEmbed extends UIEmbedBase {
    private static vars = {};

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsPublicEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getColor() {
        return 0x75C8E1; // Same as globe emoji.
    }

    protected getImage(): string {
        return "https://i.imgur.com/NthLO3W.png";
    }

    protected getTitle() {
        return "🌐  The channel is public now";
    }

    protected getDescription() {
        return "Please be aware that your room is currently accessible to anyone.\n\n" +
            "Members **without** access will be able to enter the room unless it is hidden or set to private.";
    }
}
