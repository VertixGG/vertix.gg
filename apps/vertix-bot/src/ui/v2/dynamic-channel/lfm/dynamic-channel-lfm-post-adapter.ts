import { ChannelType, PermissionsBitField } from "discord.js";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { DynamicChannelLfmPostComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/dynamic-channel-lfm-post-component";

import type { ButtonInteraction, TextChannel } from "discord.js";

interface DefaultInteraction extends ButtonInteraction<"cached"> {
    channel: TextChannel;
}

const DynamicChannelLfmPostAdapter = new ExecutionAdapterBuilder<TextChannel, DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelLfmPostAdapter"
)
    .setComponent( DynamicChannelLfmPostComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildText ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: {
                    channelId: "123456789",
                    channelName: "Leo's Channel",
                    ownerId: "123456789",
                    occupancy: "2/5",
                    gameName: "Valorant"
                }
            } );
    } )
    .getStartArgs( async( context, channel, argsFromManager ) => argsFromManager ?? {} )
    .getMessageContent( ( context, argsFromManager ) => String( argsFromManager?.pingContent ?? "" ) )
    .build();

export { DynamicChannelLfmPostAdapter };
