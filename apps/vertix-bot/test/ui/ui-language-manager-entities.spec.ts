import { UILanguageManager } from "@vertix.gg/bot/src/ui/ui-language-manager";

const SHARED_BUTTON_NAME = "VertixBot/UI-General/WizardBackButton";

/**
 * The manager without its constructor, which stands up a great deal this does not touch.
 * `extractEntitiesLanguage()` is private and reached directly, because the public method around it
 * goes on to read language files from disk - and what is under test here is only which of the two
 * log levels a repeated name is reported at.
 *
 * The four extractors it calls afterwards are stubbed: each one *constructs* the entities it is
 * given, and these are plain objects standing in for classes.
 */
function createManager( adapters: unknown[] ) {
    const warnings: string[] = [],
        logs: string[] = [];

    const manager = Object.create( UILanguageManager.prototype ) as UILanguageManager;

    Object.assign( manager, {
        logger: {
            log: ( _caller: unknown, message: unknown ) => {
                logs.push( String( message ) );
            },
            warn: ( _caller: unknown, message: unknown ) => {
                warnings.push( String( message ) );
            }
        },
        uiService: {
            getAll: () => adapters
        },
        extractElementsLanguage: async() => ( { buttons: [], textInputs: [], selectMenus: [] } ),
        extractEmbedsLanguage: async() => [],
        extractMarkdownLanguage: async() => [],
        extractModalsLanguage: async() => []
    } );

    return { manager, warnings, logs };
}

function createEntity( name: string ) {
    return {
        getName: () => name,
        getType: () => "element"
    };
}

function createAdapter( name: string, entities: unknown[] ) {
    const component = {
        getName: () => `${ name }Component`,
        getEntities: () => entities
    };

    return {
        getName: () => name,
        isMultiLanguage: () => true,
        getComponent: () => component
    };
}

describe( "VertixBot/UI/LanguageManager/extractEntitiesLanguage", () => {

    /**
     * Sharing is the norm. `WizardBackButton` belongs to every wizard, so it arrives once per
     * wizard and is collected once - which used to be reported at warn level, 492 times a boot,
     * every one of them fine. That volume is what hides the line that is not.
     */
    it( "should not warn when the same entity is shared by several components", async() => {
        const backButton = createEntity( SHARED_BUTTON_NAME );

        const { manager, warnings, logs } = createManager( [
            createAdapter( "VertixBot/UI-General/SetupNewWizardAdapter", [ backButton ] ),
            createAdapter( "VertixBot/UI-General/SetupEditWizardAdapter", [ backButton ] )
        ] );

        await ( manager as never as {
            extractEntitiesLanguage(): Promise<unknown>;
        } ).extractEntitiesLanguage();

        expect( warnings ).toEqual( [] );
        expect( logs.filter( ( message ) => message.includes( "already collected" ) ) ).toHaveLength( 1 );
    } );

    /**
     * The case the check exists for, and the one the noise was burying. The second class is dropped,
     * so its copy never reaches a language file - which surfaces much later as a translation that
     * quietly went missing rather than as anything pointing here.
     */
    it( "should warn when two different classes answer to one name", async() => {
        const { manager, warnings } = createManager( [
            createAdapter( "VertixBot/UI-General/SetupNewWizardAdapter", [ createEntity( SHARED_BUTTON_NAME ) ] ),
            createAdapter( "VertixBot/UI-General/SetupEditWizardAdapter", [ createEntity( SHARED_BUTTON_NAME ) ] )
        ] );

        await ( manager as never as {
            extractEntitiesLanguage(): Promise<unknown>;
        } ).extractEntitiesLanguage();

        expect( warnings ).toHaveLength( 1 );
        expect( warnings[ 0 ] ).toContain( SHARED_BUTTON_NAME );
        expect( warnings[ 0 ] ).toContain( "two different classes" );
    } );

    it( "should collect an entity that appears once without saying anything", async() => {
        const { manager, warnings, logs } = createManager( [
            createAdapter( "VertixBot/UI-General/SetupNewWizardAdapter", [ createEntity( SHARED_BUTTON_NAME ) ] )
        ] );

        await ( manager as never as {
            extractEntitiesLanguage(): Promise<unknown>;
        } ).extractEntitiesLanguage();

        expect( warnings ).toEqual( [] );
        expect( logs.filter( ( message ) => message.includes( "already collected" ) ) ).toEqual( [] );
    } );
} );
