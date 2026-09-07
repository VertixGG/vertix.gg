import fs from "fs/promises";
import path from "path";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import {
    ALL_PROMPT_NAMES,
    PROMPT_FILE_EXTENSION,
    PROMPTS_PATH
} from "@vertix.gg/ai/src/definitions/prompt-definitions";

import type { PromptName } from "@vertix.gg/ai/src/definitions/prompt-definitions";

/** Matches `{name}` - the same wrapper the GUI package uses for its templates. */
const TEMPLATE_PATTERN = /\{(\w+)\}/g;

export type PromptVariables = Record<string, string>;

/**
 * Loads the prompt files from `assets/prompts` and fills their placeholders.
 *
 * Prompts live as files rather than string literals so they can be read and
 * edited without touching TypeScript - the same reason the bot keeps its
 * languages in `assets/languages`.
 */
export class PromptManager extends InitializeBase {
    private static instance: PromptManager;

    private readonly prompts = new Map<PromptName, string>();

    public static getName() {
        return "VertixAI/Managers/PromptManager";
    }

    public static getInstance(): PromptManager {
        if ( !PromptManager.instance ) {
            PromptManager.instance = new PromptManager();
        }

        return PromptManager.instance;
    }

    public static get $() {
        return PromptManager.getInstance();
    }

    /**
     * Reads every prompt once, at startup.
     *
     * Deliberately eager: a missing or unreadable prompt should stop the bot
     * booting, not surface as a strange reply hours later.
     */
    public async load(): Promise<void> {
        for ( const name of ALL_PROMPT_NAMES ) {
            const filePath = path.join( PROMPTS_PATH, `${ name }${ PROMPT_FILE_EXTENSION }` );

            const content = await fs.readFile( filePath, "utf-8" ).catch( () => null );

            if ( null === content ) {
                throw new Error( `Prompt file is missing or unreadable: '${ filePath }'` );
            }

            this.prompts.set( name, content.trim() );
        }

        this.logger.log( this.load, `Loaded '${ this.prompts.size }' prompts from '${ PROMPTS_PATH }'` );
    }

    /** Returns the prompt with `{placeholders}` replaced. */
    public get( name: PromptName, variables: PromptVariables = {} ): string {
        const template = this.prompts.get( name );

        if ( undefined === template ) {
            throw new Error( `Prompt '${ name }' was requested before load()` );
        }

        return template.replace( TEMPLATE_PATTERN, ( match, key: string ) => {
            const value = variables[ key ];

            if ( undefined === value ) {
                this.logger.warn( this.get, `Prompt '${ name }' has no value for '{${ key }}'` );

                return match;
            }

            return value;
        } );
    }
}

export default PromptManager;
