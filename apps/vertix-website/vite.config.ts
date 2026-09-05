import path from "path";

import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";

import react from "@vitejs/plugin-react";

import { defineConfig, loadEnv } from "vite";

import { ROUTE_META, SITE_ORIGIN } from "./src/vertix/seo/site-meta";

import type { Plugin, ResolvedConfig } from "vite";

function exportsAssetsPlugin(): Plugin {
    const exportsDir = path.resolve( __dirname, "../../exports" );
    let resolvedConfig: ResolvedConfig | null = null;

    return {
        name: "vertix:exports-assets",
        configResolved( config ) {
            resolvedConfig = config;
        },
        configureServer( server ) {
            server.middlewares.use( "/exports", ( req, res, next ) => {
                void ( async() => {
                    try {
                        const url = req.url ?? "";
                        const urlPath = url.split( "?" )[ 0 ]?.split( "#" )[ 0 ] ?? "";
                        const decodedPath = decodeURIComponent( urlPath );
                        const relativePath = decodedPath.replace( /^\/+/, "" );

                        const filePath = path.resolve( exportsDir, relativePath );
                        const isWithinExportsDir = filePath === exportsDir || filePath.startsWith( exportsDir + path.sep );

                        if ( !isWithinExportsDir ) {
                            next();
                            return;
                        }

                        const stats = await fs.stat( filePath );
                        if ( !stats.isFile() ) {
                            next();
                            return;
                        }

                        res.setHeader( "Content-Type", getContentType( filePath ) );
                        res.setHeader( "Cache-Control", "no-cache" );

                        await pipeline( createReadStream( filePath ), res );
                    } catch {
                        next();
                    }
                } )();
            } );
        },
        async closeBundle() {
            if ( !resolvedConfig ) {
                return;
            }

            const outDir = path.resolve( resolvedConfig.root, resolvedConfig.build.outDir );
            const targetDir = path.join( outDir, "exports" );

            await fs.rm( targetDir, { recursive: true, force: true } );
            await fs.cp( exportsDir, targetDir, { recursive: true } );
        }
    };
}

function getContentType( filePath: string ): string {
    const ext = path.extname( filePath ).toLowerCase();

    if ( ext === ".json" ) {
        return "application/json; charset=utf-8";
    }

    if ( ext === ".svg" ) {
        return "image/svg+xml";
    }

    if ( ext === ".png" ) {
        return "image/png";
    }

    if ( ext === ".webp" ) {
        return "image/webp";
    }

    if ( ext === ".jpg" || ext === ".jpeg" ) {
        return "image/jpeg";
    }

    if ( ext === ".css" ) {
        return "text/css; charset=utf-8";
    }

    if ( ext === ".js" ) {
        return "text/javascript; charset=utf-8";
    }

    return "application/octet-stream";
}

// https://vitejs.dev/config/

/**
 * Emits `sitemap.xml` from the same route metadata the app renders its tags
 * from, so the two can't drift apart.
 */
function sitemapPlugin(): Plugin {
    return {
        name: "vertix:sitemap",
        apply: "build",
        async closeBundle() {
            const entries = ROUTE_META
                .filter( ( route ) => ! route.noSitemap )
                .map( ( route ) => [
                    "    <url>",
                    `        <loc>${ SITE_ORIGIN }${ route.path === "/" ? "/" : route.path }</loc>`,
                    `        <priority>${ ( route.priority ?? 0.5 ).toFixed( 1 ) }</priority>`,
                    "    </url>",
                ].join( "\n" ) );

            const xml = [
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
                "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
                ...entries,
                "</urlset>",
                "",
            ].join( "\n" );

            const outDir = path.resolve( __dirname, "dist" );

            await fs.mkdir( outDir, { recursive: true } );
            await fs.writeFile( path.join( outDir, "sitemap.xml" ), xml, "utf-8" );
        },
    };
}

export default defineConfig( ( { mode } ) => {
    const rootEnv = loadEnv( mode, path.resolve( __dirname, "../.." ), "" );
    const localEnv = loadEnv( mode, process.cwd(), "" );
    const env = { ...rootEnv, ...localEnv, ...process.env };

    const dashboardUrl = env.DASHBOARD_PROD_URL || "https://dashboard.voicechannels.online";

    return {
        plugins: [ react(), exportsAssetsPlugin(), sitemapPlugin() ],
        define: {
            "import.meta.env.VITE_DASHBOARD_URL": JSON.stringify( dashboardUrl ),
        },
        resolve: {
            alias: {
                "@vertix.gg/website": path.resolve( __dirname, "./" ),
                "@": path.resolve( __dirname, "./src/vertix" ),
                "@assets": path.resolve( __dirname, "../../assets" ),
            },
        },
        server: {
            fs: {
                allow: [
                    path.resolve( __dirname ),
                    path.resolve( __dirname, "../../packages" ),
                    path.resolve( __dirname, "../../assets" )
                ]
            }
        }
    }; } );
