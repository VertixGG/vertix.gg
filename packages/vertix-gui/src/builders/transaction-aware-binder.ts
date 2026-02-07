import type {
    ButtonInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type {
    IAdapterContext,
    IBinder,
    BindingRegistrationOptions
} from "@vertix.gg/gui/src/builders/builders-definitions";
import type { ElementHandlerBinding, TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";

/**
 * TransactionAwareBinder wraps the base binder to auto-inject flowTriggers
 * from TransactionBuilder when binding elements.
 */
export class TransactionAwareBinder<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs,
    TContext extends IAdapterContext<TInteraction, TArgs>
> implements IBinder<TInteraction, TArgs, TContext> {
    private baseBinder: IBinder<TInteraction, TArgs, TContext>;
    private transactions: TransactionBuilder;

    public constructor(
        baseBinder: IBinder<TInteraction, TArgs, TContext>,
        transactions: TransactionBuilder
    ) {
        this.baseBinder = baseBinder;
        this.transactions = transactions;
    }

    public bindButton<T extends ButtonInteraction<"cached">>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>,
        options?: BindingRegistrationOptions
    ): void {
        const flowTrigger = this.transactions.getFlowTrigger( name );
        const mergedOptions = this.mergeFlowTriggerOptions( options, flowTrigger );

        this.baseBinder.bindButton( name, callback, mergedOptions );
    }

    public bindModal<T extends ModalSubmitInteraction<"cached">>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>,
        options?: BindingRegistrationOptions
    ): void {
        const flowTrigger = this.transactions.getFlowTrigger( name );
        const mergedOptions = this.mergeFlowTriggerOptions( options, flowTrigger );

        this.baseBinder.bindModal( name, callback, mergedOptions );
    }

    public bindModalWithButton<T extends ModalSubmitInteraction<"cached">>(
        buttonName: string,
        modalName: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>,
        options?: BindingRegistrationOptions
    ): void {
        // For modal-with-button, check both button and modal names
        const buttonFlowTrigger = this.transactions.getFlowTrigger( buttonName );
        const modalFlowTrigger = this.transactions.getFlowTrigger( modalName );
        const flowTrigger = modalFlowTrigger ?? buttonFlowTrigger;
        const mergedOptions = this.mergeFlowTriggerOptions( options, flowTrigger );

        this.baseBinder.bindModalWithButton( buttonName, modalName, callback, mergedOptions );
    }

    public bindSelectMenu<T extends StringSelectMenuInteraction<"cached">>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>,
        options?: BindingRegistrationOptions
    ): void {
        const flowTrigger = this.transactions.getFlowTrigger( name );
        const mergedOptions = this.mergeFlowTriggerOptions( options, flowTrigger );

        this.baseBinder.bindSelectMenu( name, callback, mergedOptions );
    }

    public bindUserSelectMenu<T extends UserSelectMenuInteraction<"cached">>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>,
        options?: BindingRegistrationOptions
    ): void {
        const flowTrigger = this.transactions.getFlowTrigger( name );
        const mergedOptions = this.mergeFlowTriggerOptions( options, flowTrigger );

        this.baseBinder.bindUserSelectMenu( name, callback, mergedOptions );
    }

    public dispatchBinding( binding: ElementHandlerBinding ): void {
        this.baseBinder.dispatchBinding( binding );
    }

    private mergeFlowTriggerOptions(
        options: BindingRegistrationOptions | undefined,
        flowTrigger: ReturnType<TransactionBuilder[ "getFlowTrigger" ]>
    ): BindingRegistrationOptions | undefined {
        if ( !flowTrigger ) {
            return options;
        }

        const existingTriggers = options?.flowTriggers ?? [];
        return {
            ...options,
            flowTriggers: [ ...existingTriggers, flowTrigger ]
        };
    }
}
