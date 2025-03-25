import path from "path";

import { Type } from "@fastify/type-provider-typebox";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { zFindRootPackageJsonPath } from "@zenflux/utils/src/workspace";

import type { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import type { FlowIntegrationPoint } from "@vertix.gg/flow/src/shared/types/flow";
import type UIService from "@vertix.gg/gui/src/ui-service";

/**
 * UI Module file interface
 */
interface UIModuleFile {
    shortName: string;
    name: string;
    path: string;
    adapters: string[];
    flows: string[];
}

/**
 * UI Modules response interface
 */
export interface UIModulesResponse {
    uiModules: UIModuleFile[];
}

/**
 * UI Flow schema interface
 */
interface FlowComponent {
    name?: string;
    type: string;
    entities?: {
        elements: Array<Array<any>>;
        embeds: Array<any>;
    };
}

/**
 * UI Flow response interface
 */
interface UIFlowResponse {
    name: string;
    transactions: string[];
    requiredData: Record<string, string[]>;
    components: FlowComponent[];
    integrations?: {
        entryPoints?: FlowIntegrationPoint[];
        handoffPoints?: FlowIntegrationPoint[];
        externalReferences?: Record<string, string>;
    };
}

/**
 * UI Modules route handler
 */
export class UIModulesRoute extends InitializeBase {
    /**
     * Get the name of the class
     */
    public static getName(): string {
        return "VertixFlow/Server/Routes/UIModulesRoute";
    }

    public constructor() {
        super();
    }

    protected initialize(): void {
        this.logger.log( this.initialize, "UI Modules route initialized" );
    }

    /**
     * Handle UI modules request
     */
    public handleModules = async( _request: FastifyRequest, reply: FastifyReply ): Promise<UIModulesResponse> => {
        // Get the modules map from UIService
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const modules = Array.from( uiService.getUIModules().entries() );

        try {
            const uiModules = modules.map( ( [ key, ModuleClass ] ) => {
                const instance = uiService.getUIModule( key );

                if ( !instance ) {
                    this.logger.error( this.handleModules, `UI module ${ key } not found` );
                    return null;
                }

                return {
                    shortName: key,
                    name: ModuleClass.getName(),
                    path: ModuleClass.getSourcePath().replace( path.resolve( zFindRootPackageJsonPath(), ".." ) + "/", "" ),
                    adapters: ModuleClass.getAdapters().map( a => a.getName() ),
                    flows: ModuleClass.getFlows().map( f => f.getName() )
                };
            } ).filter( ( module ): module is UIModuleFile => module !== null );

            this.logger.info( this.handleModules, `Found ${ uiModules.length } UI modules` );
            return { uiModules };
        } catch ( err ) {
            this.logger.error( this.handleModules, "Error scanning UI modules:", err );
            reply.status( 500 ).send( {
                error: "Failed to scan UI modules",
                message: err instanceof Error ? err.message : "Unknown error"
            } );
            return { uiModules: [] };
        }
    };

    /**
     * Handle UI flows request
     */
    public handleFlows = async( request: FastifyRequest<{
        Querystring: { moduleName: string; flowName: string }
    }>, reply: FastifyReply ): Promise<UIFlowResponse | void> => {
        const { moduleName, flowName } = request.query;

        this.logger.info( this.handleFlows, `UI flow requested for module ${ moduleName } and flow ${ flowName }` );

        try {
            const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
            const moduleInstance = uiService.getUIModule( moduleName );

            if ( !moduleInstance ) {
                reply.status( 404 ).send( {
                    error: "Module not found",
                    message: `Module "${ moduleName }" not found`
                } );
                return;
            }

            const ModuleClass = moduleInstance.constructor as any;
            const flows = ModuleClass.getFlows();

            // Find the requested flow
            const FlowClass = flows.find( ( flow: any ) =>
                flow.getName() === flowName
            );

            if ( !FlowClass ) {
                reply.status( 404 ).send( {
                    error: "Flow not found",
                    message: `Flow "${ flowName }" not found in module`
                } );
                return;
            }

            // Create an instance of the flow
            const flowInstance = new FlowClass( {
                adapter: null,
                options: {}
            } );

            // Get the JSON representation
            const flowData = await flowInstance.toJSON();

            // Check name property or provide default
            if ( !flowData.name ) {
                flowData.name = ( flowInstance.constructor as any ).getName?.() || flowName;
            }

            return flowData;
        } catch ( err ) {
            this.logger.error( this.handleFlows, "Error getting flow data:", err );
            reply.status( 500 ).send( {
                error: "Failed to get flow data",
                message: err instanceof Error ? err.message : "Unknown error"
            } );
        }
    };

    /**
     * Register routes with Fastify instance
     */
    public async register( instance: FastifyInstance ): Promise<void> {
        // Schema for UI modules response
        const uiModulesSchema = {
            response: {
                200: Type.Object( {
                    uiModules: Type.Array(
                        Type.Object( {
                            shortName: Type.String(),
                            name: Type.String(),
                            path: Type.String(),
                            adapters: Type.Array( Type.String() ),
                            flows: Type.Array( Type.String() )
                        } )
                    )
                } )
            }
        };

        // Schema for UI flows request and response
        const uiFlowsSchema = {
            querystring: Type.Object( {
                moduleName: Type.String(),
                flowName: Type.String()
            } ),
            response: {
                200: Type.Object( {
                    name: Type.String(),
                    transactions: Type.Array( Type.String() ),
                    requiredData: Type.Record( Type.String(), Type.Array( Type.String() ) ),
                    components: Type.Array(
                        Type.Recursive( ( Self ) =>
                            Type.Object( {
                                type: Type.String(),
                                name: Type.Optional( Type.String() ),
                                entities: Type.Optional(
                                    Type.Object( {
                                        elements: Type.Array( Type.Array( Type.Any() ) ),
                                        embeds: Type.Array( Type.Any() )
                                    } )
                                ),
                                components: Type.Optional( Type.Array( Self ) )
                            } )
                        )
                    ),
                    integrations: Type.Optional( Type.Object( {
                        entryPoints: Type.Optional( Type.Array( Type.Object( {
                            flowName: Type.String(),
                            description: Type.String(),
                            sourceState: Type.Optional( Type.String() ),
                            targetState: Type.Optional( Type.String() ),
                            transition: Type.Optional( Type.String() ),
                            requiredData: Type.Optional( Type.Array( Type.String() ) )
                        } ) ) ),
                        handoffPoints: Type.Optional( Type.Array( Type.Object( {
                            flowName: Type.String(),
                            description: Type.String(),
                            sourceState: Type.Optional( Type.String() ),
                            targetState: Type.Optional( Type.String() ),
                            transition: Type.Optional( Type.String() ),
                            requiredData: Type.Optional( Type.Array( Type.String() ) )
                        } ) ) ),
                        externalReferences: Type.Optional( Type.Record( Type.String(), Type.String() ) )
                    } ) )
                } )
            }
        };

        instance.get( "/ui-modules", { schema: uiModulesSchema }, this.handleModules );
        instance.get( "/ui-flows", { schema: uiFlowsSchema }, this.handleFlows );
    }
}

/**
 * UI Modules route plugin for Fastify
 */
const uiModulesRoutePlugin: FastifyPluginAsync = async( fastify ): Promise<void> => {
    const route = new UIModulesRoute();
    await route.register( fastify );
};

export default uiModulesRoutePlugin;
