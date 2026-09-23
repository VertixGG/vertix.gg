import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { getAllCommandDefinitions } from "@vertix.gg/bot/src/commands/definitions";

/**
 * Every adapter a command names is a string, and a string that does not resolve is a command that
 * throws at whoever ran it rather than at a build.
 *
 * This is the check that was missing when a notice adapter was written, imported, and left out of
 * its module's list: the import satisfied the compiler, the registration was what mattered, and
 * nothing said otherwise until an unrelated export came back without it.
 *
 * The v2 index is deliberately absent. Its adapters read their defaults as they are constructed,
 * so importing it needs the configs registered, which needs more of the bot's start-up than a test
 * should stand up. What that leaves unchecked is the `v2` half of every row - worth knowing when
 * one of those names changes.
 */
const registeredAdapters = async(): Promise<Set<string>> => {
    const result = new Set<string>();

    const v3 = await import( "@vertix.gg/bot/src/ui/v3/ui-adapters-index" );

    for ( const adapter of Object.values( v3 ) ) {
        result.add( adapter.getName() );
    }

    // The general adapters are listed by their module rather than an index, and that list is the
    // registration - which is the thing worth checking.
    const { UIModuleGeneral } = await import( "@vertix.gg/bot/src/ui/general/ui-module" );

    for ( const adapter of UIModuleGeneral.getAdapters() ) {
        result.add( adapter.getName() );
    }

    return result;
};

describe( "VertixBot/Commands/AdapterResolution", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should name an adapter the bot has registered", async() => {
        const registered = await registeredAdapters();

        const unresolved = getAllCommandDefinitions().flatMap( ( definition ) => (
            [ definition.adapterName ]
                .filter( ( name ): name is string => Boolean( name ) )
                .filter( ( name ) => ! registered.has( name ) )
                .map( ( name ) => `${ definition.flowTransition } -> ${ name }` )
        ) );

        expect( unresolved ).toEqual( [] );
    } );

    it( "should register every notice a command can answer with", async() => {
        const registered = await registeredAdapters();

        // Named as strings where they are used, so nothing but this notices them going missing.
        const notices = [
            "VertixBot/UI-General/FeatureMissingInV2Adapter",
            "VertixBot/UI-General/MissingAdminPermissionsAdapter",
            "VertixBot/UI-General/NotClaimableAdapter",
            "VertixBot/UI-General/CommandFailedAdapter"
        ];

        expect( notices.filter( ( name ) => ! registered.has( name ) ) ).toEqual( [] );
    } );
} );
