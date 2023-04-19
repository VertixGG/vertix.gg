import { ButtonInteraction, ButtonStyle, Interaction } from "discord.js";

import EditTemplateModal from "@dynamico/ui/_TEMP/set-master-config/edit-template-modal";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { guiManager } from "@dynamico/managers";

export default class EditTemplateButton extends UIElement {
    public static getName() {
        return "Dynamico/UI/Temp/SetMasterConfig/EditTemplateButton";
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

    private async onClick( interaction: ButtonInteraction ) {
        const component = guiManager
            .get( EditTemplateModal.getName() );

        if ( undefined !== typeof this.args.channelNameTemplate ) {
            if ( this.args._id?.length ) {
                component.setArg( "_id", this.args._id );
            }

            component.setArg( "channelNameTemplate", this.args.channelNameTemplate );
        }

        if ( component && component.getModal ) {
            await interaction.showModal( await component.getModal( interaction ) );
        }
    }
}
