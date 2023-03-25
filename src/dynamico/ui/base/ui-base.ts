import {
    ActionRowBuilder,
    BaseMessageOptions,
    CommandInteraction,
    EmbedBuilder,
    Interaction,
    ModalBuilder,
    User
} from "discord.js";

import {
    BaseInteractionTypes, ContinuesInteractionTypes,
    DYNAMICO_UI_BASE,
    DYNAMICO_UI_ELEMENT, E_UI_TYPES,
} from "@dynamico/interfaces/ui";

import Debugger from "@dynamico/utils/debugger";

import guiManager from "@dynamico/managers/gui";

import { ObjectBase } from "@internal/bases/object-base";
import { ForceMethodImplementation } from "@internal/errors";

export class UIBase extends ObjectBase {
    protected static debugger = new Debugger( this );

    protected loadPromise: Promise<void> | null = null;

    public static getName() {
        return DYNAMICO_UI_BASE;
    }

    public static getType(): E_UI_TYPES {
        throw new ForceMethodImplementation( this, this.name );
    }

    public constructor( interaction?: BaseInteractionTypes | null, args?: any ) {
        super( args );

        if ( this.getName() === DYNAMICO_UI_ELEMENT ) {
            return;
        }

        if ( this.initialize ) {
            this.initialize();
        }

        this.loadPromise = new Promise( ( resolve ) => {
            setTimeout( async () => {
                await this.load( interaction );
                resolve();
            } );
        } );
    }

    public async waitUntilLoaded() {
        await this.loadPromise;
    }

    public setArg( key: string, value: any ) {
        ( this.constructor as typeof UIBase ).debugger.log( this.setArg,
            `Setting argument '${ key }' to '${ value }'`,
        );

        this.args[ key ] = value;
    }

    /**
     * Function sendContinues() :: a method that sends a continues interaction message to the user.
     * It takes an interaction object and additional arguments as input and returns a promise.
     */
    public async sendContinues( interaction: ContinuesInteractionTypes | CommandInteraction, args: any ) {
        return await guiManager.getInstance().sendContinuesMessage( interaction, this, args );
    }

    /**
     * Function sendFollowUp() :: a method that sends a follow-up interaction message to the user.
     * It takes an interaction object and additional arguments as input and returns a promise.
     */
    public async sendFollowUp( interaction: CommandInteraction, args: any ) {
        return await interaction.followUp( await this.getMessage( interaction, args ) );
    }

    /**
     * Function sendUser() ::  a method that sends a message to a specified user.
     * It takes a user object and additional arguments as input and returns a promise.
     */
    public async sendUser( user: User, args: any ) {
        const message = await this.getMessage( await user.createDM(), args );

        await user.send( message );
    }

    public async getMessage( interaction: BaseInteractionTypes, args?: any ): Promise<BaseMessageOptions> {
        const builtComponents = await this.getActionRows( interaction, args ),
            result: any = { components: builtComponents },
            embeds = await this.getEmbeds( interaction, args );

        if ( embeds?.length ) {
            result.embeds = embeds;
        }

        return result;
    }

    public async getElements( interaction?: BaseInteractionTypes, args?: any ): Promise<any[]> {
        return [];
    }

    public async getEmbeds( interaction?: BaseInteractionTypes | null, args?: any ): Promise<EmbedBuilder[]> {
        return [];
    }

    /**
     * Function getModal() :: a method that returns a modal for the UI.
     * It is an optional method that needs to be implemented by the child class.
     * TODO: Find better solution, ui-component-base should not know about modals.
     */
    public async getModal?( interaction?: Interaction, args?: any ): Promise<ModalBuilder>;

    protected initialize?() {};

    /**
     * The method should wait for the entity(s) to be constructed and initialized.
     */
    protected load( interaction?: BaseInteractionTypes | null ): Promise<void> {
        throw new ForceMethodImplementation( this, this.load.name );
    }

    /**
     * Function getActionRows() :: a method that returns the action rows for the UI.
     * It combines the static and dynamic components and returns them as an array.
     */
    private async getActionRows( interaction?: BaseInteractionTypes, args?: any ): Promise<ActionRowBuilder<any>[]> {
        const elements = [];

        elements.push( ... await this.getElements( interaction, args ) );

        const builtComponents = [];

        for ( const component of elements ) {
            const builtComponent = component.getBuiltRows();

            if ( Array.isArray( builtComponent ) ) {
                builtComponents.push( ... builtComponent );
            }
        }

        return builtComponents;
    }
}

export default UIBase;
