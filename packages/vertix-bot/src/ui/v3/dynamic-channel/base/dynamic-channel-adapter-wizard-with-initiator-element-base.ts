import { ForceMethodImplementation } from "@vertix.gg/base/src/errors/index";

import { ComponentType } from "discord.js";

import { DynamicChannelAdapterWizardBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-wizard-base";

import type { UIExecutionStep, UIExecutionSteps } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type {
    UIAdapterReplyContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

// TODO: Use Mixins to not duplicate code
export abstract class DynamicChannelAdapterWizardWithInitiatorElementBase<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction
> extends DynamicChannelAdapterWizardBase<TInteraction> {
    public static validate( skipDefaultGroups = false ) {
        super.validate( skipDefaultGroups );
    }

    protected static getInitiatorElement(): typeof UIElementBase<any> {
        throw new ForceMethodImplementation( this.getName(), this.getInitiatorElement.name );
    }

    protected static getExecutionSteps(): UIExecutionSteps {
        const component = this.getComponent();

        const defaultGroups: UIExecutionStep = {};

        defaultGroups.elementsGroup = component.getDefaultElementsGroup();
        defaultGroups.embedsGroup = component.getDefaultEmbedsGroup();
        defaultGroups.markdownGroup = component.getDefaultMarkdownsGroup();

        if ( !Object.values( defaultGroups ).filter( Boolean ).length ) {
            throw new Error(
                "Error in: '" + this.getName() + `' Component: '${ component.getName() }' has default groups set`
            );
        }

        return {
            default: defaultGroups
        };
    }

    protected static getExcludedElementsInternal() {
        const initiatorElement = this.getInitiatorElement();

        const excludedElements = super.getExcludedElementsInternal();

        if ( !initiatorElement ) {
            return excludedElements;
        }

        return [ ...excludedElements, initiatorElement ];
    }

    protected entitiesMapInternal() {
        super.entitiesMapInternal();

        // Check if element initiator is not bind.
        const initiatorElement = (
                this.constructor as typeof DynamicChannelAdapterWizardWithInitiatorElementBase
            ).getInitiatorElement(),
            initiatorInstance = this.getEntityMap( initiatorElement.getName() );

        if ( initiatorInstance.callback ) {
            return;
        }

        switch ( initiatorElement.getComponentType() ) {
            case ComponentType.Button:
                this.bindButton( initiatorElement.getName(), this.onInitiatorButtonClicked );
                break;

            default:
                throw new Error( `Not implemented initiator element type: ${ initiatorElement.getComponentType() }` );
        }
    }

    protected async onInitiatorButtonClicked( interaction: TInteraction ) {
        // TODO: The use case in dynamic channels probably, it should be configurable.
        await this.ephemeral( interaction );
    }
}
