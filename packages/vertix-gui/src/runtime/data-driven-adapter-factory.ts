import { Logger } from "@vertix.gg/base/src/modules/logger";
import { PermissionsBitField } from "discord.js";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";
import { uiClassRegistry } from "@vertix.gg/gui/src/runtime/ui-class-registry";

import type { ChannelType } from "discord.js";

import type {
    HydratedAdapter,
    RuntimeHandler
} from "@vertix.gg/gui/src/runtime/ui-definition-runtime";
import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs, UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { RegisterableClass } from "@vertix.gg/gui/src/runtime/ui-class-registry";
import type { BindingFlowTriggerDefinition } from "@vertix.gg/gui/src/runtime/ui-definition-types";

type BindingInvoker = ( context: Record<string, unknown>, interaction: unknown ) => Promise<void>;
type FlowComponentResolver = ( flowName: string, state: string ) => Promise<string | undefined>;

interface DataDrivenAdapterConfig {
    hydrated: HydratedAdapter;
    componentClass: () => UIComponentTypeConstructor;
    resolveFlowComponent?: FlowComponentResolver;
}

const HANDLER_KIND_TO_METHOD: Record<string, string> = {
    button: "bindButton",
    modal: "bindModal",
    "modal-button": "bindModalWithButton",
    "string-select": "bindSelectMenu",
    "user-select": "bindUserSelectMenu"
};

export function createExecutionAdapter( config: DataDrivenAdapterConfig ) {
    const { hydrated, componentClass, resolveFlowComponent } = config;
    const logger = new Logger( hydrated.definition.name );
    const adapterExecutionStepKeys = new Set(
        ( hydrated.definition.executionSteps ?? [] ).map( ( step ) => step.key )
    );

    class DataDrivenExecutionAdapter extends UIAdapterExecutionStepsBase<UIAdapterStartContext, UIAdapterReplyContext> {
        public static override getName() {
            return hydrated.definition.name;
        }

        public static override getComponent() {
            return componentClass();
        }

        public static override getExecutionSteps() {
            return hydrated.definition.executionSteps.reduce<Record<string, {
                elementsGroup?: string | null;
                embedsGroup?: string | null;
                markdownGroup?: string | null;
            }>>( ( accumulator, step ) => {
                accumulator[ step.key ] = {
                    elementsGroup: step.elementsGroup ?? null,
                    embedsGroup: step.embedsGroup ?? null,
                    markdownGroup: step.markdownGroup ?? null
                };
                return accumulator;
            }, {} );
        }

        public override getPermissions(): PermissionsBitField {
            const { permissions } = hydrated.definition;

            if ( null === permissions || undefined === permissions ) {
                return super.getPermissions();
            }

            const bits = "string" === typeof permissions ? BigInt( permissions ) : BigInt( permissions );

            return new PermissionsBitField( bits );
        }

        public override getChannelTypes(): ChannelType[] {
            const channelTypes = hydrated.definition.channelTypes;

            if ( !channelTypes?.length ) {
                return super.getChannelTypes();
            }

            return channelTypes as unknown as ChannelType[];
        }

        public constructor( options: ConstructorParameters<typeof UIAdapterExecutionStepsBase>[ 0 ] ) {
            super( options );

            this.bindRuntimeInteractions();
        }

        protected override async getStartArgs(
            channel: UIAdapterStartContext,
            argsFromManager?: UIArgs
        ): Promise<UIArgs> {
            return this.invokeHook<UIArgs>(
                "getStartArgs",
                [ this.createContext(), channel, argsFromManager ],
                async() => super.getStartArgs( channel, argsFromManager )
            );
        }

        protected override async getReplyArgs(
            interaction: UIAdapterReplyContext,
            argsFromManager?: UIArgs
        ): Promise<UIArgs> {
            return this.invokeHook<UIArgs>(
                "getReplyArgs",
                [ this.createContext(), interaction, argsFromManager ],
                async() => super.getReplyArgs( interaction, argsFromManager )
            );
        }

        protected override async onBeforeBuild(
            args: UIArgs,
            from: string,
            interaction?: UIAdapterReplyContext
        ): Promise<void> {
            await this.invokeHook<void>(
                "onBeforeBuild",
                [ this.createContext(), args, from, interaction ],
                async() => {
                    const baseMethod = ( UIAdapterExecutionStepsBase.prototype as unknown as {
                        onBeforeBuild?: (
                            this: DataDrivenExecutionAdapter,
                            args: UIArgs,
                            from: string,
                            interaction?: UIAdapterReplyContext
                        ) => Promise<void>;
                    } ).onBeforeBuild;

                    if ( baseMethod ) {
                        await baseMethod.call( this, args, from as never, interaction );
                    }
                }
            );
        }

        protected async onAfterBuild(
            args: UIArgs,
            from: string,
            interaction?: UIAdapterReplyContext
        ): Promise<void> {
            await this.invokeHook<void>(
                "onAfterBuild",
                [ this.createContext(), args, from, interaction ],
                async() => {
                    const baseMethod = ( UIAdapterExecutionStepsBase.prototype as unknown as {
                        onAfterBuild?: (
                            this: DataDrivenExecutionAdapter,
                            args: UIArgs,
                            from: string,
                            interaction?: UIAdapterReplyContext
                        ) => Promise<void>;
                    } ).onAfterBuild;

                    if ( baseMethod ) {
                        await baseMethod.call( this, args, from as never, interaction );
                    }
                }
            );
        }

        protected override async onStep(
            stepName: string,
            interaction: UIAdapterReplyContext
        ): Promise<void> {
            await this.invokeHook<void>(
                "onStep",
                [ this.createContext(), stepName, interaction ],
                async() => {
                    const baseMethod = ( UIAdapterExecutionStepsBase.prototype as unknown as {
                        onStep?: (
                            this: DataDrivenExecutionAdapter,
                            name: string,
                            interaction: UIAdapterReplyContext
                        ) => Promise<void>;
                    } ).onStep;

                    if ( baseMethod ) {
                        await baseMethod.call( this, stepName, interaction );
                    }
                }
            );
        }

        private bindRuntimeInteractions() {
            for ( const binding of hydrated.bindings ) {
                const methodName = HANDLER_KIND_TO_METHOD[ binding.definition.kind || "button" ];

                if ( !methodName ) {
                    logger.warn(
                        "DataDrivenExecutionAdapter:bindRuntimeInteractions",
                        `Unknown binding kind '${ binding.definition.kind }' for '${ binding.definition.entity }'`
                    );
                    continue;
                }

                const binder = Reflect.get(
                    this,
                    methodName
                ) as ( name: string, handler: ( interaction: unknown ) => Promise<void> ) => void;

                if ( "function" !== typeof binder ) {
                    throw new Error( `DataDrivenExecutionAdapter: binder method '${ methodName }' not found` );
                }

                const invoker = createBindingInvoker( binding.callable );
                const flowTriggers = binding.definition.flowTriggers ?? [];

                const binderFn = binder as ( name: string, handler: ( interaction: unknown ) => Promise<void> ) => void;

                binderFn.call(
                    this,
                    binding.definition.entity,
                    async( interaction: unknown ) => {
                        const context = this.createContext();

                        await invoker( context, interaction );

                        await this.applyFlowTriggers( context, interaction, flowTriggers );
                    }
                );
            }
        }

        private async invokeHook<T>(
            name: string,
            args: unknown[],
            fallback: () => Promise<T>
        ): Promise<T> {
            const handlers = hydrated.hooks.filter( ( hook ) => hook.definition.hook === name );

            if ( !handlers.length ) {
                return fallback();
            }

            let lastResult: T = await fallback();

            for ( const handler of handlers ) {
                lastResult = await callHandler<T>( handler.callable, args, lastResult );
            }

            return lastResult;
        }

        private createContext(): Record<string, unknown> {
            const manager = this.getArgsManager() as unknown as {
                getArgs: ( adapter: unknown, ctx: unknown ) => UIArgs;
                setArgs: ( adapter: unknown, interaction: unknown, args: UIArgs ) => void;
            };

            return {
                logger,
                customIdStrategy: this.customIdStrategy,
                getName: this.getName.bind( this ),
                getComponent: this.getComponent.bind( this ),
                getArgs: ( context: unknown ) => manager.getArgs( this, context ),
                setArgs: ( interaction: unknown, args: UIArgs ) => manager.setArgs( this, interaction, args ),
                deleteArgs: ( interaction: unknown ) => this.deleteArgs( interaction as UIAdapterReplyContext ),
                editReply: this.editReply.bind( this ),
                ephemeral: this.ephemeral.bind( this ),
                showModal: ( interaction: unknown, name: string ) => this.showModal( name, interaction as never ),
                updateInteractionDefer: this.updateInteractionDefer.bind( this ),
                deleteRelatedEphemeralInteractionsInternal: this.deleteRelatedEphemeralInteractionsInternal.bind( this )
            };
        }

        private async applyFlowTriggers(
            context: Record<string, unknown>,
            interaction: unknown,
            triggers: BindingFlowTriggerDefinition[]
        ): Promise<void> {
            if ( !triggers.length ) {
                return;
            }

            const editReplyWithStep = context.editReplyWithStep as
                | ( ( interaction: unknown, stepName: string, args?: UIArgs ) => Promise<unknown> )
                | undefined;

            const getArgs = context.getArgs as ( ( ctx: unknown ) => UIArgs ) | undefined;

            const args = getArgs ? getArgs( interaction ) : undefined;

            for ( const trigger of triggers ) {
                const flowName = trigger.flowName;
                const targetState = trigger.navigation?.targetState;
                let executionStep = trigger.navigation?.executionStep;

                if ( resolveFlowComponent && flowName && targetState ) {
                    try {
                        const resolvedStep = await resolveFlowComponent( flowName, targetState );

                        if ( resolvedStep ) {
                            executionStep = resolvedStep;
                        }
                    } catch( error ) {
                        logger.warn(
                            "DataDrivenExecutionAdapter:applyFlowTriggers",
                            `Failed to resolve execution step for flow '${ flowName }' and state '${ targetState }'`,
                            error
                        );
                    }
                }

                if (
                    executionStep &&
                    adapterExecutionStepKeys.has( executionStep ) &&
                    typeof editReplyWithStep === "function"
                ) {
                    await editReplyWithStep( interaction, executionStep, args );
                }
            }
        }
    }

    uiClassRegistry.register( DataDrivenExecutionAdapter as RegisterableClass<object> );

    return DataDrivenExecutionAdapter;
}

export type ExecutionAdapterClass = ReturnType<typeof createExecutionAdapter>;

function createBindingInvoker( handler: RuntimeHandler ): BindingInvoker {
    if ( "function" === handler.type ) {
        return async( context, interaction ) => {
            await Promise.resolve( handler.handler( context, interaction ) );
        };
    }

    const instance: Record<string, unknown> = new handler.classRef.Class() as Record<string, unknown>;
    const method = instance[ handler.method ];

    if ( "function" !== typeof method ) {
        throw new Error(
            `DataDrivenAdapterFactory: '${ handler.classRef.name }#${ handler.method }' is not a function`
        );
    }

    return async( context, interaction ) => {
        await Promise.resolve(
            ( method as ( context: unknown, interaction: unknown ) => Promise<unknown> | unknown )
                .call( instance, context, interaction )
        );
    };
}

async function callHandler<T>( handler: RuntimeHandler, args: unknown[], fallback: T ): Promise<T> {
    if ( "function" === handler.type ) {
        const result = await handler.handler( ...args );

        return ( undefined === result ? fallback : result ) as T;
    }

    const instance: Record<string, unknown> = new handler.classRef.Class() as Record<string, unknown>;
    const method = instance[ handler.method ];

    if ( "function" !== typeof method ) {
        throw new Error(
            `DataDrivenAdapterFactory: hook '${ handler.classRef.name }#${ handler.method }' is not callable`
        );
    }

    const result = await ( method as ( ...fnArgs: unknown[] ) => Promise<unknown> ).apply( instance, args );

    return ( undefined === result ? fallback : result ) as T;
}

