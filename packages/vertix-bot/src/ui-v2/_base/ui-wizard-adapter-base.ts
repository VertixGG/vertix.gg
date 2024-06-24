import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-execution-steps-base";

import type {
    UIArgs,
    UICreateComponentArgs,
    UIExecutionStep,
    UIExecutionSteps
} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";
import type { UIWizardComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-wizard-component-base";

import type { UIAdapterService } from "src/ui-v2/ui-adapter-service";

export type UIWizardComponentConstructor = { new( args?: UICreateComponentArgs ): UIWizardComponentBase };
export type UIWizardComponentTypeConstructor = typeof UIWizardComponentBase & UIWizardComponentConstructor;

export class UIWizardAdapterBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterExecutionStepsBase<TChannel, TInteraction> {
    protected staticWizardAdapter: typeof UIWizardAdapterBase;

    public static getName() {
        return "Vertix/UI-V2/UIWizardAdapterBase";
    }

    public static getComponent(): UIWizardComponentTypeConstructor {
        throw new ForceMethodImplementation( this.getName(), this.getComponent.name );
    }

    protected static getExecutionStepsInternal() {
        const result: UIExecutionSteps = {
            default: {},
        };

        this.getComponent().getComponents().forEach( ( component ) => {
            const implementedObject: UIExecutionStep = {},
                entities = component.getEntities();

            // Check has embeds.
            if ( entities.some( ( e ) => e.getType() === "embed" ) ) {
                implementedObject.embedsGroup = component.getName() + "/EmbedsGroup";
            }

            // Check has elements.
            if ( entities.some( ( e ) => e.getType() === "element" ) ) {
                implementedObject.elementsGroup = component.getName() + "/ElementsGroup";
            }

            result[ component.getName() ] = implementedObject;
        } );

        const subclassSteps = this.getExecutionSteps();

        if ( subclassSteps ) {
            Object.assign( result, subclassSteps );
        }

        return result;
    }

    public constructor( uiManager: UIAdapterService ) {
        super( uiManager );

        const staticThis = this.constructor as typeof UIWizardAdapterBase;

        this.staticWizardAdapter = staticThis;
    }

    public editReplyWithStep( interaction: TInteraction, stepName: string, sendArgs?: UIArgs ) {
        this.getArgsManager().setArgs( this, interaction, {
            _step: stepName,
        } );

        return super.editReplyWithStep( interaction, stepName, sendArgs );
    }

    protected async onBeforeBack?( interaction: TInteraction ): Promise<void>;

    protected async onAfterBack?( interaction: TInteraction ): Promise<void>;

    protected async onBeforeNext?( interaction: TInteraction ): Promise<void>;

    protected async onAfterNext?( interaction: TInteraction ): Promise<void>;

    protected async onBeforeFinish?( interaction: TInteraction ): Promise<void>;

    protected async onAfterFinish?( interaction: TInteraction ): Promise<void>;

    protected buildEntitiesMap() {
        super.buildEntitiesMap();

        this.bindButton<TInteraction>( "Vertix/UI-V2/WizardBackButton", this.onWizardBackButtonClicked );
        this.bindButton<TInteraction>( "Vertix/UI-V2/WizardNextButton", this.onWizardNextButtonClicked );
        this.bindButton<TInteraction>( "Vertix/UI-V2/WizardFinishButton", this.onWizardFinishButtonClicked );
    }

    private async onWizardBackButtonClicked( interaction: TInteraction ) {
        await this.onBeforeBack?.( interaction );

        const components = this.staticWizardAdapter.getComponent().getComponents();

        const currentIndex = components.findIndex( ( i ) => i.getName() === this.getCurrentExecutionStep( interaction )?.name );

        if ( 0 === currentIndex ) {
            return;
        }

        await this.editReplyWithStep( interaction, components[ currentIndex - 1 ].getName() );

        await this.onAfterBack?.( interaction );
    }

    private async onWizardNextButtonClicked( interaction: TInteraction ) {
        await this.onBeforeNext?.( interaction );

        const components = this.staticWizardAdapter.getComponent().getComponents();

        const currentIndex = components.findIndex( ( i ) => i.getName() === this.getCurrentExecutionStep( interaction )?.name );

        if ( currentIndex === components.length - 1 ) {
            return;
        }

        await this.editReplyWithStep( interaction, components[ currentIndex + 1 ].getName() );

        await this.onAfterNext?.( interaction );
    }

    private async onWizardFinishButtonClicked( interaction: TInteraction ) {
        await this.onBeforeFinish?.( interaction );

        // TODO: ???.

        await this.onAfterFinish?.( interaction );
    }
}
