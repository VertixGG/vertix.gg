import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { V2_BUTTONS, V2_ELEMENT_TO_V3_BUTTON_ID, V2_TO_V3_BUTTON_IDS } from "@vertix.gg/definitions/src/button-ids";

/** What a button answers to, whichever version it belongs to. */
interface ButtonLike {
    getId(): string | number;
}

/**
 * Both groups build their buttons the moment the module loads, and a button needs the ui service
 * to construct - so they are imported after the mock is in place rather than at the top.
 */
async function loadGroups() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const v2 = ( await import( "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group" ) )
        .DynamicChannelElementsGroup;

    const v3 = ( await import( "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group" ) )
        .DynamicChannelPrimaryMessageElementsGroup;

    return {
        v2Buttons: v2.getAll() as unknown as ButtonLike[],
        v3Buttons: v3.getAll() as unknown as ButtonLike[]
    };
}

const nameOf = ( button: ButtonLike ) => ( button.constructor as unknown as { getName(): string } ).getName();

/**
 * `V2_BUTTONS` is the one place the two interfaces are joined, and every fact in it belongs to a
 * button class somewhere else: the element's name and number to the v2 button, the shared id to
 * the v3 one. Nothing stops those drifting apart, and they have - an earlier copy of the map had
 * 7 and 12 the wrong way round and dropped two ids entirely, which showed up as a generator
 * listing a button it does not carry.
 *
 * So the table is held against the classes here. A renamed element, a renumbered button or a
 * retired v3 slug fails this rather than quietly matching nothing at runtime, where the only
 * symptom is a set that reads as empty.
 */
describe( "VertixBot/Definitions/ButtonIds", () => {
    it( "names an element and a number that the v2 buttons actually have", async() => {
        const { v2Buttons } = await loadGroups();

        const byName = new Map( v2Buttons.map( ( button ) => [ nameOf( button ), String( button.getId() ) ] ) );

        V2_BUTTONS.forEach( ( button ) => {
            expect( byName.has( button.element ) ).toBe( true );
            expect( byName.get( button.element ) ).toBe( button.id );
        } );
    } );

    it( "covers every v2 button a generator can choose", async() => {
        const { v2Buttons } = await loadGroups();

        // The permission menus are not buttons a generator picks, so the table is allowed to be
        // narrower than the group - but never wider, and never missing one that is pickable.
        const v2Names = v2Buttons.map( nameOf );

        const tabled = V2_BUTTONS.map( ( button ) => button.element );

        expect( v2Names.sort() ).toEqual( [ ...tabled ].sort() );
    } );

    it( "names shared ids that v3 still carries, apart from the one it dropped", async() => {
        const { v3Buttons } = await loadGroups();

        const v3Ids = new Set( v3Buttons.map( ( button ) => button.getId() ) );

        // V2 draws privacy as two buttons where v3 draws one, so `visibility` is v2's alone and has
        // no v3 button behind it. Every other shared id must still exist.
        const V2_ONLY = [ "visibility" ];

        V2_BUTTONS
            .filter( ( button ) => ! V2_ONLY.includes( button.shared ) )
            .forEach( ( button ) => expect( v3Ids.has( button.shared ) ).toBe( true ) );
    } );

    it( "derives both maps from the one table", () => {
        expect( Object.keys( V2_TO_V3_BUTTON_IDS ) ).toHaveLength( V2_BUTTONS.length );
        expect( Object.keys( V2_ELEMENT_TO_V3_BUTTON_ID ) ).toHaveLength( V2_BUTTONS.length );

        V2_BUTTONS.forEach( ( button ) => {
            expect( V2_TO_V3_BUTTON_IDS[ button.id ] ).toBe( button.shared );
            expect( V2_ELEMENT_TO_V3_BUTTON_ID[ button.element ] ).toBe( button.shared );
        } );
    } );
} );
