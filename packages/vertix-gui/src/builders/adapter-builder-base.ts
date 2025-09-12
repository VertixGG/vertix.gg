
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { PermissionsBitField  } from "discord.js";

import type { ChannelType } from "discord.js";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

import type { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import type { UIModalSchema } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type {
    UIArgs,
    UIEntityTypes,
    UIEntitySchemaBase,
    UIAdapterBuildSource,
    UIComponentTypeConstructor,
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    IAdapterContext,
    GetReplyArgsHandler,
    BeforeBuildHandler,
    BeforeBuildRunHandler,
    GenerateCustomIdForEntityHandler,
    GetCustomIdForEntityHandler,
    GetStartArgsHandler,
    IBinder,
    BeforeFinishHandler
} from "@vertix.gg/gui/src/builders/builders-definitions";

type StartArgsHandler<TContext, TChannel, TArgs> = ( context: TContext, channel: TChannel ) => Promise<TArgs>;
type ReplyArgsHandler<TContext, TInteraction, TArgs> = (
    context: TContext,
    interaction?: TInteraction,
    argsFromManager?: TArgs
) => Promise<TArgs>;
type GenIdWithContext<TContext> = ( context: TContext, entity: UIEntitySchemaBase | UIModalSchema ) => string;
type GetIdWithContext<TContext> = ( context: TContext, hash: string ) => string;

type EntityMapHandler<TInteraction extends UIAdapterReplyContext, TArgs extends UIArgs, TContext extends IAdapterContext<TInteraction, TArgs>> = (
    binder: IBinder<TInteraction, TArgs, TContext>
) => Promise<void>;

export class AdapterBuilderBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TAdapter extends  typeof UIAdapterBase <TChannel, TInteraction>,
    TArgs extends UIArgs,
    TContext extends IAdapterContext<TInteraction, TArgs>,
    TComponent extends UIComponentTypeConstructor = UIComponentTypeConstructor
> {
    protected component: TComponent | undefined;
    protected permissions: PermissionsBitField | undefined;
    protected channelTypes: ChannelType[] | undefined;
    protected excludedElements: UIEntityTypes | undefined;
    protected generateCustomIdForEntityHandler: GenerateCustomIdForEntityHandler<TInteraction, TArgs, TContext> | undefined;
    protected getCustomIdForEntityHandler: GetCustomIdForEntityHandler<TInteraction, TArgs, TContext> | undefined;
    protected startArgsHandler: GetStartArgsHandler<TChannel, TInteraction, TArgs, TContext> | undefined;
    protected replyArgsHandler: GetReplyArgsHandler<TInteraction, TArgs, TContext> | undefined;
    protected beforeBuildHandler: BeforeBuildHandler<TInteraction, TArgs, TContext> | undefined;
    protected beforeBuildRunHandler: BeforeBuildRunHandler<TInteraction, TArgs, TContext> | undefined;
    protected beforeFinishHandler: BeforeFinishHandler<TInteraction, TArgs, TContext> | undefined;
    protected entityMapHandler: EntityMapHandler<TInteraction, TArgs, TContext> | undefined;

    protected static dedicatedLogger = new Logger( this.getName() );

    public static getName(): string {
        return "VertixGUI/Builders/AdapterBuilderBase";
    }

    public constructor(
        protected name: string,
        protected adatperBase: TAdapter ) {
    }

    public setComponent( component: TComponent ): this {
        this.component = component;
        return this;
    }

    public setExcludedElements( elements: UIEntityTypes ): this {
        this.excludedElements = elements;
        return this;
    }

    public setPermissions( permissions: PermissionsBitField ): this {
        this.permissions = permissions;
        return this;
    }

    public setChannelTypes( channelTypes: ChannelType[] ): this {
        this.channelTypes = channelTypes;
        return this;
    }

    public generateCustomIdForEntity( handler: GenerateCustomIdForEntityHandler<TInteraction, TArgs, TContext> ): this {
        this.generateCustomIdForEntityHandler = handler;
        return this;
    }

    public getCustomIdForEntity( handler: GetCustomIdForEntityHandler<TInteraction, TArgs, TContext> ): this {
        this.getCustomIdForEntityHandler = handler;
        return this;
    }

    public getStartArgs( handler: GetStartArgsHandler<TChannel, TInteraction, TArgs, TContext> ): this {
        this.startArgsHandler = handler;
        return this;
    }

    public getReplyArgs( handler: GetReplyArgsHandler<TInteraction, TArgs, TContext> ): this {
        this.replyArgsHandler = handler;
        return this;
    }

    public onEntityMap( handler: EntityMapHandler<TInteraction, TArgs, TContext> ): this {
        this.entityMapHandler = handler;
        return this;
    }

    public onBeforeBuild( handler: BeforeBuildHandler<TInteraction, TArgs, TContext> ): this {
        this.beforeBuildHandler = handler;
        return this;
    }

    public onBeforeBuildRun( handler: BeforeBuildRunHandler<TInteraction, TArgs, TContext> ): this {
        this.beforeBuildRunHandler = handler;
        return this;
    }

    public build( options: {
        bypassComponentCheck?: boolean;
    } = {} ) {
        const builder = this;

        if ( !options.bypassComponentCheck && !builder.component ) {
            throw new Error( `A component must be set for adapter "${ builder.name }" before building.` );
        }

        const BaseAdapter = builder.adatperBase as typeof UIAdapterBase<TChannel, TInteraction>;

        function createAdapterClass() {
            const AdapterBuilderGenerated = class AdapterBuilderGenerated extends BaseAdapter {

                public static getName() {
                    return builder.name;
                }

                public static getComponent() {
                    return builder.component as UIComponentTypeConstructor ?? BaseAdapter.getComponent();
                }

                public static getExcludedElements() {
                    return builder.excludedElements ?? BaseAdapter.getExcludedElements();
                }

                public getPermissions(): PermissionsBitField {
                    const superPermissions = super.getPermissions;

                    function tryGetSuperPermissions() {
                        try {
                            return superPermissions();
                        } catch {
                            return undefined;
                        }
                    }

                    return builder.permissions || tryGetSuperPermissions() || new PermissionsBitField();
                }

                public getChannelTypes() {
                    const superChannelTypes = super.getChannelTypes;

                    function getSuperChannelTypes() {
                        try {
                            return superChannelTypes();
                        } catch {
                            return undefined;
                        }
                    }

                    return [
                        ... getSuperChannelTypes() ?? [],
                        ... builder.channelTypes ?? []
                    ];
                }

                protected generateCustomIdForEntity( entity: UIEntitySchemaBase | UIModalSchema ): string {
                    const builderResult = builder.generateCustomIdForEntityHandler?.( this.getContext(), entity );
                    return builderResult ?? super.generateCustomIdForEntity( entity );
                }

                protected getCustomIdForEntity( hash: string ): string {
                    const builderResult = builder.getCustomIdForEntityHandler?.( this.getContext(), hash );
                    return builderResult ?? super.getCustomIdForEntity( hash );
                }

                protected async getStartArgs( channel: TChannel, _argsFromManager?: UIArgs ): Promise<UIArgs> {
                    if ( builder.startArgsHandler ) {
                        return builder.startArgsHandler( this.getContext(), channel );
                    }
                    return super.getStartArgs( channel, _argsFromManager );
                }

                protected async getReplyArgs( interaction: TInteraction, argsFromManager?: UIArgs ): Promise<UIArgs> {
                    if ( builder.replyArgsHandler ) {
                        return builder.replyArgsHandler( this.getContext(), interaction, argsFromManager as TArgs );
                    }
                    return super.getReplyArgs( interaction, argsFromManager );
                }

                protected async onBeforeBuild( args: UIArgs, from: UIAdapterBuildSource, interaction?: TInteraction ) {
                    if ( builder.beforeBuildHandler ) {
                        await builder.beforeBuildHandler( this.getContext(), args as TArgs, from, interaction );
                    }

                    if ( from === "run" && builder.beforeBuildRunHandler ) {
                        const binder: IBinder<TInteraction, TArgs, TContext> = {
                            bindButton: <T extends UIDefaultButtonChannelTextInteraction>(
                                name: string,
                                callback: ( context: TContext, interaction: T ) => Promise<void>
                            ) => this.bindButton( name, ( interaction ) => callback( this.getContext(), interaction as T ) ),
                            bindModal: <T extends UIDefaultModalChannelTextInteraction>(
                                name: string,
                                callback: ( context: TContext, interaction: T ) => Promise<void>
                            ) => this.bindModal( name, ( interaction ) => callback( this.getContext(), interaction as T ) ),
                            bindModalWithButton: <T extends UIDefaultModalChannelTextInteraction>(
                                buttonName: string,
                                modalName: string,
                                callback: ( context: TContext, interaction: T ) => Promise<void>
                            ) => this.bindModalWithButton( buttonName, modalName, ( interaction ) => callback( this.getContext(), interaction as T ) ),
                            bindSelectMenu: <T extends UIDefaultStringSelectMenuChannelTextInteraction>(
                                name: string,
                                callback: ( context: TContext, interaction: T ) => Promise<void>
                            ) => this.bindSelectMenu( name, ( interaction ) => callback( this.getContext(), interaction as T ) )
                        };
                        await builder.beforeBuildRunHandler( binder );
                    }
                }

                protected async onEntityMap() {
                    if ( builder.entityMapHandler ) {
                        const binder: IBinder<TInteraction, TArgs, TContext> = {
                            bindButton: <T extends UIDefaultButtonChannelTextInteraction>(
                                name: string,
                                callback: ( context: TContext, interaction: T ) => Promise<void>
                            ) => this.bindButton( name, ( interaction ) => callback( this.getContext(), interaction as T ) ),
                            bindModal: <T extends UIDefaultModalChannelTextInteraction>(
                                name: string,
                                callback: ( context: TContext, interaction: T ) => Promise<void>
                            ) => this.bindModal( name, ( interaction ) => callback( this.getContext(), interaction as T ) ),
                            bindModalWithButton: <T extends UIDefaultModalChannelTextInteraction>(
                                buttonName: string,
                                modalName: string,
                                callback: ( context: TContext, interaction: T ) => Promise<void>
                            ) => this.bindModalWithButton( buttonName, modalName, ( interaction ) => callback( this.getContext(), interaction as T ) ),
                            bindSelectMenu: <T extends UIDefaultStringSelectMenuChannelTextInteraction>(
                                name: string,
                                callback: ( context: TContext, interaction: T ) => Promise<void>
                            ) => this.bindSelectMenu( name, ( interaction ) => callback( this.getContext(), interaction as T ) )
                        };
                        await builder.entityMapHandler( binder );
                    }
                }

                protected getContext(): TContext {
                    return {
                        getInstance: () => this,
                        logger: AdapterBuilderBase.dedicatedLogger,
                        customIdStrategy: this.customIdStrategy,
                        getComponent: this.getComponent.bind( this ),
                        deleteArgs: this.deleteArgs.bind( this ),
                        ephemeral: this.ephemeral.bind( this ),
                        editReply: this.editReply.bind( this ),
                        showModal: this.showModal.bind( this )
                    } as unknown as TContext;
                }
            };

            return AdapterBuilderGenerated as unknown as  {
                new ( options: TAdapterRegisterOptions ): InstanceType<TAdapter> & InstanceType<typeof AdapterBuilderGenerated>;
            };
        }

        const AdapterClass = createAdapterClass();

        try { Object.defineProperty( AdapterClass, "displayName", { value: builder.name } ); } catch {}
        try { Object.defineProperty( AdapterClass.prototype, Symbol.toStringTag, { value: builder.name } ); } catch {}

        return AdapterClass;
    }

    protected callGetStartArgs(
        handler: StartArgsHandler<TContext, TChannel, TArgs> | undefined,
        context: TContext,
        channel: TChannel
    ): Promise<UIArgs> {
        if ( handler ) {
            return handler( context, channel );
        }
        return Promise.resolve( {} );
    }

    protected callGetReplyArgs(
        handler: ReplyArgsHandler<TContext, TInteraction, TArgs> | undefined,
        context: TContext,
        interaction?: TInteraction,
        argsFromManager?: UIArgs
    ): Promise<UIArgs> {
        if ( handler ) {
            return handler( context, interaction, argsFromManager as TArgs );
        }
        return Promise.resolve( {} );
    }

    protected resolveGenerateCustomIdForEntity(
        handler: GenIdWithContext<TContext> | ( ( entity: UIEntitySchemaBase | UIModalSchema ) => string ) | undefined,
        context: TContext,
        entity: UIEntitySchemaBase | UIModalSchema,
        fallback: ( entity: UIEntitySchemaBase | UIModalSchema ) => string
    ): string {
        if ( handler ) {
            if ( ( handler as Function ).length >= 2 ) {
                return ( handler as ( context: TContext, entity: UIEntitySchemaBase | UIModalSchema ) => string )( context, entity );
            }
            return ( handler as ( entity: UIEntitySchemaBase | UIModalSchema ) => string )( entity );
        }
        return fallback( entity );
    }

    protected resolveGetCustomIdForEntity(
        handler: GetIdWithContext<TContext> | ( ( hash: string ) => string ) | undefined,
        context: TContext,
        hash: string,
        fallback: ( hash: string ) => string
    ): string {
        if ( handler ) {
            if ( ( handler as Function ).length >= 2 ) {
                return ( handler as ( context: TContext, hash: string ) => string )( context, hash );
            }
            return ( handler as ( hash: string ) => string )( hash );
        }
        return fallback( hash );
    }

    protected mergeEmbedsGroups(
        base: ( typeof UIEmbedsGroupBase )[],
        additional: ( typeof UIEmbedsGroupBase )[],
        extra: ( typeof UIEmbedsGroupBase )[]
    ): ( typeof UIEmbedsGroupBase )[] {
        return [ ...base, ...additional, ...extra ];
    }

}
