import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import type { UIArgs, UIExecutionSteps } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { Message } from "discord.js";

import type {
    IAdapterContext,
    IExecutionAdapterContext
} from "@vertix.gg/gui/src/builders/builders-definitions";

export class ExecutionAdapterBuilder<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs,
    TBase extends typeof UIAdapterExecutionStepsBase<TChannel, TInteraction> = typeof UIAdapterExecutionStepsBase<TChannel, TInteraction>
> extends AdapterBuilderBase<
        TChannel,
        TInteraction,
        TBase,
        TArgs,
        IExecutionAdapterContext<TInteraction, TArgs>
    > {
    private executionSteps: UIExecutionSteps | undefined;
    private shouldDeletePreviousReplyHandler: ( () => boolean ) | undefined;
    private initiatorElement: typeof UIElementBase<any> | undefined;
    private getEditMessageArgsHandler:
        | ( ( context: IExecutionAdapterContext<TInteraction, TArgs>, message?: Message<true>, argsFromManager?: UIArgs ) => Promise<TArgs> )
        | undefined;
    private onStepHandler:
        | ( ( context: IExecutionAdapterContext<TInteraction, TArgs>, stepName: string, interaction: TInteraction ) => Promise<void> )
        | undefined;

    public constructor( name: string, adapterBase?: TBase ) {
        super( name, ( adapterBase || UIAdapterExecutionStepsBase ) as TBase );
    }

    public setExecutionSteps( executionSteps: UIExecutionSteps ): this {
        this.executionSteps = executionSteps;
        return this;
    }

    /**
     * For adapters that require an initiator element (e.g., initiator button).
     */
    public setInitiatorElement( element: typeof UIElementBase<any> ): this {
        this.initiatorElement = element;
        return this;
    }

    /**
     * Configure whether previous replies should be deleted after sending a new one.
     */
    public shouldDeletePreviousReply( handler: () => boolean ): this {
        this.shouldDeletePreviousReplyHandler = handler;
        return this;
    }

    /**
     * Provide edit message args resolver (used in message updates).
     */
    public getEditMessageArgs(
        handler: ( context: IExecutionAdapterContext<TInteraction, TArgs>, message?: Message<true>, argsFromManager?: UIArgs ) => Promise<TArgs>
    ): this {
        this.getEditMessageArgsHandler = handler;
        return this;
    }

    /**
     * Hook into execution step transitions.
     */
    public onStep(
        handler: ( context: IExecutionAdapterContext<TInteraction, TArgs>, stepName: string, interaction: TInteraction ) => Promise<void>
    ): this {
        this.onStepHandler = handler;
        return this;
    }

    public build() {
        const builder = this;

        const BaseBuild = super.build();

        const AdapterClass = class ExecutionAdapterBuilderGenerated extends BaseBuild {
            protected static dedicatedLogger = new Logger( builder.name );

            protected static getExecutionSteps() {
                return builder.executionSteps || {};
            }

            protected static getInitiatorElement() {
                if ( builder.initiatorElement ) {
                    return builder.initiatorElement;
                }
                // @ts-expect-error base may not implement
                return super.getInitiatorElement?.();
            }

            protected shouldDeletePreviousReply() {
                if ( builder.shouldDeletePreviousReplyHandler ) {
                    return builder.shouldDeletePreviousReplyHandler();
                }
                return super.shouldDeletePreviousReply?.() ?? false;
            }

            protected async getEditMessageArgs( message?: Message<true>, argsFromManager?: UIArgs ) {
                if ( builder.getEditMessageArgsHandler ) {
                    return builder.getEditMessageArgsHandler( this.getContext(), message, argsFromManager );
                }

                return super.getEditMessageArgs?.( message, argsFromManager );
            }

            protected getContext(): IExecutionAdapterContext<TInteraction, TArgs> {
                const baseContext = super.getContext() as IAdapterContext<TInteraction, TArgs>;
                return {
                    ...baseContext,
                    editReplyWithStep: this.editReplyWithStepWrapper.bind( this ),
                    ephemeralWithStep: this.ephemeralWithStepWrapper.bind( this ),
                    getCurrentExecutionStep: this.getCurrentExecutionStepWrapper.bind( this ),
                    getName: () => this.getName()
                };
            }

            private editReplyWithStepWrapper( interaction: TInteraction, stepName: string, sendArgs?: TArgs ) {
                const method = Reflect.get( this, "editReplyWithStep" ) as Function;
                return method.call( this, interaction, stepName, sendArgs );
            }

            private ephemeralWithStepWrapper(
                interaction: TInteraction,
                stepName: string,
                sendArgs?: TArgs,
                deletePrevious?: boolean
            ) {
                const method = Reflect.get( this, "ephemeralWithStep" ) as Function;
                return method.call( this, interaction, stepName, sendArgs, deletePrevious );
            }

            private getCurrentExecutionStepWrapper( interaction?: TInteraction ) {
                const method = Reflect.get( this, "getCurrentExecutionStep" ) as Function;
                return method.call( this, interaction );
            }

            protected async onStep( stepName: string, interaction: TInteraction ) {
                if ( builder.onStepHandler ) {
                    await builder.onStepHandler( this.getContext(), stepName, interaction );
                    return;
                }
                // @ts-expect-error - base may not implement
                return super.onStep?.( stepName, interaction );
            }
        };

        try { Object.defineProperty( AdapterClass, "displayName", { value: builder.name } ); } catch {}
        try { Object.defineProperty( AdapterClass.prototype, Symbol.toStringTag, { value: builder.name } ); } catch {}

        return AdapterClass;
    }
}
