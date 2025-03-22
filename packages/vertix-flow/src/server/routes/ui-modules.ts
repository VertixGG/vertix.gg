import path from "path";
import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { scanUIModules } from "@vertix.gg/flow/src/server/utils/ui-module-scanner";

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
        },
        { prefix: "/api" }
    );
};
