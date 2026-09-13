import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import { DynamicChannelPrivacyComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-component";
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { Message, VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

const PRIVACY_STATE_PUBLIC = "public",
    PRIVACY_STATE_PRIVATE = "private",
    PRIVACY_STATE_HIDDEN = "hidden";

/**
 * What each state reads as, for anything drawing this without a channel to ask.
 *
 * The same words the embed's own options put on screen - it maps the state onto them, and that
 * mapping is a function, so a preview cannot be handed it and has to be told the answer instead.
 */
const PREVIEW_STATE_VARS = {
    [ PRIVACY_STATE_PUBLIC ]: { state: "🌐 Public", stateMessage: "Everyone can join your channel." },
    [ PRIVACY_STATE_PRIVATE ]: { state: "🚫 Private", stateMessage: "Only trusted users can join your channel." },
    [ PRIVACY_STATE_HIDDEN ]: { state: "🙈 Hidden", stateMessage: "Only trusted users can see and join your channel." }
};

type DefaultInteraction =
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction |
    UIDefaultButtonChannelVoiceInteraction;

const DynamicChannelPrivacyAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelPrivacyAdapter"
)
    .setComponent( DynamicChannelPrivacyComponent )
    .setInitiatorElement( DynamicChannelPrivacyButton )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: PREVIEW_STATE_VARS.public,
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyMenuGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyEmbedGroup"
            } )
            .addState( "Public", {
                executionStep: "default",
                navigationType: "editReply",
                previewDefaultVars: PREVIEW_STATE_VARS.public,
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyMenuGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyEmbedGroup"
            } )
            .addState( "Private", {
                executionStep: "default",
                navigationType: "editReply",
                previewDefaultVars: PREVIEW_STATE_VARS.private,
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyMenuGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyEmbedGroup"
            } )
            .addState( "Hidden", {
                executionStep: "default",
                navigationType: "editReply",
                previewDefaultVars: PREVIEW_STATE_VARS.hidden,
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyMenuGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPrivacyEmbedGroup"
            } )
            // All three leave by the same menu, so what tells them apart is the option picked -
            // `privacyState`, the value the menu carries. The bot never reads these.
            .addTransition( "SetPublic", {
                from: [ "Default", "Private", "Hidden" ],
                to: "Public",
                mutations: [ { type: "set", path: [ "state" ] } ],
                previewCondition: { field: "privacyState", operator: "equals", value: PRIVACY_STATE_PUBLIC }
            } )
            .addTransition( "SetPrivate", {
                from: [ "Default", "Public", "Hidden" ],
                to: "Private",
                mutations: [ { type: "set", path: [ "state" ] } ],
                previewCondition: { field: "privacyState", operator: "equals", value: PRIVACY_STATE_PRIVATE }
            } )
            .addTransition( "SetHidden", {
                from: [ "Default", "Public", "Private" ],
                to: "Hidden",
                mutations: [ { type: "set", path: [ "state" ] } ],
                previewCondition: { field: "privacyState", operator: "equals", value: PRIVACY_STATE_HIDDEN }
            } )
            // Handler bindings (combines element-to-transition binding with handler)
            .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction>(
                "VertixBot/UI-V3/DynamicChannelPrivacyMenu",
                "SetPublic",
                async( context, interaction ) => {
                    const state = interaction.values[ 0 ];

                    context.setArgs( interaction, { state } );

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    await dynamicChannelService.editChannelPrivacyState(
                        interaction,
                        interaction.channel,
                        state as "public" | "private" | "hidden"
                    );

                    // Use triggerTransition based on selected state
                    switch ( state ) {
                        case "public":
                            await context.triggerTransition( "SetPublic", interaction );
                            break;
                        case "private":
                            await context.triggerTransition( "SetPrivate", interaction );
                            break;
                        case "hidden":
                            await context.triggerTransition( "SetHidden", interaction );
                            break;
                    }
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction ) => getArgsWithPermissions( interaction.channel ) )
    .getEditMessageArgs( async( _context, message?: Message<true> ) =>
        message ? getArgsWithPermissions( message.channel as VoiceChannel ) : {}
    )
    .build();

async function getArgsWithPermissions( channel: VoiceChannel ) {
    const args: UIArgs = {};
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const allowedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        true
    );

    args.allowedUsers = allowedUsers;
    args.blockedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        false
    );
    args.state = await dynamicChannelService.getChannelPrivacyState( channel );

    return args;
}

export { DynamicChannelPrivacyAdapter };
