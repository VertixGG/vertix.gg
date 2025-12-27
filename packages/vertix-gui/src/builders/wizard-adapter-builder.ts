import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ComponentType } from "discord.js";

import { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";
import { UIWizardComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-component-base";
import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import type { UIArgs, UIExecutionSteps , UIComponentTypeConstructor, UIEntitySchemaBase, UIEntityTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";
import type { UIModalSchema } from "@vertix.gg/gui/src/bases/ui-modal-base";
import type { AdapterBuilderMetadata } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type {
    IWizardAdapterContext,
    BeforeFinishHandler,
    IAdapterContext,
} from "@vertix.gg/gui/src/builders/builders-definitions";

export interface IWizardComponentConfig {
    name: string;
    components: UIComponentTypeConstructor[];
    baseComponent?: typeof UIWizardComponentBase;
}

export class WizardAdapterBuilder<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs
> extends AdapterBuilderBase<
        TChannel,
        TInteraction,
        typeof UIWizardAdapterBase<TChannel, TInteraction>,
        TArgs,
        IWizardAdapterContext<TInteraction, TArgs>
    > {
    private componentConfig: IWizardComponentConfig | undefined;
    private componentEmbedsGroups: ( typeof UIEmbedsGroupBase )[] | undefined;
    private executionSteps: UIExecutionSteps | undefined;
    private initiatorElement: typeof UIElementBase<any> | undefined;
    private onBeforeNextHandler: ( ( interaction: TInteraction ) => Promise<void> ) | undefined;
    private onBeforeBackHandler: ( ( interaction: TInteraction ) => Promise<void> ) | undefined;
    private onAfterFinishHandler: ( ( interaction: TInteraction ) => Promise<void> ) | undefined;

    public constructor( name: string ) {
        super( name, UIWizardAdapterBase );
    }

    public setComponents( config: IWizardComponentConfig ): this {
        this.componentConfig = config;
        return this;
    }

    public setEmbedsGroups( embedsGroups: ( typeof UIEmbedsGroupBase )[] ): this {
        this.componentEmbedsGroups = embedsGroups;
        return this;
    }

    public setExecutionSteps( executionSteps: UIExecutionSteps ): this {
        this.executionSteps = executionSteps;
        return this;
    }

    public setInitiatorElement( element: typeof UIElementBase<any> ): this {
        this.initiatorElement = element;
        return this;
    }

    public onBeforeNext( handler: ( interaction: TInteraction ) => Promise<void> ): this {
        this.onBeforeNextHandler = handler;
        return this;
    }

    public onBeforeBack( handler: ( interaction: TInteraction ) => Promise<void> ): this {
        this.onBeforeBackHandler = handler;
        return this;
    }

    public onAfterFinish( handler: ( interaction: TInteraction ) => Promise<void> ): this {
        this.onAfterFinishHandler = handler;
        return this;
    }

    public onBeforeFinish( handler: BeforeFinishHandler<TInteraction, TArgs, IWizardAdapterContext<TInteraction, TArgs>> ): this {
        this.beforeFinishHandler = handler;
        return this;
    }

    public build() {
        const builder = this;

        if ( !builder.componentConfig ) {
            throw new Error( `A component configuration must be set for wizard adapter "${ builder.name }" before building.` );
        }

        const BaseBuild = super.build( { bypassComponentCheck: true } );

        type AdapterWithExcludedElements = typeof BaseBuild & { getExcludedElements?: () => UIEntityTypes };

        const AdapterClass = class WizardAdapterBuilderGenerated extends BaseBuild {
            protected static dedicatedLogger = new Logger( builder.name );

            public static getComponent() {
                const BaseComponent = builder.componentConfig!.baseComponent || UIWizardComponentBase;
                return class extends BaseComponent {
                    public static getName() {
                        return builder.componentConfig!.name;
                    }

                    public static getComponents() {
                        return builder.componentConfig!.components;
                    }

                    public static getEmbedsGroups() {
                        const base = super.getEmbedsGroups();
                        const fromSetter = builder.componentEmbedsGroups || [];
                        return [ ...base, ...fromSetter ];
                    };
                };
            }

            protected static getExecutionSteps() {
                return builder.executionSteps || {};
            }

            protected static getInitiatorElement() {
                if ( builder.initiatorElement ) {
                    return builder.initiatorElement;
                }
                return undefined;
            }

            public static getExcludedElements() {
                const baseExcluded = ( BaseBuild as AdapterWithExcludedElements ).getExcludedElements?.() || [];
                const initiatorElement = this.getInitiatorElement?.();

                if ( !initiatorElement ) {
                    return baseExcluded;
                }

                return [ ...baseExcluded, initiatorElement ];
            }

            protected entitiesMapInternal() {
                super.entitiesMapInternal();

                const initiatorElement = ( this.constructor as typeof WizardAdapterBuilderGenerated ).getInitiatorElement?.();

                if ( !initiatorElement ) {
                    return;
                }

                const initiatorInstance = this.getEntityMap( initiatorElement.getName() );

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
                await this.ephemeral( interaction );
            }

            protected async onBeforeNext( interaction: TInteraction ) {
                if ( builder.onBeforeNextHandler ) {
                    await builder.onBeforeNextHandler.call( this, interaction );
                }
            }

            protected async onBeforeBack( interaction: TInteraction ) {
                if ( builder.onBeforeBackHandler ) {
                    await builder.onBeforeBackHandler.call( this, interaction );
                }
            }

            protected async onAfterFinish( interaction: TInteraction ) {
                if ( builder.onAfterFinishHandler ) {
                    await builder.onAfterFinishHandler.call( this, interaction );
                }
            }

            protected async onBeforeFinish( interaction: TInteraction ) {
                if ( builder.beforeFinishHandler ) {
                    await builder.beforeFinishHandler( this.getContext(), interaction );
                }
            }

            protected getContext(): IWizardAdapterContext<TInteraction, TArgs> {
                const baseContext = super.getContext() as IAdapterContext<TInteraction, TArgs>;
                return {
                    ...baseContext,
                    editReplyWithStep: this.editReplyWithStepWrapper.bind( this ),
                    ephemeralWithStep: this.ephemeralWithStepWrapper.bind( this ),
                    getCurrentExecutionStep: this.getCurrentExecutionStepWrapper.bind( this ),
                    getCurrentStepIndex: this.getCurrentStepIndexWrapper.bind( this ),
                    generateCustomIdForEntity: this.generateCustomIdForEntityWrapper.bind( this ),
                    getName: () => this.getName()
                };
            }

            private editReplyWithStepWrapper( interaction: TInteraction, stepName: string, sendArgs?: TArgs ) {
                const method = Reflect.get( this, "editReplyWithStep" ) as Function;
                return method.call( this, interaction, stepName, sendArgs );
            }

            private ephemeralWithStepWrapper( interaction: TInteraction, stepName: string, sendArgs?: TArgs ) {
                const method = Reflect.get( this, "ephemeralWithStep" ) as Function;
                return method.call( this, interaction, stepName, sendArgs );
            }

            private getCurrentExecutionStepWrapper( context?: TInteraction ) {
                const method = Reflect.get( this, "getCurrentExecutionStep" ) as Function;
                return method.call( this, context );
            }

            private getCurrentStepIndexWrapper( interaction?: TInteraction ) {
                const method = Reflect.get( this, "getCurrentStepIndex" ) as Function;
                return method.call( this, interaction );
            }

            private generateCustomIdForEntityWrapper( entity: UIEntitySchemaBase | UIModalSchema ) {
                return builder.buildCustomId( this.getName(), entity, this.customIdStrategy );
            }
        };

        try {
            Object.defineProperty( AdapterClass, "displayName", { value: builder.name } );
        } catch {}
        try {
            Object.defineProperty( AdapterClass.prototype, Symbol.toStringTag, { value: builder.name } );
        } catch {}

        const metadataCarrier = AdapterClass as unknown as { [ BUILDER_METADATA_SYMBOL ]?: AdapterBuilderMetadata };
        const metadata = metadataCarrier[ BUILDER_METADATA_SYMBOL ];

        if ( metadata ) {
            metadata.executionSteps = builder.executionSteps;
            metadata.initiatorElement = metadata.initiatorElement ?? builder.initiatorElement;
            metadata.wizard = {
                componentConfig: builder.componentConfig
                    ? {
                        name: builder.componentConfig.name,
                        components: builder.componentConfig.components,
                        baseComponent: builder.componentConfig.baseComponent
                    }
                    : undefined,
                componentEmbedsGroups: builder.componentEmbedsGroups
            };
        }

        return AdapterClass;
    }
}
