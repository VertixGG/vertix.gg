import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { VoiceChannel } from "discord.js";

import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelRegionComponent
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/region/dynamic-channel-region-component";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction =
    UIDefaultStringSelectMenuChannelVoiceInteraction
    | UIDefaultButtonChannelVoiceInteraction;

async function getArgs( channel: VoiceChannel ) {
    return {
        region: channel.rtcRegion,

        bitrate: channel.bitrate,

        // A property of the guild rather than a number written down here, so a server that boosts on
        // friday sees the wider menu on friday rather than after a deploy.
        maxBitrate: channel.guild.maximumBitrate
    };
}

/**
 * The region screen on a channel whose generator runs the older interface.
 *
 * `/voice region` used to answer that the feature was not in this interface, which was true - v2
 * printed a channel's region on its own message and gave nobody a way to change it. It is the same
 * two questions v3 asks on one screen, drawn with this version's own elements.
 *
 * Reached by the panel's region button and by the command, which is why it is not named after
 * either of them: one screen, two doors, the way v3 has always had it.
 */
const DynamicChannelRegionAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelRegionAdapter"
)
    .setComponent( DynamicChannelRegionComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "VertixBot/UI-V2/DynamicChannelRegion",
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
            .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelRegionSelectMenu",
                "SelectRegion",
                async( context, interaction ) => {
                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

                    await dynamicChannelService.editChannelRegion( interaction, interaction.channel, interaction.values[ 0 ] );

                    await context.triggerTransition( "SelectRegion", interaction );
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelBitrateSelectMenu",
                "SelectBitrate",
                async( context, interaction ) => {
                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

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
    .build();

export { DynamicChannelRegionAdapter };
