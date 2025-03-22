import path from "path";

import { Type } from "@sinclair/typebox";

import { scanUIModules } from "@vertix.gg/flow/src/server/utils/ui-module-scanner";

import type { FastifyPluginAsync } from "fastify";

export const createUIModulesRoute: FastifyPluginAsync = async( fastify ) => {
    // Add prefix to all routes
    fastify.register(
        async( instance ) => {
            const responseSchema = {
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
                                } ),
                            } )
                        ),
                    } ),
                },
            };

            instance.get( "/ui-modules", {
                schema: responseSchema,
                handler: async( request, reply ) => {
                    try {
                        // Get the absolute path to the UI modules directory
                        const uiModulesPath = path.resolve( __dirname, "../../../..", "vertix-bot/src/ui" );

                        instance.log.info( `Scanning UI modules from: ${ uiModulesPath }` );

                        const files = await scanUIModules( uiModulesPath );

                        if ( !files || files.length === 0 ) {
                            instance.log.warn( "No UI modules found" );
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

                        instance.log.info( `Found ${ files.length } UI modules` );
                        return { files: transformedFiles };
                    } catch ( err ) {
                        instance.log.error( "Error scanning UI modules:", err );
                        reply.status( 500 ).send( {
                            error: "Failed to scan UI modules",
                            message: err instanceof Error ? err.message : "Unknown error",
                        } );
                    }
                },
            } );

            // Add endpoint to get flow data using query parameters
            const flowDataQuerySchema = {
                querystring: Type.Object( {
                    modulePath: Type.String(),
                    flowName: Type.String()
                } ),
                response: {
                    200: Type.Object( {
                        transactions: Type.Array( Type.String() ),
                        requiredData: Type.Record( Type.String(), Type.Array( Type.String() ) ),
                        schema: Type.Any()
                    } ),
                },
            };

            instance.get( "/ui-flows", {
                schema: flowDataQuerySchema,
                handler: async( request, reply ) => {
                    try {
                        const { modulePath, flowName } = request.query as { modulePath: string; flowName: string };

                        // Get the absolute path to the UI modules directory
                        const uiModulesPath = path.resolve( __dirname, "../../../..", "vertix-bot/src/ui" );
                        const fullModulePath = path.join( uiModulesPath, modulePath );

                        instance.log.info( `Loading module from: ${ fullModulePath }` );
                        instance.log.info( `Looking for flow: ${ flowName }` );

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

                        return flowData;
                    } catch ( err ) {
                        instance.log.error( "Error getting flow data:", err );
                        reply.status( 500 ).send( {
                            error: "Failed to get flow data",
                            message: err instanceof Error ? err.message : "Unknown error"
                        } );
                    }
                }
            } );
        },
        { prefix: "/api" }
    );
};
