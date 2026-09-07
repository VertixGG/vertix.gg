/**
 * @author Leonid Vinikov <leonidvinikov@gmail.com>
 *
 * Vertix AI - the LLM-driven companion bot. Runs as its own Discord
 * application so it can live in a guild alongside Vertix without the two
 * competing for the same gateway session.
 */
import * as fsNative from "fs";
import path from "path";

import { fileURLToPath } from "url";

import { Client, GatewayIntentBits, Partials } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PrismaAIClient } from "@vertix.gg/prisma/ai-client";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import { OllamaProvider } from "@vertix.gg/ai/src/providers/ollama-provider";
import { MCPProvider } from "@vertix.gg/ai/src/providers/mcp-provider";

import { PromptManager } from "@vertix.gg/ai/src/managers/prompt-manager";
import { InteractiveMessageManager } from "@vertix.gg/ai/src/managers/interactive-message-manager";

import { registerPromptUploadListener } from "@vertix.gg/ai/src/listeners/prompt-upload-listener";

import { registerInteractionHandler } from "@vertix.gg/ai/src/listeners/interaction-handler";

import { registerTriggerDispatcher } from "@vertix.gg/ai/src/listeners/trigger-dispatcher";

import GlobalLogger from "@vertix.gg/ai/src/global-logger";

import type { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

/**
 * Newest mtime across the source tree.
 *
 * Printed at startup so a log makes it obvious whether the running process
 * predates a change - otherwise an old build looks exactly like a broken fix.
 */
function getBuildStamp(): string {
    const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ) );

    let newest = 0;

    const walk = ( dir: string ): void => {
        for ( const entry of fsNative.readdirSync( dir, { withFileTypes: true } ) ) {
            const full = path.join( dir, entry.name );

            if ( entry.isDirectory() ) {
                walk( full );

                continue;
            }

            if ( entry.name.endsWith( ".ts" ) ) {
                newest = Math.max( newest, fsNative.statSync( full ).mtimeMs );
            }
        }
    };

    try {
        walk( root );
    } catch {
        return "unknown";
    }

    return new Date( newest ).toTimeString().slice( 0, 8 );
}

export async function entryPoint(): Promise<Client> {
    GlobalLogger.$.log( entryPoint, `Starting Vertix AI... (build ${ getBuildStamp() })` );

    // Before anything else: a missing prompt file should stop the boot here,
    // not surface as a strange reply later.
    await PromptManager.$.load();

    await PrismaAIClient.$.connect();

    if ( !await OllamaProvider.$.isModelAvailable() ) {
        GlobalLogger.$.warn(
            entryPoint,
            `Model '${ AIConfig.$.getOllamaModel() }' is not available from Ollama - replies will fail until it is pulled`
        );
    }

    if ( AIConfig.$.isMcpEnabled() ) {
        // Failing to reach the tools is not fatal - the bot can still chat, and
        // saying so beats refusing to start.
        await MCPProvider.$.connect().catch( ( error: unknown ) => {
            GlobalLogger.$.error( entryPoint, "Could not connect to vertix-mcp - continuing without tools", error );
        } );
    }

    const client = new Client( {
        intents: buildIntents(),
        partials: [ Partials.Channel, Partials.Message ]
    } );

    client.once( "clientReady", onClientReady );

    registerPromptUploadListener( client );
    registerInteractionHandler( client );
    registerTriggerDispatcher( client );

    await client.login( AIConfig.$.getDiscordToken() );

    return client;
}

async function onClientReady( client: Client<true> ): Promise<void> {
    GlobalLogger.$.log(
        onClientReady,
        `Logged in as '${ client.user.tag }' - model: '${ AIConfig.$.getOllamaModel() }', num_ctx: '${ AIConfig.$.getOllamaNumCtx() }'`
    );

    InteractiveMessageManager.$.setClient( client );

    // UI first: an interaction can arrive the moment the commands are live, and
    // the adapters must already be resolvable when it does.
    await registerUI( client );

    await registerCommands( client );
}

/**
 * The union of what the trigger events need, minus GuildMembers unless it has
 * been explicitly turned on - an unenabled privileged intent is a login error,
 * not a degraded feature.
 */
function buildIntents(): GatewayIntentBits[] {
    const intents = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates
    ];

    if ( AIConfig.$.isMemberIntentEnabled() ) {
        intents.push( GatewayIntentBits.GuildMembers );
    } else {
        GlobalLogger.$.warn(
            buildIntents,
            "GuildMembers intent is off - MEMBER_JOIN and MEMBER_LEAVE triggers will never fire. " +
            "Enable it in the Developer Portal, then set VERTIX_AI_ENABLE_MEMBER_INTENT=true"
        );
    }

    return intents;
}

async function registerCommands( client: Client<true> ): Promise<void> {
    const { Commands } = await import( "@vertix.gg/ai/src/commands" );

    const devGuildId = AIConfig.$.getDevGuildId();

    const names = Commands.map( ( command ) => `/${ command.name }` ).join( ", " );

    if ( devGuildId ) {
        await client.application.commands.set( Commands, devGuildId );

        GlobalLogger.$.log(
            registerCommands,
            `Registered '${ Commands.length }' command(s) to guild '${ devGuildId }' (visible immediately): ${ names }`
        );

        return;
    }

    await client.application.commands.set( Commands );

    GlobalLogger.$.log(
        registerCommands,
        `Registered '${ Commands.length }' command(s) globally - Discord may take up to an hour to show them: ${ names }`
    );
}

/**
 * Only the three services the GUI runtime actually needs. The bot additionally
 * registers a language manager, version strategies and data components; none
 * apply here - `UIService` falls back to a null language manager on its own.
 */
async function registerUI( client: Client<true> ): Promise<void> {
    const uiServices = await Promise.all( [
        import( "@vertix.gg/gui/src/ui-service" ),
        import( "@vertix.gg/gui/src/ui-hash-service" ),
        import( "@vertix.gg/gui/src/ui-adapter-versioning-service" )
    ] );

    uiServices.forEach( ( service ) => {
        GlobalLogger.$.debug( registerUI, `Registering service: '${ service.default.getName() }'` );

        ServiceLocator.$.register<ServiceBase>( service.default, client );
    } );

    await ServiceLocator.$.waitForAll();

    const { UIModuleAI } = await import( "@vertix.gg/ai/src/ui/ui-module" );

    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

    uiService.registerModule( UIModuleAI );

    GlobalLogger.$.log( registerUI, `UI module registered: '${ UIModuleAI.getName() }'` );
}

export default entryPoint;
