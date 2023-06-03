import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export default class ButtonsEmbed extends UIEmbedBase {
    public static getName() {
        return "Vertix/UI-V2/ButtonsEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle(): string {
        return "Step 2 - Set Buttons";
    }

    protected getDescription(): string {
        return "Here you can select which buttons will be visible to members in Dynamic Channels primary message.\n\n" +
            "Members will see only buttons that you have been selected.\n\n" +
            "**__Current enabled buttons__**:\n\n";
    }
}
