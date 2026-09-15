import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import {
    DynamicChannelElementsGroup
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import {
    onBlockSelected,
    onDenySelected,
    onGrantSelected,
    onKickSelected,
    onUnBlockSelected
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-menu-handlers";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";

type PermissionsInteraction =
    | UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultButtonChannelVoiceInteraction;

type PermissionsTransactions = TransactionBuilder<IExecutionAdapterContext<PermissionsInteraction, UIArgs>>;

/**
 * Function definePermissionsAccessStates() :: Who may come in, and every answer to changing that.
 *
 * Shared by the permissions interface, where access sits behind a button on the privacy screen, and
 * by the one `/voice access` opens, which starts on it. That difference is the whole difference:
 * both draw the same five menus and both answer with the same six screens.
 *
 * `actedFrom` is which of the caller's own states those menus are reachable from - the permissions
 * interface leaves them on its first screen as well as on the access one, and a command has only
 * the access one. It changes nothing the bot does, a transition resolving by name wherever it was
 * triggered, but it is what the exported flow draws.
 */
export function definePermissionsAccessStates(
    tx: PermissionsTransactions,
    options: { actedFrom: string | string[] }
) {
    const { actedFrom } = options;

    tx
        .addState( "Access", {
            executionStep: "VertixBot/UI-V2/DynamicChannelPermissionsAccess",
            elementsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup",
            embedsGroup: "VertixBot/UI-V2/DynamicChannelPermissionsAccessEmbedGroup",
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
        .addTransition( "GrantAccess", {
            from: actedFrom,
            to: "Granted",
            mutations: [ { type: "set", path: [ "userGrantedDisplayName" ] } ]
        } )
        .addTransition( "DenyAccess", {
            from: actedFrom,
            to: "Denied",
            mutations: [ { type: "set", path: [ "userDeniedDisplayName" ] } ]
        } )
        .addTransition( "BlockUser", {
            from: actedFrom,
            to: "Blocked",
            mutations: [ { type: "set", path: [ "userBlockedDisplayName" ] } ]
        } )
        .addTransition( "UnblockUser", {
            from: actedFrom,
            to: "Unblocked",
            mutations: [ { type: "set", path: [ "userUnBlockedDisplayName" ] } ]
        } )
        .addTransition( "KickUser", {
            from: actedFrom,
            to: "Kicked",
            mutations: [ { type: "set", path: [ "userKickedDisplayName" ] } ]
        } )
        .addTransition( "Error", { from: actedFrom, to: "Error" } )
        .addTransition( "NothingChanged", { from: actedFrom, to: "NothingChanged" } )
        .addTransition( "StaffMember", {
            from: actedFrom,
            to: "StaffMember",
            mutations: [ { type: "set", path: [ "staffMemberDisplayName" ] } ]
        } )
        .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsGrantMenu",
            "GrantAccess",
            onGrantSelected
        )
        .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsDenyMenu",
            "DenyAccess",
            onDenySelected
        )
        .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsBlockMenu",
            "BlockUser",
            onBlockSelected
        )
        .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsUnblockMenu",
            "UnblockUser",
            onUnBlockSelected
        )
        .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelPermissionsKickMenu",
            "KickUser",
            onKickSelected
        );

    return tx;
}

/**
 * Function getPermissionsAccessReplyArgs() :: Everything the access screen needs to draw itself.
 *
 * Three things, and leaving out any one of them breaks the screen quietly rather than loudly:
 *
 * The name of whoever was just acted on, which the outcome screens print - and which one they print
 * depends on which outcome it is.
 *
 * Who currently has access and who is blocked, which the access screen lists.
 *
 * And whether the access button is in this generator's button template, because all five menus ask
 * that of themselves in `isAvailable()`. Absent, it reads `undefined`, the menus draw nothing, and
 * a member gets the embed with no way to act on it - which is the whole reason this is shared
 * rather than written out per adapter.
 */
export async function getPermissionsAccessReplyArgs(
    context: IExecutionAdapterContext<PermissionsInteraction, UIArgs>,
    interaction: PermissionsInteraction,
    argsFromManager?: UIArgs
): Promise<UIArgs> {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const args: UIArgs = {};

    switch ( context.getCurrentExecutionStep( interaction )?.name ) {
        case "VertixBot/UI-V2/DynamicChannelPermissionsGranted":
            args.userGrantedDisplayName = argsFromManager?.userGrantedDisplayName;
            break;

        case "VertixBot/UI-V2/DynamicChannelPermissionsDenied":
            args.userDeniedDisplayName = argsFromManager?.userDeniedDisplayName;
            break;

        case "VertixBot/UI-V2/DynamicChannelPermissionsBlocked":
            args.userBlockedDisplayName = argsFromManager?.userBlockedDisplayName;
            break;

        case "VertixBot/UI-V2/DynamicChannelPermissionsUnBlocked":
            args.userUnBlockedDisplayName = argsFromManager?.userUnBlockedDisplayName;
            break;

        case "VertixBot/UI-V2/DynamicChannelPermissionsKick":
            args.userKickedDisplayName = argsFromManager?.userKickedDisplayName;
            break;

        case "VertixBot/UI-V2/DynamicChannelPermissionsStateStaffMember":
            args.staffMemberDisplayName = argsFromManager?.staffMemberDisplayName;
            break;
    }

    const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channel.id );

    if ( masterChannelDB ) {
        args.dynamicChannelButtonsTemplate = await MasterChannelDataManager.$.getChannelButtonsTemplate(
            masterChannelDB,
            false
        );

        // Runs over all dynamic-channel buttons that are configured by the user(Master Channel)
        // And determine if accessButtonId is enabled , since all other "permissions" buttons are depends on the access button
        // TODO: This mechanism is broken, and it should be reworked.
        // Keep in mind that is only for version V2, and consider the effort to rework it.
        const accessButtonId = DynamicChannelElementsGroup.getByName(
            "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton"
        )?.getId();

        args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
            ( buttonId: number ) => buttonId.toString() === accessButtonId?.toString()
        );
    }

    args.allowedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
        interaction.channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        true
    );
    args.blockedUsers = await dynamicChannelService.getChannelUsersWithPermissionState(
        interaction.channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        false
    );

    return args;
}
