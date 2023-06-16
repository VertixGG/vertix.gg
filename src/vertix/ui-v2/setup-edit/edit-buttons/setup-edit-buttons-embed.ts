import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export class SetupEditButtonsEmbed extends UIEmbedBase {
    private static vars = {
        index: uiUtilsWrapAsTemplate( "index" )
    };

    public static getName() {
        return "Vertix/UI-V2/SetupEditButtonsEmbed";
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

    protected getTitle() {
        return `🎚  Edit Buttons Of Master Channel #${ SetupEditButtonsEmbed.vars.index }`;
    }

    protected getDescription(): string {
        return "Select which buttons you wish to be visible for your members.\n\n" +
            "Only selected buttons will be enabled/visible at\n" +
            "_Dynamic Channels_ that created by this master channel.\n\n";
    }

    protected getFooter() {
        return "Current enabled buttons at the menu below";
    }

    protected getLogic( args: UIArgs ) {
        return {
            index: args.index + 1,
        };
    }
}
