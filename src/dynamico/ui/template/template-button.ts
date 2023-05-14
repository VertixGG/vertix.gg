import { ButtonInteraction, ButtonStyle, Interaction } from "discord.js";

import UIElement from "@dynamico/ui/_base/ui-element";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { GUIManager } from "@dynamico/managers/gui";

export class TemplateButton extends UIElement {
    public static getName() {
        return "Dynamico/UI/TemplateButton";
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
        const component = GUIManager.$.get( "Dynamico/UI/TemplateModal" );

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
