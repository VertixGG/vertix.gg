import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { VERSION_UI_V2 } from "@vertix.gg/base/src/definitions/version";

import { DynamicChannelMetaRenameComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/rename/dynamic-channel-meta-rename-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | UIDefaultModalChannelVoiceInteraction;

const DynamicChannelMetaRenameAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelMetaRenameAdapter"
)
    .setComponent( DynamicChannelMetaRenameComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { defaultChannelName: "{username}'s Channel" }
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaRenameSuccess",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaRenameSuccessEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { channelName: "My Channel" }
            } )
            .addState( "Badword", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaRenameBadword",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaRenameBadwordEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { badword: "example" }
            } )
            .addState( "RateLimited", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaRenameRateLimited",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaRenameLimitedEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { retryAfter: "300", masterChannelId: "123456789" }
            } )
            .addTransition( "SubmitSuccess", { from: "Default", to: "Success" } )
            .addTransition( "SubmitBadword", {
                from: "Default",
                to: "Badword",
                mutations: [ { type: "set", path: [ "badword" ] } ]
            } )
            .addTransition( "SubmitRateLimited", {
                from: "Default",
                to: "RateLimited",
                mutations: [
                    { type: "set", path: [ "retryAfter" ] },
                    { type: "set", path: [ "masterChannelId" ] }
                ]
            } )
            .bindModal<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelMetaRenameModal",
                "SubmitSuccess",
                async( context, interaction ) => {
                    const renameButtonId = context.customIdStrategy.generateId(
                        "VertixBot/UI-V2/DynamicChannelMetaRenameAdapter:VertixBot/UI-V2/DynamicChannelMetaRenameInput"
                    );

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

                    let newChannelName = interaction.fields.getTextInputValue( renameButtonId ),
                        masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

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
                            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaRenameSuccess", {} );
                            break;

                        case "badword":
                            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaRenameBadword", {
                                badword: result.badword
                            } );
                            break;

                        case "rate-limit":
                            await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelMetaRenameRateLimited", {
                                retryAfter: result.retryAfter,
                                masterChannelId: masterChannelDB?.channelId // No worries embed handles this situation.
                            } );
                            break;
                    }
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args: UIArgs = {};

        // noinspection FallThroughInSwitc`hStatementJS
        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/DynamicChannelMetaRenameBadword":
                args.badword = argsFromManager?.badword;
                break;

            case "VertixBot/UI-V2/DynamicChannelMetaRenameRateLimited":
                args.masterChannelId = argsFromManager?.masterChannelId;
                args.retryAfter = argsFromManager?.retryAfter;
                break;

            default:
                const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

                if ( masterChannelDB ) {
                    args.defaultChannelName = await MasterChannelDataManager.$.getChannelNameTemplate( masterChannelDB, true );
                } else {
                    args.defaultChannelName = ConfigManager.$
                        .get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 )
                        .get( "settings" ).dynamicChannelNameTemplate;
                }

            case "VertixBot/UI-V2/DynamicChannelMetaRenameSuccess":
                args.channelName = interaction.channel.name;
                break;
        }

        return args;
    } )
    .build();

export { DynamicChannelMetaRenameAdapter };
