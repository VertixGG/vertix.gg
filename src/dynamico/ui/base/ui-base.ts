import {
    ActionRowBuilder,
    APIEmbed,
    ButtonBuilder,
    ComponentBuilder,
    Interaction,
    ModalBuilder, ModalSubmitInteraction,
    StringSelectMenuBuilder, TextInputBuilder,
} from "discord.js";

import { ForceMethodImplementation } from "@internal/errors";

import { CallbackUIType, E_UI_TYPES } from "@dynamico/interfaces/ui";

import ObjectBase from "@internal/bases/object-base";

import GUIManager from "@dynamico/managers/gui";

import Logger from "@internal/modules/logger";

export default class UIBase extends ObjectBase {
    private static logger: Logger = new Logger( this );

    private builtRows: ActionRowBuilder<any>[] = [];

    static getName() {
        return "Dynamico/UI/UIBase";
    }

    static getType(): E_UI_TYPES {
        throw new ForceMethodImplementation( this, this.getType.name );
    }

    constructor( interaction?: Interaction ) {
        super();

        if ( this.getName() === UIBase.getName() ) {
            return;
        }

        this.initialize( interaction );
    }

    protected initialize( interaction?: Interaction ) {
        this.build( interaction );
    }

    protected getButtonBuilder( callback: CallbackUIType ) {
        const button = new ButtonBuilder();

        this.setCallback( button, callback );

        return button;
    }

    protected getMenuBuilder( callback: CallbackUIType ) {
        const menu = new StringSelectMenuBuilder();

        this.setCallback( menu, callback );

        return menu;
    }

    protected getInputBuilder( callback?: CallbackUIType ) {
        const input = new TextInputBuilder();

        if ( callback ) {
            this.setCallback( input, callback );
        }

        return input;
    }

    protected getModalBuilder( callback: ( interaction: ModalSubmitInteraction ) => Promise<void> ) {
        const modal = new ModalBuilder();

        this.setCallback( modal, callback );

        return modal;
    }

    protected getBuilders( interaction?: Interaction ): ComponentBuilder[]| ComponentBuilder[][] | ModalBuilder[] {
        throw new ForceMethodImplementation( this, this.getBuilders.name );
    }

    public build( interaction?: Interaction ) {
        UIBase.logger.debug( this.build, `Building UI '${ this.getName() }'` );

        const builders = this.getBuilders( interaction ),
            builtComponents: ActionRowBuilder<any>[] = [];

        // Loop through the builders and build them.
        const isMultiRow = Array.isArray( builders[ 0 ] );

        if ( isMultiRow ) {
            for ( const row of builders ) {
                const actionRow = new ActionRowBuilder<any>();

               builtComponents.push( actionRow.addComponents( row as ComponentBuilder[] ) );
            }
        } else {
            const actionRow = new ActionRowBuilder<any>();

            builtComponents.push( actionRow.addComponents( builders as ComponentBuilder[] ) );
        }

        // Set row type according to the type of the component.
        builtComponents.forEach( ( row ) => {
            row.data.type = 1;
        } );

        this.builtRows = builtComponents;
    }

    public getBuiltRows() {
        return this.builtRows;
    }

    private setCallback( context: ButtonBuilder | StringSelectMenuBuilder | TextInputBuilder | ModalBuilder, callback: Function ) {
        const unique = GUIManager.getInstance().storeCallback( this, callback );

        context.setCustomId( unique );
    }
}
