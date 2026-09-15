import fs from "fs";
import os from "os";

import { AgentManager } from "@vertix.gg/bot/src/managers/agent-manager";

import type { AgentWorkspace } from "@vertix.gg/bot/src/managers/agent-manager";

/** The two pieces under test are private - what a run is granted, and where it is started. */
type AgentManagerInternals = {
    getClaudeTools( workspace: AgentWorkspace ): string;
    createIsolatedWorkspace(): string | null;
};

/**
 * The manager is a service, and a service keeps its constructor protected so that callers go
 * through the locator. A spec reaching past both of those says so here rather than at the `new`.
 */
const AgentManagerInternalsCtor = AgentManager as unknown as new() => AgentManagerInternals;

const TOOL_ENV_KEYS = [ "AI_CHAT_CLAUDE_TOOLS", "AI_CHAT_CLAUDE_UNTRUSTED_TOOLS" ];

describe( "VertixBot/Managers/Agent/Workspace", () => {
    const originalEnv: Record<string, string | undefined> = {};

    let internals: AgentManagerInternals;
    const created: string[] = [];

    beforeEach( () => {
        TOOL_ENV_KEYS.forEach( ( key ) => {
            originalEnv[ key ] = process.env[ key ];
            delete process.env[ key ];
        } );

        internals = new AgentManagerInternalsCtor();
    } );

    afterEach( () => {
        TOOL_ENV_KEYS.forEach( ( key ) => {
            if ( undefined === originalEnv[ key ] ) {
                delete process.env[ key ];
            } else {
                process.env[ key ] = originalEnv[ key ];
            }
        } );

        while ( created.length ) {
            fs.rmSync( created.pop() as string, { recursive: true, force: true } );
        }
    } );

    describe( "getClaudeTools()", () => {
        it( "should grant an isolated run nothing but Read", () => {
            expect( internals.getClaudeTools( "isolated" ) ).toBe( "Read" );
        } );

        it( "should keep Read for an isolated run, since attachments are opened with it", () => {
            // The message handed to the model names the attachment paths and says to open them.
            expect( internals.getClaudeTools( "isolated" ).split( "," ) ).toContain( "Read" );
        } );

        it( "should not let AI_CHAT_CLAUDE_TOOLS widen an isolated run", () => {
            // Arrange - the value production actually sets.
            process.env.AI_CHAT_CLAUDE_TOOLS = "Read,Grep,Glob";

            // Act.
            const tools = internals.getClaudeTools( "isolated" );

            // Assert - the grant this narrows cannot be handed back by an environment file.
            expect( tools ).toBe( "Read" );
            expect( tools ).not.toContain( "Grep" );
            expect( tools ).not.toContain( "Glob" );
        } );

        it( "should let AI_CHAT_CLAUDE_UNTRUSTED_TOOLS set the isolated grant deliberately", () => {
            process.env.AI_CHAT_CLAUDE_UNTRUSTED_TOOLS = "Read,Glob";

            expect( internals.getClaudeTools( "isolated" ) ).toBe( "Read,Glob" );
        } );

        it( "should give a repo run the configured tools", () => {
            process.env.AI_CHAT_CLAUDE_TOOLS = "Read,Grep,Glob";

            expect( internals.getClaudeTools( "repo" ) ).toBe( "Read,Grep,Glob" );
        } );

        it( "should fall back to the default tools for a repo run", () => {
            expect( internals.getClaudeTools( "repo" ) ).toBe( "Read,Grep,Glob" );
        } );
    } );

    describe( "createIsolatedWorkspace()", () => {
        it( "should make a directory that exists and is empty", () => {
            // Act.
            const workspace = internals.createIsolatedWorkspace();

            // Assert.
            expect( workspace ).not.toBeNull();
            created.push( workspace as string );

            expect( fs.existsSync( workspace as string ) ).toBe( true );
            expect( fs.readdirSync( workspace as string ) ).toEqual( [] );
        } );

        it( "should place it under the temp directory, never inside the repo", () => {
            // Act.
            const workspace = internals.createIsolatedWorkspace();
            created.push( workspace as string );

            // Assert - the repo is where the bot's own .env lives, and the suite runs inside it.
            expect( workspace?.startsWith( os.tmpdir() ) ).toBe( true );
            expect( workspace?.startsWith( process.cwd() ) ).toBe( false );
        } );

        it( "should hand each run its own directory", () => {
            const first = internals.createIsolatedWorkspace();
            const second = internals.createIsolatedWorkspace();

            created.push( first as string, second as string );

            expect( first ).not.toBe( second );
        } );
    } );
} );
