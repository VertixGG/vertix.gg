import { ButtonStyle, Interaction } from "discord.js";

import EditTemplateModal from "@dynamico/ui/set-master-config/edit-template-modal";

import UIElement from "@dynamico/ui/base/ui-element";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import { guiManager } from "@dynamico/managers";

export default class EditTemplateButton extends UIElement {
    public static getName() {
        return "Dynamico/UI/SetMasterConfig/Buttons/EditTemplateButton";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected async getBuilders( interaction: Interaction ) {
        const modifyTemplate = this.getButtonBuilder( this.onClick.bind( this ) );

        modifyTemplate.setEmoji( "✏️" );
        modifyTemplate.setLabel( "Modify Default Name" );
        modifyTemplate.setStyle( ButtonStyle.Primary );

        return [ modifyTemplate ];
    }

    private async onClick( interaction: Interaction ) {
        if ( interaction.channel && interaction.isButton() ) {
            const component = guiManager
                .get( EditTemplateModal.getName() );

            if ( undefined !== typeof this.args.channelNameTemplate ) {
                component.setArg( "channelNameTemplate", this.args.channelNameTemplate );
            }

            if ( component && component.getModal ) {
                await interaction.showModal( await component.getModal( interaction ) );
            }        }
    }
}
