import path from "path";
import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@fastify/type-provider-typebox";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { servicesInitialized } from "../utils/ui-module-scanner";

/**
 * UI Module file interface
 */
interface UIModuleFile {
    name: string;
    path: string;
    moduleInfo: {
        name: string;
        adapters: string[];
        flows: string[];
    };
}

/**
 * UI Modules response interface
 */
interface UIModulesResponse {
    files: UIModuleFile[];
}

/**
 * UI Flow schema interface
 */
interface FlowSchema {
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
    transactions: string[];
    requiredData: Record<string, string[]>;
    schema: FlowSchema;
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

    constructor() {
        super();
    }

    protected initialize(): void {
        this.logger.info( "initialize", "UI Modules route initialized" );
    }

    /**
     * Handle UI modules request
     */
    public handleModules = async( request: FastifyRequest, reply: FastifyReply ): Promise<UIModulesResponse> => {
        this.logger.info( "handleModules", "UI modules requested" );

        try {
            // Get the absolute path to the UI modules directory
            const uiModulesPath = path.resolve( __dirname, "../../../..", "vertix-bot/src/ui" );

            this.logger.info( "handleModules", `Scanning UI modules from: ${ uiModulesPath }` );

            // Get the UI module scanner from the original implementation
            const { scanUIModules } = await import( "../utils/ui-module-scanner" );
            const files = await scanUIModules( uiModulesPath );

            if ( !files || files.length === 0 ) {
                this.logger.warn( "handleModules", "No UI modules found" );
                return { files: [] };
            }

            // Transform response to include only what's needed for the UI selector dialog
            const transformedFiles = files.map( file => ( {
                name: file.name,
                path: file.path,
                moduleInfo: {
                    name: file.moduleInfo.name,
                    adapters: file.moduleInfo.adapters,
                    flows: file.moduleInfo.flows
                }
            } ) );

            this.logger.info( "handleModules", `Found ${ files.length } UI modules` );
            return { files: transformedFiles };
        } catch ( err ) {
            this.logger.error( "handleModules", "Error scanning UI modules:", err );
            reply.status( 500 ).send( {
                error: "Failed to scan UI modules",
                message: err instanceof Error ? err.message : "Unknown error",
            } );
            return { files: [] };
        }
    }

    /**
     * Handle UI flows request
     */
    public handleFlows = async( request: FastifyRequest<{
        Querystring: { modulePath: string; flowName: string }
    }>, reply: FastifyReply ): Promise<UIFlowResponse | void> => {
        const { modulePath, flowName } = request.query;

        this.logger.info( "handleFlows", `UI flow requested for module ${ modulePath } and flow ${ flowName }` );

        try {
            // Ensure services are initialized before proceeding
            this.logger.info( "handleFlows", "Waiting for services to initialize..." );
            await servicesInitialized;
            this.logger.info( "handleFlows", "Services initialized successfully" );

            // Get the absolute path to the UI modules directory
            const uiModulesPath = path.resolve( __dirname, "../../../..", "vertix-bot/src/ui" );
            const fullModulePath = path.join( uiModulesPath, modulePath );

            this.logger.info( "handleFlows", `Loading module from: ${ fullModulePath }` );
            this.logger.info( "handleFlows", `Looking for flow: ${ flowName }` );

            // Import the module
            const module = await import( fullModulePath );
            const ModuleClass = module.default;

            if ( !ModuleClass || typeof ModuleClass.getFlows !== "function" ) {
                reply.status( 404 ).send( {
                    error: "Invalid module",
                    message: "The module does not have a getFlows method"
                } );
                return;
            }

            // Get all flow classes
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

            // Debug logs to understand schema structure
            console.log( "[DEBUG] Original flow data structure:", JSON.stringify( {
                hasSchema: !!flowData.schema,
                schemaType: flowData.schema ? typeof flowData.schema : 'null',
                schemaKeys: flowData.schema ? Object.keys( flowData.schema ) : []
            }, null, 2 ) );

            // Debug log buildSchema method if available
            if ( typeof flowInstance.buildSchema === 'function' ) {
                console.log( "[DEBUG] Flow has buildSchema method" );

                // Check if component has build method
                const component = flowInstance.getComponent();
                console.log( "[DEBUG] Component:", {
                    name: component?.constructor?.name || 'unknown',
                    hasBuild: typeof component?.build === 'function',
                } );
            }

            // Ensure schema is always an object with a type property
            if ( !flowData.schema ) {
                console.log( "[DEBUG] Schema is null or undefined, providing default" );
                flowData.schema = {
                    type: "default",
                    name: flowName,
                    entities: { elements: [], embeds: [] }
                };
            } else if ( typeof flowData.schema !== 'object' ) {
                console.log( "[DEBUG] Schema is not an object, providing default" );
                flowData.schema = {
                    type: "default",
                    name: flowName,
                    entities: { elements: [], embeds: [] }
                };
            } else if ( !flowData.schema.type ) {
                console.log( "[DEBUG] Schema has no type property, adding default type" );
                flowData.schema.type = "default";
            }

            console.log( "[DEBUG] Final flow data structure:", JSON.stringify( {
                hasSchema: !!flowData.schema,
                schemaType: typeof flowData.schema,
                schemaKeys: Object.keys( flowData.schema )
            }, null, 2 ) );

            return flowData;
        } catch ( err ) {
            this.logger.error( "handleFlows", "Error getting flow data:", err );
            reply.status( 500 ).send( {
                error: "Failed to get flow data",
                message: err instanceof Error ? err.message : "Unknown error"
            } );
        }
    }

    /**
     * Register routes with Fastify instance
     */
    public async register( instance: FastifyInstance ): Promise<void> {
        // Schema for UI modules response
        const uiModulesSchema = {
            response: {
                200: Type.Object( {
                    files: Type.Array(
                        Type.Object( {
                            name: Type.String(),
                            path: Type.String(),
                            moduleInfo: Type.Object( {
                                name: Type.String(),
                                adapters: Type.Array( Type.String() ),
                                flows: Type.Array( Type.String() )
                            } )
                        } )
                    )
                } )
            }
        };

        // Schema for UI flows request and response
        const uiFlowsSchema = {
            querystring: Type.Object( {
                modulePath: Type.String(),
                flowName: Type.String()
            } ),
            response: {
                200: Type.Object( {
                    transactions: Type.Array( Type.String() ),
                    requiredData: Type.Record( Type.String(), Type.Array( Type.String() ) ),
                    schema: Type.Object( {
                        type: Type.String(),
                        name: Type.Optional( Type.String() ),
                        entities: Type.Optional( Type.Object( {
                            elements: Type.Array( Type.Array( Type.Any() ) ),
                            embeds: Type.Array( Type.Any() )
                        } ) )
                    } )
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
