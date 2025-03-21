import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

export class DynamicChannelTransferOwnerTransferredEmbed extends UIEmbedBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelTransferOwnerTransferredEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return "🔀  Transfer channel ownership succeeded!";
    }

    protected getDescription() {
        return "You are no longer the owner of this channel.";
    }
}
