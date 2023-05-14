import { ButtonStyle, Interaction } from "discord.js";

import { GUIManager } from "@dynamico/managers/gui";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

export class BasicRoleClearButton extends UIElement {
    public static getName() {
        return "Dynamico/UI/BasicRoleClearButton";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC; // TODO: try to make this static
    }

    protected async getBuilders( interaction: Interaction ) {
        const clearButton = this.getButtonBuilder( this.onClick.bind( this ) );

        clearButton.setEmoji( "🗑️");
        clearButton.setLabel( "Clear roles" );
        clearButton.setStyle( ButtonStyle.Primary );

        return [ clearButton ];
    }

    private async onClick( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            await GUIManager.$.get( "Dynamico/UI/SetupWizard" )
                .sendContinues( interaction, {
                    _step: 2,
                    basicRoles: undefined,
                } );
        }
    }
}
