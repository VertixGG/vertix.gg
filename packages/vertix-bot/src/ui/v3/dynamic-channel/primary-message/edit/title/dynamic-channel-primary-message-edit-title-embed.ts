import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";
import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS = {
    title: uiUtilsWrapAsTemplate( "title" ),
    titleDisplayDefault: uiUtilsWrapAsTemplate( "titleDisplayDefault" ),
    titleDisplayValue: uiUtilsWrapAsTemplate( "titleDisplayValue" ),
    titleValue: uiUtilsWrapAsTemplate( "titleValue" ),
    editPrimaryMessageEmoji: uiUtilsWrapAsTemplate( "editPrimaryMessageEmoji" )
};

const DynamicChannelPrimaryMessageEditTitleEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS>(
    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEmbed",
    DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( "https://i.imgur.com/sGjDVJ4.png" )
    .setTitle( () => `${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS.editPrimaryMessageEmoji }  •  Edit title of your channel` )
    .setDescription( () => "\n _Title_:\n `" + DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS.title + "`\n" + "\n### Do you want to change it?" )
    .setOptions( () => {
        const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
            "Vertix/Config/MasterChannel",
            VERSION_UI_V3
        );
        const vars = DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS;
        return {
            title: {
                [ vars.titleDisplayValue ]: vars.titleValue,
                [ vars.titleDisplayDefault ]: configV3.data.constants.dynamicChannelPrimaryMessageTitle
            }
        };
    } )
    .setLogic( async( args: UIArgs ) => {
        const result: any = {};
        const { titleDisplayValue, titleDisplayDefault } = DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS;

        if ( args.title ) {
            result.titleValue = args.title;
            result.title = titleDisplayValue;
        } else {
            result.title = titleDisplayDefault;
        }

        result.editPrimaryMessageEmoji = await EmojiManager.$.getMarkdown(
            DynamicChannelPrimaryMessageEditButton.getBaseName()
        );

        return result;
    } )
    .build();

export { DynamicChannelPrimaryMessageEditTitleEmbed, DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_TITLE_VARS };
