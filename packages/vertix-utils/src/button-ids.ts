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

/** The interface version a generator was set up with, as it is stored on the channel row. */
export const UI_VERSION = {
    V2: "0.0.0.2",
    V3: "0.0.0.3"
} as const;

/**
 * The v3 slug each v2 button number means.
 *
 * The numbers are `getId()` on v2's own primary-message group, read off the buttons themselves
 * rather than assumed: 7 is Claim and 12 is Transfer, which an earlier copy of this map had the
 * wrong way round while dropping 12 and 13 entirely - so a v2 generator listed a button it does
 * not carry and hid two it does.
 *
 * Not a bijection: v3 has buttons v2 never carried, and v2 draws privacy as two buttons - state and
 * visibility - where v3 draws one. Those two keep separate ids here rather than both reading as
 * `privacy`: a generator arranges them independently, and collapsing them left the second one
 * unaddressable, so it could not be saved into a set at all.
 *
 * `visibility` is therefore a v2 only id. It reads one way only, and a number with no entry is a
 * button v3 dropped rather than renamed. Ids 8-11 and 14 are v2's permission menus, which are not
 * buttons a generator can choose, so they are deliberately absent.
 */
export const V2_TO_V3_BUTTON_IDS: Readonly<Record<string, string>> = {
    "0": "rename",
    "1": "limit",
    "2": "clear-chat",
    "3": "privacy",
    "4": "visibility",
    "5": "access",
    "6": "rest-channel",
    "7": "claim-button",
    "12": "transfer",
    "13": "status"
};

/**
 * The v3 slug each v2 button element draws.
 *
 * The ui export carries an element's name, label and emoji but not the number it answers to, so
 * the catalogue joins on the name where a stored set joins on the number. Same ten buttons as the
 * map above, addressed the other way.
 *
 * This is what lets a v2 generator be described in v3 slugs throughout - one vocabulary for the
 * set, with each version supplying its own artwork for it.
 */
export const V2_ELEMENT_TO_V3_BUTTON_ID: Readonly<Record<string, string>> = {
    "VertixBot/UI-V2/DynamicChannelMetaRenameButton": "rename",
    "VertixBot/UI-V2/DynamicChannelMetaLimitButton": "limit",
    "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": "clear-chat",
    "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": "privacy",
    "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": "visibility",
    "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": "access",
    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": "rest-channel",
    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": "claim-button",
    "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": "transfer",
    "VertixBot/UI-V2/DynamicChannelMetaStatusButton": "status"
};

/** The component whose elements are the buttons of each version's dynamic channel. */
export const DYNAMIC_CHANNEL_COMPONENT = {
    V2: "VertixBot/UI-V2/DynamicChannel",
    V3: "VertixBot/UI-V3/DynamicChannel"
} as const;

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
