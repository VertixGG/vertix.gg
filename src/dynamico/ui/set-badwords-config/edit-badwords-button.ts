import { ButtonInteraction, ButtonStyle, Interaction } from "discord.js";

import UIElement from "@dynamico/ui/base/ui-element";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import { guiManager } from "@dynamico/managers";

import EditBadwordsModal from "@dynamico/ui/set-badwords-config/edit-badwords-modal";

export default class EditBadwordsButton extends UIElement {
    public static getName() {
        return "Dynamico/UI/SetBadwords/EditBadwordsButton";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected async getBuilders( interaction: Interaction ) {
        const modifyBadwords = this.getButtonBuilder( this.onClick.bind( this ) );

        modifyBadwords.setEmoji( "🙅" );
        modifyBadwords.setLabel( "Modify Bad Words" );
        modifyBadwords.setStyle( ButtonStyle.Primary );

        return [ modifyBadwords ];
    }

    private async onClick( interaction: ButtonInteraction ) {
        const component = guiManager
            .get( EditBadwordsModal.getName() );

        if ( undefined !== typeof this.args.badwords ) {
            if ( this.args._id?.length ) {
                component.setArg( "_id", this.args._id );
            }

            component.setArg( "badwords", this.args.badwords );
        }

        if ( component && component.getModal ) {
            await interaction.showModal( await component.getModal( interaction ) );
        }
    }
}
