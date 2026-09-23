import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import { getBoundHandler } from "@vertix.gg/bot/test/__test_utils__/bound-handler";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { SetupEditAdapter as TSetupEditAdapter } from "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-adapter";
import type {
    DynamicChannelElementsGroup as TDynamicChannelElementsGroup
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

const GUILD_ID = "guild-id",
    MASTER_CHANNEL_DB_ID = "master-channel-db-id";

// Imported once the ui service is there to answer: the elements group builds every button it
// knows about as the module loads, and a button reaches for the ui service as it is constructed.
let SetupEditAdapter: typeof TSetupEditAdapter,
    DynamicChannelElementsGroup: typeof TDynamicChannelElementsGroup;

/** What the handler reads and writes of its context - the rest of the adapter stays out of it. */
function createContext( args: UIArgs ) {
    return {
        getArgs: () => ( { ... args } ),
        setArgs: ( _interaction: object, next: UIArgs ) => {
            Object.assign( args, next );
        },
        editReplyWithStep: jest.fn<( interaction: object, step: string ) => Promise<void>>().mockResolvedValue( undefined )
    };
}

/** A pick on the buttons menu: the ids ticked, and the guild it was made in. */
function createPick( values: string[] ) {
    const guild = { id: GUILD_ID, roles: { cache: new Map() } };

    return { values, guild, guildId: GUILD_ID };
}

/** Lets the handler run up to the first thing it really waits on. */
const settle = () => new Promise( ( resolve ) => setImmediate( resolve ) );

function setup( redraw: () => Promise<void> ) {
    const refreshControlPanel = jest.fn( redraw ),
        logged = jest.spyOn( GlobalLogger.$, "error" ).mockImplementation( () => {} );

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( {
        get: () => ( { refreshControlPanel } )
    } as never );

    jest.spyOn( MasterChannelDataManager, "$", "get" ).mockReturnValue( {
        setChannelButtonsTemplate: async() => {},
        setChannelButtonsTemplateForRole: async() => {}
    } as never );

    // A v2 set names its buttons by number, and the menu hands them back as strings.
    const defaults = DynamicChannelElementsGroup.getDefaults().map( ( item ) => String( item.getId() ) );

    const context = createContext( {
            ChannelDBId: MASTER_CHANNEL_DB_ID,
            dynamicChannelButtonsTemplateDefault: defaults,
            dynamicChannelButtonsRoleId: null
        } ),
        pick = createPick( defaults.slice( 0, -1 ) );

    const onButtonsSelected = getBoundHandler<typeof context, typeof pick>(
        SetupEditAdapter,
        "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu"
    );

    return { context, pick, onButtonsSelected, refreshControlPanel, logged };
}

/**
 * Picking a generator's default buttons redraws its control panel, which is two discord requests.
 * The pick itself is only answered by the screen being edited, so it does not wait for them.
 */
describe( "VertixBot/UI-V2/SetupEditAdapter/buttons", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { SetupEditAdapter } = await import( "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-adapter" ) );
        ( { DynamicChannelElementsGroup } = await import(
            "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group"
        ) );
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should answer the pick before the panel is redrawn", async() => {
        let finishRedraw!: () => void;

        const { context, pick, onButtonsSelected, refreshControlPanel } = setup(
            () => new Promise<void>( ( resolve ) => {
                finishRedraw = resolve;
            } )
        );

        const handled = onButtonsSelected( context, pick );

        await settle();

        // The redraw is under way and has not come back - and the screen is answered regardless.
        expect( refreshControlPanel ).toHaveBeenCalledWith(
            pick.guild,
            expect.objectContaining( { id: MASTER_CHANNEL_DB_ID } )
        );
        expect( context.editReplyWithStep ).toHaveBeenCalledTimes( 1 );

        finishRedraw();

        await handled;
    } );

    it( "should log a redraw that fails rather than throw it at the pick", async() => {
        const failure = new Error( "discord refused the edit" );

        const { context, pick, onButtonsSelected, logged } = setup( async() => {
            throw failure;
        } );

        await expect( onButtonsSelected( context, pick ) ).resolves.toBeUndefined();

        await settle();

        expect( context.editReplyWithStep ).toHaveBeenCalledTimes( 1 );
        expect( logged ).toHaveBeenCalledWith( expect.any( Function ), failure );
    } );
} );
