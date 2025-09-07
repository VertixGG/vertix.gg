import type { Logger } from "@vertix.gg/base/src/modules/logger";
import type { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";
import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import type { UIArgs, UIAdapterBuildSource } from "@vertix.gg/gui/src/bases/ui-definitions";
import type {
    UIAdapterReplyContext,
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { MessageComponentInteraction } from "discord.js";

export interface IAdapterContext<TArgs extends UIArgs = UIArgs> {
    readonly logger: Logger;
    readonly customIdStrategy: UICustomIdStrategyBase;
    getComponent: () => UIComponentBase;
    deleteArgs: <T extends UIAdapterReplyContext>( interaction: T ) => void;
    ephemeral: <T extends UIAdapterReplyContext>( interaction: T, args?: TArgs, deletePrevious?: boolean ) => Promise<void>;
    editReply: <T extends UIAdapterReplyContext>( interaction: T, args?: TArgs ) => Promise<void | {}>;
    showModal: ( name: string, interaction: MessageComponentInteraction<"cached"> ) => Promise<void>;
}

export type GetReplyArgsHandler<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs
> = (
    context: IAdapterContext<TArgs>,
    interaction?: TInteraction,
    argsFromManager?: TArgs
) => Promise<TArgs>;

export type BeforeBuildHandler<
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs
> = (
    context: IAdapterContext<TArgs>,
    args: TArgs,
    from: UIAdapterBuildSource,
    interaction?: TInteraction
) => Promise<void>;

export interface IBinder<TArgs extends UIArgs = UIArgs> {
    bindButton: <T extends UIDefaultButtonChannelTextInteraction>(
        name: string,
        callback: ( context: IAdapterContext<TArgs>, interaction: T ) => Promise<void>
    ) => void;
    bindModal: <T extends UIDefaultModalChannelTextInteraction>(
        name: string,
        callback: ( context: IAdapterContext<TArgs>, interaction: T ) => Promise<void>
    ) => void;
    bindSelectMenu: <T extends UIDefaultStringSelectMenuChannelTextInteraction>(
        name: string,
        callback: ( context: IAdapterContext<TArgs>, interaction: T ) => Promise<void>
    ) => void;
}

export type BeforeBuildRunHandler<TArgs extends UIArgs = UIArgs> = (
    binder: IBinder<TArgs>
) => Promise<void>;
