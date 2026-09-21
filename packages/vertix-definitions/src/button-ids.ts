/**
 * Button ids across the two interface versions.
 *
 * V2 wrote numbers against its own elements group, v3 writes slugs against a different one, and
 * either can be sitting in a settings row - a generator keeps the version it was set up with.
 * Everything that reads a stored set therefore has to know both, which is why the map lives here
 * rather than inside whichever screen happened to need it first: the buttons screen inside
 * discord, the generators panel in the dashboard and the legend all draw the same list, and a copy
 * per reader is how they end up disagreeing about what a generator carries.
 */

import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

/**
 * The interface version a generator was set up with, as it is stored on the channel row.
 *
 * Taken from `version.ts` rather than written out again. Spelled here as literals, the two said
 * the same thing in two places, and a version string that disagrees with the one the row was
 * written under matches nothing at all.
 */
export const UI_VERSION = {
    V2: VERSION_UI_V2,
    V3: VERSION_UI_V3
} as const;

/**
 * Every button v2 carries: the element that draws it, the number it answers to, and the shared id
 * it is known by everywhere else.
 *
 * One table rather than the two maps this used to be. The two were a hand written join of three
 * facts the button classes already own - `getName()` and `getId()` on the v2 button, `getId()` on
 * the v3 one - and being written twice they could disagree, which they did: one copy had 7 and 12
 * the wrong way round and dropped 12 and 13 entirely, so a v2 generator listed a button it does
 * not carry and hid two it does. Spelled once, that particular mistake cannot be made.
 *
 * The numbers are read off the buttons themselves rather than assumed, and `button-ids.spec.ts`
 * holds this table against them, so a renamed element or a renumbered button fails a test here
 * instead of quietly matching nothing at runtime.
 *
 * Not a bijection with v3: it has buttons v2 never carried, and v2 draws privacy as two buttons -
 * state and visibility - where v3 draws one. Those keep separate ids rather than both reading as
 * `privacy`: a generator arranges them independently, and collapsing them left the second one
 * unaddressable, so it could not be saved into a set at all. `visibility` is therefore a v2 only
 * id, and reads one way only.
 *
 * Ids 8-11 and 14 are v2's permission menus, which are not buttons a generator can choose, so they
 * are deliberately absent.
 */
export const V2_BUTTONS = [
    { element: "VertixBot/UI-V2/DynamicChannelMetaRenameButton", id: "0", shared: "rename" },
    { element: "VertixBot/UI-V2/DynamicChannelMetaLimitButton", id: "1", shared: "limit" },
    { element: "VertixBot/UI-V2/DynamicChannelMetaClearChatButton", id: "2", shared: "clear-chat" },
    { element: "VertixBot/UI-V2/DynamicChannelPermissionsStateButton", id: "3", shared: "privacy" },
    { element: "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton", id: "4", shared: "visibility" },
    { element: "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton", id: "5", shared: "access" },
    { element: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton", id: "6", shared: "rest-channel" },
    { element: "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton", id: "7", shared: "claim-button" },
    { element: "VertixBot/UI-V2/DynamicChannelTransferOwnerButton", id: "12", shared: "transfer" },
    { element: "VertixBot/UI-V2/DynamicChannelMetaStatusButton", id: "13", shared: "status" },
    { element: "VertixBot/UI-V2/DynamicChannelLfmButton", id: "15", shared: "lfm" },
    { element: "VertixBot/UI-V2/DynamicChannelRegionButton", id: "19", shared: "region" }
] as const;

/**
 * The full v2 set as it stood before the lfm button existed, in the order it was stored.
 *
 * A generator that never had its buttons curated stores exactly this - the defaults are the whole
 * set, and opening the buttons screen and saving writes them back unchanged. Adding a button to
 * the group therefore leaves those generators carrying a set that is complete for the version it
 * was written under and short by one for this one, and the new button never draws.
 *
 * Held as a literal rather than computed, because it has to go on meaning what it meant then: it
 * is the fingerprint of an untouched set, and a set derived from today's group would match today
 * rather than the day it was written.
 *
 * It is still the only fingerprint, because neither button added since changed what a new generator
 * stores: lfm and region are both out of the default set, so the ten below stayed the whole of it.
 * A button that does join the set needs a `..._BEFORE_<IT>` of the set as it stood beside this one,
 * or the generators made in between match nothing and never draw it.
 */
export const V2_DEFAULT_BUTTONS_BEFORE_LFM: ReadonlyArray<string> = Object.freeze(
    [ "0", "1", "2", "3", "4", "5", "6", "12", "13", "7" ]
);

/**
 * The buttons that joined v2's default set after the fingerprint above was taken.
 *
 * Empty, and meant to stay that way for as long as v2 gains only opt-in buttons. Not every button
 * added to v2 belongs here - only one that changes what a new generator stores. Lfm and region are
 * both out of the default set, so every untouched generator in the wild stores the same ten above
 * and the compensation has nothing to add to them.
 *
 * Held beside the fingerprint rather than derived from the group, so that a button which does join
 * the default set has to be thought about rather than appearing here by arithmetic.
 */
export const V2_DEFAULT_BUTTONS_ADDED_SINCE: ReadonlyArray<string> = Object.freeze( [] );

/**
 * Function isUntouchedV2DefaultSet() :: Whether a stored set is a default nobody has curated.
 *
 * Compared as a set rather than a sequence - the order is the row order and can be rearranged
 * without the set itself being a choice about which buttons a generator carries.
 */
export function isUntouchedV2DefaultSet( buttons: ReadonlyArray<string> | null | undefined ): boolean {
    if ( ! buttons || buttons.length !== V2_DEFAULT_BUTTONS_BEFORE_LFM.length ) {
        return false;
    }

    const stored = new Set( buttons.map( ( button ) => String( button ) ) );

    return V2_DEFAULT_BUTTONS_BEFORE_LFM.every( ( id ) => stored.has( id ) );
}

/**
 * The v3 slug each v2 button number means, derived from the table above.
 *
 * A number with no entry is a button v3 dropped rather than renamed.
 */
export const V2_TO_V3_BUTTON_IDS: Readonly<Record<string, string>> = Object.freeze(
    Object.fromEntries( V2_BUTTONS.map( ( button ) => [ button.id, button.shared ] ) )
);

/**
 * The v3 slug each v2 button element draws, derived from the same table.
 *
 * The ui export carries an element's name, label and emoji but not the number it answers to, so
 * the catalogue joins on the name where a stored set joins on the number. Same ten buttons,
 * addressed the other way - and now provably the same ten, rather than two lists that had to be
 * kept in step by hand.
 */
export const V2_ELEMENT_TO_V3_BUTTON_ID: Readonly<Record<string, string>> = Object.freeze(
    Object.fromEntries( V2_BUTTONS.map( ( button ) => [ button.element, button.shared ] ) )
);

/** The component whose elements are the buttons of each version's dynamic channel. */
export const DYNAMIC_CHANNEL_COMPONENT = {
    V2: "VertixBot/UI-V2/DynamicChannel",
    V3: "VertixBot/UI-V3/DynamicChannel"
} as const;

/**
 * The component that draws a generator's control panel, per version.
 *
 * Named beside the one above because it carries the same buttons and is laid out by the same
 * stored list - but only ever the default set. A role's set is resolved from a channel's owner,
 * and a panel belongs to the generator rather than to anybody, so it has no owner to resolve from.
 */
export const DYNAMIC_CHANNEL_PANEL_COMPONENT = {
    V2: "VertixBot/UI-V2/DynamicChannelPanel",
    V3: "VertixBot/UI-V3/DynamicChannelPanel"
} as const;

/**
 * How many buttons a version prints in a row when the generator arranged none.
 *
 * Discord allows five, and v3 uses all five; v2 has always drawn four and its exported schema is
 * baked at four, so a generator that arranged nothing goes on printing the rows it always did.
 *
 * Here rather than in whichever reader needed it first, because three of them have to agree: the
 * component that prints the row, the exporter that bakes it into the schema, and the dashboard
 * that tells an admin what their channels look like. The dashboard cut every version at five, so
 * a v2 generator's settings showed rows of five beside channels drawing rows of four.
 */
export const BUTTONS_PER_ROW = {
    V2: 4,
    V3: 5
} as const;

/**
 * Function buttonsPerRow() :: The row width this version draws at.
 */
export function buttonsPerRow( version: string | null | undefined ): number {
    return isV2Version( version ) ? BUTTONS_PER_ROW.V2 : BUTTONS_PER_ROW.V3;
}

/**
 * Function isV2ButtonEntry() :: Whether one stored entry names this v2 button.
 *
 * A v2 set can hold either vocabulary - its own screen inside discord writes numbers, and a
 * dashboard that predates writing them back wrote slugs - so both have to be answered to. Kept
 * here rather than in the button that first needed it, because the same question is asked twice
 * with two different answers riding on it: whether a channel carries the button at all, and where
 * in the arranged order it sits. Two spellings of the rule is how those two came to disagree.
 *
 * A separator carries no number and names no button, so it falls out here by matching nothing.
 */
export function isV2ButtonEntry( entry: string, elementName: string, id: number ): boolean {
    if ( parseInt( entry ) === id ) {
        return true;
    }

    const slug = V2_ELEMENT_TO_V3_BUTTON_ID[ elementName ];

    return Boolean( slug ) && entry === slug;
}

/**
 * Function isV2Version() :: Whether a stored version string is the older interface.
 *
 * Anything that is not explicitly v2 is treated as v3, so a row written by a version this code
 * has not heard of reads as current rather than as legacy.
 */
export function isV2Version( version: string | null | undefined ): boolean {
    return UI_VERSION.V2 === version;
}

/**
 * Function toV3ButtonIds() :: A stored button list as ids this version knows.
 *
 * Deliberately tolerant of a mixed list. A generator can hold one - the dashboard writes slugs
 * whatever version it is looking at - and a reader that assumed the list was all one kind would
 * silently drop the half it did not recognise and show a set the admin never chose.
 *
 * Order is kept, because it is the order the buttons print in, and duplicates collapse onto their
 * first appearance - two v2 numbers can name the same v3 button.
 */
/**
 * The v2 number each id answers to, derived from the map above rather than restated.
 *
 * Well defined only because state and visibility carry separate ids - while both read as `privacy`
 * there was no single number to write back for it.
 */
const V3_TO_V2_BUTTON_IDS: Readonly<Record<string, string>> = Object.freeze(
    Object.fromEntries(
        Object.entries( V2_TO_V3_BUTTON_IDS ).map( ( [ number, id ] ) => [ id, number ] )
    )
);

/**
 * Function toV2ButtonIds() :: A button set as the numbers a v2 generator stores.
 *
 * The inverse of `toV3ButtonIds()`, for writing rather than reading. V2's own buttons screen inside
 * discord stores numbers and its channels read them back the same way, so a set saved against a v2
 * generator is written in numbers: a bot that predates reading slugs draws nothing at all from a set
 * it cannot parse, and nothing here can know which bot a guild is running.
 *
 * An entry already numeric is kept as it is, and an id with no v2 number is dropped - it names a
 * button that version does not carry.
 */
export function toV2ButtonIds( buttons: ReadonlyArray<string | number> | null | undefined ): string[] {
    if ( ! buttons ) {
        return [];
    }

    const mapped = buttons.map( ( button ) => {
        const id = String( button );

        if ( V3_TO_V2_BUTTON_IDS[ id ] ) {
            return V3_TO_V2_BUTTON_IDS[ id ];
        }

        return Number.isNaN( parseInt( id ) ) ? undefined : id;
    } );

    return [ ...new Set( mapped.filter( ( id ): id is string => undefined !== id ) ) ];
}

export function toV3ButtonIds( buttons: ReadonlyArray<string | number> | null | undefined ): string[] {
    if ( ! buttons ) {
        return [];
    }

    return [ ...new Set(
        buttons.map( ( button ) => {
            const id = String( button );

            return V2_TO_V3_BUTTON_IDS[ id ] ?? id;
        } )
    ) ];
}
