import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";
import { DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-embed";
import { DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    editPrimaryMessageEmoji: uiUtilsWrapAsTemplate( "editPrimaryMessageEmoji" ),
    title: DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS.title,
    description: DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS.description
};

const DynamicChannelPrimaryMessageEditEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( "https://i.imgur.com/sGjDVJ4.png" )
    .setTitle( () => `${ vars.editPrimaryMessageEmoji }  •  Edit primary message of your channel` )
    .setDescription( () => (
        "\n _Current_:\n" +
        "\n• Title: `" +
        vars.title +
        "`\n" +
        "\n• Description: `" +
        vars.description +
        "`\n" +
        "\n### Do you want to change it?"
    ) )
    // .setLogic( async( _args: UIArgs ) => {
    //     const result: any = {};
    //
    //     result.editPrimaryMessageEmoji = DynamicChannelPrimaryMessageEditButton.getEmoji();

    //     return result;
    // } )
    // TODO: setDefaultVars shoudld handle the logic above.
    .setDefaultVars( () => {
        return {
            editPrimaryMessageEmoji: DynamicChannelPrimaryMessageEditButton.getEmoji(),
        };
    } )
    .build();

export { DynamicChannelPrimaryMessageEditEmbed };
