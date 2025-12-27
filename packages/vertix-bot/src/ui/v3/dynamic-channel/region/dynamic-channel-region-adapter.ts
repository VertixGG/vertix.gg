import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { VoiceChannel } from "discord.js";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelRegionButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-button";

import { DynamicChannelRegionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-component";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

const REGION_STEPS = {
    default: {
        elementsGroup: DynamicChannelRegionComponent.getDefaultElementsGroup(),
        embedsGroup: DynamicChannelRegionComponent.getDefaultEmbedsGroup()
    }
} as const;

async function getArgs( channel: VoiceChannel ) {
    return {
        region: channel.rtcRegion
    };
}

async function onRegionSelected(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const newRegion = interaction.values[ 0 ];

    await dynamicChannelService.editChannelRegion( interaction, interaction.channel, newRegion );

    await context.editReply( interaction );
}

const DynamicChannelRegionAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelRegionAdapter"
)
    .setComponent( DynamicChannelRegionComponent )
    .setExecutionSteps( REGION_STEPS )
    .setInitiatorElement( DynamicChannelRegionButton )
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
    .onEntityMap( async( { bindUserSelectMenu } ) => {
        bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelRegionSelectMenu",
            onRegionSelected,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/DynamicChannelRegionFlow",
                        transition: "VertixBot/UI-V3/DynamicChannelRegionFlow/Transitions/SelectRegion",
                        mutations: [
                            { type: "set", path: [ "region" ] }
                        ],
                        navigation: {
                            targetState: "VertixBot/UI-V3/DynamicChannelRegionFlow/States/Default",
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
    } )
    .build();

export { DynamicChannelRegionAdapter };
