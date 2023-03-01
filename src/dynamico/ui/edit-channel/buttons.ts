import { ButtonStyle, Interaction } from "discord.js";

import StaticUIBase from "../base/static-ui-base";

export default class EditChannelButtons extends StaticUIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/Buttons";
    }

    getComponents() {
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
            this.getButtonRow().addComponents( renameButton, limitButton ),
            this.getButtonRow().addComponents( publicButton, privateButton, specialButton )
        ];
    }

    private async renameChannel( interaction: Interaction ) {
        await interaction.user.send( "Rename Channel" );
    }

    private async limitChannel() {

    }

    private async publicChannel() {

    }

    private async privateChannel() {

    }

    private async specialChannel() {

    }
}
