import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { TrialEndingComponent } from "@vertix.gg/bot/src/ui/general/trial-ending/trial-ending-component";

import type { ButtonInteraction, TextChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: TextChannel;
}

/**
 * The heads-up sent to a server's owner before its free trial runs out.
 *
 * A direct message with nothing to answer - its one button is a link - so it has a single state and
 * binds nothing. `GuildTrialWarningService` sends it.
 */
const TrialEndingAdapter = new ExecutionAdapterBuilder<TextChannel, DefaultInteraction>(
    "VertixBot/UI-General/TrialEndingAdapter"
)
    .setComponent( TrialEndingComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildText ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: {
                    guildName: "My Server",
                    planName: "Pro",
                    endsAt: "1791057600",
                    maxMasterChannels: "2",
                    monthlyPriceUsd: "4"
                }
            } );
    } )
    .getStartArgs( async( _context, _channel, argsFromManager ) => argsFromManager ?? {} )
    .build();

export { TrialEndingAdapter };
