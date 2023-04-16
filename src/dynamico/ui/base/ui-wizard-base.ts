import {  Interaction } from "discord.js";

import {
    UIBaseInteractionTypes,
    UIContinuesInteractionTypes,
    E_UI_TYPES,
    DYNAMICO_UI_WIZARD,
} from "@dynamico/interfaces/ui";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";
import Buttons from "@dynamico/ui/base/ui-wizard/buttons";

import Logger from "@internal/modules/logger";

const UI_WIZARD_MINIMUM_COMPONENTS = 2,
    UI_WIZARD_INITIAL_DEFINITION = "initial";

/**
 * A base class for creating wizard-like UI components. This class is designed to be extended
 * and provides functionality for managing multiple steps of UI interaction.
 * It should contain at least two UI component.
 **/
export abstract class UIWizardBase extends UIComponentBase {
    protected static logger = new Logger( this );

    protected currentInteractions: { [ interactionId: string ]: UIContinuesInteractionTypes } = {};

    /**
     * An object that contains data shared between steps of the wizard. This data can be used
     * to store information that needs to be passed between steps.
     */
    protected sharedSteps: any = {};

    /**
     * An object that contains data shared between steps of the wizard. This data can be used
     * to store information that needs to be passed between steps.
     */
    protected sharedArgs: any = {};

    public static getName() {
        return DYNAMICO_UI_WIZARD;
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public constructor() {
        super();

        if ( this.getStepComponents().length < UI_WIZARD_MINIMUM_COMPONENTS ) {
            throw new Error( `Wizard must have at least '${ UI_WIZARD_MINIMUM_COMPONENTS }' components` );
        }
    }

    /**
     * Function getSharedArgs() :: Returns an object containing data shared between steps of the wizard.
     */
    protected getSharedArgs( interactionId: string ) {
        const args: any = {};

        for ( const component of Object.values( this.getStepComponents() ) ) {
            const interactionData = this.sharedArgs[ interactionId ];

            if ( interactionData ) {
                const argsFromComponent = interactionData[ component.getName() ];

                if ( typeof argsFromComponent !== "object" ) {
                    continue;
                }

                Object.entries( argsFromComponent ).forEach( ( [ key, value ] ) => {
                    args[ key ] = value;
                } );
            }
        }

        return args;
    }

    protected getLogger() {
        return ( this.constructor as typeof UIWizardBase ).logger;
    }

    /**
     * Function getMessage() :: Responsible for return full message object that will be sent to the user.
     */
    public async getMessage( interaction: UIBaseInteractionTypes, args: any = {} ) {
        const isInitial = UI_WIZARD_INITIAL_DEFINITION === args.step,
            id = this.getId( interaction );

        let step = this.getStep( id );

        if ( isInitial ) {
            delete args.step;

            args._step = 0;

            step = 0;
        }

        // Allow to set step from outside.
        if ( Object.keys( args ).length && args._step ) {
            step = args._step;
        }

        const ensureArgs = {
            _step: step,
            _end: this.getStepComponents().length - 1,

            ... this.getSharedArgs( id ),
            ... args,
        };

        this.setStep( interaction, step );

        this.setSharedArgs( id, ensureArgs );

        return super.getMessage( interaction, ensureArgs );
    }

    /**
     * Function getElements() :: Responsible for return full elements object that will be sent to the user.
     */
    public async getElements( interaction?: UIBaseInteractionTypes, args?: any ): Promise<any[]> {
        const id = this.getId( interaction ),
            step = this.getStep( id ),
            components = this.staticComponentsInstances[ step ];

        this.getLogger().debug( this.getElements,
            `Get elements for step: '${ step }' interaction '${ id }'` );

        const elements = [
            ... await components.getElements( interaction, args ),
            ... await this.getDynamicElements( interaction, args ),
        ];

        this.getLogger().debug( this.getElements,
            `Elements for step: '${ step }' interaction '${ id }'`, elements );

        return elements;
    }

    /**
     * Function getEmbeds() :: Responsible for return full embeds object that will be sent to the user.
     */
    public async getEmbeds( interaction?: UIBaseInteractionTypes | null, args?: any ) {
        if ( ! interaction ) {
            return super.getEmbeds( interaction, args );
        }

        const id = this.getId( interaction ),
            embeds = await this.staticComponentsInstances[ this.getStep( id ) ]
                .getEmbeds( interaction, args );

        if ( embeds?.length ) {
            return embeds;
        }

        return [];
    }

    // TODO: Try private.
    public getId( interaction: undefined | UIBaseInteractionTypes, isInitial = false ) {
        if ( typeof interaction !== "object" ) {
            throw new Error( "Interaction is not defined" );
        }

        // TODO was `user.id`.
        const id = ( interaction as Interaction ).id;

        if ( ! id ) {
            throw new Error( "Interaction is not defined" );
        }

        return id;
    }

    /**
     * Function getStepComponents() :: Returns an array of UI components that will be used as steps.
     */
    protected abstract getStepComponents(): typeof UIComponentBase[];

    protected abstract onFinish( interaction: UIContinuesInteractionTypes ): Promise<any>;

    protected getInternalComponents() {
        return this.getStepComponents();
    }

    protected getInternalElements() {
        return [
            Buttons,
        ];
    }

    protected async pulse( interaction: UIContinuesInteractionTypes, args: any ): Promise<void> {
        const id = this.getId( interaction );

        this.setSharedArgs( id, args );

        let step = this.getStep( id );

        if ( args.action === "next" ) {
            step++;
        } else if ( args.action === "back" ) {
            step--;
        }

        this.setStep( interaction, step );

        if ( args.action === "finish" ) {
            await this.onFinish( interaction );

            return this.setStep( interaction, -1 );
        }

        // Don't pass action to next step.
        delete args.action;

        // Share args with back/next step.
        await this.sendContinues( interaction, args );
    }

    private setSharedArgs( interactionId: string, args: any ) {
        if ( undefined !== typeof args ) {
            if ( ! this.sharedArgs[ interactionId ] ) {
                this.sharedArgs[ interactionId ] = {};
            }

            const step = this.getStep( interactionId ),
                component = this.getStepComponents()[ step ],
                componentName = component?.getName();

            this.getLogger().debug( this.setSharedArgs,
                `Set shared args for step: '${ step }' interaction '${ interactionId }' and component '${ componentName }'`
            );

            this.sharedArgs[ interactionId ][ componentName ] = args;
        }
    }

    private setStep( interaction: UIBaseInteractionTypes, step: number ) {
        const id = this.getId( interaction );

        if ( -1 === step ) {
            delete this.currentInteractions[ id ];
            delete this.sharedSteps[ id ];
            delete this.sharedArgs[ id ];

            return;
        }

        // In case of new interaction. ensure that previous interaction is deleted.
        if ( 0 === step && "object" === typeof this.currentInteractions[ id ] ) {
            this.setStep( interaction, -1 );

            return;
        }

        this.currentInteractions[ id ] = interaction as Interaction;
        this.sharedSteps[ id ] = step;
    }

    private getStep( interactionId: string ) {
        return this.sharedSteps [ interactionId ] ?? 0;
    }
}

export default UIWizardBase;
