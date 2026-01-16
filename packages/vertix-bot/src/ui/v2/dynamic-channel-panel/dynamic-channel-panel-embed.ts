import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" )
};

const FEATURE_OPTIONS = {
    "0": "✏️ ∙ **Rename** - Change your channel name",
    "1": "✋ ∙ **User Limit** - Set maximum users",
    "2": "🧹 ∙ **Clear Chat** - Delete chat messages",
    "3": "🚫 ∙ **Private** / 🌐 ∙ **Public** - Toggle privacy state",
    "4": "🙈 ∙ **Hidden** / 🐵 ∙ **Shown** - Toggle visibility",
    "5": "👥 ∙ **Access** - Manage user permissions",
    "6": "🔃 ∙ **Reset** - Reset channel settings",
    "7": "😈 ∙ **Claim** - Claim abandoned channel",
    "12": "🔀 ∙ **Transfer** - Transfer ownership"
};

const DynamicChannelPanelEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelPanelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "༄ Manage your Dynamic Channel" )
    .setDescription( () =>
        "Embrace the responsibility of overseeing your dynamic channel, " +
        "diligently customizing it according to your discerning preferences.\n\n" +
        "**Available Features:**\n\n" +
        vars.dynamicChannelButtonsTemplate + "\n\n" +
        "_Please be advised that the privilege to make alterations is vested solely to the channel owner._"
    )
    .setArrayOptions( {
        dynamicChannelButtonsTemplate: {
            format: "{value}{separator}",
            separator: "\n",
            options: FEATURE_OPTIONS
        }
    } )
    .setLogic( ( args: UIArgs ) => {
        const buttonsTemplate = args.dynamicChannelButtonsTemplate?.length
            ? args.dynamicChannelButtonsTemplate
            : DynamicChannelElementsGroup.getAll().map( item => item.getId().toString() );

        return {
            dynamicChannelButtonsTemplate: buttonsTemplate
        };
    } )
    .build();

export { DynamicChannelPanelEmbed };
