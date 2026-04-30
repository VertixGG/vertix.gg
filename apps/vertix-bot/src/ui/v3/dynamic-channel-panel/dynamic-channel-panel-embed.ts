import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "../../../managers/emoji-manager";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    dynamicChannelButtonsTemplate: uiUtilsWrapAsTemplate( "dynamicChannelButtonsTemplate" )
};

const DynamicChannelPanelEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelPanelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( "https://i.imgur.com/sGjDVJ4.png" )
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
            format: vars.value + vars.separator,
            separator: "\n\n",
            options: {
                "rename": EmojiManager.$.getMarkdown( "ChannelRename" ) + " ・ **Rename** - Change your channel name",
                "limit": EmojiManager.$.getMarkdown( "UserLimit" ) + " ・ **User Limit** - Set maximum users",
                "access": EmojiManager.$.getMarkdown( "ChannelPermissions" ) + " ・ **Access** - Manage user permissions",
                "privacy": EmojiManager.$.getMarkdown( "ChannelPrivacy" ) + " ・ **Privacy** - Toggle public/private state",
                "region": EmojiManager.$.getMarkdown( "ChannelRegion" ) + " ・ **Region** - Change voice region",
                "edit-primary-message": EmojiManager.$.getMarkdown( "EditChannelMessage" ) + " ・ **Edit Message** - Customize primary message",
                "clear-chat": EmojiManager.$.getMarkdown( "ClearChat" ) + " ・ **Clear Chat** - Delete chat messages",
                "rest-channel": EmojiManager.$.getMarkdown( "ResetChannel" ) + " ・ **Reset** - Reset channel settings",
                "transfer": EmojiManager.$.getMarkdown( "TransferChannel" ) + " ・ **Transfer** - Transfer ownership",
                "templates": EmojiManager.$.getMarkdown( "Templates" ) + " ・ **Templates** - Save/load channel templates",
                "claim-button": EmojiManager.$.getMarkdown( "ClaimChannel" ) + "・ **Claim** - Claim abandoned channel"
            }
        }
    } )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string[]> = {};

        if ( args.dynamicChannelButtonsTemplate?.length ) {
            result.dynamicChannelButtonsTemplate = args.dynamicChannelButtonsTemplate;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.getAll().map( item => item.getId() )
    } ) )
    .build();

export { DynamicChannelPanelEmbed };
