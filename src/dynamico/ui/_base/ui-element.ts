import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    ComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    RoleSelectMenuBuilder,
    RoleSelectMenuInteraction,
    SelectMenuInteraction,
    StringSelectMenuBuilder,
    TextInputBuilder,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
} from "discord.js";

import ObjectBase from "../../../bases/object-base";
import UIGroupBase from "@dynamico/ui/_base/ui-group-base";

import { guiManager } from "@dynamico/managers";

import { UIBaseInteractionTypes, DYNAMICO_UI_ELEMENT, UICustomIdContextTypes } from "@dynamico/ui/_base/ui-interfaces";

import { GUI_ID_LOGICAL_SEPARATOR } from "@dynamico/managers/gui";

import Logger from "@internal/modules/logger";

import { ForceMethodImplementation } from "@internal/errors";

export default class UIElement extends UIGroupBase {
    protected static logger: Logger = new Logger( this );

    protected interaction?: UIBaseInteractionTypes;

    protected parent?: UIElement;

    private builtRows: ActionRowBuilder<any>[] = [];

    public static getName() {
        return DYNAMICO_UI_ELEMENT;
    }

    public constructor( interaction?: UIBaseInteractionTypes, args? : any  ) {
        super( interaction, args );

        if ( this.getName() === UIElement.getName() ) {
            return;
        }

        if ( interaction ) {
            this.interaction = interaction;
        }

        if ( args._parent ) {
            this.parent = args._parent;
        }
    }

    public async build( interaction?: UIBaseInteractionTypes, args?: any ) {
        UIElement.logger.debug( this.build, `Building UIElement: '${ this.getName() }'` );

        const builders = await this.getBuilders( interaction, args ),
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

    protected getButtonBuilder( callback: ( inteaction: ButtonInteraction ) => Promise<void>, extraData = "" ) {
        const button = new ButtonBuilder();

        this.setCallback( button, callback, extraData );

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

    protected getRoleMenuBuilder( callback: ( interaction: RoleSelectMenuInteraction ) => Promise<void> ) {
        const menu = new RoleSelectMenuBuilder();

        this.setCallback( menu, callback );

        return menu;
    }

    protected getInputBuilder( callback?: ( interaction: ChatInputCommandInteraction ) => Promise<void> ) {
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

    protected async getBuilders( interaction?: UIBaseInteractionTypes, args?: any ): Promise<ComponentBuilder[] | ComponentBuilder[][] | ModalBuilder[]> {
        throw new ForceMethodImplementation( this, this.getBuilders.name );
    }

    protected load( interaction?: UIBaseInteractionTypes ) {
        return this.build( interaction, this.args );
    }

    protected storeCallback( sourceUI: ObjectBase, callback: Function, suffix = "", extraData = "" ) {
        if ( this.interaction?.id ) {
            if ( suffix.length ) {
                suffix = this.interaction.id + GUI_ID_LOGICAL_SEPARATOR + suffix;
            } else {
                suffix = this.interaction.id;
            }
        }

        // TODO This is temporary fix for wizard unique id.
        const argsId = this.args?._id;
        if ( argsId?.length ) {
            if ( suffix.length ) {
                suffix += GUI_ID_LOGICAL_SEPARATOR;
            }

            suffix += argsId;
        }

        if ( extraData.length ) {
            if ( suffix.length ) {
                suffix += GUI_ID_LOGICAL_SEPARATOR;
            }

            suffix += ">" + extraData;
        }

        return guiManager.storeCallback( this, callback, suffix );
    }

    private setCallback( context: UICustomIdContextTypes, callback: Function, extraData = "" ) {
        context.setCustomId( this.storeCallback( this, callback, "", extraData ) );
    }
}
