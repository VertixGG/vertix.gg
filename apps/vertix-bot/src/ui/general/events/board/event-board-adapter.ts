import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { EventBoardComponent } from "@vertix.gg/bot/src/ui/general/events/board/event-board-component";

import type { ButtonInteraction, TextChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: TextChannel;
}

/**
 * The check-in board a run posts, and edits until it is the attendance.
 *
 * Posted by the bot rather than in answer to anybody, so it needs no permission from whoever reads
 * it, and nothing on it calls back - its one button is a link.
 */
const EventBoardAdapter = new ExecutionAdapterBuilder<TextChannel, DefaultInteraction>(
    "VertixBot/UI-General/EventBoardAdapter"
)
    .setComponent( EventBoardComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildText ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: {
                    boardState: "check-in",
                    eventName: "Raid Night",
                    startsAt: "1791057600",
                    voiceChannelId: "123456789"
                }
            } );
    } )
    .getStartArgs( async( _context, _channel, argsFromManager ) => argsFromManager ?? {} )
    .build();

export { EventBoardAdapter };
