
import { Logger } from "@vertix.gg/base/src/modules/logger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PermissionsBitField } from "discord.js";

import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";
import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";
import { UI_MAX_CUSTOM_ID_LENGTH } from "@vertix.gg/gui/src/ui-constants";

import type {
    ChannelType,
    ButtonInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import type { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import type { UIModalSchema } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
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
    BeforeFinishHandler,
    BindingRegistrationOptions,
    BindingFlowTriggerConfig
} from "@vertix.gg/gui/src/builders/builders-definitions";
import type { AdapterBuilderMetadata } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";
import type { TAdapterStaticContract, TAdapterRegisterOptions as TRegisterOptionsContract } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIDataService } from "@vertix.gg/gui/src/ui-data-service";
import type { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";

type StartArgsHandler<TContext, TChannel, TArgs> = (
    context: TContext,
    channel: TChannel,
    argsFromManager?: TArgs
) => Promise<TArgs>;
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
    protected argsDataSource:
        | {
            targets: Set<"start" | "reply" | "edit">;
            dataComponentName: string;
        }
        | undefined;

    protected contextFactory:
        | ( (
            base: IAdapterContext<TInteraction, TArgs>,
            adapter: InstanceType<TAdapter>
        ) => TContext )
        | undefined;

    protected static dedicatedLogger = new Logger( this.getName() );
    protected disableMiddlewareFlag: boolean | undefined;

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

    public disableMiddleware(): this {
        this.disableMiddlewareFlag = true;
        return this;
    }

    public setShouldDisableMiddleware( value: boolean ): this {
        this.disableMiddlewareFlag = value;
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

    public onBeforeBuildPrototype( handler: BeforeBuildHandler<TInteraction, TArgs, TContext> ): this {
        this.beforeBuildHandler = handler;
        return this;
    }

    public onBeforeBuildRun( handler: BeforeBuildRunHandler<TInteraction, TArgs, TContext> ): this {
        this.beforeBuildRunHandler = handler;
        return this;
    }

    /**
     * Use a UIDataBase component as the args data source for adapter methods.
     * targets: array including 'start', 'reply', 'edit', or 'all' (applies to all).
     */
    public setArgsDataSource(
        targets: Array<"start" | "reply" | "edit" | "all">,
        dataComponentName: string
    ): this {
        const normalized = new Set<"start" | "reply" | "edit">();

        targets.forEach( ( target ) => {
            if ( target === "all" ) {
                normalized.add( "start" );
                normalized.add( "reply" );
                normalized.add( "edit" );
                return;
            }
            normalized.add( target );
        } );

        this.argsDataSource = {
            targets: normalized,
            dataComponentName
        };

        return this;
    }

    public useContextFactory(
        factory: (
            base: IAdapterContext<TInteraction, TArgs>,
            adapter: InstanceType<TAdapter>
        ) => TContext
    ): this {
        this.contextFactory = factory;
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
                    if ( builderResult ) {
                        return builderResult;
                    }
                    return builder.buildCustomId( this.getName(), entity, this.customIdStrategy );
                }

                protected getCustomIdForEntity( hash: string ): string {
                    const builderResult = builder.getCustomIdForEntityHandler?.( this.getContext(), hash );
                    return builderResult ?? super.getCustomIdForEntity( hash );
                }

                protected async getStartArgs( channel: TChannel, argsFromManager?: UIArgs ): Promise<UIArgs> {
                    const dataArgs = await builder.resolveArgsFromDataSource( "start", channel, argsFromManager );

                    if ( builder.startArgsHandler ) {
                        const handlerArgs = await builder.startArgsHandler( this.getContext(), channel, argsFromManager as TArgs );
                        if ( dataArgs ) {
                            return { ...dataArgs, ...handlerArgs };
                        }
                        return handlerArgs;
                    }

                    if ( dataArgs ) {
                        return dataArgs;
                    }

                    return super.getStartArgs( channel, argsFromManager );
                }

                protected async getReplyArgs( interaction: TInteraction, argsFromManager?: UIArgs ): Promise<UIArgs> {
                    const dataArgs = await builder.resolveArgsFromDataSource( "reply", interaction, argsFromManager );

                    if ( builder.replyArgsHandler ) {
                        const handlerArgs = await builder.replyArgsHandler( this.getContext(), interaction, argsFromManager as TArgs );
                        if ( dataArgs ) {
                            return { ...dataArgs, ...handlerArgs };
                        }
                        return handlerArgs;
                    }

                    if ( dataArgs ) {
                        return dataArgs;
                    }

                    return super.getReplyArgs( interaction, argsFromManager );
                }

                protected async onBeforeBuild( args: UIArgs, from: UIAdapterBuildSource, interaction?: TInteraction ) {
                    if ( builder.beforeBuildHandler ) {
                        await builder.beforeBuildHandler( this.getContext(), args as TArgs, from, interaction );
                    }

                    if ( from === "run" && builder.beforeBuildRunHandler ) {
                        await builder.beforeBuildRunHandler( this.createBinder() );
                    }
                }

                protected async onEntityMap() {
                    if ( builder.entityMapHandler ) {
                        await builder.entityMapHandler( this.createBinder() );
                    }
                }

                protected createBinder(): IBinder<TInteraction, TArgs, TContext> {
                    const getContext = this.getContext.bind( this );

                    const applyFlowTriggers = async(
                        interaction: UIAdapterReplyContext,
                        options?: BindingRegistrationOptions
                    ) => {
                        const triggers = options?.flowTriggers ?? [];

                        if ( triggers.length === 0 ) {
                            return;
                        }

                        const context = getContext();
                        const editReplyWithStep = ( context as Partial<{
                            editReplyWithStep: ( interaction: UIAdapterReplyContext, stepName: string, sendArgs?: TArgs ) => Promise<void | {}>;
                        }> ).editReplyWithStep;

                        if ( typeof editReplyWithStep !== "function" ) {
                            return;
                        }

                        const args = context.getArgs( interaction ) as TArgs | undefined;

                        if ( !args || typeof args !== "object" ) {
                            return;
                        }

                        for ( const trigger of triggers as BindingFlowTriggerConfig[] ) {
                            const executionStep = trigger.navigation?.executionStep;

                            if ( typeof executionStep === "string" && executionStep.length > 0 ) {
                                await editReplyWithStep( interaction, executionStep, args );
                            }
                        }
                    };

                    return {
                        bindButton: <T extends ButtonInteraction<"cached">>(
                            name: string,
                            callback: ( context: TContext, interaction: T ) => Promise<void>,
                            _options?: BindingRegistrationOptions
                        ) => this.bindButton( name, async( interaction ) => {
                            await callback( getContext(), interaction as T );
                            await applyFlowTriggers( interaction, _options );
                        } ),
                        bindModal: <T extends ModalSubmitInteraction<"cached">>(
                            name: string,
                            callback: ( context: TContext, interaction: T ) => Promise<void>,
                            _options?: BindingRegistrationOptions
                        ) => this.bindModal( name, async( interaction ) => {
                            await callback( getContext(), interaction as T );
                            await applyFlowTriggers( interaction, _options );
                        } ),
                        bindModalWithButton: <T extends ModalSubmitInteraction<"cached">>(
                            buttonName: string,
                            modalName: string,
                            callback: ( context: TContext, interaction: T ) => Promise<void>,
                            _options?: BindingRegistrationOptions
                        ) => this.bindModalWithButton( buttonName, modalName, async( interaction ) => {
                            await callback( getContext(), interaction as T );
                            await applyFlowTriggers( interaction, _options );
                        } ),
                        bindSelectMenu: <T extends StringSelectMenuInteraction<"cached">>(
                            name: string,
                            callback: ( context: TContext, interaction: T ) => Promise<void>,
                            _options?: BindingRegistrationOptions
                        ) => this.bindSelectMenu( name, async( interaction ) => {
                            await callback( getContext(), interaction as T );
                            await applyFlowTriggers( interaction, _options );
                        } ),
                        bindUserSelectMenu: <T extends UserSelectMenuInteraction<"cached">>(
                            name: string,
                            callback: ( context: TContext, interaction: T ) => Promise<void>,
                            _options?: BindingRegistrationOptions
                        ) => this.bindUserSelectMenu( name, async( interaction ) => {
                            await callback( getContext(), interaction as T );
                            await applyFlowTriggers( interaction, _options );
                        } )
                    };
                }

                protected getBaseContext(): IAdapterContext<TInteraction, TArgs> {
                    return {
                        logger: AdapterBuilderBase.dedicatedLogger,
                        customIdStrategy: this.customIdStrategy,
                        getName: this.getName.bind( this ),
                        getComponent: this.getComponent.bind( this ),
                        getArgs: (  context ) => this.getArgsManager().getArgs( this, context ),
                        setArgs: ( interaction, args ) => this.getArgsManager().setArgs( this, interaction, args ),
                        deleteArgs: this.deleteArgs.bind( this ),
                        ephemeral: this.ephemeral.bind( this ),
                        editReply: this.editReply.bind( this ),
                        showModal: ( interaction, name ) => this.showModal( name, interaction ),
                        updateInteractionDefer: this.updateInteractionDefer.bind( this ),
                        deleteRelatedEphemeralInteractionsInternal: this.deleteRelatedEphemeralInteractionsInternal.bind( this )
                    };
                }

                protected getContext() {
                    const base = this.getBaseContext();
                    if ( builder.contextFactory ) {
                        return builder.contextFactory( base, this as InstanceType<TAdapter> );
                    }
                    return base as TContext;
                }

                protected shouldDisableMiddleware(): boolean {
                    const builderValue = builder.disableMiddlewareFlag;
                    if ( builderValue !== undefined ) {
                        return builderValue;
                    }
                    return super.shouldDisableMiddleware ? super.shouldDisableMiddleware() : false;
                }
            };

            return AdapterBuilderGenerated as TAdapterStaticContract & (
                new ( options: TRegisterOptionsContract ) => InstanceType<typeof AdapterBuilderGenerated>
            );
        }

        const AdapterClass = createAdapterClass();

        try { Object.defineProperty( AdapterClass, "displayName", { value: builder.name } ); } catch {}
        try { Object.defineProperty( AdapterClass.prototype, Symbol.toStringTag, { value: builder.name } ); } catch {}

        const metadata: AdapterBuilderMetadata = {
            name: builder.name,
            component: builder.component,
            excludedElements: builder.excludedElements,
            permissions: builder.permissions,
            channelTypes: builder.channelTypes,
            shouldDisableMiddleware: builder.disableMiddlewareFlag,
            generateCustomIdForEntityHandler: builder.generateCustomIdForEntityHandler,
            getCustomIdForEntityHandler: builder.getCustomIdForEntityHandler,
            startArgsHandler: builder.startArgsHandler,
            replyArgsHandler: builder.replyArgsHandler,
            beforeBuildHandler: builder.beforeBuildHandler,
            beforeBuildRunHandler: builder.beforeBuildRunHandler,
            beforeFinishHandler: builder.beforeFinishHandler,
            entityMapHandler: builder.entityMapHandler,
            contextFactory: builder.contextFactory,
            rawBuilder: builder
        };

        Reflect.defineProperty( AdapterClass, BUILDER_METADATA_SYMBOL, {
            value: metadata
        } );

        return AdapterClass;
    }

    protected callGetStartArgs(
        handler: StartArgsHandler<TContext, TChannel, TArgs> | undefined,
        context: TContext,
        channel: TChannel,
        argsFromManager?: TArgs
    ): Promise<UIArgs> {
        if ( handler ) {
            return handler( context, channel, argsFromManager );
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

    protected buildCustomId(
        adapterName: string,
        entity: UIEntitySchemaBase | UIModalSchema,
        strategy: UICustomIdStrategyBase
    ): string {
        const customId = entity.attributes.custom_id;
        if ( customId ) {
            return customId;
        }

        const baseName = adapterName;
        const entityName = entity.name;
        const separatorLength = UI_CUSTOM_ID_SEPARATOR.length;
        const candidate = baseName + UI_CUSTOM_ID_SEPARATOR + entityName;

        if ( candidate.length <= UI_MAX_CUSTOM_ID_LENGTH ) {
            return strategy.generateId( candidate );
        }

        const availableBaseLength = UI_MAX_CUSTOM_ID_LENGTH - separatorLength - entityName.length;

        if ( availableBaseLength > 0 ) {
            const hashedBase = UIHashService.generateHash( baseName, availableBaseLength, true );
            return hashedBase + UI_CUSTOM_ID_SEPARATOR + entityName;
        }

        const entityParts = entityName.split( UI_CUSTOM_ID_SEPARATOR );
        const entitySuffix = entityParts.pop();
        const entityCore = entityParts.join( UI_CUSTOM_ID_SEPARATOR );
        const baseBudget = Math.floor( UI_MAX_CUSTOM_ID_LENGTH / 3 );
        const entityBudget = UI_MAX_CUSTOM_ID_LENGTH - separatorLength * 2 - baseBudget - ( entitySuffix ? entitySuffix.length : 0 );
        const hashedBase = UIHashService.generateHash( baseName, Math.max( baseBudget, 6 ), true );
        const hashedEntityCore = UIHashService.generateHash( entityCore || entityName, Math.max( entityBudget, 6 ), true );

        if ( entitySuffix ) {
            const id = hashedBase + UI_CUSTOM_ID_SEPARATOR + hashedEntityCore + UI_CUSTOM_ID_SEPARATOR + entitySuffix;
            if ( id.length <= UI_MAX_CUSTOM_ID_LENGTH ) {
                return id;
            }
        }

        return UIHashService.generateHash( candidate, UI_MAX_CUSTOM_ID_LENGTH, true );
    }

    protected async resolveArgsFromDataSource(
        target: "start" | "reply" | "edit",
        context: unknown,
        argsFromManager?: UIArgs
    ): Promise<UIArgs | undefined> {
        if ( !this.argsDataSource?.targets.has( target ) || !this.argsDataSource.dataComponentName ) {
            return undefined;
        }

        try {
            const uiDataService = ServiceLocator.$.get<UIDataService>( "VertixGUI/UIDataService" );
            const dataComponent = uiDataService.getDataComponent( this.argsDataSource.dataComponentName, true );

            if ( !dataComponent || "function" !== typeof ( dataComponent as any ).read ) {
                return argsFromManager;
            }

            const identifier = {
                ...( "object" === typeof context ? ( context as Record<string, unknown> ) : {} ),
                ...( argsFromManager ?? {} )
            };

            const data = await ( dataComponent as { read: ( payload: Record<string, unknown> ) => Promise<UIArgs | null> } )
                .read( identifier );

            return { ...( data ?? {} ), ...( argsFromManager ?? {} ) };
        } catch( error ) {
            const logger = new Logger( this.name );
            logger.warn( this.resolveArgsFromDataSource, `Failed to resolve data source for '${ this.name }'`, error );
            return argsFromManager;
        }
    }
}
