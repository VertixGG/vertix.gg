import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { getBoundHandler } from "@vertix.gg/bot/test/__test_utils__/bound-handler";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    ScalingSetupEditAdapter as TScalingSetupEditAdapter
} from "@vertix.gg/bot/src/ui/v3/scaling-setup/scaling-setup-edit-adapter";

const GUILD_ID = "guild-id",
    POOL_DB_ID = "pool-db-id";

// Imported once the ui service is there to answer: a button reaches for the ui service as it is
// constructed, and the adapter's elements are built as the module loads.
let ScalingSetupEditAdapter: typeof TScalingSetupEditAdapter;

/** Lets the handler run up to the first thing it really waits on. */
const settle = () => new Promise( ( resolve ) => setImmediate( resolve ) );

function setupDelete( deleting: () => Promise<boolean>, answering: () => Promise<unknown> = async() => {} ) {
    const deleteScalingMasterChannelWithCleanup = jest.fn( deleting ),
        editReply = jest.fn<( interaction: object, args: UIArgs ) => Promise<void>>().mockResolvedValue( undefined );

    const services: Record<string, object> = {
        "VertixBot/Services/ChannelCleanup": { deleteScalingMasterChannelWithCleanup },
        "VertixGUI/UIService": { get: () => ( { editReply } ) }
    };

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( {
        get: ( name: string ) => services[ name ]
    } as never );

    const context = {
            customIdStrategy: { generateId: ( id: string ) => id },
            getArgs: () => ( { scalingEditMasterChannelId: POOL_DB_ID } ),
            deleteArgs: jest.fn()
        },
        // The modal as discord hands it back, confirmed, from the setup screen it was opened on.
        submit = {
            guild: { id: GUILD_ID },
            message: {},
            deferred: false,
            replied: false,
            fields: { getTextInputValue: () => "delete" },
            deferUpdate: jest.fn( answering )
        };

    const onDeleteConfirmed = getBoundHandler<typeof context, typeof submit>(
        ScalingSetupEditAdapter,
        "VertixBot/UI-General/DeleteConfirmModal"
    );

    return { context, submit, onDeleteConfirmed, deleteScalingMasterChannelWithCleanup, editReply };
}

/**
 * Deleting a pool is a discord request for every room it has open, for the pool and for its
 * category, one after another. Discord gives up on an answer after three seconds, and a modal it
 * gave up on stays open on "Something went wrong" - over a pool that is gone by then.
 */
describe( "VertixBot/UI-V3/ScalingSetupEditAdapter/delete", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { ScalingSetupEditAdapter } = await import( "@vertix.gg/bot/src/ui/v3/scaling-setup/scaling-setup-edit-adapter" ) );
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should answer the modal before the pool is deleted", async() => {
        let finishDeleting!: ( deleted: boolean ) => void;

        const { context, submit, onDeleteConfirmed, deleteScalingMasterChannelWithCleanup, editReply } = setupDelete(
            () => new Promise<boolean>( ( resolve ) => {
                finishDeleting = resolve;
            } )
        );

        const handled = onDeleteConfirmed( context, submit );

        await settle();

        // The deleting is under way and has not come back - and the modal is answered regardless.
        expect( deleteScalingMasterChannelWithCleanup ).toHaveBeenCalledWith( {
            guildId: GUILD_ID,
            masterChannelId: POOL_DB_ID
        } );
        expect( submit.deferUpdate ).toHaveBeenCalledTimes( 1 );
        expect( editReply ).not.toHaveBeenCalled();

        finishDeleting( true );

        await handled;

        expect( editReply ).toHaveBeenCalledWith( submit, {} );
    } );

    it( "should delete nothing when the modal can no longer be answered", async() => {
        const { context, submit, onDeleteConfirmed, deleteScalingMasterChannelWithCleanup, editReply } = setupDelete(
            async() => true,
            async() => {
                throw new Error( "Unknown interaction" );
            }
        );

        await expect( onDeleteConfirmed( context, submit ) ).resolves.toBeUndefined();

        // Discord shows that modal an error - the pool must not vanish behind it.
        expect( deleteScalingMasterChannelWithCleanup ).not.toHaveBeenCalled();
        expect( editReply ).not.toHaveBeenCalled();
    } );
} );
