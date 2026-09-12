import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";
import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";
import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";
import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR, UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";
import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import { warnOnMissingLogsChannelPermissions } from "@vertix.gg/bot/src/ui/general/logs-channel/logs-channel-utils";

import {
    verifiedRolesFromEveryoneRole,
    verifiedRolesFromSelectedRoles
} from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-utils";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";
import { DeleteButton } from "@vertix.gg/bot/src/ui/general/decision/delete-button";
import { DeleteConfirmModal } from "@vertix.gg/bot/src/ui/general/decision/delete-confirm-modal";
import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/general/config-extras/config-extras-select-menu";
import { ChannelNameTemplateModal } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-modal";
import { LogChannelSelectMenu } from "@vertix.gg/bot/src/ui/v3/logs-channel/log-channel-select-menu";
import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-select-menu";
import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";
import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-everyone-select-menu";
import { StaffRolesMenu } from "@vertix.gg/bot/src/ui/general/staff-roles/staff-roles-menu";
import { VoiceRoleMenu } from "@vertix.gg/bot/src/ui/general/server-options/voice-role-menu";
import { DefaultPrivacyStateMenu } from "@vertix.gg/bot/src/ui/general/master-defaults/default-privacy-state-menu";
import { DefaultPrivacyResetButton } from "@vertix.gg/bot/src/ui/general/master-defaults/default-privacy-reset-button";
import { DefaultUserLimitInheritButton } from "@vertix.gg/bot/src/ui/general/master-defaults/default-user-limit-inherit-button";
import { DefaultUserLimitMenu } from "@vertix.gg/bot/src/ui/general/master-defaults/default-user-limit-menu";
import { warnOnUnassignableVoiceRole } from "@vertix.gg/bot/src/ui/general/server-options/voice-role-utils";
import { SetupEditButtonsRoleSelectMenu } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-role-select-menu";
import { SetupEditButtonsScopeSelectMenu, SCOPE_DEFAULT_VALUE } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-scope-select-menu";
import { SetupEditButtonsUpdateExistingButton } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-update-existing-button";
import { SetupEditButtonsClearRoleOverrideButton } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-clear-role-override-button";
import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";
import { SetupEditSelectEditOptionMenu } from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-select-edit-option-menu";

import {
    SETUP_EDIT_BUTTONS_EMBED_VARS,
    SETUP_EDIT_VERIFIED_ROLES_EMBED_VARS,
    SETUP_EDIT_STAFF_ROLES_EMBED_VARS,
    SETUP_EDIT_VOICE_ROLE_EMBED_VARS,
    SETUP_EDIT_DEFAULT_PRIVACY_EMBED_VARS,
    SETUP_EDIT_DEFAULT_USER_LIMIT_EMBED_VARS,
    SETUP_EDIT_EMBED_VARS
} from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-definitions";

import type { ChannelExtended } from "@vertix.gg/data/src/models/channel/channel-client-extend";

import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

import type { VoiceChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    ChannelPrivacyStateDefault,
    MasterChannelConfigInterfaceV3
} from "@vertix.gg/data/src/interfaces/master-channel-config";
import type { ChannelCleanupService } from "@vertix.gg/bot/src/services/channel-cleanup-service";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultChannelSelectMenuChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type UIService from "@vertix.gg/gui/src/ui-service";

type Interactions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultChannelSelectMenuChannelTextInteraction
    | UIDefaultModalChannelTextInteraction;

const V2_TO_V3_BUTTON_IDS: Record<string, string> = {
    "0": "rename",
    "1": "limit",
    "2": "clear-chat",
    "3": "privacy",
    "4": "privacy",
    "5": "access",
    "6": "rest-channel",
    "7": "transfer",
    "8": "claim-button"
};

/**
 * Function migrateV2Buttons() :: Turns a stored button list into ids this version knows.
 *
 * V2 wrote numbers, V3 writes slugs, and either can be sitting in a settings row. The unknown-id
 * filter runs on every list rather than only on the ones that start with a number - an id this
 * version dropped would otherwise reach the screen and print as its own raw value.
 */
function migrateV2Buttons( buttons: ( string | number )[] | undefined | null ): string[] {
    if ( ! buttons ) {
        return [];
    }

    return Array.from(
        new Set( buttons.map( ( button ) => V2_TO_V3_BUTTON_IDS[ button.toString() ] ?? button.toString() ) )
    ).filter( ( id ) => undefined !== DynamicChannelPrimaryMessageElementsGroup.getById( id ) );
}

const ROSTER_LIMIT = 15;

const SetupEditButtonsEmbed = new EmbedBuilder<UIArgs, typeof SETUP_EDIT_BUTTONS_EMBED_VARS>( "VertixBot/UI-V3/SetupEditButtonsEmbed", SETUP_EDIT_BUTTONS_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🎚  Buttons Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        `${ v.scopeDisplay }\n\n` +
        `${ v.listHeadingDisplay }\n${ v.buttonsList }\n\n` +
        `${ v.rosterHeading }\n${ v.rosterDisplay }\n\n` +
        v.hintDisplay
    )
    .setFooterText( () =>
        "Every pick is saved straight away. Channels that are already open keep their buttons " +
        "until you press Update Existing Channels."
    )
    .setOptions( ( v ) => ( {
        buttonsNone: "> - *None. Owners would see a panel with no buttons on it.*",

        rosterHeading: "**Roles with buttons of their own**",

        rosterButtonsWord: "Buttons",

        panelNote: "Role sets reach only the panel inside the voice channel. A **control-panel** channel always shows the default set.",

        rosterMore: `> - *… and ${ v.rosterMoreCount } more. Every one of them is in the top menu.*`,

        scopeDisplay: {
            [ v.scopeDefault ]:
                `**You are editing the default buttons of <#${ v.masterChannelId }>.**\n` +
                "Whoever owns a channel created here sees these buttons — unless they have one of " +
                "the roles listed further down, which replaces this set for them.",
            [ v.scopeDefaultVerified ]:
                `**You are editing the default buttons of <#${ v.masterChannelId }>.**\n` +
                `Only ${ v.verifiedRolesList } can open a channel here, so these are the buttons ` +
                "their owners see — unless they also have one of the roles listed further down, " +
                "which replaces this set for them.",
            [ v.scopeRoleOwn ]:
                `**You are editing the buttons for <@&${ v.roleId }>.**\n` +
                "An owner who has this role sees these buttons **instead of** the default set. " +
                "Every other owner keeps the default set, and it is not changed.\n" +
                v.panelNote,
            [ v.scopeRoleNew ]:
                `**<@&${ v.roleId }> has no buttons of its own yet.**\n` +
                "Its owners follow the default set, which is what is ticked in the button menu " +
                "right now. Tick or untick anything and this role gets a set of its own from that " +
                "moment on — the default set stays exactly as it is.\n" +
                v.panelNote,
            [ v.scopeRoleMissing ]:
                "**This role no longer exists on this server.**\n" +
                "Nobody can have it, so its saved buttons never reach anyone. Press " +
                "**Use The Default For This Role** to clear it away."
        },

        listHeadingDisplay: {
            [ v.listDefault ]: "**On every panel**",
            [ v.listRoleOwn ]: "**On the panel of an owner who has this role**",
            [ v.listRoleNew ]: "**The default set — change it here to turn it into this role's own set**"
        },

        rosterDisplay: {
            [ v.rosterNone ]:
                "> - *None yet. Every owner gets the default set.*\n" +
                "> - *For example: let one role claim and reset channels while everyone else can only rename.*",
            [ v.rosterOne ]: v.rosterList,
            [ v.rosterMany ]:
                `${ v.rosterList }\nAn owner who has two of these roles gets the set of whichever ` +
                "role sits higher in **Server Settings → Roles**."
        },

        hintDisplay: {
            [ v.hintDefault ]:
                "To give one role a different set, pick it in **➕ Give a role its own buttons**.",
            [ v.hintRoleOwn ]:
                "**Use The Default For This Role** deletes this set and puts its owners back on the default one.",
            [ v.hintRoleNew ]:
                "Nothing is saved for this role until you change a button.",
            [ v.hintEveryone ]:
                "⚠️ **@everyone** cannot have a set of its own — every member has that role, so its " +
                "set would replace the default one for every single owner. Edit the default set " +
                "instead, or pick a narrower role.",
            [ v.hintPushed ]:
                "✅ Sent to every channel this master channel has open. Each one now shows the set " +
                "its own owner should get."
        }
    } ) )
    .setArrayOptions( {
        buttonsList: {
            format: "> - {value}{separator}",
            separator: "\n",
            options: {
                "rename": EmojiManager.getToken( "ChannelRename" ) + "  ∙ **Rename**",
                "limit": EmojiManager.getToken( "UserLimit" ) + " ∙ **User Limit**",
                "access": EmojiManager.getToken( "ChannelPermissions" ) + " ∙ **Access**",
                "invite": EmojiManager.getToken( "InviteChannel" ) + " ∙ **Invite**",
                "privacy": EmojiManager.getToken( "ChannelPrivacy" ) + " ∙ **Privacy**",
                "region": EmojiManager.getToken( "ChannelRegion" ) + " ∙ **Region**",
                "edit-primary-message": EmojiManager.getToken( "EditChannelMessage" ) + " ∙ **Edit Primary Message**",
                "clear-chat": EmojiManager.getToken( "ClearChat" ) + " ∙ **Clear Chat**",
                "rest-channel": EmojiManager.getToken( "ResetChannel" ) + "  ∙ **Reset**",
                "transfer": EmojiManager.getToken( "TransferChannel" ) + " ∙ **Transfer**",
                "templates": EmojiManager.getToken( "ChannelTemplates" ) + " ∙ **Templates**",
                "status": EmojiManager.getToken( "Megaphone" ) + " ∙ **Status**",
                "claim-button": EmojiManager.getToken( "ClaimChannel" ) + " ∙ **Claim**",
                "knock": EmojiManager.getToken( "KnockChannel" ) + " ∙ **Knock**"
            }
        }
    } )
    .setLogic( ( args, v ) => {
        const roleId = ( args.dynamicChannelButtonsRoleId as string | null | undefined ) ?? null,
            notice = ( args.dynamicChannelButtonsNotice as string | null | undefined ) ?? null,
            selected = ( args.dynamicChannelButtonsTemplate as string[] | undefined ) ?? [],
            byRole = ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {},
            meta = ( args.dynamicChannelButtonsRoleMeta as { id: string; name: string; position: number }[] | undefined ) ?? [];

        const known = new Set( meta.map( ( role ) => role.id ) ),
            hasOwnSet = Boolean( roleId ) && Boolean( byRole[ roleId as string ]?.length ),
            isMissingRole = Boolean( roleId ) && ! known.has( roleId as string );

        // A count rather than the buttons themselves: an emoji token is around thirty six
        // characters, so a roster of them reaches several kilobytes and discord rejects the whole
        // message rather than trimming it.
        const total = DynamicChannelPrimaryMessageElementsGroup.getAll().length,
            rosterIds = Object.keys( byRole ).filter( ( id ) => byRole[ id ]?.length );

        rosterIds.sort( ( a, b ) => {
            const roleA = meta.find( ( role ) => role.id === a ),
                roleB = meta.find( ( role ) => role.id === b );

            if ( ! roleA !== ! roleB ) {
                return roleA ? 1 : -1;
            }

            return ( roleB?.position ?? 0 ) - ( roleA?.position ?? 0 );
        } );

        const shown = rosterIds.slice( 0, ROSTER_LIMIT ),
            remaining = rosterIds.length - shown.length;

        const rosterLines = shown.map(
            ( id ) => `> - <@&${ id }> — ${ v.rosterButtonsWord }: ${ byRole[ id ].length } / ${ total }`
        );

        if ( remaining > 0 ) {
            rosterLines.push( v.rosterMore );
        }

        // Only the verified roles can open a channel here, so "everyone" would be a lie whenever
        // the audience is narrower than the server.
        const verifiedRoles = ( args.dynamicChannelVerifiedRoles as string[] | undefined ) ?? [],
            isEveryoneAudience = Boolean( args.dynamicChannelIncludeEveryoneRole ) || ! verifiedRoles.length;

        let scopeDisplay: string = isEveryoneAudience ? v.scopeDefault : v.scopeDefaultVerified,
            listHeadingDisplay: string = v.listDefault,
            hintDisplay: string = v.hintDefault;

        if ( roleId ) {
            scopeDisplay = isMissingRole ? v.scopeRoleMissing : ( hasOwnSet ? v.scopeRoleOwn : v.scopeRoleNew );
            listHeadingDisplay = hasOwnSet || isMissingRole ? v.listRoleOwn : v.listRoleNew;
            hintDisplay = hasOwnSet || isMissingRole ? v.hintRoleOwn : v.hintRoleNew;
        }

        // The notice replaces the closing line for one render. It has to be set on every handler,
        // because args merge per key and a value left behind would pin the notice to the screen.
        if ( "everyone" === notice ) {
            hintDisplay = v.hintEveryone;
        } else if ( "pushed" === notice ) {
            hintDisplay = v.hintPushed;
        }

        let rosterDisplay: string = v.rosterNone;

        if ( rosterIds.length > 1 ) {
            rosterDisplay = v.rosterMany;
        } else if ( rosterIds.length ) {
            rosterDisplay = v.rosterOne;
        }

        return {
            index: ( args.index as number || 0 ) + 1,
            masterChannelId: ( args.masterChannelId as string | undefined ) ?? "",
            roleId: roleId ?? "",
            scopeDisplay,
            verifiedRolesList: verifiedRoles.map( ( id ) => `<@&${ id }>` ).join( ", " ),
            listHeadingDisplay,
            // The array form lets the translated button names apply. An empty one would render as
            // a blank line, so the guard sentence is passed as a plain string instead.
            buttonsList: selected.length ? selected : v.buttonsNone,
            rosterHeading: v.rosterHeading,
            rosterDisplay,
            rosterList: rosterLines.join( "\n" ),
            rosterMoreCount: remaining,
            hintDisplay
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditVerifiedRolesEmbed = new EmbedBuilder( "VertixBot/UI-V3/SetupEditVerifiedRolesEmbed", SETUP_EDIT_VERIFIED_ROLES_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🛡️  Edit Verified Roles Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        `Editing verified roles will impact the dynamic channels created by Master Channel #${ v.index }.\n\n` +
        "Leaving it empty falls back to the server wide verified roles.\n\n" +
        `**_Current Verified Roles_**\n\n> ${ v.verifiedRolesDisplay }`
    )
    .setFooterText( () =>
        "Note: The changes will only affect dynamic channels that change their state after the editing, the old roles in the channel will be be unchanged."
    )
    .setOptions( ( v ) => ( {
        verifiedRolesDisplay: {
            [ v.verifiedRoles ]: v.verifiedRoles,
            [ v.verifiedRolesGuild ]: `${ v.verifiedRoles } *(from the server options)*`
        }
    } ) )
    .setArrayOptions( {
        verifiedRoles: {
            format: "<@&{value}>{separator}",
            separator: ", "
        }
    } )
    .setLogic( ( args, v ) => {
        const ownRoles = ( args.dynamicChannelVerifiedRoles as string[] ) || [],
            guildRoles = ( args.guildVerifiedRoleIds as string[] ) || [];

        return {
            index: ( args.index || 0 ) + 1,
            verifiedRoles: ownRoles.length ? ownRoles : guildRoles,
            verifiedRolesDisplay: ownRoles.length ? v.verifiedRoles : v.verifiedRolesGuild
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditStaffRolesEmbed = new EmbedBuilder<UIArgs, typeof SETUP_EDIT_STAFF_ROLES_EMBED_VARS>( "VertixBot/UI-V3/SetupEditStaffRolesEmbed", SETUP_EDIT_STAFF_ROLES_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🔑  Edit Staff Roles Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        "Staff roles are the mirror of the verified roles: the verified roles are the audience a channel can shut out, the staff roles are the ones it never can.\n\n" +
        `A role selected here keeps access to every dynamic channel of Master Channel #${ v.index }, whatever privacy state its owner picks - so a moderator can reach a private or hidden channel without being let in one at a time.\n\n` +
        "Leaving it empty falls back to the server wide staff roles.\n\n" +
        `**_Current Staff Roles_**\n\n> ${ v.staffRolesDisplay }`
    )
    .setFooterText( () =>
        "Note: The changes are applied immediately to the existing dynamic channels."
    )
    .setOptions( ( v ) => ( {
        staffRolesDisplay: {
            [ v.staffRoles ]: v.staffRoles,
            [ v.staffRolesGuild ]: `${ v.staffRoles } *(from the server options)*`,
            [ v.staffRolesNone ]: "**None** *(from the server options)*"
        }
    } ) )
    .setArrayOptions( {
        staffRoles: {
            format: "<@&{value}>{separator}",
            separator: ", "
        }
    } )
    .setLogic( ( args, v ) => {
        const ownRoles = ( args.dynamicChannelStaffRoles as string[] ) || [],
            guildRoles = ( args.guildStaffRoleIds as string[] ) || [];

        const staffRoles = ownRoles.length ? ownRoles : guildRoles;

        return {
            index: ( args.index || 0 ) + 1,
            ...( staffRoles.length ? { staffRoles } : {} ),
            staffRolesDisplay: ownRoles.length
                ? v.staffRoles
                : ( guildRoles.length ? v.staffRolesGuild : v.staffRolesNone )
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditEmbed = new EmbedBuilder<UIArgs, typeof SETUP_EDIT_EMBED_VARS>( "VertixBot/UI-V3/SetupEditEmbed", SETUP_EDIT_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🔧  Configure Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        "Configure master channel according to your preferences.\n\n" +
        "**_🎛️ General_**\n\n" +
        `➤ ∙ Name: <#${ v.masterChannelId }>\n` +
        `➤ ∙ Channel ID: \`${ v.masterChannelId }\`\n` +
        `➤ ∙ Dynamic Channels Name: \`${ v.dynamicChannelNameTemplate }\`\n` +
        `➤ ∙ New Channel Privacy: ${ v.newChannelPrivacy }\n` +
        `➤ ∙ New Channel Limit: ${ v.newChannelLimit }\n` +
        `➤ ∙ Logs Channel: ${ v.dynamicChannelLogsChannelDisplay }\n\n` +
        "**_🎚 Buttons Interface_**\n\n" +
        `${ v.dynamicChannelButtonsTemplate }\n\n` +
        `**_🛡️ Verified Roles_**\n\n▹ ${ v.verifiedRolesDisplay }\n\n` +
        `**_🔑 Staff Roles_**\n\n▹ ${ v.staffRolesDisplay }\n\n` +
        `**_🎙️ Voice Role_**\n\n▹ ${ v.voiceRoleDisplay }\n\n` +
        "**_⚙️ Configuration_**\n\n" +
        `@ ∙ Mention user in primary message: ${ v.configUserMention }\n` +
        `⫸ ∙ Auto save dynamic channels: ${ v.configAutoSave }\n` +
        `📢 ∙ Automatic channel status: ${ v.configAutoStatus }\n` +
        `❯❯ ∙ Send logs to custom channel: ${ v.configLogs }\n` +
        `▥ ∙ Auto create control panel channel: ${ v.configControlChannelAutoCreate }\n\n`
    )
    .setOptions( ( v ) => ( {
        on: "`🟢∙On`",
        off: "`🔴∙Off`",
        dynamicChannelLogsChannelDisplay: {
            [ v.dynamicChannelLogsChannelDefault ]: "**None**",
            [ v.dynamicChannelLogsChannelSelected ]: `<#${ v.dynamicChannelLogsChannelId }>`
        },
        configUserMention: {
            [ v.configUserMentionEnabled ]: v.on,
            [ v.configUserMentionDisabled ]: v.off
        },
        configAutoSave: {
            [ v.configAutoSaveEnabled ]: v.on,
            [ v.configAutoSaveDisabled ]: v.off
        },
        configAutoStatus: {
            [ v.configAutoStatusEnabled ]: v.on,
            [ v.configAutoStatusDisabled ]: v.off
        },
        configLogs: {
            [ v.configLogsEnabled ]: v.on,
            [ v.configLogsDisabled ]: v.off
        },
        configControlChannelAutoCreate: {
            [ v.configControlChannelAutoCreateEnabled ]: v.on,
            [ v.configControlChannelAutoCreateDisabled ]: v.off
        },
        verifiedRolesDisplay: {
            [ v.verifiedRoles ]: v.verifiedRoles,
            [ v.verifiedRolesGuild ]: `${ v.verifiedRoles } *(from the server options)*`
        },
        staffRolesDisplay: {
            [ v.staffRoles ]: v.staffRoles,
            [ v.staffRolesGuild ]: `${ v.staffRoles } *(from the server options)*`,
            [ v.staffRolesNone ]: "**None** *(from the server options)*"
        },
        newChannelLimit: {
            [ v.newChannelLimitUnlimited ]: "No limit",
            [ v.newChannelLimitValue ]: `${ v.newChannelLimitCount } users`
        },
        newChannelPrivacy: {
            [ v.privacyPublic ]: "🌐 Public",
            [ v.privacyPrivate ]: "🚫 Private",
            [ v.privacyHidden ]: "🙈 Hidden"
        },
        voiceRoleDisplay: {
            [ v.voiceRoleId ]: `<@&${ v.voiceRoleId }>`,
            [ v.voiceRoleGuild ]: `<@&${ v.voiceRoleId }> *(from the server options)*`,
            [ v.voiceRoleNone ]: "**None** *(from the server options)*"
        }
    } ) )
    .setArrayOptions( {
        verifiedRoles: {
            format: "<@&{value}>{separator}",
            separator: ", "
        },
        staffRoles: {
            format: "<@&{value}>{separator}",
            separator: ", "
        }
    } )
    .setLogic( ( args, v ) => {
        let processedLogsChannelId: string | null = args.dynamicChannelLogsChannelId as string | null;
        if ( Array.isArray( processedLogsChannelId ) ) {
            processedLogsChannelId = processedLogsChannelId[ 0 ] || null;
        }

        const formatButtons = ( buttonIds: string[] ) => {
            return buttonIds.map( ( id ) => {
                const item = DynamicChannelPrimaryMessageElementsGroup.getById( id );
                const label = item ? item.getLabelForEmbed() : id;
                return `${ v.labelButtonPrefix } ${ label }`;
            } ).join( "\n" );
        };

        const defaultButtons = args.dynamicChannelButtonsTemplateDefault as string[] || args.dynamicChannelButtonsTemplate as string[] || [];
        const roleOverrides = args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> || {};

        let buttonsDisplay = `${ v.labelDefaultSettings }\n${ formatButtons( defaultButtons ) || v.labelButtonNone }`;

        Object.entries( roleOverrides ).forEach( ( [ roleId, buttons ] ) => {
            if ( buttons.length > 0 ) {
                buttonsDisplay += `\n\n${ v.labelRoleOverride } <@&${ roleId }>**\n${ formatButtons( buttons ) }`;
            }
        } );

        // The stored lists, with what they fall back to alongside - a master channel holding
        // none of its own shows what it inherits rather than an empty line.
        const ownVerifiedRoles = ( args.dynamicChannelVerifiedRoles as string[] ) || [],
            guildVerifiedRoles = ( args.guildVerifiedRoleIds as string[] ) || [];

        const ownStaffRoles = ( args.dynamicChannelStaffRoles as string[] ) || [],
            guildStaffRoles = ( args.guildStaffRoleIds as string[] ) || [];

        const staffRoles = ownStaffRoles.length ? ownStaffRoles : guildStaffRoles;

        // Mirrors the verified roles embed: the array var is left unset when there is nothing to
        // format, the display var carries the "None" literal instead.
        const staffRolesDisplay = ownStaffRoles.length
            ? v.staffRoles
            : ( guildStaffRoles.length ? v.staffRolesGuild : v.staffRolesNone );

        // A master channel without its own voice role shows the one it inherits, so an admin sees
        // what actually applies rather than a bare None.
        const privacyState = args.dynamicChannelDefaultPrivacyState as string;
        const newChannelPrivacy = "private" === privacyState
            ? v.privacyPrivate
            : ( "hidden" === privacyState ? v.privacyHidden : v.privacyPublic );

        // An unset default copies the generator's own limit, so the number it copies is named
        // rather than the rule, and the wording is left to the options so it can be translated.
        const ownUserLimit = args.dynamicChannelDefaultUserLimit as number | null | undefined;
        const newChannelLimitCount =
            ( null === ownUserLimit || undefined === ownUserLimit ? Number( args.masterChannelUserLimit ) : ownUserLimit ) || 0;

        const ownVoiceRoleId = args.dynamicChannelVoiceRoleId as string | null,
            guildVoiceRoleId = args.guildVoiceRoleId as string | null,
            resolvedVoiceRoleId = ownVoiceRoleId || guildVoiceRoleId;

        return {
            index: ( args.index || 0 ) + 1,
            masterChannelId: args.masterChannelId,
            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate,
            dynamicChannelLogsChannelId: processedLogsChannelId,
            newChannelPrivacy,
            ...( newChannelLimitCount ? { newChannelLimitCount } : {} ),
            newChannelLimit: newChannelLimitCount ? v.newChannelLimitValue : v.newChannelLimitUnlimited,
            verifiedRoles: ownVerifiedRoles.length ? ownVerifiedRoles : guildVerifiedRoles,
            verifiedRolesDisplay: ownVerifiedRoles.length ? v.verifiedRoles : v.verifiedRolesGuild,
            ...( staffRoles.length ? { staffRoles } : {} ),
            staffRolesDisplay,
            ...( resolvedVoiceRoleId ? { voiceRoleId: resolvedVoiceRoleId } : {} ),
            voiceRoleDisplay: ownVoiceRoleId
                ? v.voiceRoleId
                : ( guildVoiceRoleId ? v.voiceRoleGuild : v.voiceRoleNone ),
            configUserMention: args.dynamicChannelMentionable ? v.configUserMentionEnabled : v.configUserMentionDisabled,
            configAutoSave: args.dynamicChannelAutoSave ? v.configAutoSaveEnabled : v.configAutoSaveDisabled,
            // Unset means on, the automatic status is what the channels have always had.
            configAutoStatus: false !== args.dynamicChannelAutoStatus
                ? v.configAutoStatusEnabled
                : v.configAutoStatusDisabled,
            configLogs: processedLogsChannelId ? v.configLogsEnabled : v.configLogsDisabled,
            configControlChannelAutoCreate: args.dynamicChannelControlChannelAutoCreate ?
                v.configControlChannelAutoCreateEnabled :
                v.configControlChannelAutoCreateDisabled,
            dynamicChannelLogsChannelDisplay: processedLogsChannelId ? v.dynamicChannelLogsChannelSelected : v.dynamicChannelLogsChannelDefault,
            dynamicChannelButtonsTemplate: buttonsDisplay
        };
    } )
    .setDefaultVars( () => ( {
        labelDefaultSettings: "**Default Settings**",
        labelRoleOverride: "**Role Override:",
        labelButtonPrefix: "> -",
        labelButtonNone: "> - *None*",
    } ) )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditElementsGroup" )
    .addRow( [ SetupEditSelectEditOptionMenu ] )
    .addRow( [ ConfigExtrasSelectMenu ] )
    .addRow( [ LogChannelSelectMenu ] )
    .addRow( [ DoneButton, DeleteButton ] )
    .build();

// Lazily, because the back button is a system element that is not registered yet while this module
// is being evaluated.
const SetupEditButtonsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditButtonsElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();

        return [
            [ SetupEditButtonsScopeSelectMenu ],
            [ SetupEditButtonsRoleSelectMenu ],
            [ ChannelButtonsTemplateSelectMenu ],
            [ WizardBackButton, SetupEditButtonsClearRoleOverrideButton, SetupEditButtonsUpdateExistingButton ]
        ];
    } )
    .build();

const SetupEditVerifiedRolesElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditVerifiedRolesElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton, WizardFinishButton } = uiService.$$.getSystemElements();
        return [ [ VerifiedRolesMenu ], [ VerifiedRolesEveryoneSelectMenu ], [ WizardBackButton, WizardFinishButton ] ];
    } )
    .build();

const SetupEditVoiceRoleEmbed = new EmbedBuilder<UIArgs, typeof SETUP_EDIT_VOICE_ROLE_EMBED_VARS>( "VertixBot/UI-V3/SetupEditVoiceRoleEmbed", SETUP_EDIT_VOICE_ROLE_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🎙️  Edit Voice Role Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        "A member holds this role only while they sit in a dynamic channel of this master channel, " +
        "and loses it the moment they leave.\n\n" +
        "Use it to show a text channel to whoever is in voice right now, or to group them in the " +
        "member list.\n\n" +
        "Leaving it empty falls back to the server wide voice role.\n\n" +
        `**_Current Voice Role_**\n\n> ${ v.voiceRoleDisplay }`
    )
    .setFooterText( () =>
        "Note: The bot's own role has to sit above the role it hands out, or discord refuses it."
    )
    .setOptions( ( v ) => ( {
        voiceRoleDisplay: {
            [ v.voiceRoleId ]: `<@&${ v.voiceRoleId }>`,
            [ v.voiceRoleGuild ]: `<@&${ v.voiceRoleId }> *(from the server options)*`,
            [ v.voiceRoleNone ]: "**None** *(from the server options)*"
        }
    } ) )
    .setLogic( ( args, v ) => {
        const roleId = args.dynamicChannelVoiceRoleId as string | null,
            guildRoleId = args.guildVoiceRoleId as string | null;

        const result: Record<string, string | number> = {
            index: ( args.index || 0 ) + 1
        };

        if ( roleId ) {
            result.voiceRoleId = roleId;
            result.voiceRoleDisplay = v.voiceRoleId;
        } else if ( guildRoleId ) {
            result.voiceRoleId = guildRoleId;
            result.voiceRoleDisplay = v.voiceRoleGuild;
        } else {
            result.voiceRoleDisplay = v.voiceRoleNone;
        }

        return result;
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditDefaultPrivacyEmbed = new EmbedBuilder<UIArgs, typeof SETUP_EDIT_DEFAULT_PRIVACY_EMBED_VARS>( "VertixBot/UI-V3/SetupEditDefaultPrivacyEmbed", SETUP_EDIT_DEFAULT_PRIVACY_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🛡️  Edit Default Privacy Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        "This is the state a **newly created** dynamic channel starts in. It does not touch channels " +
        "that already exist, and the owner can still change their own channel afterwards.\n\n" +
        "**Public** - anyone in the audience can see and join.\n" +
        "**Private** - visible, but only the owner lets people in.\n" +
        "**Hidden** - not visible at all until the owner shows it.\n\n" +
        "With auto save on, a returning owner gets their own last state instead of this.\n\n" +
        `**_Current Default_**\n\n> ${ v.privacyState }`
    )
    .setOptions( ( v ) => ( {
        privacyState: {
            [ v.privacyPublic ]: "🌐 **Public**",
            [ v.privacyPrivate ]: "🚫 **Private**",
            [ v.privacyHidden ]: "🙈 **Hidden**"
        }
    } ) )
    .setLogic( ( args, v ) => {
        const state = args.dynamicChannelDefaultPrivacyState as string;

        return {
            index: ( args.index || 0 ) + 1,
            privacyState: "private" === state ? v.privacyPrivate : ( "hidden" === state ? v.privacyHidden : v.privacyPublic )
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditDefaultUserLimitEmbed = new EmbedBuilder<UIArgs, typeof SETUP_EDIT_DEFAULT_USER_LIMIT_EMBED_VARS>( "VertixBot/UI-V3/SetupEditDefaultUserLimitEmbed", SETUP_EDIT_DEFAULT_USER_LIMIT_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `✋  Edit Default User Limit Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        "This is the user limit a **newly created** dynamic channel starts with. It does not touch " +
        "channels that already exist, and the owner can still change their own channel afterwards.\n\n" +
        "Copying the generator channel is the old behaviour. Setting a number here is usually better, " +
        "because the generator's own limit also caps how many people can wait in it at once.\n\n" +
        "With auto save on, a returning owner gets their own last limit instead of this.\n\n" +
        `**_Current Default_**\n\n> ${ v.userLimitDisplay }`
    )
    .setOptions( ( v ) => ( {
        userLimitDisplay: {
            [ v.userLimitUnlimited ]: "**No limit**",
            [ v.userLimitValue ]: `**${ v.userLimit } users**`
        }
    } ) )
    .setLogic( ( args, v ) => {
        const own = args.dynamicChannelDefaultUserLimit as number | null | undefined;

        // An unset default copies the generator's own limit and both read the same way, so the
        // number is resolved here and the wording left to the two options, which are translated.
        const limit = ( null === own || undefined === own ? Number( args.masterChannelUserLimit ) : own ) || 0;

        return {
            index: ( args.index || 0 ) + 1,
            ...( limit ? { userLimit: String( limit ) } : {} ),
            userLimitDisplay: limit ? v.userLimitValue : v.userLimitUnlimited
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditDefaultPrivacyElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditDefaultPrivacyElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();
        return [ [ DefaultPrivacyStateMenu ], [ DefaultPrivacyResetButton, WizardBackButton ] ];
    } )
    .build();

const SetupEditDefaultUserLimitElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditDefaultUserLimitElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();
        return [ [ DefaultUserLimitMenu ], [ DefaultUserLimitInheritButton, WizardBackButton ] ];
    } )
    .build();

const SetupEditVoiceRoleElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditVoiceRoleElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();
        return [ [ VoiceRoleMenu ], [ WizardBackButton ] ];
    } )
    .build();

const SetupEditStaffRolesElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditStaffRolesElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton } = uiService.$$.getSystemElements();
        return [ [ StaffRolesMenu ], [ WizardBackButton ] ];
    } )
    .build();

const SetupEditComponent = new ComponentBuilder( "VertixBot/UI-V3/ConfigComponent" )
    .addElementsGroup( SetupEditElementsGroup )
    .addElementsGroup( SetupEditButtonsElementsGroup )
    .addElementsGroup( SetupEditVerifiedRolesElementsGroup )
    .addElementsGroup( SetupEditStaffRolesElementsGroup )
    .addElementsGroup( SetupEditVoiceRoleElementsGroup )
    .addElementsGroup( SetupEditDefaultPrivacyElementsGroup )
    .addElementsGroup( SetupEditDefaultUserLimitElementsGroup )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditButtonsEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditVerifiedRolesEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditStaffRolesEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditVoiceRoleEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditDefaultPrivacyEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditDefaultUserLimitEmbed ) )
    .addModal( ChannelNameTemplateModal )
    .addModal( DeleteConfirmModal )
    .setDefaultElementsGroup( "VertixBot/UI-V3/SetupEditElementsGroup" )
    .setDefaultEmbedsGroup( "VertixBot/UI-V3/SetupEditEmbedGroup" )
    .setInstanceType( UIInstancesTypes.Static )
    .build();

/**
 * Function syncButtonsRoleMeta() :: Refreshes the names of the roles that own a button set.
 *
 * Elements hold no guild handle, so the names have to be read here and put on args. It is rebuilt
 * on every render rather than kept, which is what makes a role deleted since the last look fall
 * out of the map on its own - and that absence is what the screen reports back to the admin.
 */
function syncButtonsRoleMeta(
    context: IExecutionAdapterContext<Interactions>,
    interaction: Interactions
) {
    const args = context.getArgs( interaction ),
        byRole = ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {},
        roleId = args.dynamicChannelButtonsRoleId as string | null | undefined;

    const ids = new Set( Object.keys( byRole ) );

    if ( roleId ) {
        ids.add( roleId );
    }

    const meta: { id: string; name: string; position: number }[] = [];

    ids.forEach( ( id ) => {
        const role = interaction.guild?.roles.cache.get( id );

        if ( role ) {
            meta.push( { id, name: role.name, position: role.position } );
        }
    } );

    context.setArgs( interaction, { dynamicChannelButtonsRoleMeta: meta } );
}

async function onSetupMasterEditSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );

    args.index = args.masterChannelIndex;
    args.ChannelDBId = args.masterChannelDB.id;
    args.masterChannelId = args.masterChannelDB.channelId;

    const masterChannelKeys = MasterChannelDataManager.$.getKeys();
    const masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( args.masterChannelDB, {
        [ masterChannelKeys.dynamicChannelLogsChannelId ]: [ interaction.guild.roles.everyone.id ]
    } );

    Object.entries( masterChannelSettings ).forEach( ( [ key, value ] ) => {
        ( args )[ key ] = value;
    } );

    // What a master channel without a list of its own actually applies. The component is static, so
    // `getReplyArgs()` never runs and this is the only place these can be seeded.
    args.guildVoiceRoleId = await GuildDataManager.$.getVoiceRoleId( interaction.guildId );
    args.guildVerifiedRoleIds = await GuildDataManager.$.resolveVerifiedRoleIds( interaction.guildId );
    args.guildStaffRoleIds = await GuildDataManager.$.getStaffRoleIds( interaction.guildId );

    // Through the manager rather than the settings copied above: `@everyone` alone is what every
    // channel created before the guild wide lists existed stores, and only the manager knows that
    // counts as no choice of its own.
    args[ masterChannelKeys.dynamicChannelVerifiedRoles ] =
        await MasterChannelDataManager.$.getChannelOwnVerifiedRoles( args.masterChannelDB, interaction.guildId );
    args[ masterChannelKeys.dynamicChannelStaffRoles ] =
        await MasterChannelDataManager.$.getChannelOwnStaffRoles( args.masterChannelDB );

    if ( ( args[ masterChannelKeys.dynamicChannelVerifiedRoles ] as string[] ).includes( interaction.guild.roles.everyone.id ) ) {
        args.dynamicChannelIncludeEveryoneRole = true;
    }

    // The generator's own limit is what an unset default copies, so the screens can name the number
    // rather than only the rule.
    const masterVoiceChannel = interaction.guild.channels.cache.get( args.masterChannelId as string );

    args.masterChannelUserLimit = masterVoiceChannel && "userLimit" in masterVoiceChannel
        ? masterVoiceChannel.userLimit
        : 0;

    args.dynamicChannelControlChannelAutoCreate = !!args.dynamicChannelControlChannelId;

    // The buttons screen keeps its saved sets apart from the set being looked at, and this is the
    // only place they can be seeded: the adapter is static, so the framework never calls
    // `getReplyArgs()` and nothing else ever puts them on args.
    //
    // Both are rebuilt rather than referenced. `getAllSettings()` hands back the config defaults
    // themselves when a master channel has none of its own, so the empty by-role object is one
    // instance shared by every such channel in the process.
    //
    // Kept in their saved order rather than sorted: the order is the admin's, set from the
    // dashboard, and this screen would otherwise quietly normalise it away on open.
    args.guildId = interaction.guildId;

    const storedTemplate = args.dynamicChannelButtonsTemplate;

    args.dynamicChannelButtonsTemplateDefault = migrateV2Buttons(
        Array.isArray( storedTemplate ) ? [ ...storedTemplate ] : []
    );

    const storedByRole = args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined,
        byRole: Record<string, string[]> = {};

    Object.entries( storedByRole ?? {} ).forEach( ( [ roleId, buttons ] ) => {
        byRole[ roleId ] = migrateV2Buttons( Array.isArray( buttons ) ? [ ...buttons ] : [] );
    } );

    args.dynamicChannelButtonsTemplateByRole = byRole;
    args.dynamicChannelButtonsTemplate = [ ...( args.dynamicChannelButtonsTemplateDefault as string[] ) ];
    args.dynamicChannelButtonsRoleId = null;
    args.dynamicChannelButtonsNotice = null;

    args._wizardIsFinishButtonAvailable = true;

    context.setArgs( interaction, args );

    syncButtonsRoleMeta( context, interaction );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );
}

async function onSelectEditOptionSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const selected = interaction.values[ 0 ];

    if ( !selected ) {
        return;
    }

    switch ( selected ) {
        case "edit-dynamic-channel-name":
            await context.showModal( interaction, "VertixBot/UI-General/ChannelNameTemplateModal" );
            break;

        case "edit-dynamic-channel-buttons":
            // Opened on the default set every time. Args are merged per key and never cleared, so
            // without this the screen resumes on whichever role was open earlier in the session.
            context.setArgs( interaction, {
                dynamicChannelButtonsRoleId: null,
                dynamicChannelButtonsTemplate: [
                    ...( ( context.getArgs( interaction ).dynamicChannelButtonsTemplateDefault as string[] | undefined ) ?? [] )
                ],
                dynamicChannelButtonsNotice: null
            } );

            syncButtonsRoleMeta( context, interaction );

            await context.editReplyWithStep( interaction, BUTTONS_STEP );
            break;

        case "edit-dynamic-channel-verified-roles":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditVerifiedRoles" );
            break;

        case "edit-dynamic-channel-staff-roles":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditStaffRoles" );
            break;

        case "edit-dynamic-channel-voice-role":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditVoiceRole" );
            break;

        case "edit-dynamic-channel-default-privacy":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditDefaultPrivacy" );
            break;

        case "edit-dynamic-channel-default-user-limit":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditDefaultUserLimit" );
            break;
    }
}

async function onTemplateEditModalSubmitted(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const channelNameInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V3/SetupEditAdapter:VertixBot/UI-General/ChannelNameTemplateInput"
    );

    const value = interaction.fields.getTextInputValue( channelNameInputId ),
        args = context.getArgs( interaction );

    const { settings } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V3
    ).data;

    context.setArgs( interaction, {
        dynamicChannelNameTemplate: value || settings.dynamicChannelNameTemplate
    } );

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    await MasterChannelDataManager.$.setChannelNameTemplate( masterChannelDB, value );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );
}

const BUTTONS_STEP = "VertixBot/UI-V3/SetupEditButtons";

/**
 * Function readButtonsScope() :: The saved sets plus the one the screen is pointed at.
 *
 * Every handler starts here so the role names are refreshed first - a role deleted since the last
 * render drops out of the meta and the screen says so instead of naming something that is gone.
 */
function readButtonsScope( context: IExecutionAdapterContext<Interactions>, interaction: Interactions ) {
    syncButtonsRoleMeta( context, interaction );

    const args = context.getArgs( interaction );

    return {
        args,
        roleId: ( args.dynamicChannelButtonsRoleId as string | null | undefined ) ?? null,
        byRole: ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {},
        templateDefault: ( args.dynamicChannelButtonsTemplateDefault as string[] | undefined ) ?? [],
        masterChannelDB: {
            id: args.ChannelDBId,
            version: VERSION_UI_V3
        } as ChannelExtended
    };
}

/**
 * Function scopeTemplate() :: The set a scope should show.
 *
 * A role with nothing of its own opens on the default set rather than on an empty menu, so the
 * common intent - this role, plus one more button - is a single tick instead of rebuilding the
 * list. The copy matters: args share their nested arrays with the stored bag, so handing back a
 * borrowed reference would let a later edit write through to the saved default.
 */
function scopeTemplate( byRole: Record<string, string[]>, templateDefault: string[], roleId: string | null ) {
    const source = roleId && byRole[ roleId ]?.length ? byRole[ roleId ] : templateDefault;

    return [ ...source ];
}

/**
 * Function keepOrder() :: The picked set, in the order it already had.
 *
 * A select menu has no way to express order - it hands its values back in its own - so taking the
 * pick at face value would flatten an arrangement made in the dashboard every time somebody ticked
 * one more button here. What was already in the set keeps its place, and anything new lands at the
 * end, which is where the dashboard puts a newly added button too.
 */
function keepOrder( previous: string[], picked: string[] ): string[] {
    const kept = previous.filter( ( id ) => picked.includes( id ) ),
        added = picked.filter( ( id ) => ! previous.includes( id ) );

    return [ ...kept, ...added ];
}

async function onButtonsScopeSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const { byRole, templateDefault } = readButtonsScope( context, interaction ),
        selected = interaction.values.at( 0 ) ?? SCOPE_DEFAULT_VALUE,
        roleId = SCOPE_DEFAULT_VALUE === selected ? null : selected;

    // Nothing is written. Looking at another scope has to be free, otherwise the list above stops
    // being something an admin will browse.
    context.setArgs( interaction, {
        dynamicChannelButtonsRoleId: roleId,
        dynamicChannelButtonsTemplate: scopeTemplate( byRole, templateDefault, roleId ),
        dynamicChannelButtonsNotice: null
    } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

async function onButtonsRoleSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const { args, byRole, templateDefault } = readButtonsScope( context, interaction ),
        roleId = interaction.values.at( 0 ) ?? null;

    if ( ! roleId ) {
        context.setArgs( interaction, { dynamicChannelButtonsNotice: null } );

        await context.editReplyWithStep( interaction, BUTTONS_STEP );

        return;
    }

    // Discord seeds every member's roles with @everyone under the guild id, so a set stored there
    // would match every owner alive and leave the default set unreachable.
    if ( roleId === args.guildId ) {
        context.setArgs( interaction, { dynamicChannelButtonsNotice: "everyone" } );

        await context.editReplyWithStep( interaction, BUTTONS_STEP );

        return;
    }

    context.setArgs( interaction, {
        dynamicChannelButtonsRoleId: roleId,
        dynamicChannelButtonsTemplate: scopeTemplate( byRole, templateDefault, roleId ),
        dynamicChannelButtonsNotice: null
    } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

async function onButtonsSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const { byRole, roleId, templateDefault, masterChannelDB } = readButtonsScope( context, interaction );

    const picked = interaction.values.filter(
        ( id ) => undefined !== DynamicChannelPrimaryMessageElementsGroup.getById( id )
    );

    const buttons = keepOrder( scopeTemplate( byRole, templateDefault, roleId ), picked );

    // Saved on the pick, like every other setting on this screen's siblings. There is no pending
    // state to lose and nothing to press afterwards to make it count.
    if ( roleId ) {
        await MasterChannelDataManager.$.setChannelButtonsTemplateForRole( masterChannelDB, roleId, buttons );
    } else {
        await MasterChannelDataManager.$.setChannelButtonsTemplate( masterChannelDB, buttons );
    }

    // A fresh map rather than an assignment into the old one - `getArgs()` hands back a shallow
    // copy, so writing through a nested object reaches the stored bag directly and would show the
    // set as saved whether or not the write above succeeded.
    context.setArgs( interaction, {
        dynamicChannelButtonsTemplate: buttons,
        dynamicChannelButtonsNotice: null,
        ...( roleId
            ? { dynamicChannelButtonsTemplateByRole: { ...byRole, [ roleId ]: buttons } }
            : { dynamicChannelButtonsTemplateDefault: buttons } )
    } );

    // The set reaches the channels already open as well as the control panel, and neither re-reads
    // it on its own. A role's set never reaches the panel, so only the default scope redraws that.
    if ( interaction.guild ) {
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        await dynamicChannelService
            .refreshGeneratorButtons( interaction.guild, masterChannelDB, ! roleId )
            .catch( ( error ) => GlobalLogger.$.error( onButtonsSelected, error ) );
    }

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

async function onClearButtonsRoleOverrideClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const { byRole, roleId, templateDefault, masterChannelDB } = readButtonsScope( context, interaction );

    if ( ! roleId ) {
        await context.editReplyWithStep( interaction, BUTTONS_STEP );

        return;
    }

    await MasterChannelDataManager.$.removeChannelButtonsTemplateForRole( masterChannelDB, roleId );

    context.setArgs( interaction, {
        dynamicChannelButtonsTemplateByRole: { ...byRole, [ roleId ]: [] },
        dynamicChannelButtonsRoleId: null,
        dynamicChannelButtonsTemplate: scopeTemplate( byRole, templateDefault, null ),
        dynamicChannelButtonsNotice: null
    } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

/**
 * Function onButtonsUpdateExistingClicked() :: Refreshes the channels that are already open.
 *
 * One press covers both scopes, because each channel is rebuilt through its own owner - so every
 * panel ends up with whichever set that owner should be getting, not with the set on screen.
 */
async function onButtonsUpdateExistingClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const { args } = readButtonsScope( context, interaction );

    const claimChannelButtonId = DynamicChannelPrimaryMessageElementsGroup.getByName(
        "VertixBot/UI-V3/DynamicChannelClaimChannelButton"
    )?.getId();

    const buttons = ( args.dynamicChannelButtonsTemplate as string[] | undefined ) ?? [];

    setTimeout( async() => {
        const channels = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, args.masterChannelId );

        const appService = ServiceLocator.$.get<AppService>( "VertixBot/Services/App" );
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        for ( const channelDB of channels ) {
            const channel = appService.getClient().channels.cache.get( channelDB.channelId ) as VoiceChannel;

            if ( ! channel ) {
                continue;
            }

            dynamicChannelService.editPrimaryMessageDebounce( channel );
        }

        if ( claimChannelButtonId && buttons.includes( claimChannelButtonId ) ) {
            DynamicChannelClaimManager.get( "VertixBot/UI-V3/DynamicChannelClaimManager" )
                .handleAbandonedChannels( appService.getClient(), [], channels )
                .catch( ( e ) => {
                    throw e;
                } );
        }
    } );

    context.setArgs( interaction, { dynamicChannelButtonsNotice: "pushed" } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

async function onDoneButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    if ( !interaction.deferred && !interaction.replied ) {
        try {
            await interaction.deferUpdate();
        } catch {
            return;
        }
    }

    if ( context.getCurrentExecutionStep( interaction )?.name === "VertixBot/UI-V3/SetupEditMaster" ) {
        context.deleteArgs( interaction );
        ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
        return;
    }
}

async function onDeleteButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    await context.showModal( interaction, "VertixBot/UI-General/DeleteConfirmModal" );
}

async function onDeleteConfirmModalSubmitted(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const inputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V3/SetupEditAdapter:VertixBot/UI-General/DeleteConfirmInput"
    );

    const value = interaction.fields.getTextInputValue( inputId );

    if ( value.trim().toLowerCase() !== "delete" ) {
        return;
    }

    const args: UIArgs = context.getArgs( interaction );
    const masterChannelId = args.masterChannelId;

    if ( typeof masterChannelId !== "string" || !masterChannelId ) {
        return;
    }

    const channelCleanupService = ServiceLocator.$.get<ChannelCleanupService>( "VertixBot/Services/ChannelCleanup" );

    const deleted = await channelCleanupService.deleteDynamicMasterChannelWithCleanup( {
        guildId: interaction.guildId,
        masterChannelId
    } );

    if ( !deleted ) {
        return;
    }

    context.deleteArgs( interaction );

    if ( !interaction.channel ) {
        return;
    }

    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
}

async function onConfigExtrasSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        values = interaction.values;

    const masterChannelDB: ChannelExtended = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    } as ChannelExtended;

    for ( const value of values ) {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelMentionable":
                args.dynamicChannelMentionable = !!parseInt( parted[ 1 ] );
                await MasterChannelDataManager.$.setChannelMentionable( masterChannelDB, args.dynamicChannelMentionable );
                break;

            case "dynamicChannelAutoSave":
                args.dynamicChannelAutoSave = !!parseInt( parted[ 1 ] );
                await MasterChannelDataManager.$.setChannelAutoSave( masterChannelDB, args.dynamicChannelAutoSave );
                break;

            case "dynamicChannelAutoStatus":
                args.dynamicChannelAutoStatus = !!parseInt( parted[ 1 ] );
                await MasterChannelDataManager.$.setChannelAutoStatus( masterChannelDB, args.dynamicChannelAutoStatus );
                break;

            case "dynamicChannelLogsChannel":
                args.dynamicChannelLogsChannelId = null;
                await MasterChannelDataManager.$.setChannelLogsChannel( masterChannelDB, args.dynamicChannelLogsChannelId );
                break;

        }
    }

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );
}

async function onLogChannelSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const channelId = interaction.values.at( 0 ) || null,
        args: UIArgs = context.getArgs( interaction );

    args.dynamicChannelLogsChannelId = channelId;

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    await MasterChannelDataManager.$.setChannelLogsChannel( masterChannelDB, channelId );

    context.setArgs( interaction, args );

    // The logs channel belongs to the admin, not to the bot, so nothing grants the bot anything
    // there. Say so at the moment of the pick rather than letting logging fail in silence later.
    await warnOnMissingLogsChannelPermissions( interaction, channelId );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );
}

async function onStaffRolesSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    // Rewriting the overwrites of every channel the master channel owns takes longer than the
    // three seconds discord gives to acknowledge an interaction, so acknowledge it first.
    if ( ! interaction.deferred && ! interaction.replied ) {
        try {
            await interaction.deferUpdate();
        } catch {}
    }

    const args: UIArgs = context.getArgs( interaction ),
        staffRoles = interaction.values.filter( ( roleId ) => roleId !== interaction.guildId ).sort();

    args.dynamicChannelStaffRoles = staffRoles;

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    const previousRoles = await MasterChannelDataManager.$.getChannelStaffRoles( masterChannelDB, interaction.guildId );

    await MasterChannelDataManager.$.setChannelStaffRoles( masterChannelDB, interaction.guildId, staffRoles );

    context.setArgs( interaction, args );

    await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
        .updateStaffRolesPermissions( interaction.guildId, args.masterChannelId, previousRoles, staffRoles );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditStaffRoles" );
}

async function onDefaultPrivacySelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        state = interaction.values.at( 0 ) as ChannelPrivacyStateDefault | undefined;

    if ( state ) {
        args.dynamicChannelDefaultPrivacyState = state;

        await MasterChannelDataManager.$.setChannelDefaultPrivacyState(
            { id: args.ChannelDBId, version: VERSION_UI_V3 } as any,
            interaction.guildId,
            state
        );

        context.setArgs( interaction, args );
    }

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditDefaultPrivacy" );
}

async function onDefaultUserLimitSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        selected = interaction.values.at( 0 );

    if ( selected ) {
        const userLimit = Number( selected );

        args.dynamicChannelDefaultUserLimit = userLimit;

        await MasterChannelDataManager.$.setChannelDefaultUserLimit(
            { id: args.ChannelDBId, version: VERSION_UI_V3 } as any,
            interaction.guildId,
            userLimit
        );

        context.setArgs( interaction, args );
    }

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditDefaultUserLimit" );
}

async function onDefaultPrivacyResetClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction );

    const { settings } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V3
    ).data;

    args.dynamicChannelDefaultPrivacyState = settings.dynamicChannelDefaultPrivacyState;

    await MasterChannelDataManager.$.setChannelDefaultPrivacyState(
        { id: args.ChannelDBId, version: VERSION_UI_V3 } as any,
        interaction.guildId,
        settings.dynamicChannelDefaultPrivacyState
    );

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditDefaultPrivacy" );
}

async function onDefaultUserLimitInheritClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction );

    args.dynamicChannelDefaultUserLimit = null;

    await MasterChannelDataManager.$.setChannelDefaultUserLimit(
        { id: args.ChannelDBId, version: VERSION_UI_V3 } as any,
        interaction.guildId,
        null
    );

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditDefaultUserLimit" );
}

async function onVoiceRoleSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        roleId = interaction.values.at( 0 ) ?? null;

    args.dynamicChannelVoiceRoleId = roleId;

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    await MasterChannelDataManager.$.setChannelVoiceRoleId( masterChannelDB, interaction.guildId, roleId );

    context.setArgs( interaction, args );

    await warnOnUnassignableVoiceRole( interaction, roleId );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditVoiceRole" );
}

async function onVerifiedRolesSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        selection = verifiedRolesFromSelectedRoles(
            interaction.values,
            interaction.guildId,
            Boolean( args.dynamicChannelIncludeEveryoneRole )
        );

    context.setArgs( interaction, {
        ...selection,
        _wizardIsFinishButtonDisabled: !selection.dynamicChannelVerifiedRoles.length
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditVerifiedRoles" );
}

async function onVerifiedRolesEveryoneSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelIncludeEveryoneRole":
                Object.assign( args, verifiedRolesFromEveryoneRole(
                    !!parseInt( parted[ 1 ] ),
                    args.dynamicChannelVerifiedRoles ?? [],
                    interaction.guildId
                ) );
                break;
        }
    } );

    args._wizardIsFinishButtonDisabled = !args.dynamicChannelVerifiedRoles?.length;

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditVerifiedRoles" );
}

async function onBackButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    if ( !interaction.deferred && !interaction.replied ) {
        try {
            await interaction.deferUpdate();
        } catch {
            return;
        }
    }

    const args = context.getArgs( interaction );
    const keys = MasterChannelDataManager.$.getKeys();

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    const currentStep = context.getCurrentExecutionStep( interaction )?.name;

    // Everything below the guards falls through to the verified roles case and writes them back
    // from the database, so a step that shares this button has to claim itself here or leaving it
    // quietly rewrites settings it never touched.
    if ( "VertixBot/UI-V3/SetupEditDefaultPrivacy" === currentStep
        || "VertixBot/UI-V3/SetupEditDefaultUserLimit" === currentStep
        || BUTTONS_STEP === currentStep ) {
        await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );

        return;
    }

    if ( "VertixBot/UI-V3/SetupEditVoiceRole" === context.getCurrentExecutionStep( interaction )?.name ) {
        await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );

        return;
    }

    if ( "VertixBot/UI-V3/SetupEditStaffRoles" === context.getCurrentExecutionStep( interaction )?.name ) {
        ( args as UIArgs )[ keys.dynamicChannelStaffRoles ] =
            await MasterChannelDataManager.$.getChannelStaffRoles( masterChannelDB, interaction.guild.id ) as unknown;

        context.setArgs( interaction, args );

        await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );

        return;
    }

    // The stored answer rather than the resolved one. The editor writes whatever it is handed
    // back, so an inherited list loaded here would be pinned as the channel's own the moment the
    // screen is finished - even when nothing was touched.
    const verifiedRoles = await MasterChannelDataManager.$.getChannelOwnVerifiedRoles( masterChannelDB, interaction.guild.id );

    if ( verifiedRoles.includes( interaction.guild.roles.everyone.id ) ) {
        args.dynamicChannelIncludeEveryoneRole = true;
    }

    ( args as UIArgs )[ keys.dynamicChannelVerifiedRoles ] = verifiedRoles as unknown;

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );
}

async function onFinishButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    if ( !interaction.deferred && !interaction.replied ) {
        try {
            await interaction.deferUpdate();
        } catch {}
    }

    const args: UIArgs = context.getArgs( interaction );

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    const previousRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, interaction.guildId );

    await MasterChannelDataManager.$.setChannelVerifiedRoles( masterChannelDB, interaction.guildId, args.dynamicChannelVerifiedRoles );

    // Read back rather than trusting the args, an emptied list is stored as is and resolves
    // through the guild wide default.
    const currentRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, interaction.guildId, false );

    await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
        .updateVerifiedRolesPermissions( interaction.guildId, args.masterChannelId, previousRoles, currentRoles );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );
}

const SetupEditAdapter = new AdminExecutionAdapterBuilder<VoiceChannel, Interactions>( "VertixBot/UI-V3/SetupEditAdapter" )
    .setComponent( SetupEditComponent )
    .setExcludedElements( [ SetupMasterEditSelectMenu ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            // States
            .addState( "Default", { executionStep: "default" } )
            .addState( "EditMaster", {
                executionStep: "VertixBot/UI-V3/SetupEditMaster",
                elementsGroup: "VertixBot/UI-V3/SetupEditElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditEmbedGroup",
                previewDefaultVars: {
                    index: "1",
                    masterChannelId: "123456789",
                    dynamicChannelNameTemplate: "{user}'s Channel",
                    dynamicChannelLogsChannelDisplay: "**None**",
                    newChannelPrivacy: "🌐 Public",
                    newChannelLimit: "No limit",
                    dynamicChannelButtonsTemplate: "**Default Settings**\n> - Rename\n> - User Limit\n> - Access",
                    verifiedRoles: "**None**",
                    staffRolesDisplay: "**None**",
                    voiceRoleDisplay: "**None**",
                    configUserMention: "`🟢∙On`",
                    configAutoSave: "`🔴∙Off`",
                    configLogs: "`🔴∙Off`",
                    configControlChannelAutoCreate: "`🟢∙On`",
                }
            } )
            .addState( "EditButtons", {
                executionStep: "VertixBot/UI-V3/SetupEditButtons",
                elementsGroup: "VertixBot/UI-V3/SetupEditButtonsElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditButtonsEmbedGroup",
                previewDefaultVars: {
                    index: "1",
                    masterChannelId: "0",
                    roleId: "0",
                    scopeDisplay: "**Default buttons**",
                    listHeadingDisplay: "**On every panel**",
                    buttonsList: "> - *None*",
                    rosterHeading: "**Roles with buttons of their own**",
                    rosterDisplay: "> - *None yet*",
                    hintDisplay: "Pick a role to give it a set of its own."
                }
            } )
            .addState( "EditVerifiedRoles", {
                executionStep: "VertixBot/UI-V3/SetupEditVerifiedRoles",
                elementsGroup: "VertixBot/UI-V3/SetupEditVerifiedRolesElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditVerifiedRolesEmbedGroup",
                previewDefaultVars: { index: "1" }
            } )
            .addState( "EditDefaultPrivacy", {
                executionStep: "VertixBot/UI-V3/SetupEditDefaultPrivacy",
                elementsGroup: "VertixBot/UI-V3/SetupEditDefaultPrivacyElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditDefaultPrivacyEmbedGroup",
                previewDefaultVars: { index: "1", privacyState: "🌐 **Public**" }
            } )
            .addState( "EditDefaultUserLimit", {
                executionStep: "VertixBot/UI-V3/SetupEditDefaultUserLimit",
                elementsGroup: "VertixBot/UI-V3/SetupEditDefaultUserLimitElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditDefaultUserLimitEmbedGroup",
                previewDefaultVars: { index: "1", userLimitDisplay: "**No limit**" }
            } )
            .addState( "EditVoiceRole", {
                executionStep: "VertixBot/UI-V3/SetupEditVoiceRole",
                elementsGroup: "VertixBot/UI-V3/SetupEditVoiceRoleElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditVoiceRoleEmbedGroup",
                previewDefaultVars: { index: "1", voiceRoleDisplay: "**None**" }
            } )
            .addState( "EditStaffRoles", {
                executionStep: "VertixBot/UI-V3/SetupEditStaffRoles",
                elementsGroup: "VertixBot/UI-V3/SetupEditStaffRolesElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditStaffRolesEmbedGroup",
                previewDefaultVars: { index: "1", staffRolesDisplay: "**None**" }
            } )
            // Transitions from Default
            .addTransition( "SelectMasterChannel", { from: "Default", to: "EditMaster" } )
            // Transitions from EditMaster
            .addTransition( "OpenEditButtons", { from: "EditMaster", to: "EditButtons" } )
            .addTransition( "OpenEditVerifiedRoles", { from: "EditMaster", to: "EditVerifiedRoles" } )
            .addTransition( "OpenEditStaffRoles", { from: "EditMaster", to: "EditStaffRoles" } )
            .addTransition( "OpenEditVoiceRole", { from: "EditMaster", to: "EditVoiceRole" } )
            .addTransition( "OpenEditDefaultPrivacy", { from: "EditMaster", to: "EditDefaultPrivacy" } )
            .addTransition( "OpenEditDefaultUserLimit", { from: "EditMaster", to: "EditDefaultUserLimit" } )
            .addTransition( "EditChannelName", { from: "EditMaster", to: "EditMaster" } )
            .addTransition( "ConfigExtrasChanged", { from: "EditMaster", to: "EditMaster" } )
            .addTransition( "LogChannelChanged", { from: "EditMaster", to: "EditMaster" } )
            .addTransition( "Done", { from: "EditMaster", to: "Default" } )
            .addTransition( "Delete", { from: "EditMaster", to: "Default" } )
            // Transitions from EditButtons
            .addTransition( "ButtonsSelected", { from: "EditButtons", to: "EditButtons" } )
            .addTransition( "ButtonsScopeSelected", { from: "EditButtons", to: "EditButtons" } )
            .addTransition( "ButtonsRoleSelected", { from: "EditButtons", to: "EditButtons" } )
            .addTransition( "ClearRoleOverride", { from: "EditButtons", to: "EditButtons" } )
            .addTransition( "UpdateExistingChannels", { from: "EditButtons", to: "EditButtons" } )
            .addTransition( "ButtonsBack", { from: "EditButtons", to: "EditMaster" } )
            // Transitions from EditVerifiedRoles
            .addTransition( "VerifiedRolesSelected", { from: "EditVerifiedRoles", to: "EditVerifiedRoles" } )
            .addTransition( "VerifiedRolesBack", { from: "EditVerifiedRoles", to: "EditMaster" } )
            .addTransition( "VerifiedRolesFinish", { from: "EditVerifiedRoles", to: "EditMaster" } )
            // Transitions from EditStaffRoles
            .addTransition( "StaffRolesChanged", { from: "EditStaffRoles", to: "EditStaffRoles" } )
            .addTransition( "StaffRolesBack", { from: "EditStaffRoles", to: "EditMaster" } )
            // Transitions from EditVoiceRole
            .addTransition( "VoiceRoleChanged", { from: "EditVoiceRole", to: "EditVoiceRole" } )
            .addTransition( "VoiceRoleBack", { from: "EditVoiceRole", to: "EditMaster" } )
            // Transitions from the creation defaults
            .addTransition( "DefaultPrivacyChanged", { from: "EditDefaultPrivacy", to: "EditDefaultPrivacy" } )
            .addTransition( "DefaultPrivacyBack", { from: "EditDefaultPrivacy", to: "EditMaster" } )
            .addTransition( "DefaultUserLimitChanged", { from: "EditDefaultUserLimit", to: "EditDefaultUserLimit" } )
            .addTransition( "DefaultUserLimitBack", { from: "EditDefaultUserLimit", to: "EditMaster" } )
            .addTransition( "DefaultPrivacyReset", { from: "EditDefaultPrivacy", to: "EditDefaultPrivacy" } )
            .addTransition( "DefaultUserLimitInherit", { from: "EditDefaultUserLimit", to: "EditDefaultUserLimit" } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                transitionName: "OpenEditButtons",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                transitionName: "OpenEditVerifiedRoles",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                transitionName: "OpenEditStaffRoles",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                transitionName: "OpenEditVoiceRole",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                transitionName: "EditChannelName",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            // Element bindings with handlers
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterEditSelectMenu",
                "SelectMasterChannel",
                onSetupMasterEditSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                "OpenEditButtons",
                onSelectEditOptionSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu",
                "ButtonsSelected",
                onButtonsSelected
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsRoleSelectMenu",
                "ButtonsRoleSelected",
                onButtonsRoleSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsScopeSelectMenu",
                "ButtonsScopeSelected",
                onButtonsScopeSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsClearRoleOverrideButton",
                "ClearRoleOverride",
                onClearButtonsRoleOverrideClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsUpdateExistingButton",
                "UpdateExistingChannels",
                onButtonsUpdateExistingClicked
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/ConfigExtrasSelectMenu",
                "ConfigExtrasChanged",
                onConfigExtrasSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/LogChannelSelectMenu",
                "LogChannelChanged",
                onLogChannelSelected
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-General/StaffRolesMenu",
                "StaffRolesChanged",
                onStaffRolesSelected
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-General/VoiceRoleMenu",
                "VoiceRoleChanged",
                onVoiceRoleSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/DefaultPrivacyStateMenu",
                "DefaultPrivacyChanged",
                onDefaultPrivacySelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/DefaultUserLimitMenu",
                "DefaultUserLimitChanged",
                onDefaultUserLimitSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DefaultPrivacyResetButton",
                "DefaultPrivacyReset",
                onDefaultPrivacyResetClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DefaultUserLimitInheritButton",
                "DefaultUserLimitInherit",
                onDefaultUserLimitInheritClicked
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-General/VerifiedRolesMenu",
                "VerifiedRolesSelected",
                onVerifiedRolesSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu",
                "VerifiedRolesSelected",
                onVerifiedRolesEveryoneSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DoneButton",
                "Done",
                onDoneButtonClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DeleteButton",
                "Delete",
                onDeleteButtonClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/WizardBackButton",
                "VerifiedRolesBack",
                onBackButtonClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/WizardFinishButton",
                "VerifiedRolesFinish",
                onFinishButtonClicked
            )
            // Modal bindings
            .bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/ChannelNameTemplateModal",
                "EditChannelName",
                onTemplateEditModalSubmitted
            )
            .bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/DeleteConfirmModal",
                "Delete",
                onDeleteConfirmModalSubmitted
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .setShouldRequireArgs( () => true )
    .onRegenerate( async( context, interaction ) => {
        ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
    } )
    .getCustomIdForEntity( ( _context, hash ) => {
        if ( hash === "VertixBot/UI-General/SetupAdapter:VertixBot/UI-General/SetupMasterEditSelectMenu" ) {
            return hash;
        }
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        let args: UIArgs = {};

        if ( argsFromManager?.dynamicChannelButtonsTemplate ) {
            args.dynamicChannelButtonsTemplate = [ ...argsFromManager.dynamicChannelButtonsTemplate as string[] ];
        }

        const availableArgs = context.getArgs( interaction ),
            masterChannelDB = argsFromManager?.masterChannelDB || availableArgs?.masterChannelDB;

        if ( masterChannelDB ) {
            args.index = masterChannelDB.masterChannelIndex;
            args.ChannelDBId = masterChannelDB.id;
            args.masterChannelId = masterChannelDB.channelId;

            const masterChannelKeys = MasterChannelDataManager.$.getKeys();
            let masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );

            // V3 migration fallback: if V3 settings are missing, try to get V2 settings
            if ( masterChannelDB.version === VERSION_UI_V3 && ( !masterChannelSettings || !Object.keys( masterChannelSettings ).length ) ) {
                masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( {
                    ...masterChannelDB,
                    version: VERSION_UI_V2
                } as any );
            }

            const { settings: globalDefaults } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
                "Vertix/Config/MasterChannel",
                VERSION_UI_V3
            ).data;

            const selectedKeys = [
                masterChannelKeys.dynamicChannelNameTemplate,
                masterChannelKeys.dynamicChannelButtonsTemplate,
                masterChannelKeys.dynamicChannelMentionable,
                masterChannelKeys.dynamicChannelAutoStatus,
                masterChannelKeys.dynamicChannelVerifiedRoles,
                masterChannelKeys.dynamicChannelStaffRoles,
                masterChannelKeys.dynamicChannelVoiceRoleId,
                masterChannelKeys.dynamicChannelDefaultPrivacyState,
                masterChannelKeys.dynamicChannelDefaultUserLimit
            ];

            selectedKeys.forEach( ( key ) => {
                ( args )[ key ] = ( masterChannelSettings )[ key ] ?? ( globalDefaults as any )[ key ];
            } );

            let buttonsTemplateFromDb = masterChannelSettings.dynamicChannelButtonsTemplate;
            if ( Array.isArray( buttonsTemplateFromDb ) && buttonsTemplateFromDb.length > 0 ) {
                // If they are numbers, migrate them
                if ( typeof buttonsTemplateFromDb[ 0 ] === "number" ) {
                    buttonsTemplateFromDb = migrateV2Buttons( buttonsTemplateFromDb );
                }
            } else {
                buttonsTemplateFromDb = globalDefaults.dynamicChannelButtonsTemplate;
            }

            const buttonsTemplateFromArgs = Array.isArray( availableArgs?.dynamicChannelButtonsTemplate )
                ? ( availableArgs.dynamicChannelButtonsTemplate as string[] )
                : undefined;

            const buttonsTemplateByRoleFromDb = masterChannelSettings.dynamicChannelButtonsTemplateByRole ?? {};

            // Migrate role overrides as well
            Object.keys( buttonsTemplateByRoleFromDb ).forEach( ( roleId ) => {
                const buttons = buttonsTemplateByRoleFromDb[ roleId ];
                if ( Array.isArray( buttons ) && buttons.length > 0 && typeof buttons[ 0 ] === "number" ) {
                    buttonsTemplateByRoleFromDb[ roleId ] = migrateV2Buttons( buttons );
                }
            } );

            const buttonsTemplateByRoleFromArgs = availableArgs?.dynamicChannelButtonsTemplateByRole &&
                "object" === typeof availableArgs.dynamicChannelButtonsTemplateByRole
                ? ( availableArgs.dynamicChannelButtonsTemplateByRole as Record<string, string[]> )
                : undefined;

            args.dynamicChannelButtonsTemplateByRole = {
                ...buttonsTemplateByRoleFromDb,
                ...( buttonsTemplateByRoleFromArgs ?? {} )
            };

            // Copies rather than sorts, here and below: the saved order is the admin's arrangement,
            // and these arrays can be the ones held inside the cached settings row.
            args.dynamicChannelButtonsTemplateDefault = [ ...buttonsTemplateFromDb as string[] ];

            const roleId = availableArgs?.dynamicChannelButtonsRoleId as string | null | undefined;
            args.dynamicChannelButtonsRoleId = roleId ?? null;

            if ( roleId && !buttonsTemplateFromArgs ) {
                const byRole = args.dynamicChannelButtonsTemplateByRole as Record<string, string[]>;
                const override = byRole[ roleId ];

                if ( Array.isArray( override ) ) {
                    args.dynamicChannelButtonsTemplate = [ ...override ];
                }
            } else if ( buttonsTemplateFromArgs ) {
                args.dynamicChannelButtonsTemplate = [ ...buttonsTemplateFromArgs ];
            } else {
                args.dynamicChannelButtonsTemplate = args.dynamicChannelButtonsTemplateDefault;
            }
        } else {
            args.masterChannels = await ChannelModel.$.getMasters( interaction.guild?.id || "", "settings" );
        }

        return args;
    } )
    .build();

export { SetupEditAdapter };
export { SetupEditComponent };
