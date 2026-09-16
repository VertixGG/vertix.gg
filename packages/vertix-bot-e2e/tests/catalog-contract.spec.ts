import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";

const ENTITY_NAME = /"(VertixBot\/[^"]+)"/g;

const SOURCE_DIRECTORIES = [ "src", "tests" ];

interface IEntityReference {
    name: string;
    file: string;
}

function readEntityReferences(): IEntityReference[] {
    const root = E2EConfig.$.packageRoot;

    const references: IEntityReference[] = [];

    for ( const directory of SOURCE_DIRECTORIES ) {
        const base = path.join( root, directory );

        for ( const entry of fs.readdirSync( base, { recursive: true, encoding: "utf8" } ) ) {
            if ( ! entry.endsWith( ".ts" ) ) {
                continue;
            }

            const file = path.join( directory, entry );

            for ( const match of fs.readFileSync( path.join( root, file ), "utf8" ).matchAll( ENTITY_NAME ) ) {
                references.push( { name: match[ 1 ], file } );
            }
        }
    }

    return references;
}

/**
 * Every entity name this suite spells out, checked against the ones the bot declares.
 *
 * These names cross a wire - the bot exports them as strings and the suite looks them up as strings -
 * so a renamed entity does not fail, it resolves to nothing: an embed title that is never found, a
 * modal that never opens, an assertion that can never come true. `AGENTS.md` describes the same hazard
 * for the website and the dashboard, and the answer there is the same as here - one search, over the
 * full name, with nothing aliased or composed.
 *
 * It needs no browser, no guild and no bot, so it costs nothing to keep and catches a rename the
 * moment the catalog is rebuilt rather than twenty minutes into a run.
 */
test.describe( "catalog contract", () => {
    test( "every entity name the suite uses exists in the bot", async() => {
        const known = new Set( [
            ...Object.keys( BotCatalog.$.copyNames.buttons ),
            ...Object.keys( BotCatalog.$.copyNames.embeds ),
            ...Object.keys( BotCatalog.$.copyNames.modals ),
            ...Object.keys( BotCatalog.$.copyNames.selectMenus ),
            ...Object.keys( BotCatalog.$.copyNames.textInputs ),
            ...BotCatalog.$.panelButtons.map( ( button ) => button.name ),
            ...BotCatalog.$.panelButtonsV2.map( ( button ) => button.name )
        ] );

        const missing = readEntityReferences().filter( ( reference ) => ! known.has( reference.name ) );

        expect(
            missing.map( ( reference ) => `${ reference.name } (${ reference.file })` ),
            "these names are spelled out in the suite but the bot no longer declares them"
        ).toEqual( [] );
    } );

    test( "the catalog carries both interfaces", async() => {
        expect( BotCatalog.$.panelButtons.length, "no v3 panel buttons" ).toBeGreaterThan( 0 );

        expect( BotCatalog.$.panelButtonsV2.length, "no v2 panel buttons" ).toBeGreaterThan( 0 );
    } );
} );
