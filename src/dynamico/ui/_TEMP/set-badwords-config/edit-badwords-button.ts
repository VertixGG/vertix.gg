import { ButtonInteraction, ButtonStyle, Interaction } from "discord.js";

import { GUIManager } from "@dynamico/managers/gui";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import EditBadwordsModal from "@dynamico/ui/_TEMP/set-badwords-config/edit-badwords-modal";

export default class EditBadwordsButton extends UIElement {
    public static getName() {
        return "Dynamico/UI/Temp/SetBadwordsConfig/EditBadwordsButton";
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
        const component = GUIManager.$
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
