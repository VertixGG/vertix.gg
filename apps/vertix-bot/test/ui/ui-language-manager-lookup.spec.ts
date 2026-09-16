import { UILanguageManager } from "@vertix.gg/bot/src/ui/ui-language-manager";

const BUTTON_NAME = "VertixBot/UI-V2/ClaimVoteAddButton",
    VOTER_ID = "999998991775322204";

/**
 * The manager without its constructor, which stands up a great deal this does not touch. The lookup
 * is a private method reached through the public one, so what is driven here is
 * `getButtonTranslatedContent()` - the same entry point an element uses when it builds.
 */
function createManager( registered?: Record<string, { label: string }> ) {
    const errors: string[] = [];

    const manager = Object.create( UILanguageManager.prototype ) as UILanguageManager;

    Object.assign( manager, {
        logger: {
            error: ( _caller: unknown, message: unknown ) => {
                errors.push( String( message ) );
            }
        },
        // Undefined registered content stands for "register() has not built the maps yet", which is
        // the window `extractEntitiesLanguage()` runs in.
        buttonsByLang: new Map( registered ? [ [ "en", new Map( Object.entries( registered ) ) ] ] : [] )
    } );

    return { manager, errors };
}

function createButton( name: string, ownContent: { label: string } ) {
    return {
        getName: () => name,
        getTranslatableContent: async() => ownContent
    };
}

describe( "VertixBot/UI/LanguageManager/getButtonTranslatedContent", () => {

    it( "should answer the registered translation", async() => {
        const { manager, errors } = createManager( { [ BUTTON_NAME ]: { label: "Stimme" } } );

        const content = await manager.getButtonTranslatedContent(
            createButton( BUTTON_NAME, { label: "Vote" } ) as never,
            "en"
        );

        expect( content.label ).toBe( "Stimme" );
        expect( errors ).toEqual( [] );
    } );

    /**
     * The claim vote mints a button per candidate, named for the candidate. Nothing can register a
     * translation under a name that only exists while a vote is open, so every one of them fell
     * back to English and logged an error - 428 of them in a single production log.
     */
    it( "should resolve a per-member button back to its registered name", async() => {
        const { manager, errors } = createManager( { [ BUTTON_NAME ]: { label: "Stimme" } } );

        const content = await manager.getButtonTranslatedContent(
            createButton( `${ BUTTON_NAME }:${ VOTER_ID }`, { label: "Vote" } ) as never,
            "en"
        );

        expect( content.label ).toBe( "Stimme" );
        expect( errors ).toEqual( [] );
    } );

    /**
     * `extractEntitiesLanguage()` builds every entity in the bot to work out what the language files
     * ought to contain, and it runs before `register()` builds the maps. Falling back to the
     * entity's own content is the point of that pass, not a fault.
     */
    it( "should not report a miss before the language maps are built", async() => {
        const { manager, errors } = createManager();

        const content = await manager.getButtonTranslatedContent(
            createButton( BUTTON_NAME, { label: "Vote" } ) as never,
            "en"
        );

        expect( content.label ).toBe( "Vote" );
        expect( errors ).toEqual( [] );
    } );

    // Quietening the boot pass must not quieten a genuinely missing entry.
    it( "should still report a miss once the maps exist", async() => {
        const { manager, errors } = createManager( { "VertixBot/UI-General/SomethingElse": { label: "Other" } } );

        const content = await manager.getButtonTranslatedContent(
            createButton( BUTTON_NAME, { label: "Vote" } ) as never,
            "en"
        );

        expect( content.label ).toBe( "Vote" );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ] ).toContain( BUTTON_NAME );
    } );
} );
