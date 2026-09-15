import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    masterChannelMessage: uiUtilsWrapAsTemplate( "masterChannelMessage" ),
    masterChannelMessageDefault: uiUtilsWrapAsTemplate( "masterChannelMessageDefault" )
};

/**
 * Told to a member who asked something of a channel they do not own one of.
 *
 * The offer of somewhere to go is a tail rather than part of the sentence, because there is not
 * always somewhere to go: a server with no generator, or one whose generator has since been
 * deleted, has nothing to name. Said unconditionally it printed the variable's own name at the
 * member - `Join <#{masterChannelId}> to create your own channel first` - which is both broken and
 * an instruction they cannot follow.
 */
const NoActiveDynamicChannelEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-General/NoActiveDynamicChannelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "⛔  No active dynamic channel" )
    .setDescription( () => (
        "You don't own an active dynamic channel." +
        vars.masterChannelMessage
    ) )
    .setOptions( () => ( {
        masterChannelMessage: {
            [ vars.masterChannelId ]: `\n\nJoin <#${ vars.masterChannelId }> to create your own channel first.`,
            [ vars.masterChannelMessageDefault ]: ""
        }
    } ) )
    .setColor( 0xff5202 )
    .setLogic( ( args?: UIArgs ) => {
        const result: Record<string, string> = {};

        if ( args?.masterChannelId ) {
            result.masterChannelId = String( args.masterChannelId );
            result.masterChannelMessage = vars.masterChannelId;
        } else {
            result.masterChannelMessage = vars.masterChannelMessageDefault;
        }

        return result;
    } )
    .build();

export { NoActiveDynamicChannelEmbed };
