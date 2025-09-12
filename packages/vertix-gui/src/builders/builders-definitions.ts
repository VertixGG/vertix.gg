import type { UIModalSchema } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { Logger } from "@vertix.gg/base/src/modules/logger";
import type { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import type { UIArgs, UIAdapterBuildSource, UIExecutionStepItem, UIEntitySchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIArgsManager } from "@vertix.gg/gui/src/bases/ui-args-manager";
import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultChannelSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { MessageComponentInteraction } from "discord.js";

export interface IAdapterContext<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs = UIArgs> {
    readonly logger: Logger;
    readonly customIdStrategy: UICustomIdStrategyBase;
    getInstance: () => UIAdapterBase<any, any>;
    getComponent: () => UIComponentBase;
    deleteArgs: ( interaction: TInteraction ) => void;
    ephemeral: ( interaction: TInteraction, args?: TArgs, deletePrevious?: boolean ) => Promise<void>;
    editReply: ( interaction: TInteraction, args?: TArgs ) => Promise<void | {}>;
    showModal: ( name: string, interaction: MessageComponentInteraction<"cached"> ) => Promise<void>;
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
    getArgsManager: () => UIArgsManager;
    getName: () => string;
}

export type GetStartArgsHandler<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs,
    TContext extends IAdapterContext<TInteraction, TArgs> = IAdapterContext<TInteraction, TArgs>
> = (
    context: TContext,
    channel: TChannel
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
    bindButton: <T extends UIDefaultButtonChannelTextInteraction>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>
    ) => void;
    bindModal: <T extends UIDefaultModalChannelTextInteraction>(
        name: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>
    ) => void;
    bindModalWithButton: <T extends UIDefaultModalChannelTextInteraction>(
        buttonName: string,
        modalName: string,
        callback: ( context: TContext, interaction: T ) => Promise<void>
    ) => void;
    bindSelectMenu: <T extends UIDefaultStringSelectMenuChannelTextInteraction>(
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
