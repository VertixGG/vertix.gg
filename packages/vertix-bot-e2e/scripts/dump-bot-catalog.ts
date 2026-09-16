import fs from "node:fs";
import path from "node:path";

import {
    COMMAND_DEFINITIONS,
    COMMAND_GROUP_DEFINITIONS
} from "@vertix.gg/bot/src/commands/definitions/index";

import type { ICommandDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";
import type {
    IBotCatalog,
    ICatalogCommand,
    ICatalogCopy,
    ICatalogPanelButton,
    ICatalogPanelButtonV2,
    TCommandTierName
} from "@vertix.gg/bot-e2e/src/catalog/bot-catalog-types";

const REPOSITORY_ROOT = path.resolve( import.meta.dir, "../../.." );

const PANEL_BUTTON_GLOB = "apps/vertix-bot/src/ui/v3/dynamic-channel/**/*-button.ts";

const PANEL_BUTTON_GLOB_V2 = "apps/vertix-bot/src/ui/v2/dynamic-channel/**/*-button.ts";

const LANGUAGE_SOURCE = "apps/vertix-bot/assets/languages/en.json";

const CATALOG_TARGET = "packages/vertix-bot-e2e/.e2e/catalog/bot-catalog.json";

interface IStaticUIEntity {
    getName?: () => string;
    getBaseName?: () => string;
    getSortId?: () => number;
}

interface ILanguageEntry {
    name: string;
    content: Record<string, string | undefined> & {
        options?: Record<string, string>;
        selectOptions?: { label?: string; value?: string }[];
    };
}

interface ILanguageFile {
    elements: {
        buttons: ILanguageEntry[];
        textInputs: ILanguageEntry[];
        selectMenus: ILanguageEntry[];
    };
    embeds: ILanguageEntry[];
    modals: ILanguageEntry[];
}

function toCatalogCommand( definition: ICommandDefinition, group: string | null ): ICatalogCommand {
    return {
        name: definition.name,
        group,
        fullName: group ? `/${ group } ${ definition.name }` : `/${ definition.name }`,
        description: definition.description,
        tier: definition.tier as TCommandTierName,
        adapterName: definition.adapterName,
        adapterNameV2: definition.adapterNameV2 ?? null,
        modalName: definition.modalName ?? null,
        modalNameV2: definition.modalNameV2 ?? null,
        executionStep: definition.executionStep ?? null
    };
}

function collectCommands(): ICatalogCommand[] {
    const flat = COMMAND_DEFINITIONS.map( ( definition ) => toCatalogCommand( definition, null ) );

    const grouped = COMMAND_GROUP_DEFINITIONS.flatMap( ( group ) =>
        group.subcommands.map( ( definition ) => toCatalogCommand( definition, group.name ) )
    );

    return [ ...flat, ...grouped ];
}

/**
 * The control panel draws emoji and no text, so a button is only findable in the rendered message by
 * the name of its emoji - which is exactly what `getBaseName()` returns. Read off the classes rather
 * than listed here, so a button added to the panel is covered without this file being touched.
 */
async function collectPanelButtons(): Promise<ICatalogPanelButton[]> {
    const glob = new Bun.Glob( PANEL_BUTTON_GLOB );

    const buttons: ICatalogPanelButton[] = [];

    for await ( const file of glob.scan( REPOSITORY_ROOT ) ) {
        const imported: Record<string, IStaticUIEntity> = await import( path.join( REPOSITORY_ROOT, file ) );

        for ( const entity of Object.values( imported ) ) {
            if ( "function" !== typeof entity?.getName ) {
                continue;
            }

            if ( "function" !== typeof entity.getBaseName || "function" !== typeof entity.getSortId ) {
                continue;
            }

            buttons.push( {
                name: entity.getName(),
                emojiName: entity.getBaseName(),
                sortId: entity.getSortId()
            } );
        }
    }

    return buttons.sort( ( left, right ) => left.name.localeCompare( right.name ) );
}

/**
 * The older interface's panel, which the static read above cannot reach: a v2 button declares no
 * emoji name and keeps `getSortId` on the instance rather than the class. Its name is static, though,
 * and its label is in the language files like everything else - which is all that is needed, because
 * v2 draws the label.
 */
async function collectPanelButtonsV2( copy: ICatalogCopy, language: ILanguageFile ): Promise<ICatalogPanelButtonV2[]> {
    const glob = new Bun.Glob( PANEL_BUTTON_GLOB_V2 );

    const buttons: ICatalogPanelButtonV2[] = [];

    for await ( const file of glob.scan( REPOSITORY_ROOT ) ) {
        const imported: Record<string, IStaticUIEntity> = await import( path.join( REPOSITORY_ROOT, file ) );

        for ( const entity of Object.values( imported ) ) {
            if ( "function" !== typeof entity?.getName ) {
                continue;
            }

            const name = entity.getName();

            const label = copy.buttons[ name ];

            if ( undefined === label ) {
                continue;
            }

            const entry = language.elements.buttons.find( ( candidate ) => candidate.name === name );

            buttons.push( {
                name,
                label,
                alternatives: Object.values( entry?.content.options ?? {} )
            } );
        }
    }

    return buttons.sort( ( left, right ) => left.name.localeCompare( right.name ) );
}

/**
 * What a member actually reads is the snapshot in `assets/languages`, not the string in the class -
 * so that snapshot is what the assertions compare against.
 */
function readLanguageFile(): ILanguageFile {
    return JSON.parse( fs.readFileSync( path.join( REPOSITORY_ROOT, LANGUAGE_SOURCE ), "utf8" ) );
}

function collectCopy(): ICatalogCopy {
    const language: ILanguageFile = readLanguageFile();

    const copy: ICatalogCopy = { buttons: {}, textInputs: {}, embeds: {}, modals: {}, selectMenus: {} };

    for ( const entry of language.elements.buttons ) {
        copy.buttons[ entry.name ] = entry.content.label ?? "";
    }

    for ( const entry of language.elements.textInputs ) {
        copy.textInputs[ entry.name ] = {
            label: entry.content.label ?? "",
            placeholder: entry.content.placeholder ?? null
        };
    }

    for ( const entry of language.elements.selectMenus ) {
        copy.selectMenus[ entry.name ] = {
            placeholder: entry.content.placeholder ?? null,
            options: ( entry.content.selectOptions ?? [] ).map( ( option ) => ( {
                label: option.label ?? "",
                value: option.value ?? null
            } ) )
        };
    }

    for ( const entry of language.embeds ) {
        copy.embeds[ entry.name ] = {
            title: entry.content.title ?? null,
            description: entry.content.description ?? null
        };
    }

    for ( const entry of language.modals ) {
        copy.modals[ entry.name ] = entry.content.title ?? "";
    }

    return copy;
}

async function dumpBotCatalog(): Promise<void> {
    const copy = collectCopy();

    const catalog: IBotCatalog = {
        generatedAt: new Date().toISOString(),
        commands: collectCommands(),
        panelButtons: await collectPanelButtons(),
        panelButtonsV2: await collectPanelButtonsV2( copy, readLanguageFile() ),
        copy
    };

    const target = path.join( REPOSITORY_ROOT, CATALOG_TARGET );

    fs.mkdirSync( path.dirname( target ), { recursive: true } );

    fs.writeFileSync( target, JSON.stringify( catalog, null, 4 ) + "\n" );

    process.stdout.write(
        `bot catalog: ${ catalog.commands.length } commands, ` +
        `${ catalog.panelButtons.length } v3 panel buttons, ` +
        `${ catalog.panelButtonsV2.length } v2 panel buttons -> ${ CATALOG_TARGET }\n`
    );
}

await dumpBotCatalog();
