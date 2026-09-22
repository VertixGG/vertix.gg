import { bitrateToKilobits } from "@vertix.gg/definitions/src/bitrate-definitions";
import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { splitTemplate } from "@vertix.gg/utils/src/button-rows";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";
import { DynamicChannelPermissionsComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/dynamic-channel-permissions-component";
import {
    DynamicChannelPermissionsAccessButton,
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/elements";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { VoiceChannel } from "discord.js";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

const DynamicChannelPermissionsAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelPermissionsAdapter"
)
    .setComponent( DynamicChannelPermissionsComponent )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            // States
            .addState( "Default", {
                executionStep: "default",
                previewDefaultVars: { state: "public" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
            } )
            .addState( "Granted", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsGranted",
                navigationType: "ephemeral",
                previewDefaultVars: { userGrantedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsGrantedEmbedGroup"
            } )
            .addState( "Denied", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsDenied",
                navigationType: "ephemeral",
                previewDefaultVars: { userDeniedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsDeniedEmbedGroup"
            } )
            .addState( "Blocked", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsBlocked",
                navigationType: "ephemeral",
                previewDefaultVars: { userBlockedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsBlockedEmbedGroup"
            } )
            .addState( "Unblocked", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked",
                navigationType: "ephemeral",
                previewDefaultVars: { userUnBlockedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsUnblockedEmbedGroup"
            } )
            .addState( "Kicked", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsKick",
                navigationType: "ephemeral",
                previewDefaultVars: { userKickedDisplayName: "User" },
                elementsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelPermissionsKickEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateError",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } )
            .addState( "NothingChanged", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateNothingChanged",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/NothingChangedEmbedGroup"
            } )
            .addState( "StaffMember", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPermissionsStateStaffMember",
                navigationType: "ephemeral",
                previewDefaultVars: { staffMemberDisplayName: "User" },
                embedsGroup: "VertixBot/UI-General/StaffMemberEmbedGroup"
            } )
            // Transitions - User access
            //
            // Privacy and visibility used to live here, in v2. They have their own adapter now, and
            // the transitions they left behind pointed at states this flow no longer declares - so
            // they are gone rather than standing as edges to nowhere.
            .addTransition( "GrantSuccess", {
                from: "Default",
                to: "Granted",
                mutations: [ { type: "set", path: [ "userGrantedDisplayName" ] } ]
            } )
            .addTransition( "DenySuccess", {
                from: "Default",
                to: "Denied",
                mutations: [ { type: "set", path: [ "userDeniedDisplayName" ] } ]
            } )
            .addTransition( "BlockSuccess", {
                from: "Default",
                to: "Blocked",
                mutations: [ { type: "set", path: [ "userBlockedDisplayName" ] } ]
            } )
            .addTransition( "UnblockSuccess", {
                from: "Default",
                to: "Unblocked",
                mutations: [ { type: "set", path: [ "userUnBlockedDisplayName" ] } ]
            } )
            .addTransition( "KickSuccess", {
                from: "Default",
                to: "Kicked",
                mutations: [ { type: "set", path: [ "userKickedDisplayName" ] } ]
            } )
            // Error transitions
            //
            // The preview conditions restate, for anything demonstrating this outside Discord, the
            // answers the handlers below get back from the service. Five menus leave this one state,
            // so each rule says which of them it belongs to; the others are not asked.
            .addTransition( "Error", { from: "Default", to: "Error" } )
            .addTransition( "NothingChanged", {
                from: "Default",
                to: "NothingChanged",
                // Taking away what was never given. `inTheList` is asked of the list the menu that
                // was used manages - trusted for one, blocked for the other - which is the single
                // "not-in-the-list" the service answers both of them with.
                previewCondition: {
                    field: "inTheList",
                    operator: "equals",
                    value: "no",
                    elements: [
                        "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu",
                        "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu"
                    ]
                }
            } )
            .addTransition( "StaffMember", {
                from: "Default",
                to: "StaffMember",
                mutations: [ { type: "set", path: [ "staffMemberDisplayName" ] } ],
                // Blocking and kicking are the two that refuse to touch a staff member; granting
                // and denying never ask.
                previewCondition: {
                    field: "staff",
                    operator: "equals",
                    value: "yes",
                    elements: [
                        "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu",
                        "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu"
                    ]
                }
            } )
            // Handler bindings (combines element-to-transition binding with handler)
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu",
                "GrantSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.editUserAccess(
                        voiceInteraction,
                        voiceInteraction.channel,
                        member,
                        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                        true
                    );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    // A refusal is not an error. `editUserAccess` says exactly why it did nothing -
                    // the member was the owner, the bot, a staff member, or already had access - and
                    // every one of those used to arrive here as "Something went wrong", which is the
                    // one thing that was not true. Only a genuine failure transitions to `Error`.
                    switch ( result ) {
                        case "success":
                            await context.triggerTransition( "GrantSuccess", voiceInteraction, {
                                userGrantedDisplayName: member.displayName
                            } );
                            break;
                        case "action-on-staff-user":
                            await context.triggerTransition( "StaffMember", voiceInteraction, {
                                staffMemberDisplayName: member.displayName
                            } );
                            break;
                        case "already-have":
                        case "self-edit":
                        case "action-on-bot-user":
                            await context.triggerTransition( "NothingChanged", voiceInteraction );
                            break;
                        default:
                            await context.triggerTransition( "Error", voiceInteraction );
                            break;
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu",
                "DenySuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.removeUserAccess(
                        voiceInteraction,
                        voiceInteraction.channel,
                        member
                    );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    switch ( result ) {
                        case "success":
                            await context.triggerTransition( "DenySuccess", voiceInteraction, {
                                userDeniedDisplayName: member.displayName
                            } );
                            break;
                        case "not-in-the-list":
                        case "self-deny":
                        case "user-blocked":
                        case "action-on-bot-user":
                            await context.triggerTransition( "NothingChanged", voiceInteraction );
                            break;
                        default:
                            await context.triggerTransition( "Error", voiceInteraction );
                            break;
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu",
                "BlockSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.editUserAccess(
                        voiceInteraction,
                        voiceInteraction.channel,
                        member,
                        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                        false
                    );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    switch ( result ) {
                        case "success":
                            await context.triggerTransition( "BlockSuccess", voiceInteraction, {
                                userBlockedDisplayName: member.displayName
                            } );
                            break;
                        case "action-on-staff-user":
                            await context.triggerTransition( "StaffMember", voiceInteraction, {
                                staffMemberDisplayName: member.displayName
                            } );
                            break;
                        case "already-have":
                        case "self-edit":
                        case "action-on-bot-user":
                            await context.triggerTransition( "NothingChanged", voiceInteraction );
                            break;
                        default:
                            await context.triggerTransition( "Error", voiceInteraction );
                            break;
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu",
                "UnblockSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.removeUserAccess(
                        voiceInteraction,
                        voiceInteraction.channel,
                        member,
                        true
                    );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    switch ( result ) {
                        case "success":
                            await context.triggerTransition( "UnblockSuccess", voiceInteraction, {
                                userUnBlockedDisplayName: member.displayName
                            } );
                            break;
                        case "not-in-the-list":
                        case "self-deny":
                        case "user-blocked":
                        case "action-on-bot-user":
                            await context.triggerTransition( "NothingChanged", voiceInteraction );
                            break;
                        default:
                            await context.triggerTransition( "Error", voiceInteraction );
                            break;
                    }
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu",
                "KickSuccess",
                async( context, interaction ) => {
                    const voiceInteraction = interaction as unknown as UIDefaultUserSelectMenuChannelVoiceInteraction;
                    const userId = voiceInteraction.values[ 0 ];
                    const member = voiceInteraction.guild.members.cache.get( userId ) || await voiceInteraction.guild.members.fetch( userId );

                    if ( !member ) {
                        await context.editReplyWithStep( voiceInteraction, "default" );
                        await context.triggerTransition( "Error", voiceInteraction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    const result = await dynamicChannelService.kickUser( voiceInteraction, voiceInteraction.channel, member );

                    // Refresh menu to show updated user list
                    await context.editReplyWithStep( voiceInteraction, "default" );

                    switch ( result ) {
                        case "success":
                            await context.triggerTransition( "KickSuccess", voiceInteraction, {
                                userKickedDisplayName: member.displayName
                            } );
                            break;
                        case "action-on-staff-user":
                            await context.triggerTransition( "StaffMember", voiceInteraction, {
                                staffMemberDisplayName: member.displayName
                            } );
                            break;
                        case "not-in-the-list":
                        case "self-action":
                        case "action-on-bot-user":
                            await context.triggerTransition( "NothingChanged", voiceInteraction );
                            break;
                        default:
                            await context.triggerTransition( "Error", voiceInteraction );
                            break;
                    }
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const channel = interaction.channel as VoiceChannel;
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        const args: UIArgs = {
            channelName: channel.name,
            userLimit: channel.userLimit,
            state: await dynamicChannelService.getChannelPrivacyState( channel ),
            channelId: channel.id,
            region: channel.rtcRegion,
            bitrate: bitrateToKilobits( channel.bitrate )
        };

        // `argsFromManager` carries what the transition that reached this step was given - the display
        // name of whoever was just granted, denied, blocked. It is only there when a transition has
        // just run, and this is reached at other times too: every handler below calls
        // `editReplyWithStep( …, "default" )` to refresh the user list *before* firing its own
        // transition, which rebuilds the reply while the machine is still parked on the step the
        // previous action left it on. Reading the name unconditionally threw a TypeError there -
        // press deny after a grant and the step was still `…PermissionsGranted` with nothing to read
        // - and the throw left the interaction unanswered, so discord showed its own red error in
        // place of the menu.
        //
        // Absent, the name is simply not set, and the embed falls back to what it renders without one.
        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V3/DynamicChannelPermissionsGranted":
                if ( argsFromManager?.userGrantedDisplayName ) {
                    args.userGrantedDisplayName = argsFromManager.userGrantedDisplayName;
                }
                break;
            case "VertixBot/UI-V3/DynamicChannelPermissionsDenied":
                if ( argsFromManager?.userDeniedDisplayName ) {
                    args.userDeniedDisplayName = argsFromManager.userDeniedDisplayName;
                }
                break;
            case "VertixBot/UI-V3/DynamicChannelPermissionsBlocked":
                if ( argsFromManager?.userBlockedDisplayName ) {
                    args.userBlockedDisplayName = argsFromManager.userBlockedDisplayName;
                }
                break;
            case "VertixBot/UI-V3/DynamicChannelPermissionsUnBlocked":
                if ( argsFromManager?.userUnBlockedDisplayName ) {
                    args.userUnBlockedDisplayName = argsFromManager.userUnBlockedDisplayName;
                }
                break;
            case "VertixBot/UI-V3/DynamicChannelPermissionsKick":
                if ( argsFromManager?.userKickedDisplayName ) {
                    args.userKickedDisplayName = argsFromManager.userKickedDisplayName;
                }
                break;
        }

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );
        if ( masterChannelDB ) {
            const templateButtons = await MasterChannelDataManager.$.getChannelButtonsTemplate(
                masterChannelDB,
                false
            );

            // Left in the order it was saved in: this array is what orders the buttons and the
            // legend drawn above them, so sorting it here would throw away the arrangement an
            // admin made. A copy, since the buttons are rearranged per channel downstream.
            // The stored list carries its own row divisions, so the ids and the arrangement come
            // out of the one array rather than from a second field beside it.
            const stored = splitTemplate( templateButtons ?? [] );

            args.dynamicChannelButtonsTemplate = stored.ids.length
                ? stored.ids
                : DynamicChannelPrimaryMessageElementsGroup.getDefaults().map( item => item.getId() );

            args.dynamicChannelButtonsRowBreaks = stored.rowBreaks;

            const accessButtonId = DynamicChannelPrimaryMessageElementsGroup.getByName(
                DynamicChannelPermissionsAccessButton.getName()
            )?.getId();
            args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
                ( buttonId: string ) => buttonId === accessButtonId
            );
        } else {
            args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.getDefaults().map( item => item.getId() );
            const accessButtonId = DynamicChannelPrimaryMessageElementsGroup.getByName(
                DynamicChannelPermissionsAccessButton.getName()
            )?.getId();
            args.dynamicChannelButtonsIsAccessButtonAvailable = args.dynamicChannelButtonsTemplate.some(
                ( buttonId: string ) => buttonId === accessButtonId
            );
        }

        Object.assign( args, await getUsersWithPermissions( channel ) );
        return args;
    } )
    .build();

async function getUsersWithPermissions( channel: VoiceChannel ) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
    const allowed = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        true
    );
    const blocked = await dynamicChannelService.getChannelUsersWithPermissionState(
        channel,
        DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
        false
    );

    return {
        allowedUsers: allowed,
        blockedUsers: blocked
    };
}

export { DynamicChannelPermissionsAdapter };
