import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import {
    UIArgs,
    UIInstancesTypes,
    UI_IMAGE_EMPTY_LINE_URL
} from "@vertix/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class LanguageEmbed extends UIEmbedBase {
    private static vars = {
        currentLanguage: uiUtilsWrapAsTemplate( "currentLanguage" )
    };

    public static getName() {
        return "Dynamico/UI-V2/LanguageEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle() {
        return "🌍  Select language";
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getDescription(): string {
        return `__Current Selected Language__: **${ LanguageEmbed.vars.currentLanguage }**\n\n` +
            "Didn't find your language?\n\n" +
            "You can be the one to translate bot to your language!\n" +
            "contact us at our support server, and be the one!\n\n" +
            "Found mistake in translation? Please let us know!";
    }

    protected getOptions() {
        // TODO: There should be one source of truth for languages.
        return {
            currentLanguage: {
                en: "English",
                ru: "Russian",
                he: "Hebrew",
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        return {
            currentLanguage: args?._language || "en",
        };
    }
}
