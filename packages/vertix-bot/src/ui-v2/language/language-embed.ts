import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UILanguageManager } from "@vertix.gg/bot/src/ui-v2/ui-language-manager";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";
import {
    UI_LANGUAGES_INITIAL_ATTRIBUTES,
    UI_LANGUAGES_INITIAL_CODE
} from "@vertix.gg/bot/src/ui-v2/_base/ui-language-definitions";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class LanguageEmbed extends UIEmbedBase {
    private static vars = {
        currentLanguage: uiUtilsWrapAsTemplate( "currentLanguage" )
    };

    public static getName() {
        return "VertixBot/UI-V2/LanguageEmbed";
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
        const initialAttrs = UI_LANGUAGES_INITIAL_ATTRIBUTES,
            result: { currentLanguage: { [ code: string ]: string } } = {
                currentLanguage: {
                    [ initialAttrs.code ]: initialAttrs.name
                }
            };

        UILanguageManager.$.getAvailableLanguages().forEach( ( { code, name } ) => {
            result.currentLanguage[ code ] = name;
        } );

        return result;
    }

    protected getLogic( args: UIArgs ) {
        return {
            currentLanguage: args?._language || UI_LANGUAGES_INITIAL_CODE,
        };
    }
}
