import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";
import { UIWizardComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-component-base";
import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import type { UIArgs, UIExecutionSteps } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

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
    components: ( typeof UIComponentBase )[];
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

        const AdapterClass = class WizardAdapterBuilderGenerated extends BaseBuild {
            protected static dedicatedLogger = new Logger( builder.name );

            public static getComponent() {
                return class extends UIWizardComponentBase {
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

            protected async onBeforeFinish( interaction: TInteraction ) {
                if ( builder.beforeFinishHandler ) {
                    await builder.beforeFinishHandler( this.getContext(), interaction );
                }
            }

            protected getContext(): IWizardAdapterContext<TInteraction, TArgs> {
                const baseContext = super.getContext() as IAdapterContext<TInteraction, TArgs>;
                return {
                    ...baseContext,
                    editReplyWithStep: this.editReplyWithStep.bind( this ),
                    ephemeralWithStep: this.ephemeralWithStep.bind( this ),
                    getCurrentExecutionStep: this.getCurrentExecutionStep.bind( this ),
                    getName: () => this.getName()
                };
            }
        };

        try {
            Object.defineProperty( AdapterClass, "displayName", { value: builder.name } );
        } catch {}
        try {
            Object.defineProperty( AdapterClass.prototype, Symbol.toStringTag, { value: builder.name } );
        } catch {}

        return AdapterClass;
    }
}
