import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelRenameComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | UIDefaultModalChannelVoiceInteraction;

const RENAME_STEPS = {
    default: {},
    "VertixBot/UI-V3/DynamicChannelRenameBadword": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelRenameBadwordEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelRenameSuccess": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelRenameSuccessEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelRenameRateLimited": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelRenameLimitedEmbedGroup"
    }
} as const;

const DynamicChannelRenameAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelRenameAdapter"
)
    .setComponent( DynamicChannelRenameComponent )
    .setExecutionSteps( RENAME_STEPS )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V3/DynamicChannelRenameBadword":
                args.badword = argsFromManager.badword;
                break;

            case "VertixBot/UI-V3/DynamicChannelRenameRateLimited":
                args.masterChannelId = argsFromManager.masterChannelId;
                args.retryAfter = argsFromManager.retryAfter;
                break;

            default: {
                const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

                if ( masterChannelDB ) {
                    args.defaultChannelName = await MasterChannelDataManager.$.getChannelNameTemplate( masterChannelDB, true );
                } else {
                    args.defaultChannelName = ConfigManager.$
                        .get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V3 )
                        .get( "settings" ).dynamicChannelNameTemplate;
                }
            }
            // fallthrough
            case "VertixBot/UI-V3/DynamicChannelRenameSuccess":
                args.channelName = interaction.channel.name;
                break;
        }

        return args;
    } )
    .onEntityMap( async( { bindModal } ) => {
        bindModal<UIDefaultModalChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelRenameModal",
            async( context, interaction ) => {
                const renameButtonId = context.customIdStrategy.generateId(
                    "VertixBot/UI-V3/DynamicChannelRenameAdapter:VertixBot/UI-V3/DynamicChannelRenameInput"
                );

                let newChannelName = interaction.fields.getTextInputValue( renameButtonId );
                const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

                const dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );

                newChannelName = await dynamicChannelService.getAssembledChannelNameTemplate(
                    interaction.channel,
                    interaction.user.id,
                    newChannelName
                );

                const result = await dynamicChannelService.editChannelName(
                    interaction,
                    interaction.channel,
                    newChannelName
                );

                switch ( result.code ) {
                    case "success":
                        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelRenameSuccess", {} );
                        break;

                    case "badword":
                        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelRenameBadword", {
                            badword: result.badword
                        } );
                        break;

                    case "rate-limit":
                        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelRenameRateLimited", {
                            retryAfter: result.retryAfter,
                            masterChannelId: masterChannelDB?.channelId
                        } );
                        break;
                }
            }
        );
    } )
    .build();

export { DynamicChannelRenameAdapter };
