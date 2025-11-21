import type { UIModalSchema } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type { Logger } from "@vertix.gg/base/src/modules/logger";
import type { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import type { UIArgs, UIAdapterBuildSource, UIExecutionStepItem, UIEntitySchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultChannelSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { ButtonInteraction, Message, MessageComponentInteraction, ModalSubmitInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";

export interface IAdapterContext<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs = UIArgs> {
    readonly logger: Logger;
    readonly customIdStrategy: UICustomIdStrategyBase;

    getName: () => string;
    getComponent: () => UIComponentBase;

    ephemeral: ( interaction: TInteraction, args?: TArgs, deletePrevious?: boolean ) => Promise<void>;
    editReply: ( interaction: TInteraction, args?: TArgs ) => Promise<void | {}>;
    showModal: ( interaction: MessageComponentInteraction<"cached">, name: string ) => Promise<void>;

    // Existing in base, part of args manager
    deleteArgs: ( interaction: TInteraction ) => void;

    getArgs: ( interaction: Message<true> | UIAdapterReplyContext | UIAdapterStartContext ) => UIArgs;
    setArgs: ( interaction: Message<true> | UIAdapterReplyContext | UIAdapterStartContext, args: UIArgs ) => void;

    updateInteractionDefer: ( interaction: TInteraction ) => Promise<void>;
    deleteRelatedEphemeralInteractionsInternal: ( interaction: TInteraction, customId: string, count: number ) => Promise<number>;
}

export interface IWizardAdapterContext<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs = UIArgs>
    extends IAdapterContext<TInteraction, TArgs> {
    editReplyWithStep: ( interaction: TInteraction, stepName: string, sendArgs?: TArgs ) => Promise<void | {}>;
    ephemeralWithStep: (
        interaction: TInteraction,
        stepName: string,
        sendArgs?: TArgs,
        deletePrevious?: boolean
    ) => Promise<void>;
    getCurrentExecutionStep: ( interaction?: TInteraction ) => UIExecutionStepItem | undefined;
    getCurrentStepIndex: ( interaction?: TInteraction ) => number;
    generateCustomIdForEntity: ( entity: UIEntitySchemaBase | UIModalSchema ) => string;
}

export interface IExecutionAdapterContext<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs = UIArgs>
    extends IAdapterContext<TInteraction, TArgs> {
    editReplyWithStep: ( interaction: TInteraction, stepName: string, sendArgs?: TArgs ) => Promise<void | {}>;
    ephemeralWithStep: ( interaction: TInteraction, stepName: string, sendArgs?: TArgs, deletePrevious?: boolean ) => Promise<void>;
    getCurrentExecutionStep: ( interaction?: TInteraction ) => UIExecutionStepItem | undefined;
}

export type GetStartArgsHandler<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs,
    TContext extends IAdapterContext<TInteraction, TArgs> = IAdapterContext<TInteraction, TArgs>
> = (
    context: TContext,
    channel: TChannel,
    argsFromManager?: TArgs
) => Promise<TArgs>;

export type GetReplyArgsHandler<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs,
    TContext extends IAdapterContext<TInteraction, TArgs> = IAdapterContext<TInteraction, TArgs>
> = (
    context: TContext,
    interaction: TInteraction,
    argsFromManager: TArgs
) => Promise<TArgs>;

export type GenerateCustomIdForEntityHandler<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs,
    TContext extends IAdapterContext<TInteraction, TArgs> = IAdapterContext<TInteraction, TArgs>
> = (
    context: TContext,
    entity: UIEntitySchemaBase | UIModalSchema
) => string | undefined;

export type GetCustomIdForEntityHandler<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs,
    TContext extends IAdapterContext<TInteraction, TArgs> = IAdapterContext<TInteraction, TArgs>
> = (
    context: TContext,
    hash: string
) => string | undefined;

export type BeforeBuildHandler<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs,
    TContext extends IAdapterContext<TInteraction, TArgs> = IAdapterContext<TInteraction, TArgs>
> = (
    context: TContext,
    args: TArgs,
    from: UIAdapterBuildSource,
    interaction?: TInteraction
) => Promise<void>;

export interface IBinder<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs, TContext extends IAdapterContext<TInteraction, TArgs>> {
    bindButton: <T extends ButtonInteraction<"cached">>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>
    ) => void;
    bindModal: <T extends ModalSubmitInteraction<"cached">>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>
    ) => void;
    bindModalWithButton: <T extends ModalSubmitInteraction<"cached">>(
        buttonName: string,
        modalName: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>
    ) => void;
    bindSelectMenu: <T extends StringSelectMenuInteraction<"cached">>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>
    ) => void;
    bindUserSelectMenu: <T extends UserSelectMenuInteraction<"cached">>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>
    ) => void;
}

export type BeforeBuildRunHandler<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs, TContext extends IAdapterContext<TInteraction, TArgs>> = (
    binder: IBinder<TInteraction, TArgs, TContext>
) => Promise<void>;

export type BeforeFinishHandler<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs, TContext extends IAdapterContext<TInteraction, TArgs>> = (
    context: TContext,
    interaction: TInteraction
) => Promise<void>;

// export type WizardBeforeBuildRunHandler<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs, TContext extends IWizardAdapterContext<TInteraction, TArgs>> = (
// binder: IBinder<TInteraction, TArgs, TContext>
// ) => Promise<void>;

// export type WizardBeforeBuildHandler<
//     TInteraction extends UIAdapterReplyContext,
//     TArgs extends UIArgs = UIArgs
// > = (
//     context: IWizardAdapterContext<TInteraction, TArgs>,
//     args: TArgs,
//     from: UIAdapterBuildSource,
//     interaction?: TInteraction
// ) => Promise<void>;

export type OnBeforeFinishHandler<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs
> = (
    context: IAdapterContext<TInteraction, TArgs>,
    interaction: TInteraction
) => Promise<void>;

export type WizardOnBeforeFinishHandler<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs
> = (
    context: IWizardAdapterContext<TInteraction, TArgs>,
    interaction: TInteraction
) => Promise<void>;

export type WizardInteractions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

export type SetupEditInteractions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultChannelSelectMenuChannelTextInteraction
    | UIDefaultModalChannelTextInteraction;
