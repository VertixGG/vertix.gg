import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "node:url";

import { ModelDataOwnerBase } from "@vertix.gg/data/src/bases/model-data-owner-base";

/**
 * What each model calls itself, as the database has it.
 *
 * `ModelDataOwnerBase.normalizeUniqueKeys()` files a row under `<model name>/<key>`, so the name a
 * class returns from `getName()` is not only a label - it is half of the primary key of every row
 * that class has ever written. Renaming the class renames the key, the rows do not move with it,
 * and a lookup under the new name finds nothing: settings read as absent and the member gets the
 * defaults. Nothing throws, so nothing says so.
 *
 * That has happened twice. `scripts/migrate-data-model-keys.ts` exists to repair the first, and
 * missed `userChannelData` entirely, which is how the second went unnoticed for months.
 *
 * This is the record of what is actually stored, so a rename has to be a decision rather than an
 * accident. It is deliberately a literal and not derived from the classes - a snapshot that asks
 * the code what it says will agree with the code no matter what the code says, which is the one
 * thing it must not do.
 */
const STORED_KEY_PREFIXES: Readonly<Record<string, string>> = {
    ChannelDataModel: "VertixData/Models/ChannelData",
    ChannelDataModelV3: "VertixData/Models/ChannelDataV3",
    ChannelTemplateModel: "VertixData/Models/ChannelTemplateModel",
    DynamicChannelClaimStateModel: "VertixData/Models/DynamicChannelClaimState",
    DynamicChannelLfmCooldownModel: "VertixData/Models/DynamicChannelLfmCooldown",
    DynamicChannelLfmPingCooldownModel: "VertixData/Models/DynamicChannelLfmPingCooldown",
    DynamicChannelLfmPostModel: "VertixData/Models/DynamicChannelLfmPost",
    DynamicChannelStatusModel: "VertixData/Models/DynamicChannelStatus",
    DynamicChannelVoteStateModel: "VertixData/Models/DynamicChannelVoteState",
    GuildDataModel: "VertixData/Models/GuildDataV3",
    MasterChannelDataModel: "VertixData/Models/MasterChannelDataModel",
    MasterChannelDataModelV3: "VertixData/Models/MasterChannelDataV3",
    ScalingChannelDataModel: "VertixData/Models/ScalingChannelData",
    UserDataModelV3: "VertixData/Models/UserDataV3",
    UserMasterChannelDataModel: "VertixData/Models/UserMasterChannelDataModel"
};

/**
 * The namespace every stored name lives under.
 *
 * `VertixBot/`, `VertixBase/` and the rest are what the names were before they moved here, and are
 * exactly what the migration carries rows away from. A model answering one of those again would be
 * writing rows the migration considers already dealt with.
 */
const NAMESPACE = "VertixData/";

const MODELS_DIR = fileURLToPath( new URL( "../../src/models", import.meta.url ) );

interface NamedClass {
    getName(): string;
}

function isNamedClass( value: unknown ): value is NamedClass {
    return "function" === typeof value &&
        "function" === typeof ( value as Partial<NamedClass> ).getName;
}

/**
 * Imported by package specifier rather than by file path: the same module reached both ways is two
 * modules, and `ModelDataOwnerBase` would then not be the one these classes extend.
 */
function modelSpecifiers(): string[] {
    const specifiers: string[] = [];

    const walk = ( dir: string ) => {
        for ( const entry of fs.readdirSync( dir, { withFileTypes: true } ) ) {
            const full = path.join( dir, entry.name );

            if ( entry.isDirectory() ) {
                walk( full );
                continue;
            }

            if ( ! entry.name.endsWith( ".ts" ) ) {
                continue;
            }

            const relative = path.relative( MODELS_DIR, full ).replace( /\.ts$/, "" );

            specifiers.push( `@vertix.gg/data/src/models/${ relative.split( path.sep ).join( "/" ) }` );
        }
    };

    walk( MODELS_DIR );

    return specifiers.sort();
}

function extendsOwnerBase( value: NamedClass ): boolean {
    let current: unknown = value;

    while ( current ) {
        if ( current === ModelDataOwnerBase ) {
            return true;
        }

        current = Object.getPrototypeOf( current );
    }

    return false;
}

/**
 * A class another model extends is a base, and a base never files a row under its own name - every
 * subclass answers `getName()` for itself, so the base's own name reaches nothing.
 *
 * Found by asking which classes are in another's prototype chain rather than by reading anything
 * into what they are called, so a base that is not named like one is still recognised, and a model
 * that happens to end in "Base" is not dropped for it.
 */
function withoutBases( models: Map<string, NamedClass> ): Map<string, NamedClass> {
    const classes = [ ...models.values() ];

    const isExtendedByAnother = ( candidate: NamedClass ) => classes.some( ( other ) => {
        if ( other === candidate ) {
            return false;
        }

        let current: unknown = Object.getPrototypeOf( other );

        while ( current ) {
            if ( current === candidate ) {
                return true;
            }

            current = Object.getPrototypeOf( current );
        }

        return false;
    } );

    return new Map( [ ...models ].filter( ( [ , value ] ) => ! isExtendedByAnother( value ) ) );
}

async function collectKeyedModels(): Promise<Map<string, NamedClass>> {
    const keyed = new Map<string, NamedClass>();

    for ( const specifier of modelSpecifiers() ) {
        const loaded: Record<string, unknown> = await import( specifier );

        for ( const [ exported, value ] of Object.entries( loaded ) ) {
            if ( "default" === exported || keyed.has( exported ) || ! isNamedClass( value ) ) {
                continue;
            }

            if ( extendsOwnerBase( value ) ) {
                keyed.set( exported, value );
            }
        }
    }

    return withoutBases( keyed );
}

describe( "VertixData/Bases/ModelDataOwnerBase/storedKeyNames", () => {
    let keyed: Map<string, NamedClass>;

    beforeAll( async() => {
        keyed = await collectKeyedModels();
    } );

    it.each( Object.entries( STORED_KEY_PREFIXES ) )(
        "%s should still call itself the name its rows are filed under",
        ( exported, expected ) => {
            const model = keyed.get( exported );

            expect( model ).toBeDefined();

            // Failing here means a class was renamed. The rows did not move with it: add the pair
            // to `RENAMES` in `scripts/migrate-data-model-keys.ts`, run it, and record the new name
            // above - in that order.
            expect( model!.getName() ).toBe( expected );
        }
    );

    /**
     * A model added without being recorded here would be storing rows under a name nothing is
     * watching, which is how the last one got missed.
     */
    it( "should have a recorded name for every model that files rows under one", () => {
        expect( [ ...keyed.keys() ].sort() ).toEqual( Object.keys( STORED_KEY_PREFIXES ).sort() );
    } );

    it( "should keep every stored name inside the namespace the migration moved them to", () => {
        const strays = Object.entries( STORED_KEY_PREFIXES )
            .filter( ( [ , name ] ) => ! name.startsWith( NAMESPACE ) );

        expect( strays ).toEqual( [] );
    } );
} );
