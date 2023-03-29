import { Interaction } from "discord.js";

import {
    BaseInteractionTypes,
    ContinuesInteractionTypes,
    DYNAMICO_UI_WIZARD,
    E_UI_TYPES,
} from "@dynamico/interfaces/ui";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";
import Buttons from "@dynamico/ui/base/ui-wizard/buttons";

import Logger from "@internal/modules/logger";

const MINIMUM_COMPONENTS = 2;

/**
 * A base class for creating wizard-like UI components. This class is designed to be extended
 * and provides functionality for managing multiple steps of UI interaction. Each step in the wizard
 * can contain two or more UI components.
 */
export abstract class UIWizardBase extends UIComponentBase {
    protected static logger = new Logger( this );

    protected currentInteractions: { [ interactionId: string ]: ContinuesInteractionTypes } = {};

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

        if ( this.getStepComponents().length < MINIMUM_COMPONENTS ) {
            throw new Error( `Wizard must have at least '${ MINIMUM_COMPONENTS }' components` );
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

    public async getMessage( interaction: BaseInteractionTypes, args: any = {} ) {
        const userId = this.getId( interaction );

        let step = this.getStep( userId );

        if ( "initial" === args.step ) {
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

            ... this.getSharedArgs( userId ?? "" ),
            ... args,
        };

        this.setStep( interaction, step );

        return super.getMessage( interaction, ensureArgs );
    }

    public async getElements( interaction?: BaseInteractionTypes, args?: any ): Promise<any[]> {
        const userId = this.getId( interaction );

        return [
            ... await this.staticComponentsInstances[ this.getStep( userId ) ].getElements( interaction, args ),
            ... await this.getDynamicElements( interaction, args ),
        ];
    }

    public async getEmbeds( interaction?: BaseInteractionTypes | null, args?: any ) {
        if ( ! interaction ) {
            return super.getEmbeds( interaction, args );
        }

        const userId = this.getId( interaction ),
            embeds = await this.staticComponentsInstances[ this.getStep( userId ) ]
                .getEmbeds( interaction, args );

        if ( embeds?.length ) {
            return embeds;
        }

        return [];
    }

    protected abstract getStepComponents(): typeof UIComponentBase[];

    protected abstract onFinish( interaction: ContinuesInteractionTypes ): Promise<any>;

    protected getInternalComponents() {
        return this.getStepComponents();
    }

    protected getInternalElements() {
        return [
            Buttons,
        ];
    }

    protected async pulse( interaction: ContinuesInteractionTypes, args: any ): Promise<void> {
        this.setSharedArgs( interaction.user.id, args );

        let step = this.getStep( interaction.user.id );

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

            this.sharedArgs[ interactionId ][ this.getStepComponents()[ this.getStep( interactionId ) ].getName() ] = args;
        }
    }

    private setStep( interaction: BaseInteractionTypes, step: number ) {
        const userId = this.getId( interaction );

        if ( -1 === step ) {
            delete this.currentInteractions[ userId ];
            delete this.sharedSteps[ userId ];
            delete this.sharedArgs[ userId ];

            return;
        }

        // In case of new interaction. ensure that previous interaction is deleted.
        if ( 0 === step && "object" === typeof this.currentInteractions[ userId ] ) {
            this.setStep( interaction, -1 );

            return;
        }

        this.currentInteractions[ userId ] = interaction as Interaction;
        this.sharedSteps[ userId ] = step;
    }

    private getStep( interactionId: string ) {
        return this.sharedSteps [ interactionId ] ?? 0;
    }

    private getId( interaction: undefined | BaseInteractionTypes ) {
        if ( typeof interaction !== "object" ) {
            throw new Error( "Interaction is not defined" );
        }

        const userId = ( interaction as Interaction ).user.id;

        if ( ! userId ) {
            throw new Error( "Interaction is not defined" );
        }

        return userId;
    }
}

export default UIWizardBase;
