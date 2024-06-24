import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { ChannelButtonsTemplateEmbed } from "@vertix.gg/bot/src/ui-v2/channel-buttons-template/channel-buttons-template-embed";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class SetupStep2Embed extends ChannelButtonsTemplateEmbed {
    private static vars = {
        on: uiUtilsWrapAsTemplate( "on" ),
        off: uiUtilsWrapAsTemplate( "off" ),

        message: uiUtilsWrapAsTemplate( "message" ),
        defaultMessage: uiUtilsWrapAsTemplate( "defaultMessage" ),
        noButtonsMessage: uiUtilsWrapAsTemplate( "noButtonsMessage" ),

        configUserMention: uiUtilsWrapAsTemplate( "configUserMention" ),
        configUserMentionEnabled: uiUtilsWrapAsTemplate( "configUserMentionEnabled" ),
        configUserMentionDisabled: uiUtilsWrapAsTemplate( "configUserMentionDisabled" ),

        configAutoSave: uiUtilsWrapAsTemplate( "configAutoSave" ),
        configAutoSaveEnabled: uiUtilsWrapAsTemplate( "configAutoSaveEnabled" ),
        configAutoSaveDisabled: uiUtilsWrapAsTemplate( "configAutoSaveDisabled" ),

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

            "> @ ∙ Mention user in primary message: " + SetupStep2Embed.vars.configUserMention + "\n" +
            "> ⫸ ∙ Auto save dynamic channels: " + SetupStep2Embed.vars.configAutoSave + "\n" +
            "\n" +
            "You can keep the default settings by pressing **( `Next ▶` )** button." +
            "\n\n" +
            "Not sure what buttons do? check out the [explanation](https://vertix.gg/features/dynamic-channels-showcase).";
    }

    protected getFooter() {
        return SetupStep2Embed.vars.footer;
    }

    protected getOptions() {
        const {
            on,
            off,

            defaultMessage,
            noButtonsMessage,

            configUserMentionEnabled,
            configUserMentionDisabled,

            configAutoSaveEnabled,
            configAutoSaveDisabled,

            defaultFooter,
            noButtonsFooter,
        } = SetupStep2Embed.vars;

        return {
            "on": "\`🟢∙On`",
            "off": "\`🔴∙Off`",

            message: {
                [ defaultMessage ]: super.getDescription() + "\n",
                [ noButtonsMessage ]: "There are no buttons selected!\n",
            },

            configUserMention: {
                [ configUserMentionEnabled ]: on,
                [ configUserMentionDisabled ]: off,
            },

            configAutoSave: {
                [ configAutoSaveEnabled ]: on,
                [ configAutoSaveDisabled ]: off,
            },

            footer: {
                [ defaultFooter ]: "Newly created dynamic channels through this master channel will be affected by the configuration you have selected.",
                [ noButtonsFooter ]: "Note: Without buttons members will not be able to manage their dynamic channels. no embed or interface will be shown to them.\n",
            },
        };
    }

    protected getLogic( args: UIArgs ) {
        const buttonsLength = args.dynamicChannelButtonsTemplate?.length ?? 0;

        return {
            configUserMention: args.dynamicChannelMentionable ? SetupStep2Embed.vars.configUserMentionEnabled : SetupStep2Embed.vars.configUserMentionDisabled,
            configAutoSave: args.dynamicChannelAutoSave ? SetupStep2Embed.vars.configAutoSaveEnabled : SetupStep2Embed.vars.configAutoSaveDisabled,

            message: buttonsLength ? SetupStep2Embed.vars.defaultMessage : SetupStep2Embed.vars.noButtonsMessage,
            footer: buttonsLength ? SetupStep2Embed.vars.defaultFooter : SetupStep2Embed.vars.noButtonsFooter,
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate,
        };
    }
}

