import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { WeeklyReportComponent } from "@vertix.gg/bot/src/ui/general/weekly-report/weekly-report-component";

import type { ButtonInteraction, TextChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: TextChannel;
}

/**
 * A server's weekly summary - its rooms, its members in them, its busiest hour and generator.
 *
 * Posted by the bot rather than in answer to anybody, so it needs no permission from whoever reads it,
 * and nothing on it calls back - its one button is a link. `GuildWeeklyReportService` posts it.
 */
const WeeklyReportAdapter = new ExecutionAdapterBuilder<TextChannel, DefaultInteraction>(
    "VertixBot/UI-General/WeeklyReportAdapter"
)
    .setComponent( WeeklyReportComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildText ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: {
                    weekStart: "1790553600",
                    rooms: "42",
                    roomsBefore: "35",
                    members: "31",
                    membersBefore: "27",
                    busiestHour: "1790974800",
                    topGeneratorId: "123456789",
                    topGeneratorRooms: "25"
                }
            } );
    } )
    .getStartArgs( async( _context, _channel, argsFromManager ) => argsFromManager ?? {} )
    .build();

export { WeeklyReportAdapter };
