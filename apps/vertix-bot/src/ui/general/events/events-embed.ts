import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes, UI_IMAGE_BLUE_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { GUILD_EVENTS_ERRORS, GUILD_EVENTS_SETTINGS_DEFAULTS } from "@vertix.gg/definitions/src/guild-events-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const vars = {
    eventsChannelId: uiUtilsWrapAsTemplate( "eventsChannelId" ),
    checkInLeadMinutes: uiUtilsWrapAsTemplate( "checkInLeadMinutes" ),
    lateAfterMinutes: uiUtilsWrapAsTemplate( "lateAfterMinutes" ),

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
    errorEventChannelForbidden: uiUtilsWrapAsTemplate( "errorEventChannelForbidden" ),
    errorLogChannelMissing: uiUtilsWrapAsTemplate( "errorLogChannelMissing" ),
    errorLogChannelForbidden: uiUtilsWrapAsTemplate( "errorLogChannelForbidden" )
};

/** Each stored failure, and the words the screen gives it. */
const ERROR_VARS: Record<string, string> = {
    [ GUILD_EVENTS_ERRORS.POST_CHANNEL_MISSING ]: vars.errorPostChannelMissing,
    [ GUILD_EVENTS_ERRORS.POST_CHANNEL_FORBIDDEN ]: vars.errorPostChannelForbidden,
    [ GUILD_EVENTS_ERRORS.EVENT_CHANNEL_FORBIDDEN ]: vars.errorEventChannelForbidden,
    [ GUILD_EVENTS_ERRORS.LOG_CHANNEL_MISSING ]: vars.errorLogChannelMissing,
    [ GUILD_EVENTS_ERRORS.LOG_CHANNEL_FORBIDDEN ]: vars.errorLogChannelForbidden
};

/**
 * The Events screen: what it does, how it is set in this server, and the last thing that stopped it.
 *
 * It names the two timings that decide what a member sees - when check-in opens and when it closes -
 * because the screen explains Events in terms of them, and they are the server's own now. Everything
 * else is on the dashboard, behind the screen's own link to it.
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
        "Whoever marked themselves **Interested** checks in by joining the voice channel. " +
        "When check-in closes, whoever has not come is marked, a post asks for somebody " +
        "to take their place, and the board ends as the attendance.\n\n" +
        `**Events** ${ vars.statusLine }\n` +
        `**Posts in** ${ vars.channelLine }\n` +
        `**"Need a sub" posts** ${ vars.subPostsLine }\n` +
        `**Check-in** opens ${ vars.checkInLeadMinutes } min before the start, closes ${ vars.lateAfterMinutes } min after` +
        `${ vars.errorLine }\n\n` +
        "Pick the channel, then turn it on. The timing, the pings, which events count and where the " +
        "attendance is copied are under **More options**. An event held at a generator counts every room it opens."
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
                "\n\n⚠️ The bot could not see an event's voice channel, so it could not check anybody in. Give it View Channel there.",
            [ vars.errorLogChannelMissing ]:
                "\n\n⚠️ The channel the attendance is copied to is gone - pick another under More options.",
            [ vars.errorLogChannelForbidden ]:
                "\n\n⚠️ The bot cannot post the attendance copy. It needs View Channel, Send Messages and Embed Links in that channel."
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, JsonValue> = {
            checkInLeadMinutes: Number( args.eventsCheckInLeadMinutes ?? GUILD_EVENTS_SETTINGS_DEFAULTS.checkInLeadMinutes ),
            lateAfterMinutes: Number( args.eventsLateAfterMinutes ?? GUILD_EVENTS_SETTINGS_DEFAULTS.lateAfterMinutes ),
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
    .setDefaultVars( () => ( {
        checkInLeadMinutes: GUILD_EVENTS_SETTINGS_DEFAULTS.checkInLeadMinutes,
        lateAfterMinutes: GUILD_EVENTS_SETTINGS_DEFAULTS.lateAfterMinutes
    } ) )
    .build();

export { EventsEmbed };
