import {
    ActionRowBuilder,
    ButtonBuilder,
    ComponentBuilder,
    Interaction,
    ModalBuilder,
    ModalSubmitInteraction,
    NonThreadGuildBasedChannel,
    SelectMenuInteraction,
    StringSelectMenuBuilder,
    TextInputBuilder,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
} from "discord.js";

import UIBase from "@dynamico/ui/base/ui-base";

import guiManager from "@dynamico/managers/gui";

import { CallbackUIType, DYNAMICO_UI_ELEMENT, E_UI_TYPES } from "@dynamico/interfaces/ui";

import Logger from "@internal/modules/logger";

import { ForceMethodImplementation } from "@internal/errors";

export default class UIElement extends UIBase {
    protected static logger: Logger = new Logger( this );

    public interaction?: Interaction | NonThreadGuildBasedChannel;

    private builtRows: ActionRowBuilder<any>[] = [];

    public static getName() {
        return DYNAMICO_UI_ELEMENT;
    }

    public static getType(): E_UI_TYPES {
        throw new ForceMethodImplementation( this, this.getType.name );
    }

    public constructor( interaction?: Interaction | NonThreadGuildBasedChannel ) {
        super( interaction );

        if ( this.getName() === UIElement.getName() ) {
            return;
        }

        if ( interaction ) {
            this.interaction = interaction;
        }
    }

    protected load( interaction?: Interaction | NonThreadGuildBasedChannel ) {
        return this.build( interaction );
    }

    protected getButtonBuilder( callback: CallbackUIType ) {
        const button = new ButtonBuilder();

        this.setCallback( button, callback );

        return button;
    }

    protected getMenuBuilder( callback: ( interaction: SelectMenuInteraction ) => Promise<void> ) {
        const menu = new StringSelectMenuBuilder();

        this.setCallback( menu, callback );

        return menu;
    }

    protected getUserMenuBuilder( callback: ( interaction: UserSelectMenuInteraction ) => Promise<void> ) {
        const menu = new UserSelectMenuBuilder();

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

    protected async getBuilders( interaction?: Interaction | NonThreadGuildBasedChannel ): Promise<ComponentBuilder[] | ComponentBuilder[][] | ModalBuilder[]> {
        throw new ForceMethodImplementation( this, this.getBuilders.name );
    }

    public async build( interaction?: Interaction | NonThreadGuildBasedChannel ) {
        UIElement.logger.debug( this.build, `Building UI '${ this.getName() }'` );

        const builders = await this.getBuilders( interaction ),
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

    private setCallback( context: ButtonBuilder | StringSelectMenuBuilder | UserSelectMenuBuilder | TextInputBuilder | ModalBuilder, callback: Function ) {
        const unique = guiManager.storeCallback( this, callback, this.interaction?.id || "" );

        context.setCustomId( unique );
    }
}
