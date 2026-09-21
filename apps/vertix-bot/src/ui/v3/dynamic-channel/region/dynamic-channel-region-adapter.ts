import { bitrateToKilobits } from "@vertix.gg/definitions/src/bitrate-definitions";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { VoiceChannel } from "discord.js";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelRegionButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-button";

import { DynamicChannelRegionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-component";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction =
    UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelVoiceInteraction
    | UIDefaultButtonChannelVoiceInteraction;

async function getArgs( channel: VoiceChannel ) {
    return {
        region: channel.rtcRegion,

        // What the channel is, rather than what the menu would offer it - a server that lost a boost
        // keeps the channels it already set, so the two can honestly disagree.
        bitrate: bitrateToKilobits( channel.bitrate ),

        // A property of the guild rather than a number written down here, so a server that boosts on
        // friday sees the wider menu on friday rather than after a deploy.
        maxBitrate: channel.guild.maximumBitrate
    };
}

const DynamicChannelRegionAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelRegionAdapter"
)
    .setComponent( DynamicChannelRegionComponent )
    .setInitiatorElement( DynamicChannelRegionButton )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                navigationType: "editReply",
                // What the embed prints, not the value behind it: its own options map turns
                // `us-west` into "US West", and that mapping is a function a preview cannot be
                // handed. A channel nobody has touched is on the automatic one.
                previewDefaultVars: { region: "Automatic", bitrate: "64" },
                elementsGroup: DynamicChannelRegionComponent.getDefaultElementsGroup(),
                embedsGroup: DynamicChannelRegionComponent.getDefaultEmbedsGroup()
            } )
            .addTransition( "SelectRegion", {
                from: "Default",
                to: "Default",
                mutations: [ { type: "set", path: [ "region" ] } ]
            } )
            .addTransition( "SelectBitrate", {
                from: "Default",
                to: "Default",
                mutations: [ { type: "set", path: [ "bitrate" ] } ]
            } )
            // Handler bindings (combines element-to-transition binding with handler)
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelRegionSelectMenu",
                "SelectRegion",
                async( context, interaction ) => {
                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const newRegion = interaction.values[ 0 ];

                    await dynamicChannelService.editChannelRegion( interaction, interaction.channel, newRegion );

                    await context.triggerTransition( "SelectRegion", interaction );
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelBitrateSelectMenu",
                "SelectBitrate",
                async( context, interaction ) => {
                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

                    // Handed on as the menu wrote it. What `inherit` resolves to, and whether the
                    // guild still allows what was picked, are the service's to answer - the same
                    // division `auto` is answered under.
                    await dynamicChannelService.editChannelBitrate( interaction, interaction.channel, interaction.values[ 0 ] );

                    await context.triggerTransition( "SelectBitrate", interaction );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( _context, interaction ) => {
        if ( interaction.channel instanceof VoiceChannel ) {
            return await getArgs( interaction.channel );
        }
        return {};
    } )
    .getEditMessageArgs( async( _context, message ) => {
        return message?.channel && message.channel instanceof VoiceChannel ? await getArgs( message.channel ) : {};
    } )
    .build();

export { DynamicChannelRegionAdapter };
