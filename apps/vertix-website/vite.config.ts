import path from "path";

import fs from "node:fs/promises";
import http from "node:http";
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync } from "node:fs";
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

    if ( ext === ".html" ) {
        return "text/html; charset=utf-8";
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

function readSourceCommitDate( sourcePath: string | undefined ): string | null {
    if ( ! sourcePath ) {
        return null;
    }

    const absolutePath = path.resolve( __dirname, sourcePath );

    if ( ! existsSync( absolutePath ) ) {
        console.warn( `sitemap: sourcePath does not exist, lastmod omitted - ${ sourcePath }` );

        return null;
    }

    try {
        const stdout = execFileSync(
            "git",
            [ "log", "-1", "--format=%cs", "--", absolutePath ],
            { cwd: __dirname, encoding: "utf-8" }
        ).trim();

        return stdout || null;
    } catch {
        return null;
    }
}

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
                .map( ( route ) => {
                    const lastModified = readSourceCommitDate( route.sourcePath );

                    return [
                        "    <url>",
                        `        <loc>${ SITE_ORIGIN }${ route.path === "/" ? "/" : route.path }</loc>`,
                        ...( lastModified ? [ `        <lastmod>${ lastModified }</lastmod>` ] : [] ),
                        "    </url>",
                    ].join( "\n" );
                } );

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

const PRERENDER_HOST = "127.0.0.1";

const PRERENDER_READY_SELECTOR = ".body-container.loaded";

const PRERENDER_READY_TIMEOUT_MS = 30000;

const PRERENDER_NAVIGATION_TIMEOUT_MS = 60000;

const PRERENDER_VIEWPORT = {
    width: 1280,
    height: 900,
} as const;

async function startPrerenderServer( rootDir: string ) {
    const server = http.createServer( ( request, response ) => {
        void ( async() => {
            const url = request.url ?? "/",
                urlPath = decodeURIComponent( url.split( "?" )[ 0 ]?.split( "#" )[ 0 ] ?? "/" );

            const candidate = path.resolve( rootDir, "." + urlPath ),
                isWithinRoot = candidate === rootDir || candidate.startsWith( rootDir + path.sep );

            let filePath = isWithinRoot ? candidate : rootDir;

            try {
                const stats = await fs.stat( filePath );

                if ( stats.isDirectory() ) {
                    filePath = path.join( filePath, "index.html" );
                }
            } catch {
                filePath = path.join( rootDir, "index.html" );
            }

            try {
                const body = await fs.readFile( filePath );

                response.setHeader( "Content-Type", getContentType( filePath ) );
                response.end( body );
            } catch {
                response.statusCode = 404;
                response.end();
            }
        } )();
    } );

    await new Promise<void>( ( resolve ) => server.listen( 0, PRERENDER_HOST, resolve ) );

    const address = server.address(),
        port = ( address && "object" === typeof address ) ? address.port : 0;

    return {
        origin: `http://${ PRERENDER_HOST }:${ port }`,
        close: () => new Promise<void>( ( resolve ) => server.close( () => resolve() ) ),
    };
}

/**
 * Function restoreDeferredStyles() :: Puts a deferred stylesheet back the way the source wrote it.
 *
 * A stylesheet that is kept off the critical path carries `media="print"` and an onload that hands
 * it back to every medium once it has arrived. Prerendering runs that onload like any other, and
 * `page.content()` serialises the dom it left behind - so the html that ships says `media="all"`
 * and blocks the first paint again, which is the one thing the attribute existed to avoid.
 *
 * Only links still carrying that exact onload are rewound, so a stylesheet that genuinely means
 * `all` is left alone.
 */
function restoreDeferredStyles( html: string ): string {
    return html.replace(
        /media="all"(\s+onload="this\.media='all'")/g,
        "media=\"print\"$1"
    );
}

function toOutputPath( outDir: string, routePath: string ): string {
    if ( "/" === routePath ) {
        return path.join( outDir, "index.html" );
    }

    return path.join( outDir, routePath.replace( /^\//, "" ), "index.html" );
}

function prerenderPlugin(): Plugin {
    return {
        name: "vertix:prerender",
        apply: "build",
        async closeBundle() {
            const outDir = path.resolve( __dirname, "dist" ),
                { default: puppeteer } = await import( "puppeteer" ),
                staticServer = await startPrerenderServer( outDir ),
                browser = await puppeteer.launch( { headless: true } );

            const rendered: { routePath: string, html: string }[] = [];

            try {
                const page = await browser.newPage();

                await page.setViewport( PRERENDER_VIEWPORT );

                for ( const route of ROUTE_META ) {
                    await page.goto( staticServer.origin + route.path, {
                        waitUntil: "networkidle0",
                        timeout: PRERENDER_NAVIGATION_TIMEOUT_MS,
                    } );

                    await page.waitForSelector( PRERENDER_READY_SELECTOR, {
                        timeout: PRERENDER_READY_TIMEOUT_MS,
                    } );

                    rendered.push( { routePath: route.path, html: restoreDeferredStyles( await page.content() ) } );
                }
            } finally {
                await browser.close();
                await staticServer.close();
            }

            for ( const { routePath, html } of rendered ) {
                const outputPath = toOutputPath( outDir, routePath );

                await fs.mkdir( path.dirname( outputPath ), { recursive: true } );
                await fs.writeFile( outputPath, html, "utf-8" );
            }

            console.log( `prerendered ${ rendered.length } routes` );
        },
    };
}

export default defineConfig( ( { mode } ) => {
    const rootEnv = loadEnv( mode, path.resolve( __dirname, "../.." ), "" );
    const localEnv = loadEnv( mode, process.cwd(), "" );
    const env = { ...rootEnv, ...localEnv, ...process.env };

    const dashboardUrl = env.DASHBOARD_PROD_URL || "https://dashboard.voicechannels.online";

    const apiPort = env.API_PORT || "3021";
    const apiHost = env.API_HOST || "0.0.0.0";
    const apiBaseUrl = env.API_PUBLIC_URL || `http://${ apiHost }:${ apiPort }/api`;

    return {
        plugins: [ react(), exportsAssetsPlugin(), sitemapPlugin(), prerenderPlugin() ],
        build: {
            // Every stylesheet a route pulls in blocks the first paint, and a split one costs a
            // whole round trip to say very little: the chat container is 0.7KiB and the home page
            // 3.2KiB, each holding render as long as the 73.5KiB bundle they sit beside. Folding
            // them in adds four kilobytes to a file already being fetched and takes two blocking
            // requests off the critical path.
            cssCodeSplit: false,
        },
        define: {
            "import.meta.env.VITE_DASHBOARD_URL": JSON.stringify( dashboardUrl ),
            "import.meta.env.API_PUBLIC_URL": JSON.stringify( apiBaseUrl ),
        },
        resolve: {
            alias: {
                "@vertix.gg/website": path.resolve( __dirname, "./" ),
                "@": path.resolve( __dirname, "./src/vertix" ),
                "@assets": path.resolve( __dirname, "../../assets" ),
            },
        },
        server: {
            host: "0.0.0.0",
            fs: {
                allow: [
                    path.resolve( __dirname ),
                    path.resolve( __dirname, "../../packages" ),
                    path.resolve( __dirname, "../../assets" )
                ]
            }
        }
    }; } );
