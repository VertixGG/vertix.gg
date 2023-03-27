import {
    BaseMessageOptions,
    CommandInteraction,
    Interaction,
    InteractionResponse,
    MessageComponentInteraction,
    ModalBuilder,
    User
} from "discord.js";

import {
    BaseInteractionTypes,
    ContinuesInteractionTypes,
    DYNAMICO_UI_BASE,
    DYNAMICO_UI_ELEMENT,
    E_UI_TYPES,
} from "@dynamico/interfaces/ui";

import { guiManager } from "@dynamico/managers";

import Debugger from "@dynamico/utils/debugger";

import Logger from "@internal/modules/logger";

import { ObjectBase } from "@internal/bases/object-base";
import { ForceMethodImplementation } from "@internal/errors";

export class UIBase extends ObjectBase {
    protected static debugger = new Debugger( this );
    protected static logger = new Logger( this );

    private static specificFlowInteraction: Map<string, InteractionResponse> = new Map();

    protected loadPromise: Promise<void> | null = null;

    public static getName() {
        return DYNAMICO_UI_BASE;
    }

    public static getType(): E_UI_TYPES {
        throw new ForceMethodImplementation( this, this.name );
    }

    protected static groups(): string[] {
        return[];
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
        if ( ! interaction.channel ) {
            return guiManager.sendContinuesMessage( interaction, this, args );
        }

        const msgInteraction = interaction as MessageComponentInteraction,
            staticThis = ( this.constructor as typeof UIBase );

        const groups = staticThis.groups(),
            uniqueId = groups.join() ?? "" + ":" + interaction.channel.id + ":" + interaction.user.id;

        if ( ! groups.length ) {
            staticThis.logger.debug( this.sendContinues,
            `No groups found for: '${ staticThis.getName() }'`
            );
            return guiManager.sendContinuesMessage( interaction, this, args );
        }

        const specificFlowInteraction = staticThis.specificFlowInteraction.get( uniqueId );

        if ( ! specificFlowInteraction ) {
            const newDefer = await guiManager.sendContinuesMessage( interaction, this, args );

            if ( newDefer ) {
                staticThis.specificFlowInteraction.set( uniqueId, newDefer );
            }

            return;
        }

        await specificFlowInteraction.edit( await this.getMessage( interaction, args ) )
            .then( () => {
                msgInteraction.deferUpdate?.();
            } )
            .catch( ( e ) => {
                staticThis.logger.warn( this.sendContinues, "", e );

                staticThis.specificFlowInteraction.delete( uniqueId );

                return this.sendContinues( interaction, args );
            } );
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
        throw new ForceMethodImplementation( this, this.getMessage.name );
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
}

export default UIBase;
