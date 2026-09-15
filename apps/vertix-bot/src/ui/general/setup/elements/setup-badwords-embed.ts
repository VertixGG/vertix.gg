import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const SETUP_BADWORDS_EMBED_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    badwords: uiUtilsWrapAsTemplate( "badwords" ),
    badwordsMessage: uiUtilsWrapAsTemplate( "badwordsMessage" ),
    badwordsMessageDefault: uiUtilsWrapAsTemplate( "badwordsMessageDefault" )
};

/**
 * The bad words screen, saying what the filter is and what it currently holds.
 *
 * It used to show the setup screen's own embed - the report of every generator in the server, its
 * buttons, its roles and its logs channel - with the word list as one line somewhere down it. That
 * is what a member wants when looking their configuration over, and not what they want having asked
 * for this one setting.
 *
 * The list is built the way the report built it, through a token rather than in a sentence here:
 * whether there is a list at all decides which of two wordings `badwordsMessage` resolves to, and
 * both of them are written in the options where the translations can reach them.
 */
const SetupBadwordsEmbed = new EmbedBuilder<ISetupArgs, typeof SETUP_BADWORDS_EMBED_VARS>(
    "VertixBot/UI-General/SetupBadwordsEmbed",
    SETUP_BADWORDS_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "🙅  Bad Words" )
    .setDescription( ( vars ) =>
        "Words that cannot appear in the name of a dynamic channel, anywhere in this server.\n\n" +
        "A member renaming their channel to something holding one of these is told no and the name " +
        "is left as it was. The check is on names only - it does not read what anyone says.\n\n" +
        "_**Current list**_:\n" +
        vars.badwordsMessage +
        "\n\n" +
        "`(🙅 Edit Bad Words)` replaces the whole list with what you type, separated by commas.\n" +
        "`(🧹 Remove all)` empties it, which allows every name again.\n"
    )
    .setArrayOptions( ( { value, separator } ) => {
        const valueStr = value != null ? String( value ) : "";
        const separatorStr = separator != null ? String( separator ) : "";

        return {
            badwords: {
                format: `${ valueStr }${ separatorStr }`,
                separator: ", "
            }
        };
    } )
    .setOptions( ( { badwords, badwordsMessageDefault } ) => ( {
        badwordsMessage: {
            [ String( badwords ) ]: "`" + badwords + "`",
            [ String( badwordsMessageDefault ) ]: "**None** - every name is allowed."
        }
    } ) )
    .setLogic( ( args: ISetupArgs, vars ) => {
        const result: Record<string, JsonValue> = {};

        if ( args?.badwords?.length ) {
            result.badwords = args.badwords;
            result.badwordsMessage = vars.badwords;
        } else {
            result.badwordsMessage = vars.badwordsMessageDefault;
        }

        return result;
    } )
    .build();

export { SetupBadwordsEmbed, SETUP_BADWORDS_EMBED_VARS };
