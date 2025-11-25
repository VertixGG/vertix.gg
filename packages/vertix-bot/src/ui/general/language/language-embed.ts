import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";
import {
    UI_LANGUAGES_INITIAL_ATTRIBUTES,
    UI_LANGUAGES_INITIAL_CODE
} from "@vertix.gg/gui/src/bases/ui-language-definitions";

import { UILanguageManager } from "@vertix.gg/bot/src/ui/ui-language-manager";
import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const LANGUAGE_EMBED_VARS = {
    currentLanguage: uiUtilsWrapAsTemplate( "currentLanguage" )
};

const LanguageEmbed = new EmbedBuilder<UIArgs, typeof LANGUAGE_EMBED_VARS>(
    "VertixBot/UI-General/LanguageEmbed",
    LANGUAGE_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( "🌍  Select language" )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setDescription( () => (
        `__Current Selected Language__: **${ LANGUAGE_EMBED_VARS.currentLanguage }**\n\n` +
        "Didn't find your language?\n\n" +
        "You can be the one to translate bot to your language!\n" +
        "contact us at our support server, and be the one!\n\n" +
        "Found mistake in translation? Please let us know!"
    ) )
    .setOptions( () => {
        const initialAttrs = UI_LANGUAGES_INITIAL_ATTRIBUTES;
        const result: { currentLanguage: { [ code: string ]: string } } = {
            currentLanguage: {
                [ initialAttrs.code ]: initialAttrs.name
            }
        };

        UILanguageManager.$.getAvailableLanguages().forEach( ( { code, name } ) => {
            result.currentLanguage[ code ] = name;
        } );

        return result;
    } )
    .setLogic( ( args: UIArgs ) => ( {
        currentLanguage: args?._language || UI_LANGUAGES_INITIAL_CODE
    } ) )
    .build();

export { LanguageEmbed };
