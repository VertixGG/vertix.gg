import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";

import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";

import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelRenameComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-component";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { MasterChannelConfigInterface } from "@vertix.gg/data/src/interfaces/master-channel-config";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | UIDefaultModalChannelVoiceInteraction;

const DynamicChannelRenameAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelRenameAdapter"
)
    .setComponent( DynamicChannelRenameComponent )
    // Define transactions - states and transitions with automatic navigation
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            // States with their execution steps and navigation type
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { defaultChannelName: "{user}'s Channel" }
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameSuccess",
                navigationType: "ephemeral",
                previewDefaultVars: { channelName: "My Channel" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelRenameSuccessEmbedGroup"
            } )
            .addState( "Badword", {
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameBadword",
                navigationType: "ephemeral",
                previewDefaultVars: { badword: "example" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelRenameBadwordEmbedGroup"
            } )
            .addState( "RateLimited", {
                executionStep: "VertixBot/UI-V3/DynamicChannelRenameRateLimited",
                navigationType: "ephemeral",
                // `masterChannelMessage` is the embed's own optional tail - the offer of a fresh
                // channel to go to instead. Its logic picks the empty one when there is no master
                // channel to point at, and a preview has none, so it is declared empty here rather
                // than left to print its own name back at the reader.
                previewDefaultVars: {
                    retryAfter: "300",
                    masterChannelId: "123456789",
                    masterChannelMessage: "",
                    elapsedTimeFormatFraction: "5.0 minutes"
                },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelRenameLimitedEmbedGroup"
            } )
            // Transitions
            // The preview conditions restate, for anything demonstrating this outside Discord, the
            // branch the handler below takes on what the rename actually did. Read in declaration
            // order, first match wins, so the unconditional one comes last. The bot never reads them.
            .addTransition( "SubmitBadword", {
                from: "Default",
                to: "Badword",
                mutations: [ { type: "set", path: [ "badword" ] } ],
                // Every server keeps its own list of words it will not have, and the bot checks
                // against that list. There is no list to check outside the bot, so a demonstration
                // needs one word it can promise will be refused.
                previewCondition: { field: "name", operator: "contains", value: "noob" }
            } )
            .addTransition( "SubmitRateLimited", {
                from: "Default",
                to: "RateLimited",
                mutations: [
                    { type: "set", path: [ "retryAfter" ] },
                    { type: "set", path: [ "masterChannelId" ] }
                ],
                // Discord limits a channel to two renames every ten minutes, which is a clock and
                // not something typed, and not one anything outside the bot can read. A
                // demonstration counts the attempts instead, so the third one runs into the same
                // wall a third rename would.
                previewCondition: { field: "attempt", operator: "equals", value: "3" }
            } )
            .addTransition( "SubmitSuccess", { from: "Default", to: "Success" } )
            // Handler bindings (combines element-to-transition binding with handler)
            .bindModal<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelRenameModal",
                "SubmitSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultModalChannelVoiceInteraction;
                    const renameButtonId = context.customIdStrategy.generateId(
                        "VertixBot/UI-V3/DynamicChannelRenameAdapter:VertixBot/UI-V3/DynamicChannelRenameInput"
                    );

                    let newChannelName = voiceInteraction.fields.getTextInputValue( renameButtonId );
                    const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( voiceInteraction.channel.id );

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

                    newChannelName = await dynamicChannelService.getAssembledChannelNameTemplate(
                        voiceInteraction.channel,
                        voiceInteraction.user.id,
                        newChannelName
                    );

                    const result = await dynamicChannelService.editChannelName(
                        voiceInteraction,
                        voiceInteraction.channel,
                        newChannelName
                    );

                    // Use triggerTransition instead of manual ephemeralWithStep
                    switch ( result.code ) {
                        case "success":
                            await context.triggerTransition( "SubmitSuccess", voiceInteraction, {} );
                            break;

                        case "badword":
                            await context.triggerTransition( "SubmitBadword", voiceInteraction, {
                                badword: result.badword
                            } );
                            break;

                        case "rate-limit":
                            await context.triggerTransition( "SubmitRateLimited", voiceInteraction, {
                                retryAfter: result.retryAfter,
                                masterChannelId: masterChannelDB?.channelId
                            } );
                            break;
                    }
                }
            );
    } )
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
    .build();

export { DynamicChannelRenameAdapter };
