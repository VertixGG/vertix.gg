import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { EventNeedSubComponent } from "@vertix.gg/bot/src/ui/general/events/need-sub/event-need-sub-component";

import type { ButtonInteraction, TextChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: TextChannel;
}

/**
 * The "need a sub" post a run puts up once its roster freezes with people missing.
 */
const EventNeedSubAdapter = new ExecutionAdapterBuilder<TextChannel, DefaultInteraction>(
    "VertixBot/UI-General/EventNeedSubAdapter"
)
    .setComponent( EventNeedSubComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildText ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: {
                    eventName: "Raid Night",
                    startsAt: "1791057600",
                    voiceChannelId: "123456789",
                    stillNeeded: "2"
                }
            } );
    } )
    .getStartArgs( async( _context, _channel, argsFromManager ) => argsFromManager ?? {} )
    .build();

export { EventNeedSubAdapter };
