import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { ChannelButtonsTemplateEmbed } from "@vertix/ui-v2/channel-buttons-template/channel-buttons-template-embed";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export class SetupStep2Embed extends ChannelButtonsTemplateEmbed {
    private static vars = {
        message: uiUtilsWrapAsTemplate( "message" ),
        defaultMessage: uiUtilsWrapAsTemplate( "defaultMessage" ),
        noButtonsMessage: uiUtilsWrapAsTemplate( "noButtonsMessage" ),

        configUserMention: uiUtilsWrapAsTemplate( "configUserMention" ),
        configUserMentionEnabled: uiUtilsWrapAsTemplate( "configUserMentionEnabled" ),
        configUserMentionDisabled: uiUtilsWrapAsTemplate( "configUserMentionDisabled" ),

        footer: uiUtilsWrapAsTemplate( "footer" ),
        defaultFooter: uiUtilsWrapAsTemplate( "defaultFooter" ),
        noButtonsFooter: uiUtilsWrapAsTemplate( "noButtonsFooter" ),
    };

    public static getName() {
        return "Vertix/UI-V2/SetupStep2Embed";
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

    protected getTitle(): string {
        return "Step 2 - Dynamic Channels Setup";
    }

    protected getDescription(): string {
        return "Setup dynamic channel management interface.\n\n" +
            "**_🎚 Buttons Interface_**\n\n" +
            SetupStep2Embed.vars.message + "\n" +
            "**_⚙️ Configuration_**\n\n" +

            "> 📌 Mention user in primary message: " + SetupStep2Embed.vars.configUserMention +
            "\n\n" +
            "You can keep the default settings by pressing **( `Next ▶` )** button." +
            "\n\n" +
            "Not sure what buttons do? check out the [explanation](https://vertix.gg/features/dynamic-channels-showcase).";
    }

    protected getFooter() {
        return SetupStep2Embed.vars.footer;
    }

    protected getOptions() {
        const {
            defaultMessage,
            noButtonsMessage,

            configUserMentionEnabled,
            configUserMentionDisabled,

            defaultFooter,
            noButtonsFooter,
        } = SetupStep2Embed.vars;

        return {
            message: {
                [ defaultMessage ]: super.getDescription() + "\n",
                [ noButtonsMessage ]: "There are no buttons selected!\n",
            },

            configUserMention: {
                [ configUserMentionEnabled ]: "\`🟢∙On`",
                [ configUserMentionDisabled ]: "\`🔴∙Off`",
            },

            footer: {
                [ defaultFooter ]: "Members creating dynamic channels through this master channel will see only the buttons you have selected. You can choose the buttons using the menu below.",
                [ noButtonsFooter ]: "Note: Without buttons members will not be able to manage their dynamic channels. no embed or interface will be shown to them.\n",
            },
        };
    }

    protected getLogic( args: UIArgs ) {
        const buttonsLength = args.dynamicChannelButtonsTemplate?.length ?? 0;

        return {
            configUserMention: args.dynamicChannelMentionable ? SetupStep2Embed.vars.configUserMentionEnabled : SetupStep2Embed.vars.configUserMentionDisabled,

            message: buttonsLength ? SetupStep2Embed.vars.defaultMessage : SetupStep2Embed.vars.noButtonsMessage,
            footer: buttonsLength ? SetupStep2Embed.vars.defaultFooter : SetupStep2Embed.vars.noButtonsFooter,
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate,
        };
    }
}

