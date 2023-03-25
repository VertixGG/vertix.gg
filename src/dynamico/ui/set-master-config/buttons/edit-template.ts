import { ButtonStyle, Interaction } from "discord.js";

import EditTemplateModal from "@dynamico/ui/set-master-config/modals/edit-template-modal";

import UIElement from "@dynamico/ui/base/ui-element";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import { guiManager } from "@dynamico/managers";

export default class EditTemplate extends UIElement {
    public static getName() {
        return "Dynamico/UI/SetMasterConfig/Buttons/EditTemplate";
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

            if ( component && component.getModal ) {
                if ( this.args.channelNameTemplate ) {
                    component.setArg( "channelNameTemplate", this.args.channelNameTemplate );
                }

                await interaction.showModal( await component.getModal( interaction ) );
            }
        }
    }
}
