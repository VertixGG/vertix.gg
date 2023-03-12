import {
    ButtonStyle,
    Interaction,
} from "discord.js";

import RenameModal from "../modals/rename";
import UserlimitModal from "../modals/userlimit";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import guiManager from "@dynamico/managers/gui";

import UIElement from "@dynamico/ui/base/ui-element";

import Logger from "@internal/modules/logger";

export default class EditMeta extends UIElement {
    private logger: Logger;

    public static getName() {
        return "Dynamico/UI/EditDynamicChannel/Buttons/EditMeta";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    public constructor() {
        super();

        this.logger = new Logger( this );
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
            const component = guiManager
                .get( RenameModal.getName() );

            if ( component && component.getModal ) {
                await interaction.showModal( await component.getModal( interaction ) );
            }
        }
    }

    private async limitChannel( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            const component = guiManager
                .get( UserlimitModal.getName() );

            if ( component && component.getModal ) {
                await interaction.showModal( await component.getModal( interaction ) );
            }
        }
    }
}
