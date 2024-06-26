import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

export class DynamicChannelTransferOwnerTransferredEmbed extends UIEmbedBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelTransferOwnerTransferredEmbed";
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
        return"You are no longer the owner of this channel.";
    }
}
