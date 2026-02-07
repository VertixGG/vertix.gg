import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";
import { TransactionAwareBinder } from "@vertix.gg/gui/src/builders/transaction-aware-binder";

import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import type { UIArgs, UIExecutionSteps } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { Message } from "discord.js";

import type {
    IAdapterContext,
    IExecutionAdapterContext,
    IBinder
} from "@vertix.gg/gui/src/builders/builders-definitions";
import type { AdapterBuilderMetadata } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

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
    private transactions: TransactionBuilder<IExecutionAdapterContext<TInteraction, TArgs>> | undefined;

    public constructor( name: string, adapterBase?: TBase ) {
        super( name, ( adapterBase || UIAdapterExecutionStepsBase ) as TBase );
    }

    /**
     * Set execution steps for this adapter.
     *
     * NOTE: Cannot be used together with defineTransactions().
     * When using defineTransactions(), execution steps are derived from state configurations.
     */
    public setExecutionSteps( executionSteps: UIExecutionSteps ): this {
        if ( this.transactions ) {
            throw new Error(
                `Adapter "${ this.name }": Cannot use setExecutionSteps() when defineTransactions() is used. ` +
                `Define execution step details (embedsGroup, elementsGroup) in addState() instead.`
            );
        }
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

    /**
     * Define transactions (state machine) for this adapter.
     * Transactions automatically generate flow triggers that are injected into bindings.
     *
     * IMPORTANT: When using defineTransactions:
     * - You cannot use onEntityMap() - bind handlers via tx.bindButton(), tx.bindModal(), etc.
     * - You cannot use setExecutionSteps() - define step details in addState() instead.
     *
     * @example
     * .defineTransactions((tx) => {
     *   tx
     *     .setInitialState("Default")
     *     .addState("Default", {
     *       executionStep: "default",
     *       elementsGroup: "MyElementsGroup",
     *       embedsGroup: "MyEmbedsGroup"
     *     })
     *     .addState("Public", { executionStep: "statePublic" })
     *     .addTransition("SetPublic", { from: "Default", to: "Public" })
     *     .bindButton("VertixBot/UI-V3/StateButton", "SetPublic", async (context, interaction) => {
     *       // handle button click
     *     });
     * })
     */
    public defineTransactions( configurator: ( tx: TransactionBuilder<IExecutionAdapterContext<TInteraction, TArgs>> ) => void ): this {
        if ( this.executionSteps ) {
            throw new Error(
                `Adapter "${ this.name }": Cannot use defineTransactions() when setExecutionSteps() is used. ` +
                `Choose one approach: either setExecutionSteps() with onEntityMap(), or defineTransactions() alone.`
            );
        }
        const flowName = `${ this.name.replace( /Adapter$/, "" ) }Flow`;
        this.transactions = new TransactionBuilder<IExecutionAdapterContext<TInteraction, TArgs>>( flowName );
        configurator( this.transactions );
        return this;
    }

    /**
     * Get the transactions builder if defined.
     */
    public getTransactions(): TransactionBuilder<IExecutionAdapterContext<TInteraction, TArgs>> | undefined {
        return this.transactions;
    }

    public build() {
        const builder = this;

        // Validate: defineTransactions and onEntityMap are mutually exclusive
        if ( builder.transactions && builder.entityMapHandler ) {
            throw new Error(
                `Adapter "${ builder.name }": Cannot use both defineTransactions() and onEntityMap(). ` +
                `When using defineTransactions(), bind handlers via tx.bindButton(), tx.bindModal(), etc.`
            );
        }

        const BaseBuild = super.build();

        const AdapterClass = class ExecutionAdapterBuilderGenerated extends BaseBuild {
            protected static dedicatedLogger = new Logger( builder.name );

            protected static getExecutionSteps() {
                // If transactions are defined, derive execution steps from them
                if ( builder.transactions ) {
                    return builder.transactions.getExecutionSteps();
                }
                return builder.executionSteps || {};
            }

            protected static getInitiatorElement() {
                if ( builder.initiatorElement ) {
                    return builder.initiatorElement;
                }
                // @ts-expect-error base may not implement
                return super.getInitiatorElement?.();
            }

            /**
             * Get the transactions builder for this adapter.
             */
            public static getTransactions(): TransactionBuilder | undefined {
                return builder.transactions;
            }

            protected shouldDeletePreviousReply() {
                if ( builder.shouldDeletePreviousReplyHandler ) {
                    return builder.shouldDeletePreviousReplyHandler();
                }
                return super.shouldDeletePreviousReply?.() ?? false;
            }

            protected async getEditMessageArgs( message?: Message<true>, argsFromManager?: UIArgs ) {
                const dataArgs = await builder.resolveArgsFromDataSource( "edit", message, argsFromManager );

                if ( builder.getEditMessageArgsHandler ) {
                    const handlerArgs = await builder.getEditMessageArgsHandler( this.getContext(), message, argsFromManager );
                    if ( dataArgs ) {
                        return { ...dataArgs, ...handlerArgs };
                    }
                    return handlerArgs;
                }

                if ( dataArgs ) {
                    return dataArgs;
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
                    getName: () => this.getName(),
                    triggerTransition: this.triggerTransitionWrapper.bind( this )
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

            /**
             * Trigger a transaction transition - resolves the transition and handles navigation automatically.
             */
            private async triggerTransitionWrapper(
                transitionName: string,
                interaction: TInteraction,
                args?: TArgs
            ): Promise<void> {
                if ( !builder.transactions ) {
                    ExecutionAdapterBuilderGenerated.dedicatedLogger.warn(
                        this.triggerTransitionWrapper,
                        `triggerTransition called but no transactions defined for adapter '${ builder.name }'`
                    );
                    return;
                }

                const resolved = builder.transactions.resolveTransition( transitionName );
                if ( !resolved ) {
                    ExecutionAdapterBuilderGenerated.dedicatedLogger.warn(
                        this.triggerTransitionWrapper,
                        `Transition '${ transitionName }' not found in adapter '${ builder.name }'`
                    );
                    return;
                }

                switch ( resolved.navigationType ) {
                    case "editReply":
                        await this.editReplyWithStepWrapper( interaction, resolved.executionStep, args );
                        break;

                    case "ephemeral":
                        await this.ephemeralWithStepWrapper(
                            interaction,
                            resolved.executionStep,
                            args,
                            resolved.deletePreviousReply
                        );
                        break;

                    case "silent":
                        // No UI update - just log for debugging
                        ExecutionAdapterBuilderGenerated.dedicatedLogger.debug(
                            this.triggerTransitionWrapper,
                            `Silent transition '${ transitionName }' executed (no UI update)`
                        );
                        break;
                }
            }

            protected async onStep( stepName: string, interaction: TInteraction ) {
                if ( builder.onStepHandler ) {
                    await builder.onStepHandler( this.getContext(), stepName, interaction );
                    return;
                }
                // @ts-expect-error - base may not implement
                return super.onStep?.( stepName, interaction );
            }

            /**
             * Override onEntityMap to register handlers from transaction builder when transactions are defined.
             */
            protected async onEntityMap() {
                // If transactions are defined, register handlers from the transaction builder
                if ( builder.transactions ) {
                    const binder = this.createBinder();
                    const handlerBindings = builder.transactions.getHandlerBindings();

                    for ( const binding of handlerBindings ) {
                        binder.dispatchBinding( binding );
                    }
                    return;
                }

                // Otherwise call base implementation
                return super.onEntityMap?.();
            }

            /**
             * Override createBinder to wrap with TransactionAwareBinder when transactions are defined.
             */
            protected createBinder(): IBinder<TInteraction, TArgs, IExecutionAdapterContext<TInteraction, TArgs>> {
                const baseBinder = super.createBinder() as IBinder<TInteraction, TArgs, IExecutionAdapterContext<TInteraction, TArgs>>;

                // If transactions are defined, wrap with TransactionAwareBinder
                if ( builder.transactions ) {
                    return new TransactionAwareBinder<TInteraction, TArgs, IExecutionAdapterContext<TInteraction, TArgs>>(
                        baseBinder,
                        builder.transactions
                    );
                }

                return baseBinder;
            }
        };

        try { Object.defineProperty( AdapterClass, "displayName", { value: builder.name } ); } catch {}
        try { Object.defineProperty( AdapterClass.prototype, Symbol.toStringTag, { value: builder.name } ); } catch {}

        // Extend metadata to include transactions and executionSteps
        // Note: metadata is on BaseBuild (parent class), need to get it from there
        const existingMetadata = Reflect.get( BaseBuild, BUILDER_METADATA_SYMBOL ) as AdapterBuilderMetadata | undefined;
        if ( existingMetadata ) {
            Reflect.defineProperty( AdapterClass, BUILDER_METADATA_SYMBOL, {
                value: {
                    ...existingMetadata,
                    ...( builder.transactions && { transactions: builder.transactions } ),
                    ...( builder.executionSteps && { executionSteps: builder.executionSteps } )
                },
                configurable: true
            } );
        }

        return AdapterClass;
    }
}
