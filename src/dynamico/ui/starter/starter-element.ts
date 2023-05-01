import { ButtonInteraction, ButtonStyle } from "discord.js";

import { E_UI_TYPES, UIBaseInteractionTypes } from "@dynamico/ui/_base/ui-interfaces";

import UIElement from "@dynamico/ui/_base/ui-element";

import { guildGetBadwordsFormatted } from "@dynamico/utils/guild";

import { guiManager } from "@dynamico/managers";

import { DEFAULT_DATA_DYNAMIC_CHANNEL_NAME } from "@dynamico/constants/master-channel";

export class StarterElement extends UIElement {
    public static getName() {
        return "Dynamico/UI/StarterElement";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected async getBuilders( interaction?: UIBaseInteractionTypes, args?: any ) {
        const setupButton = this.getButtonBuilder( this.onSetupButtonClick.bind( this ) ),
            inviteButton = this.getButtonLinkBuilder(),
            supportButton = this.getButtonLinkBuilder();

        setupButton.setLabel( "Create Master Channel" );
        setupButton.setEmoji( "➕" );
        setupButton.setStyle( ButtonStyle.Primary );

        inviteButton.setLabel( "Invite Dynamico" );
        inviteButton.setURL( "https://discord.com/oauth2/authorize?client_id=1076964068117725214&permissions=286346264&scope=bot%20applications.commands" );

        supportButton.setLabel( "Community Support" );
        supportButton.setURL( "https://discord.gg/Dynamico");

        return [
            [ setupButton ],
            [ inviteButton, supportButton ],
        ];
    }

    private async onSetupButtonClick( interaction: ButtonInteraction ) {
       await guiManager.get( "Dynamico/UI/SetupWizard" )
            .sendContinues( interaction, {
                step: "initial",
                channelNameTemplate: DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
                badwords: await guildGetBadwordsFormatted( interaction.guildId as string ),
            } );
    }

    private async onInviteButtonClick( interaction: ButtonInteraction ) {
    }

    private async onSupportButtonClick( interaction: ButtonInteraction ) {
    }
}
