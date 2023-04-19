import { ButtonStyle, Interaction } from "discord.js";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import UIElement from "@dynamico/ui/_base/ui-element";

export default class Buttons extends UIElement {
    public static getName() {
        return "Dynamico/UI/Wizard/Buttons";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public getName() {
        return this.args._parent.getName() + "/Buttons";
    }

    public async getBuilders( interaction: Interaction, args?: any ) {
        const result = [],
            { _step, _end } = args;

        result.push( this.getButtonBuilder( this.back.bind( this ) )
            .setStyle( ButtonStyle.Secondary )
            .setEmoji( "◀️" )
            .setDisabled( 0 === _step )
            .setLabel( "Back" )
        );

         if ( _end > _step ) {
            result.push( this.getButtonBuilder( this.next.bind( this ) )
                .setStyle( ButtonStyle.Secondary )
                .setEmoji( "▶️" )
                .setLabel( "Next" )
            );
        } else if ( _end === _step ) {
            result.push( this.getButtonBuilder( this.finish.bind( this ) )
                .setStyle( ButtonStyle.Success )
                .setEmoji( "✅" )
                .setLabel( "Finish" )
            );
        } else {
            throw new Error( "Invalid step" );
        }

        return result;
    }

    // TODO: Find better solution child -> parent communication.
    private async pulseParent( interaction: Interaction, args?: any ) {
        const initialArgs = this.args;

        // Take all args that not starting with underscore.
        for ( const key in initialArgs ) {
            if ( key.startsWith( "_" ) ) {
                continue;
            }

            args[ key ] = initialArgs[ key ];
        }

        if ( initialArgs._parent?.pulse ) {
            await initialArgs._parent.pulse( interaction, args );
        }
    }

    private async back( interaction: Interaction ) {
       await this.pulseParent( interaction, { action: "back" } );
    }

    private async next( interaction: Interaction ) {
        await this.pulseParent( interaction, { action: "next" } );
    }

    private async finish( interaction: Interaction ) {
        await this.pulseParent( interaction, { action: "finish" } );
    }
}
