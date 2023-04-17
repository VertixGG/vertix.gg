import { ButtonStyle, Interaction } from "discord.js";

import UIElement from "@dynamico/ui/base/ui-element";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import { guiManager } from "@dynamico/managers";

export default class ClearBasicRolesButton extends UIElement {
    public static getName() {
        return "Dynamico/UI/SetBasicRole/ClearBasicRolesButton";
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
            await guiManager.get( "Dynamico/UI/SetupProcess" )
                .sendContinues( interaction, {
                    _step: 2,
                    basicRoles: undefined,
                } );
        }
    }
}
