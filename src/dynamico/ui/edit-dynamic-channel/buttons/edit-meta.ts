import {
    ButtonStyle,
    Interaction,
} from "discord.js";

import RenameModal from "../modals/rename";
import UserlimitModal from "../modals/userlimit";
import { GUIManager } from "@dynamico/managers/gui";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import UIElement from "@dynamico/ui/_base/ui-element";

export default class EditMeta extends UIElement {

    public static getName() {
        return "Dynamico/UI/EditDynamicChannel/Buttons/EditMeta";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public async getBuilders() {
        const renameButton = this.getButtonBuilder( this.renameChannel.bind( this ) ),
            limitButton = this.getButtonBuilder( this.limitChannel.bind( this ) );

        renameButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "✏️" )
            .setLabel( "Rename" );

        limitButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "✋" )
            .setLabel( "User Limit" );

        return [ renameButton, limitButton ];
    }

    private async renameChannel( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            const component = GUIManager.$
                .get( RenameModal.getName() );

            if ( component && component.getModal ) {
                await interaction.showModal( await component.getModal( interaction ) );
            }
        }
    }

    private async limitChannel( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            const component = GUIManager.$
                .get( UserlimitModal.getName() );

            if ( component && component.getModal ) {
                await interaction.showModal( await component.getModal( interaction ) );
            }
        }
    }
}
