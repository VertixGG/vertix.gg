import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class SetupEditButtonsEffectEmbed extends UIEmbedBase {
    private static vars = {
        index: uiUtilsWrapAsTemplate( "index" )
    };

    public static getName() {
        return "VertixBot/UI-V2/SetupEditButtonsEffectEmbed";
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
        return `🎚  Edit Buttons Of Master Channel #${ SetupEditButtonsEffectEmbed.vars.index }`;
    }

    protected getDescription(): string {
        const index = SetupEditButtonsEffectEmbed.vars.index;

        return `Editing buttons will impact the dynamic channels created by __Master Channel #${ index }__.\n\n` +
            "There are have two options:\n\n" +
            "- Affect changes immediately to all channels\n" +
            "- Apply changes only to newly created _Dynamic Channels_.";
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
