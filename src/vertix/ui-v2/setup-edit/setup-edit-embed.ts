import { ChannelButtonsTemplateEmbed } from "@vertix/ui-v2/channel-buttons-template/channel-buttons-template-embed";

import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export class SetupEditEmbed extends ChannelButtonsTemplateEmbed {
    private static vars: any = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        index: uiUtilsWrapAsTemplate( "index" ),
        masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),

        configUserMention: uiUtilsWrapAsTemplate( "configUserMention" ),
        configUserMentionEnabled: uiUtilsWrapAsTemplate( "configUserMentionEnabled" ),
        configUserMentionDisabled: uiUtilsWrapAsTemplate( "configUserMentionDisabled" ),

        dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),

        verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" ),
    };

    public static getName() {
        return "Vertix/UI-V2/SetupEditEmbed";
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
        return "Configure master channel according to your preferences.\n\n" +

            `▹ Name: <#${ SetupEditEmbed.vars.masterChannelId }>\n` +
            `▹ Channel ID: \`${ SetupEditEmbed.vars.masterChannelId }\`\n` +
            `▹ Dynamic Channels Name: \`${ SetupEditEmbed.vars.dynamicChannelNameTemplate }\`\n\n` +

            "**_🎚 Buttons Interface_**\n\n" +
            super.getDescription() + "\n\n" +

            "**_🛡️ Verified Roles_**\n\n" +
            "> " + SetupEditEmbed.vars.verifiedRoles + "\n\n" +

            "**_⚙️ Configuration_**\n\n" +
            "> 📌 Mention user in primary message: " + SetupEditEmbed.vars.configUserMention;

    }

    protected getFooter() {
        return "Note: Changing user mention will not affect already created dynamic channels.";
    }

    protected getOptions() {
        const {
            configUserMentionEnabled,
            configUserMentionDisabled,
        } = SetupEditEmbed.vars;

        return {
            configUserMention: {
                [ configUserMentionEnabled ]: "\`🟢∙On`",
                [ configUserMentionDisabled ]: "\`🔴∙Off`",
            },
        };
    }

    protected getArrayOptions() {
        return {
            ... super.getArrayOptions(),

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

            verifiedRoles: args.dynamicChannelVerifiedRoles,

            configUserMention: args.dynamicChannelMentionable ? SetupEditEmbed.vars.configUserMentionEnabled : SetupEditEmbed.vars.configUserMentionDisabled,

            ... super.getLogic( args ),
        };
    }
}
