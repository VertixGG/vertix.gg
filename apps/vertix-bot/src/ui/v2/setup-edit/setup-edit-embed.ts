import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    on: uiUtilsWrapAsTemplate( "on" ),
    off: uiUtilsWrapAsTemplate( "off" ),

    index: uiUtilsWrapAsTemplate( "index" ),
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),

    configUserMention: uiUtilsWrapAsTemplate( "configUserMention" ),
    configUserMentionEnabled: uiUtilsWrapAsTemplate( "configUserMentionEnabled" ),
    configUserMentionDisabled: uiUtilsWrapAsTemplate( "configUserMentionDisabled" ),

    configAutoSave: uiUtilsWrapAsTemplate( "configAutoSave" ),
    configAutoSaveEnabled: uiUtilsWrapAsTemplate( "configAutoSaveEnabled" ),
    configAutoSaveDisabled: uiUtilsWrapAsTemplate( "configAutoSaveDisabled" ),

    configAutoStatus: uiUtilsWrapAsTemplate( "configAutoStatus" ),
    configAutoStatusEnabled: uiUtilsWrapAsTemplate( "configAutoStatusEnabled" ),
    configAutoStatusDisabled: uiUtilsWrapAsTemplate( "configAutoStatusDisabled" ),

    configLogs: uiUtilsWrapAsTemplate( "configLogs" ),
    configLogsEnabled: uiUtilsWrapAsTemplate( "configLogsEnabled" ),
    configLogsDisabled: uiUtilsWrapAsTemplate( "configLogsDisabled" ),

    configControlChannelAutoCreate: uiUtilsWrapAsTemplate( "configControlChannelAutoCreate" ),
    configControlChannelAutoCreateEnabled: uiUtilsWrapAsTemplate( "configControlChannelAutoCreateEnabled" ),
    configControlChannelAutoCreateDisabled: uiUtilsWrapAsTemplate( "configControlChannelAutoCreateDisabled" ),

    dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),
    dynamicChannelLogsChannelId: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelId" ),

    dynamicChannelLogsChannelDefault: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelDefault" ),
    dynamicChannelLogsChannelSelected: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelSelected" ),
    dynamicChannelLogsChannelDisplay: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelDisplay" ),

    verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" ),
    verifiedRolesDisplay: uiUtilsWrapAsTemplate( "verifiedRolesDisplay" ),
    verifiedRolesGuild: uiUtilsWrapAsTemplate( "verifiedRolesGuild" ),

    staffRoles: uiUtilsWrapAsTemplate( "staffRoles" ),
    staffRolesDisplay: uiUtilsWrapAsTemplate( "staffRolesDisplay" ),
    staffRolesGuild: uiUtilsWrapAsTemplate( "staffRolesGuild" ),
    staffRolesNone: uiUtilsWrapAsTemplate( "staffRolesNone" ),

    voiceRoleId: uiUtilsWrapAsTemplate( "voiceRoleId" ),
    voiceRoleDisplay: uiUtilsWrapAsTemplate( "voiceRoleDisplay" ),
    voiceRoleGuild: uiUtilsWrapAsTemplate( "voiceRoleGuild" ),
    voiceRoleNone: uiUtilsWrapAsTemplate( "voiceRoleNone" ),

    newChannelPrivacy: uiUtilsWrapAsTemplate( "newChannelPrivacy" ),
    newChannelLimit: uiUtilsWrapAsTemplate( "newChannelLimit" ),
    privacyPublic: uiUtilsWrapAsTemplate( "privacyPublic" ),
    privacyPrivate: uiUtilsWrapAsTemplate( "privacyPrivate" ),
    privacyHidden: uiUtilsWrapAsTemplate( "privacyHidden" ),
    newChannelLimitCount: uiUtilsWrapAsTemplate( "newChannelLimitCount" ),
    newChannelLimitUnlimited: uiUtilsWrapAsTemplate( "newChannelLimitUnlimited" ),
    newChannelLimitValue: uiUtilsWrapAsTemplate( "newChannelLimitValue" ),

    dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" )
};

const SetupEditEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-V2/SetupEditEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `🔧  Configure Master Channel #${ vars.index }` )
    .setDescription( () => (
        "Configure master channel according to your preferences.\n\n" +
        "**_🎛️ General_**\n\n" +
        `➤ ∙ Name: <#${ vars.masterChannelId }>\n` +
        `➤ ∙ Channel ID: \`${ vars.masterChannelId }\`\n` +
        `➤ ∙ Dynamic Channels Name: \`${ vars.dynamicChannelNameTemplate }\`\n` +
        `➤ ∙ New Channel Privacy: ${ vars.newChannelPrivacy }\n` +
        `➤ ∙ New Channel Limit: ${ vars.newChannelLimit }\n` +
        `➤ ∙ Logs Channel: ${ vars.dynamicChannelLogsChannelDisplay }\n\n` +
        "**_🎚 Buttons Interface_**\n\n" +
        vars.dynamicChannelButtonsTemplate +
        "\n\n" +
        "**_🛡️ Verified Roles_**\n\n" +
        "▹ " +
        vars.verifiedRolesDisplay +
        "\n\n" +
        "**_🔑 Staff Roles_**\n\n" +
        "▹ " +
        vars.staffRolesDisplay +
        "\n\n" +
        "**_🎙️ Voice Role_**\n\n" +
        "▹ " +
        vars.voiceRoleDisplay +
        "\n\n" +
        "**_⚙️ Configuration_**\n\n" +
        "@ ∙ Mention user in primary message: " +
        vars.configUserMention +
        "\n" +
        "⫸ ∙ Auto save dynamic channels: " +
        vars.configAutoSave +
        "\n" +
        "📢 ∙ Automatic channel status: " +
        vars.configAutoStatus +
        "\n" +
        "❯❯ ∙ Send logs to custom channel: " +
        vars.configLogs +
        "\n" +
        "▥ ∙ Auto create control panel channel: " +
        vars.configControlChannelAutoCreate +
        "\n\n"
    ) )
    .setFooterText( () => "Note: Changing user mention will not affect already created dynamic channels." )
    .setOptions( () => ( {
        on: "`🟢∙On`",
        off: "`🔴∙Off`",

        dynamicChannelLogsChannelDisplay: {
            [ vars.dynamicChannelLogsChannelDefault ]: "**None**",
            [ vars.dynamicChannelLogsChannelSelected ]: `<#${ vars.dynamicChannelLogsChannelId }>`
        },

        configUserMention: {
            [ vars.configUserMentionEnabled ]: vars.on,
            [ vars.configUserMentionDisabled ]: vars.off
        },

        configAutoSave: {
            [ vars.configAutoSaveEnabled ]: vars.on,
            [ vars.configAutoSaveDisabled ]: vars.off
        },

        configAutoStatus: {
            [ vars.configAutoStatusEnabled ]: vars.on,
            [ vars.configAutoStatusDisabled ]: vars.off
        },

        configLogs: {
            [ vars.configLogsEnabled ]: vars.on,
            [ vars.configLogsDisabled ]: vars.off
        },

        configControlChannelAutoCreate: {
            [ vars.configControlChannelAutoCreateEnabled ]: vars.on,
            [ vars.configControlChannelAutoCreateDisabled ]: vars.off
        },

        verifiedRolesDisplay: {
            [ vars.verifiedRoles ]: vars.verifiedRoles,
            [ vars.verifiedRolesGuild ]: `${ vars.verifiedRoles } *(from the server options)*`
        },

        staffRolesDisplay: {
            [ vars.staffRoles ]: vars.staffRoles,
            [ vars.staffRolesGuild ]: `${ vars.staffRoles } *(from the server options)*`,
            [ vars.staffRolesNone ]: "**None** *(from the server options)*"
        },

        newChannelLimit: {
            [ vars.newChannelLimitUnlimited ]: "No limit",
            [ vars.newChannelLimitValue ]: `${ vars.newChannelLimitCount } users`
        },

        newChannelPrivacy: {
            [ vars.privacyPublic ]: "🌐 Public",
            [ vars.privacyPrivate ]: "🚫 Private",
            [ vars.privacyHidden ]: "🙈 Hidden"
        },

        voiceRoleDisplay: {
            [ vars.voiceRoleId ]: `<@&${ vars.voiceRoleId }>`,
            [ vars.voiceRoleGuild ]: `<@&${ vars.voiceRoleId }> *(from the server options)*`,
            [ vars.voiceRoleNone ]: "**None** *(from the server options)*"
        }
    } ) )
    .setArrayOptions( () => {
        const result: Record<string, { format: string; separator: string; options?: Record<string, string> }> = {
            dynamicChannelButtonsTemplate: {
                format: `- ( ${ vars.value } )${ vars.separator }`,
                separator: "\n",
                options: {}
            },
            verifiedRoles: {
                format: `<@&${ vars.value }>${ vars.separator }`,
                separator: ", "
            },
            staffRoles: {
                format: `<@&${ vars.value }>${ vars.separator }`,
                separator: ", "
            }
        };

        DynamicChannelElementsGroup.getAll().forEach( ( item ) => {
            if ( result.dynamicChannelButtonsTemplate.options ) {
                result.dynamicChannelButtonsTemplate.options[ item.getId() ] = item.getLabelForEmbed();
            }
        } );

        return result;
    } )
    .setLogic( ( args: UIArgs ) => {
        let processedLogsChannelId = args.dynamicChannelLogsChannelId;
        if ( Array.isArray( processedLogsChannelId ) && processedLogsChannelId.length > 0 ) {
            processedLogsChannelId = processedLogsChannelId[ 0 ];
        }

        // The stored lists, with what they fall back to alongside - a master channel holding none
        // of its own shows what it inherits rather than an empty line.
        const ownVerifiedRoles: string[] = Array.isArray( args.dynamicChannelVerifiedRoles )
            ? args.dynamicChannelVerifiedRoles
            : [];

        const guildVerifiedRoles: string[] = Array.isArray( args.guildVerifiedRoleIds )
            ? args.guildVerifiedRoleIds
            : [];

        const ownStaffRoles: string[] = Array.isArray( args.dynamicChannelStaffRoles )
            ? args.dynamicChannelStaffRoles
            : [];

        const guildStaffRoles: string[] = Array.isArray( args.guildStaffRoleIds )
            ? args.guildStaffRoleIds
            : [];

        const staffRoles: string[] = ownStaffRoles.length ? ownStaffRoles : guildStaffRoles;

        const privacyState = args.dynamicChannelDefaultPrivacyState as string;
        const newChannelPrivacy = "private" === privacyState
            ? vars.privacyPrivate
            : ( "hidden" === privacyState ? vars.privacyHidden : vars.privacyPublic );

        // An unset default copies the generator's own limit, so the number it copies is named
        // rather than the rule, and the wording is left to the options so it can be translated.
        const ownUserLimit = args.dynamicChannelDefaultUserLimit as number | null | undefined;
        const newChannelLimitCount =
            ( null === ownUserLimit || undefined === ownUserLimit ? Number( args.masterChannelUserLimit ) : ownUserLimit ) || 0;

        const ownVoiceRoleId = args.dynamicChannelVoiceRoleId as string | null,
            guildVoiceRoleId = args.guildVoiceRoleId as string | null,
            resolvedVoiceRoleId = ownVoiceRoleId || guildVoiceRoleId;

        return {
            index: args.index + 1,
            masterChannelId: args.masterChannelId,

            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate,
            dynamicChannelLogsChannelId: processedLogsChannelId,

            newChannelPrivacy,
            ...( newChannelLimitCount ? { newChannelLimitCount } : {} ),
            newChannelLimit: newChannelLimitCount ? vars.newChannelLimitValue : vars.newChannelLimitUnlimited,

            verifiedRoles: ownVerifiedRoles.length ? ownVerifiedRoles : guildVerifiedRoles,
            verifiedRolesDisplay: ownVerifiedRoles.length ? vars.verifiedRoles : vars.verifiedRolesGuild,

            ...( staffRoles.length ? { staffRoles } : {} ),
            staffRolesDisplay: ownStaffRoles.length
                ? vars.staffRoles
                : ( guildStaffRoles.length ? vars.staffRolesGuild : vars.staffRolesNone ),

            ...( resolvedVoiceRoleId ? { voiceRoleId: resolvedVoiceRoleId } : {} ),
            voiceRoleDisplay: ownVoiceRoleId
                ? vars.voiceRoleId
                : ( guildVoiceRoleId ? vars.voiceRoleGuild : vars.voiceRoleNone ),

            configUserMention: args.dynamicChannelMentionable
                ? vars.configUserMentionEnabled
                : vars.configUserMentionDisabled,
            configAutoSave: args.dynamicChannelAutoSave
                ? vars.configAutoSaveEnabled
                : vars.configAutoSaveDisabled,

            // Unset means on, the automatic status is what the channels have always had.
            configAutoStatus: false !== args.dynamicChannelAutoStatus
                ? vars.configAutoStatusEnabled
                : vars.configAutoStatusDisabled,

            configLogs: processedLogsChannelId
                ? vars.configLogsEnabled
                : vars.configLogsDisabled,

            configControlChannelAutoCreate: args.dynamicChannelControlChannelAutoCreate
                ? vars.configControlChannelAutoCreateEnabled
                : vars.configControlChannelAutoCreateDisabled,

            dynamicChannelLogsChannelDisplay: processedLogsChannelId
                ? vars.dynamicChannelLogsChannelSelected
                : vars.dynamicChannelLogsChannelDefault,

            dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.sortIds( args.dynamicChannelButtonsTemplate )
        };
    } )
    .setDefaultVars( () => ( {
        dynamicChannelButtonsTemplate: "Button list"
    } ) )
    .build();

export { SetupEditEmbed };
