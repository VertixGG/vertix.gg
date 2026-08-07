import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";
import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS = {
    description: uiUtilsWrapAsTemplate( "description" ),
    descriptionDisplayDefault: uiUtilsWrapAsTemplate( "descriptionDisplayDefault" ),
    descriptionDisplayValue: uiUtilsWrapAsTemplate( "descriptionDisplayValue" ),
    descriptionValue: uiUtilsWrapAsTemplate( "descriptionValue" ),
    editPrimaryMessageEmoji: uiUtilsWrapAsTemplate( "editPrimaryMessageEmoji" )
};

const DynamicChannelPrimaryMessageEditDescriptionEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS>(
    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEmbed",
    DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( "https://i.imgur.com/sGjDVJ4.png" )
    .setTitle( () => `${ DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS.editPrimaryMessageEmoji }  •  Edit description of your channel` )
    .setDescription( () => "\n _Description_:\n `" + DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS.description + "`\n" + "\n### Do you want to change it?" )
    .setOptions( () => {
        const configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
            "Vertix/Config/MasterChannel",
            VERSION_UI_V3
        );
        const vars = DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS;
        return {
            description: {
                [ vars.descriptionDisplayValue ]: vars.descriptionValue,
                [ vars.descriptionDisplayDefault ]: configV3.data.constants.dynamicChannelPrimaryMessageDescription
            }
        };
    } )
    .setLogic( async( args: UIArgs ) => {
        const result: any = {};
        const { descriptionDisplayValue, descriptionDisplayDefault } = DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS;

        if ( args.description ) {
            result.descriptionValue = args.description;
            result.description = descriptionDisplayValue;
        } else {
            result.description = descriptionDisplayDefault;
        }

        result.editPrimaryMessageEmoji = await EmojiManager.$.getMarkdown(
            DynamicChannelPrimaryMessageEditButton.getBaseName()
        );

        return result;
    } )
    .build();

export { DynamicChannelPrimaryMessageEditDescriptionEmbed, DYNAMIC_CHANNEL_PRIMARY_MESSAGE_EDIT_DESCRIPTION_VARS };
