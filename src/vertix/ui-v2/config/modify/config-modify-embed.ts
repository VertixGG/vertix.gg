import { ButtonsEmbed } from "@vertix/ui-v2/buttons/buttons-embed";

import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export class ConfigModifyEmbed extends ButtonsEmbed {
    private static vars: any = {
        index: uiUtilsWrapAsTemplate( "index" ),
        masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),

        configUserMention: uiUtilsWrapAsTemplate( "configUserMention" ),
        configUserMentionEnabled: uiUtilsWrapAsTemplate( "configUserMentionEnabled" ),
        configUserMentionDisabled: uiUtilsWrapAsTemplate( "configUserMentionDisabled" ),

        dynamicChannelNameTemplate: uiUtilsWrapAsTemplate( "dynamicChannelNameTemplate" ),

        verifiedRoles: uiUtilsWrapAsTemplate( "verifiedRoles" ),
    };

    public static getName() {
        return "Vertix/UI-V2/ConfigModifyEmbed";
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
        return `🔧  Modify Master Channel #${ ConfigModifyEmbed.vars.index }`;
    }

    protected getDescription() {
        return "Configure master channel according to your preferences.\n\n" +

            `▹ Name: <#${ ConfigModifyEmbed.vars.masterChannelId }>\n` +
            `▹ Channel ID: \`${ ConfigModifyEmbed.vars.masterChannelId }\`\n` +
            `▹ Dynamic Channels Name: \`${ ConfigModifyEmbed.vars.dynamicChannelNameTemplate }\`\n\n` +

            "**_🎚 Buttons Interface_**\n\n" +
            super.getDescription() + "\n\n" +

            "**_⚙️ Configuration_**\n\n" +
            "> 📌 Mention user in primary message: " + ConfigModifyEmbed.vars.configUserMention;
    }

    protected getFooter() {
        return "Note: Changing user mention will not affect already created dynamic channels.";
    }

    protected getOptions() {
        const {
            configUserMentionEnabled,
            configUserMentionDisabled,
        } = ConfigModifyEmbed.vars;

        return {
            configUserMention: {
                [ configUserMentionEnabled ]: "\`🟢∙On`",
                [ configUserMentionDisabled ]: "\`🔴∙Off`",
            },
        };
    }

    protected getLogic( args: UIArgs ) {
        return {
            index: args.index + 1,
            masterChannelId: args.masterChannelId,

            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate,
            configUserMention: args.dynamicChannelMentionable ? ConfigModifyEmbed.vars.configUserMentionEnabled : ConfigModifyEmbed.vars.configUserMentionDisabled,

            ... super.getLogic( args ),
        };
    }
}
