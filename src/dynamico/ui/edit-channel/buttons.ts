import {
    ButtonStyle,
    ChannelType,
    Interaction,
    TextInputStyle
} from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIBase from "../base/ui-base";
import GUIManager from "@dynamico/managers/gui";

import RenameChannelModalUI from "./modals/rename-channel-modal";
import UserlimitChannelModalUI from "./modals/userlimit-channel-modal";

export default class EditChannelButtons extends UIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/Buttons";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    getBuilders() {
        const renameButton = this.getButtonBuilder( this.renameChannel.bind( this ) ),
            limitButton = this.getButtonBuilder( this.limitChannel.bind( this ) ),
            publicButton = this.getButtonBuilder( this.publicChannel.bind( this ) ),
            privateButton = this.getButtonBuilder( this.privateChannel.bind( this ) ),
            specialButton = this.getButtonBuilder( this.specialChannel.bind( this ) );

        renameButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "✏️" )
            .setLabel( "Rename" );

        limitButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "✋" )
            .setLabel( "User Limit" );

        publicButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "🌐" )
            .setLabel( "Public" );

        privateButton
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "🚫" )
            .setLabel( "Private" );

        specialButton
            .setStyle( ButtonStyle.Primary )
            .setEmoji( "🌟" )
            .setLabel( "Special Channel" )
            .setDisabled( true );

        return [
            [ renameButton, limitButton ],
            [ publicButton, privateButton, specialButton ],
        ];
    }

    private async renameChannel( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            const component = GUIManager
                .getInstance()
                .get( RenameChannelModalUI.getName() );

            if ( component && component.getModal ) {
                await interaction.showModal( component.getModal( interaction ) );
            }
        }
    }

    private async limitChannel( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            const component = GUIManager
                .getInstance()
                .get( UserlimitChannelModalUI.getName() );

            if ( component && component.getModal ) {
                await interaction.showModal( component.getModal( interaction ) );
            }
        }
    }

    private async publicChannel() {

    }

    private async privateChannel() {

    }

    private async specialChannel() {

    }
}
