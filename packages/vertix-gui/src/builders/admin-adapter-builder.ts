import { AdminAdapterBase } from "@vertix.gg/bot/src/ui/general/admin/admin-adapter-base";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import type { Logger } from "@vertix.gg/base/src/modules/logger";
import type { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";
import type {
    UIArgs,
    UIComponentTypeConstructor,
    UIAdapterBuildSource,
} from "@vertix.gg/gui/src/bases/ui-definitions";

export interface IAdapterContext<TArgs extends UIArgs = UIArgs> {
    readonly logger: Logger;
    readonly customIdStrategy: UICustomIdStrategyBase;
    getComponent: () => UIComponentBase;
    deleteArgs: ( interaction: any ) => void;
    ephemeral: ( interaction: any, args?: TArgs ) => Promise<any>;
    editReply: ( interaction: any, args?: TArgs ) => Promise<any>;
    showModal: ( name: string, interaction: any ) => Promise<void>;
}

type GetReplyArgsHandler<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs = UIArgs> = (
    context: IAdapterContext<TArgs>,
    interaction?: TInteraction,
    argsFromManager?: TArgs
) => Promise<TArgs>;

type BeforeBuildHandler<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs = UIArgs> = (
    context: IAdapterContext<TArgs>,
    args: TArgs,
    from: UIAdapterBuildSource,
    interaction?: TInteraction
) => Promise<void>;

interface IBinder<TArgs extends UIArgs = UIArgs> {
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

type BeforeBuildRunHandler<TArgs extends UIArgs = UIArgs> = (
    binder: IBinder<TArgs>
) => Promise<void>;

export class AdminAdapterBuilder<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs
> {
    private name: string;
    private component: UIComponentTypeConstructor | undefined;
    private replyArgsHandler: GetReplyArgsHandler<TInteraction, TArgs> | undefined;
    private beforeBuildHandler: BeforeBuildHandler<TInteraction, TArgs> | undefined;
    private beforeBuildRunHandler: BeforeBuildRunHandler<TArgs> | undefined;

    public constructor( name: string ) {
        this.name = name;
    }

    public setComponent( component: UIComponentTypeConstructor ): this {
        this.component = component;
        return this;
    }

    public onGetReplyArgs( handler: GetReplyArgsHandler<TInteraction, TArgs> ): this {
        this.replyArgsHandler = handler;
        return this;
    }

    public onBeforeBuild( handler: BeforeBuildHandler<TInteraction, TArgs> ): this {
        this.beforeBuildHandler = handler;
        return this;
    }

    public onBeforeBuildRun( handler: BeforeBuildRunHandler<TArgs> ): this {
        this.beforeBuildRunHandler = handler;
        return this;
    }

    public build(): new ( options: TAdapterRegisterOptions ) => AdminAdapterBase<TChannel, TInteraction> {
        const builder = this;

        if ( !builder.component ) {
            throw new Error( `A component must be set for adapter "${ builder.name }" before building.` );
        }

        return class GeneratedAdapter extends AdminAdapterBase<TChannel, TInteraction> {
            public static getName() {
                return builder.name;
            }

            public static getComponent() {
                return builder.component as UIComponentTypeConstructor;
            }

            protected async getReplyArgs(
                interaction?: TInteraction,
                argsFromManager?: UIArgs
            ): Promise<UIArgs> {
                if ( builder.replyArgsHandler ) {
                    return builder.replyArgsHandler( this.getContext(), interaction, argsFromManager as TArgs );
                }
                return super.getReplyArgs( interaction, argsFromManager );
            }

            protected async onBeforeBuild(
                args: UIArgs,
                from: UIAdapterBuildSource,
                interaction?: TInteraction
            ) {
                if ( from === "run" && builder.beforeBuildRunHandler ) {
                    const binder: IBinder<TArgs> = {
                        bindButton: <T extends UIDefaultButtonChannelTextInteraction>(
                            name: string,
                            callback: ( context: IAdapterContext<TArgs>, interaction: T ) => Promise<void>
                        ) => this.bindButton( name, ( interaction ) => callback( this.getContext(), interaction as T ) ),
                        bindModal: <T extends UIDefaultModalChannelTextInteraction>(
                            name: string,
                            callback: ( context: IAdapterContext<TArgs>, interaction: T ) => Promise<void>
                        ) => this.bindModal( name, ( interaction ) => callback( this.getContext(), interaction as T ) ),
                        bindSelectMenu: <T extends UIDefaultStringSelectMenuChannelTextInteraction>(
                            name: string,
                            callback: ( context: IAdapterContext<TArgs>, interaction: T ) => Promise<void>
                        ) => this.bindSelectMenu( name, ( interaction ) => callback( this.getContext(), interaction as T ) )
                    };
                    await builder.beforeBuildRunHandler( binder );
                }

                if ( builder.beforeBuildHandler ) {
                    await builder.beforeBuildHandler( this.getContext(), args as TArgs, from, interaction );
                }
            }

            private getContext(): IAdapterContext<TArgs> {
                return {
                    logger: AdminAdapterBase.dedicatedLogger,
                    customIdStrategy: this.customIdStrategy,
                    getComponent: this.getComponent.bind( this ),
                    deleteArgs: this.deleteArgs.bind( this ),
                    ephemeral: this.ephemeral.bind( this ),
                    editReply: this.editReply.bind( this ),
                    showModal: this.showModal.bind( this )
                };
            }
        };
    }
}
