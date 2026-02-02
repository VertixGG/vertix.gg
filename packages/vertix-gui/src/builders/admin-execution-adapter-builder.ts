import { Logger } from "@vertix.gg/base/src/modules/logger";

import { AdminAdapterExuBase } from "@vertix.gg/bot/src/ui/general/admin/admin-adapter-exu-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";
import { TransactionAwareBinder } from "@vertix.gg/gui/src/builders/transaction-aware-binder";

import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import type { UIArgs, UIExecutionSteps } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { IAdapterContext, IExecutionAdapterContext, IBinder } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { AdapterBuilderMetadata } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

export class AdminExecutionAdapterBuilder<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs
> extends AdapterBuilderBase<
        TChannel,
        TInteraction,
        typeof AdminAdapterExuBase<TChannel, TInteraction>,
        TArgs,
        IExecutionAdapterContext<TInteraction, TArgs>
    > {
    private executionSteps: UIExecutionSteps | undefined;
    private transactions: TransactionBuilder<IExecutionAdapterContext<TInteraction, TArgs>> | undefined;

    public constructor( name: string ) {
        super( name, AdminAdapterExuBase );
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
     * Define transactions (state machine) for this adapter.
     *
     * IMPORTANT: When using defineTransactions:
     * - You cannot use onEntityMap() - bind handlers via tx.bindButton(), tx.bindModal(), etc.
     * - You cannot use setExecutionSteps() - define step details in addState() instead.
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

        const BaseBuild = super.build();

        const AdapterClass = class AdminExecutionAdapterBuilderGenerated extends BaseBuild {
            protected static dedicatedLogger = new Logger( builder.name );

            protected static getExecutionSteps() {
                // If transactions are defined, derive execution steps from them
                if ( builder.transactions ) {
                    return builder.transactions.getExecutionSteps();
                }
                return builder.executionSteps || {};
            }

            /**
             * Get the transactions builder for this adapter.
             */
            public static getTransactions(): TransactionBuilder | undefined {
                return builder.transactions;
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
                } satisfies IExecutionAdapterContext<TInteraction, TArgs>;
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

            private getCurrentExecutionStepWrapper( context?: TInteraction ) {
                const method = Reflect.get( this, "getCurrentExecutionStep" ) as Function;
                return method.call( this, context );
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
                    AdminExecutionAdapterBuilderGenerated.dedicatedLogger.warn(
                        this.triggerTransitionWrapper,
                        `triggerTransition called but no transactions defined for adapter '${ builder.name }'`
                    );
                    return;
                }

                const resolved = builder.transactions.resolveTransition( transitionName );
                if ( !resolved ) {
                    AdminExecutionAdapterBuilderGenerated.dedicatedLogger.warn(
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
                        AdminExecutionAdapterBuilderGenerated.dedicatedLogger.debug(
                            this.triggerTransitionWrapper,
                            `Silent transition '${ transitionName }' executed (no UI update)`
                        );
                        break;
                }
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
                        switch ( binding.handlerKind ) {
                            case "button":
                                binder.bindButton( binding.elementId, binding.handler as any );
                                break;
                            case "modal":
                                binder.bindModal( binding.elementId, binding.handler as any );
                                break;
                            case "modalWithButton":
                                binder.bindModalWithButton(
                                    binding.elementId,
                                    binding.modalName!,
                                    binding.handler as any
                                );
                                break;
                            case "selectMenu":
                                binder.bindSelectMenu( binding.elementId, binding.handler as any );
                                break;
                            case "userSelectMenu":
                                binder.bindUserSelectMenu( binding.elementId, binding.handler as any );
                                break;
                        }
                    }
                    return;
                }

                // Otherwise call base implementation
                // @ts-expect-error - base may not implement
                return super.onEntityMap?.();
            }

            /**
             * Override createBinder to wrap with TransactionAwareBinder when transactions are defined.
             */
            protected createBinder(): IBinder<TInteraction, TArgs, IExecutionAdapterContext<TInteraction, TArgs>> {
                const baseBinder = super.createBinder() as IBinder<TInteraction, TArgs, IExecutionAdapterContext<TInteraction, TArgs>>;

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

        // Extend metadata to include transactions
        if ( builder.transactions ) {
            const existingMetadata = Reflect.get( AdapterClass, BUILDER_METADATA_SYMBOL ) as AdapterBuilderMetadata | undefined;
            if ( existingMetadata ) {
                Reflect.defineProperty( AdapterClass, BUILDER_METADATA_SYMBOL, {
                    value: {
                        ...existingMetadata,
                        transactions: builder.transactions
                    },
                    configurable: true
                } );
            }
        }

        return AdapterClass;
    }
}
