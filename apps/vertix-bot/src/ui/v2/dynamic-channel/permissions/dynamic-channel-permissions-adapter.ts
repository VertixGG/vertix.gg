import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelPermissionsComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-component";

import {
    DynamicChannelPermissionsAccessButton,
    DynamicChannelPermissionsStateButton,
    DynamicChannelPermissionsVisibilityButton
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/elements";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    definePermissionsAccessStates,
    getPermissionsAccessReplyArgs
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-access-states";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

async function onStateButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    switch ( await dynamicChannelService.getChannelState( interaction.channel ) ) {
        case "public":
            if ( !( await dynamicChannelService.editChannelState( interaction, interaction.channel, "private" ) ) ) {
                return await context.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                    {}
                );
            }

            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStatePrivate",
                {}
            );

        case "private":
            if ( !( await dynamicChannelService.editChannelState( interaction, interaction.channel, "public" ) ) ) {
                return await context.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                    {}
                );
            }

            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStatePublic",
                {}
            );

        default:
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                {}
            );
    }
}

async function onStateVisibilityClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    switch ( await dynamicChannelService.getChannelVisibilityState( interaction.channel ) ) {
        case "shown":
            if (
                !( await dynamicChannelService.editChannelVisibilityState(
                    interaction,
                    interaction.channel,
                    "hidden"
                ) )
            ) {
                return await context.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                    {}
                );
            }

            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateHidden",
                {}
            );

        case "hidden":
            if (
                !( await dynamicChannelService.editChannelVisibilityState(
                    interaction,
                    interaction.channel,
                    "shown"
                ) )
            ) {
                return await context.ephemeralWithStep(
                    interaction,
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                    {}
                );
            }

            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateShown",
                {}
            );

        default:
            return await context.ephemeralWithStep(
                interaction,
                "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                {}
            );
    }
}

async function onAccessButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    return await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelPermissionsAccess", {} );
}

const DynamicChannelPermissionsAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelPermissionsAdapter"
)
    .setComponent( DynamicChannelPermissionsComponent )
    .setExcludedElements( [
        DynamicChannelPermissionsAccessButton,
        DynamicChannelPermissionsStateButton,
        DynamicChannelPermissionsVisibilityButton
    ] )
    .defineTransactions( ( tx ) => {
        definePermissionsAccessStates( tx, { actedFrom: [ "Default", "Access" ] } )
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                previewDefaultVars: { state: "public" }
            } )
            .addState( "Private", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStatePrivate",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsPrivateEmbedGroup",
                navigationType: "ephemeral"
            } )
            .addState( "Public", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStatePublic",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsPublicEmbedGroup",
                navigationType: "ephemeral"
            } )
            .addState( "Hidden", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateHidden",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsHiddenEmbedGroup",
                navigationType: "ephemeral"
            } )
            .addState( "Shown", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateShown",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsShownEmbedGroup",
                navigationType: "ephemeral"
            } )
            .addState( "Granted", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsGranted",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsGrantedEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { userGrantedDisplayName: "User" }
            } )
            .addState( "Denied", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsDenied",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsDeniedEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { userDeniedDisplayName: "User" }
            } )
            .addState( "Blocked", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsBlocked",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsBlockedEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { userBlockedDisplayName: "User" }
            } )
            .addState( "Unblocked", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsUnBlocked",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsUnblockedEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { userUnBlockedDisplayName: "User" }
            } )
            .addState( "Kicked", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsKick",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsKickEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { userKickedDisplayName: "User" }
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateError",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup",
                navigationType: "ephemeral"
            } )
            .addState( "NothingChanged", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateNothingChanged",
                embedsGroup: "VertixBot/UI-General/NothingChangedEmbedGroup",
                navigationType: "ephemeral"
            } )
            .addState( "StaffMember", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsStateStaffMember",
                embedsGroup: "VertixBot/UI-General/StaffMemberEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { staffMemberDisplayName: "User" }
            } )
            .addTransition( "SetPrivate", { from: "Default", to: "Private" } )
            .addTransition( "SetPublic", { from: "Default", to: "Public" } )
            .addTransition( "SetHidden", { from: "Default", to: "Hidden" } )
            .addTransition( "SetShown", { from: "Default", to: "Shown" } )
            .addTransition( "ShowAccess", { from: "Default", to: "Access" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsStateButton",
                "SetPrivate",
                onStateButtonClicked
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton",
                "SetHidden",
                onStateVisibilityClicked
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton",
                "ShowAccess",
                onAccessButtonClicked
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( getPermissionsAccessReplyArgs )
    .build();

export { DynamicChannelPermissionsAdapter };
