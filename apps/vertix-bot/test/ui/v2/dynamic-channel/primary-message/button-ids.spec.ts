import fs from "node:fs";
import path from "node:path";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import {
    V2_BUTTONS,
    V2_DEFAULT_BUTTONS_ADDED_SINCE,
    V2_DEFAULT_BUTTONS_BEFORE_LFM,
    V2_ELEMENT_TO_V3_BUTTON_ID,
    V2_TO_V3_BUTTON_IDS,
    isUntouchedV2DefaultSet
} from "@vertix.gg/definitions/src/button-ids";

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

/** The claim button's shared id, which is also the id v3 stores it under. */
const CLAIM_SHARED_ID = "claim-button";

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
        // no v3 button behind it. `lfm` is v2's alone for the other reason - v3 has not been given
        // the button yet. Every other shared id must still exist.
        const V2_ONLY = [ "visibility", "lfm" ];

        V2_BUTTONS
            .filter( ( button ) => ! V2_ONLY.includes( button.shared ) )
            .forEach( ( button ) => expect( v3Ids.has( button.shared ) ).toBe( true ) );
    } );

    /**
     * `isClaimButtonEnabled()` decides whether a room may ever be offered to somebody else, and it
     * decides by looking for this id in the generator's stored set. Nothing else in the claim path
     * runs if it says no, and it says no in silence - no room is watched, no claim message is sent,
     * and the button on the panel simply draws greyed.
     *
     * So the id it looks for is held against the buttons that actually exist. Renaming or
     * renumbering the claim button of either version fails here rather than turning claiming off
     * for every server on that version.
     */
    it( "carries the claim button in both sets, addressed the way each version stores it", async() => {
        const { v2Buttons, v3Buttons } = await loadGroups();

        const v2ClaimId = V2_BUTTONS.find( ( button ) => CLAIM_SHARED_ID === button.shared )?.id;

        expect( v2ClaimId ).toBeDefined();

        expect( v2Buttons.map( ( button ) => String( button.getId() ) ) ).toContain( v2ClaimId );
        expect( v3Buttons.map( ( button ) => String( button.getId() ) ) ).toContain( CLAIM_SHARED_ID );
    } );

    /**
     * The fingerprint of an untouched set is a literal, so nothing stops it drifting from the set
     * it is meant to describe. Held against the group here: adding another v2 button without
     * saying which side of the fingerprint it falls on fails this, rather than silently hiding the
     * button from every generator that never curated its buttons.
     *
     * Two kinds of button fall outside the fingerprint, and they are excluded for opposite reasons.
     * Lfm is out of the default set, so no generator ever stored it. Region is in the default set
     * but was added after the fingerprint was written, so the generators made since store it and
     * the ones made before are handed it by the compensation - which is what
     * `V2_DEFAULT_BUTTONS_ADDED_SINCE` records.
     */
    it( "fingerprints the set as it stood before lfm", async() => {
        const { v2Buttons } = await loadGroups();

        const pickable = v2Buttons
            .map( ( button ) => String( button.getId() ) )
            .filter( ( id ) => V2_BUTTONS.some( ( button ) => button.id === id ) );

        const outsideTheFingerprint = ( id: string ) =>
            "15" === id || V2_DEFAULT_BUTTONS_ADDED_SINCE.includes( id );

        expect( [ ...V2_DEFAULT_BUTTONS_BEFORE_LFM ].sort() )
            .toEqual( pickable.filter( ( id ) => ! outsideTheFingerprint( id ) ).sort() );
    } );

    describe( "isUntouchedV2DefaultSet()", () => {
        it( "accepts the set as it was stored", () => {
            expect( isUntouchedV2DefaultSet( [ ...V2_DEFAULT_BUTTONS_BEFORE_LFM ] ) ).toBe( true );
        } );

        it( "accepts it rearranged, since the order is rows rather than a choice", () => {
            expect( isUntouchedV2DefaultSet( [ ...V2_DEFAULT_BUTTONS_BEFORE_LFM ].reverse() ) ).toBe( true );
        } );

        it( "rejects a set somebody curated", () => {
            expect( isUntouchedV2DefaultSet( [ "0", "1", "2" ] ) ).toBe( false );
        } );

        it( "rejects a set that already carries the new button", () => {
            expect( isUntouchedV2DefaultSet( [ ...V2_DEFAULT_BUTTONS_BEFORE_LFM, "15" ] ) ).toBe( false );
        } );

        it( "rejects nothing at all", () => {
            expect( isUntouchedV2DefaultSet( [] ) ).toBe( false );
            expect( isUntouchedV2DefaultSet( null ) ).toBe( false );
            expect( isUntouchedV2DefaultSet( undefined ) ).toBe( false );
        } );
    } );

    /**
     * The exporter writes an options map once and never adds a key to one it has already written,
     * so a button introduced after a map was baked renders as its own raw number - `( 15 )` where
     * `( \u{1F50E} \u2219 **LFM** )` belongs, in every language at once. Held against the group
     * here, because the only place the symptom shows is a setup screen a test run never opens.
     */
    it( "names every v2 button in every language", async() => {
        const { v2Buttons } = await loadGroups();

        const expected = v2Buttons.map( ( button ) => String( button.getId() ) ).sort();

        // Resolved from the package root, which is where jest runs, rather than by counting
        // directories up from this file - a count that goes stale the moment the spec moves.
        const languagesPath = path.resolve( process.cwd(), "assets/languages" );

        const files = fs.readdirSync( languagesPath ).filter( ( file ) => file.endsWith( ".json" ) );

        expect( files.length ).toBeGreaterThan( 0 );

        let checked = 0;

        files.forEach( ( file ) => {
            const locale = JSON.parse( fs.readFileSync( path.join( languagesPath, file ), "utf-8" ) ) as {
                embeds?: { name: string; content?: { arrayOptions?: Record<string, { options?: Record<string, string> }> } }[];
            };

            locale.embeds?.forEach( ( embed ) => {
                Object.entries( embed.content?.arrayOptions ?? {} ).forEach( ( [ key, spec ] ) => {
                    const ids = Object.keys( spec?.options ?? {} );

                    // Only the maps a v2 button number keys. The v3 lists are keyed by slug, and
                    // the role lists carry no options at all.
                    if ( ! ids.length || ! ids.every( ( id ) => /^\d+$/.test( id ) ) ) {
                        return;
                    }

                    checked++;

                    // The file and the embed ride along in the assertion so a failure says which
                    // language and which screen, rather than only which numbers.
                    expect( { file, embed: embed.name, key, ids: ids.sort() } )
                        .toEqual( { file, embed: embed.name, key, ids: expected } );
                } );
            } );
        } );

        expect( checked ).toBeGreaterThan( 0 );
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
