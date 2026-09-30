import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes, UI_IMAGE_BLUE_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { GUILD_EVENTS_ERRORS } from "@vertix.gg/definitions/src/guild-events-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const vars = {
    eventsChannelId: uiUtilsWrapAsTemplate( "eventsChannelId" ),

    statusLine: uiUtilsWrapAsTemplate( "statusLine" ),
    enabledOn: uiUtilsWrapAsTemplate( "enabledOn" ),
    enabledOff: uiUtilsWrapAsTemplate( "enabledOff" ),

    channelLine: uiUtilsWrapAsTemplate( "channelLine" ),
    channelSet: uiUtilsWrapAsTemplate( "channelSet" ),
    channelUnset: uiUtilsWrapAsTemplate( "channelUnset" ),

    subPostsLine: uiUtilsWrapAsTemplate( "subPostsLine" ),
    subPostsOn: uiUtilsWrapAsTemplate( "subPostsOn" ),
    subPostsOff: uiUtilsWrapAsTemplate( "subPostsOff" ),

    errorLine: uiUtilsWrapAsTemplate( "errorLine" ),
    errorNone: uiUtilsWrapAsTemplate( "errorNone" ),
    errorPostChannelMissing: uiUtilsWrapAsTemplate( "errorPostChannelMissing" ),
    errorPostChannelForbidden: uiUtilsWrapAsTemplate( "errorPostChannelForbidden" ),
    errorEventChannelForbidden: uiUtilsWrapAsTemplate( "errorEventChannelForbidden" )
};

/** Each stored failure, and the words the screen gives it. */
const ERROR_VARS: Record<string, string> = {
    [ GUILD_EVENTS_ERRORS.POST_CHANNEL_MISSING ]: vars.errorPostChannelMissing,
    [ GUILD_EVENTS_ERRORS.POST_CHANNEL_FORBIDDEN ]: vars.errorPostChannelForbidden,
    [ GUILD_EVENTS_ERRORS.EVENT_CHANNEL_FORBIDDEN ]: vars.errorEventChannelForbidden
};

/**
 * The Events screen: what it does, how it is set in this server, and the last thing that stopped it.
 */
const EventsEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-General/EventsEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setImage( UI_IMAGE_BLUE_LINE_URL )
    .setTitle( "📅  Events" )
    .setDescription( () =>
        "When a scheduled event in a voice channel is about to start, a check-in board goes up. " +
        "Whoever marked themselves **Interested** checks in by joining the voice channel; " +
        "ten minutes after the start, whoever has not come is marked, a post asks for somebody " +
        "to take their place, and the board ends as the attendance.\n\n" +
        `**Events** ${ vars.statusLine }\n` +
        `**Posts in** ${ vars.channelLine }\n` +
        `**"Need a sub" posts** ${ vars.subPostsLine }` +
        `${ vars.errorLine }\n\n` +
        "Pick the channel, then turn it on. An event held at a generator counts every room it opens."
    )
    .setOptions( () => ( {
        statusLine: {
            [ vars.enabledOn ]: "🟢 On",
            [ vars.enabledOff ]: "⚪ Off"
        },
        channelLine: {
            [ vars.channelSet ]: `<#${ vars.eventsChannelId }>`,
            [ vars.channelUnset ]: "Not picked yet"
        },
        subPostsLine: {
            [ vars.subPostsOn ]: "On",
            [ vars.subPostsOff ]: "Off"
        },
        errorLine: {
            [ vars.errorNone ]: "",
            [ vars.errorPostChannelMissing ]:
                "\n\n⚠️ The channel it posts in is gone - pick another.",
            [ vars.errorPostChannelForbidden ]:
                "\n\n⚠️ The bot cannot post in that channel. It needs View Channel, Send Messages and Embed Links there.",
            [ vars.errorEventChannelForbidden ]:
                "\n\n⚠️ The bot could not see an event's voice channel, so it could not check anybody in. Give it View Channel there."
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, JsonValue> = {
            statusLine: args.eventsEnabled ? vars.enabledOn : vars.enabledOff,
            channelLine: args.eventsChannelId ? vars.channelSet : vars.channelUnset,
            subPostsLine: false === args.eventsSubPostsEnabled ? vars.subPostsOff : vars.subPostsOn,
            errorLine: ERROR_VARS[ String( args.eventsLastError ) ] ?? vars.errorNone
        };

        if ( args.eventsChannelId ) {
            result.eventsChannelId = args.eventsChannelId;
        }

        return result;
    } )
    .build();

export { EventsEmbed };
