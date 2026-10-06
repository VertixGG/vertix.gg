import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes, UI_IMAGE_BLUE_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const vars = {
    weekRange: uiUtilsWrapAsTemplate( "weekRange" ),
    rooms: uiUtilsWrapAsTemplate( "rooms" ),
    roomsBefore: uiUtilsWrapAsTemplate( "roomsBefore" ),
    members: uiUtilsWrapAsTemplate( "members" ),
    membersBefore: uiUtilsWrapAsTemplate( "membersBefore" ),
    busiestHour: uiUtilsWrapAsTemplate( "busiestHour" ),
    topGenerator: uiUtilsWrapAsTemplate( "topGenerator" )
};

/**
 * A server's week in its rooms, posted once the week is over.
 *
 * Each figure beside the week before, since a number alone says nothing about whether the server is
 * growing. The busiest hour is a discord timestamp, so everybody reads it in their own time; the
 * generator is a channel mention, so it reads as whatever the channel is called now.
 *
 * The week itself is named by its UTC dates rather than by timestamps: it is cut at midnight UTC, and
 * a timestamp would show each reader that midnight in their own time - most of them a day to one side.
 */
const WeeklyReportEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-General/WeeklyReportEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_BLUE_LINE_URL )
    .setTitle( "📊  Your week in voice" )
    .setDescription(
        `**${ vars.weekRange }**\n\n` +
        `🎙️ **Rooms made:** ${ vars.rooms } - the week before: ${ vars.roomsBefore }\n` +
        `👥 **Members in rooms:** ${ vars.members } - the week before: ${ vars.membersBefore }\n` +
        `⏰ **Busiest hour:** ${ vars.busiestHour }\n` +
        `🏆 **Busiest generator:** ${ vars.topGenerator }`
    )
    // Written out in full, with no helper: this body is exported and run again by the site's previews,
    // where nothing but its arguments and the embed's vars exists.
    .setLogic( ( args: UIArgs ) => {
        // Nothing to say without the week - the defaults below stand in.
        if ( undefined === args?.weekStart ) {
            return {};
        }

        const weekStart = new Date( Number( args.weekStart ) * 1000 ),
            lastDay = new Date( weekStart.getTime() + 6 * 24 * 60 * 60 * 1000 ),
            busiestHour = Number( args.busiestHour ),
            topGeneratorId = String( args.topGeneratorId ?? "" );

        const result: Record<string, JsonValue> = {
            weekRange: `${ weekStart.toISOString().slice( 0, 10 ) } - ${ lastDay.toISOString().slice( 0, 10 ) } (UTC)`,
            rooms: String( args.rooms ),
            roomsBefore: String( args.roomsBefore ),
            members: String( args.members ),
            membersBefore: String( args.membersBefore ),
            busiestHour: busiestHour > 0 ? `<t:${ busiestHour }:f>` : "-",
            topGenerator: topGeneratorId ? `<#${ topGeneratorId }> (${ args.topGeneratorRooms })` : "-"
        };

        return result;
    } )
    .setDefaultVars( () => ( {
        weekRange: "2026-09-28 - 2026-10-04 (UTC)",
        rooms: "42",
        roomsBefore: "35",
        members: "31",
        membersBefore: "27",
        busiestHour: "<t:1790974800:f>",
        topGenerator: "<#123456789> (25)"
    } ) )
    .build();

export { WeeklyReportEmbed };
