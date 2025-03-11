import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ChannelButtonsTemplateEmbed } from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-embed";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupEditEmbed extends ChannelButtonsTemplateEmbed {
    private static vars: any = {
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

        configLogs: uiUtilsWrapAsTemplate( "configLogs" ),
        configLogsEnabled: uiUtilsWrapAsTemplate( "configLogsEnabled" ),
        configLogsDisabled: uiUtilsWrapAsTemplate( "configLogsDisabled" ),

        dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),
        dynamicChannelLogsChannelId: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelId" ),

        dynamicChannelLogsChannelDefault: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelDefault" ),
        dynamicChannelLogsChannelSelected: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelSelected" ),
        dynamicChannelLogsChannelDisplay: uiUtilsWrapAsTemplate( "dynamicChannelLogsChannelDisplay" ),

        verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" )
    };

    public static getName() {
        return "Vertix/UI-V3/SetupEditEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return `🔧  Configure Master Channel #${ SetupEditEmbed.vars.index }`;
    }

    protected getDescription() {
        return (
            "Configure master channel according to your preferences.\n\n" +
            "**_🎛️ General_**\n\n" +
            `➤ ∙ Name: <#${ SetupEditEmbed.vars.masterChannelId }>\n` +
            `➤ ∙ Channel ID: \`${ SetupEditEmbed.vars.masterChannelId }\`\n` +
            `➤ ∙ Dynamic Channels Name: \`${ SetupEditEmbed.vars.dynamicChannelNameTemplate }\`\n` +
            `➤ ∙ Logs Channel: ${ SetupEditEmbed.vars.dynamicChannelLogsChannelDisplay }\n\n` +
            "**_🎚 Buttons Interface_**\n\n" +
            super.getDescription() +
            "\n\n" +
            "**_🛡️ Verified Roles_**\n\n" +
            "▹ " +
            SetupEditEmbed.vars.verifiedRoles +
            "\n\n" +
            "**_⚙️ Configuration_**\n\n" +
            "@ ∙ Mention user in primary message: " +
            SetupEditEmbed.vars.configUserMention +
            "\n" +
            "⫸ ∙ Auto save dynamic channels: " +
            SetupEditEmbed.vars.configAutoSave +
            "\n" +
            "❯❯ ∙ Send logs to custom channel: " +
            SetupEditEmbed.vars.configLogs +
            "\n\n"
        );
    }

    protected getFooter() {
        return "Note: Changing user mention will not affect already created dynamic channels.";
    }

    protected getOptions() {
        const {
            on,
            off,

            dynamicChannelLogsChannelId,

            dynamicChannelLogsChannelDefault,
            dynamicChannelLogsChannelSelected,

            configUserMentionEnabled,
            configUserMentionDisabled,

            configAutoSaveEnabled,
            configAutoSaveDisabled,

            configLogsEnabled,
            configLogsDisabled
        } = SetupEditEmbed.vars;

        return {
            on: "\`🟢∙On`",
            off: "\`🔴∙Off`",

            dynamicChannelLogsChannelDisplay: {
                [ dynamicChannelLogsChannelDefault ]: "**None**",
                [ dynamicChannelLogsChannelSelected ]: `<#${ dynamicChannelLogsChannelId }>`
            },

            configUserMention: {
                [ configUserMentionEnabled ]: on,
                [ configUserMentionDisabled ]: off
            },

            configAutoSave: {
                [ configAutoSaveEnabled ]: on,
                [ configAutoSaveDisabled ]: off
            },

            configLogs: {
                [ configLogsEnabled ]: on,
                [ configLogsDisabled ]: off
            }
        };
    }

    protected getArrayOptions() {
        return {
            ...super.getArrayOptions(),

            verifiedRoles: {
                format: `<@&${ SetupEditEmbed.vars.value }>${ SetupEditEmbed.vars.separator }`,
                separator: ", "
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        return {
            index: args.index + 1,
            masterChannelId: args.masterChannelId,

            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate,
            dynamicChannelLogsChannelId: args.dynamicChannelLogsChannelId,

            verifiedRoles: args.dynamicChannelVerifiedRoles,

            configUserMention: args.dynamicChannelMentionable
                ? SetupEditEmbed.vars.configUserMentionEnabled
                : SetupEditEmbed.vars.configUserMentionDisabled,
            configAutoSave: args.dynamicChannelAutoSave
                ? SetupEditEmbed.vars.configAutoSaveEnabled
                : SetupEditEmbed.vars.configAutoSaveDisabled,

            configLogs: args.dynamicChannelLogsChannelId
                ? SetupEditEmbed.vars.configLogsEnabled
                : SetupEditEmbed.vars.configLogsDisabled,

            dynamicChannelLogsChannelDisplay: args.dynamicChannelLogsChannelId
                ? SetupEditEmbed.vars.dynamicChannelLogsChannelSelected
                : SetupEditEmbed.vars.dynamicChannelLogsChannelDefault,

            ...super.getLogic( args )
        };
    }
}
