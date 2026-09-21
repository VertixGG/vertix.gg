import {
    DYNAMIC_CHANNEL_LFM_TIMINGS_BOUNDS,
    DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS,
    DYNAMIC_CHANNEL_LFM_TIMINGS_FIELDS
} from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

import type {
    TDynamicChannelLfmTimingsField
} from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

import type { DynamicSettings } from "@vertix.gg/dashboard/src/features/generators/types";

const MILLISECONDS_PER_SECOND = 1000,
    MILLISECONDS_PER_MINUTE = 60 * MILLISECONDS_PER_SECOND;

/**
 * The unit each clock is offered in, which is the one the setup screen already offers it in.
 *
 * Three of them are minutes because that is the scale an admin thinks about them on, and the
 * debounce is seconds because its whole range is under a minute.
 */
export const LFM_TIMING_UNITS_MS: Record<TDynamicChannelLfmTimingsField, number> = {
    postCooldown: MILLISECONDS_PER_MINUTE,
    pingCooldown: MILLISECONDS_PER_MINUTE,
    postExpiry: MILLISECONDS_PER_MINUTE,
    occupancyDebounce: MILLISECONDS_PER_SECOND
};

/** The settings key each clock is stored under, which is what a save has to name. */
export const LFM_TIMING_SETTINGS_KEYS: Record<TDynamicChannelLfmTimingsField, keyof DynamicSettings> = {
    postCooldown: "dynamicChannelLfmPostCooldownMs",
    pingCooldown: "dynamicChannelLfmPingCooldownMs",
    postExpiry: "dynamicChannelLfmPostExpiryMs",
    occupancyDebounce: "dynamicChannelLfmOccupancyDebounceMs"
};

/**
 * The four clocks this screen offers, in the order it shows them, labelled as the setup screen
 * labels them - an admin who set one up in discord should recognise it here rather than have to
 * work out which of two names is the same setting.
 */
export const LFM_TIMING_FIELDS: {
    field: TDynamicChannelLfmTimingsField;
    label: string;
    unit: string;
    hint: string;
}[] = [
    {
        field: "postCooldown",
        label: "Post cooldown",
        unit: "minutes",
        hint: "How long a room rests between posts. 0 lets it post as often as it likes"
    },
    {
        field: "pingCooldown",
        label: "Ping cooldown",
        unit: "minutes",
        hint: "How long before a room may mention the ping roles again. 0 mentions them every time"
    },
    {
        field: "postExpiry",
        label: "Post expiry",
        unit: "minutes",
        hint: "How long a post stays up before it stops being an open invitation"
    },
    {
        field: "occupancyDebounce",
        label: "Member count refresh delay",
        unit: "seconds",
        hint: "How long the post waits after someone joins or leaves before it redraws the count"
    }
];

/**
 * Function formatLfmTimingBound() :: One end of a field's range, in that field's own unit.
 */
function formatLfmTimingBound( field: TDynamicChannelLfmTimingsField, milliseconds: number ) {
    return Number( ( milliseconds / LFM_TIMING_UNITS_MS[ field ] ).toFixed( 3 ) );
}

/**
 * Function readLfmTimingDraft() :: What a typed clock means, or why it cannot be saved.
 *
 * Refused here rather than left to the bot, which drops a value outside the bounds on its way back
 * out: saved, it would read as accepted and then run on the fallback, so the difference would only
 * show up as behaviour nobody asked for.
 *
 * A comma is read as a decimal point, the way the setup screen reads one - the debounce is the
 * field people type `1,5` into, and most of europe writes it that way.
 */
export function readLfmTimingDraft( field: TDynamicChannelLfmTimingsField, draft: string ) {
    const trimmed = draft.trim().replace( ",", "." ),
        { min, max } = DYNAMIC_CHANNEL_LFM_TIMINGS_BOUNDS[ field ];

    const refusal = {
        milliseconds: undefined,
        error: `Between ${ formatLfmTimingBound( field, min ) } and ${ formatLfmTimingBound( field, max ) }`
    };

    if ( ! trimmed.length ) {
        return refusal;
    }

    const value = Number( trimmed );

    if ( ! Number.isFinite( value ) ) {
        return refusal;
    }

    const milliseconds = Math.round( value * LFM_TIMING_UNITS_MS[ field ] );

    if ( milliseconds < min || milliseconds > max ) {
        return refusal;
    }

    return { milliseconds, error: null };
}

export type TLfmTimingDrafts = Record<TDynamicChannelLfmTimingsField, string>;

/**
 * Function lfmTimingDraftsOf() :: Four stored clocks as the four fields that show them.
 *
 * Each in the unit its own field is labelled with rather than in milliseconds, and trailing zeroes
 * dropped, so a debounce of 1500ms arrives as `1.5` rather than as a number with a tail.
 *
 * What the form compares against, too. Comparing the text rather than the milliseconds behind it
 * is what makes an untouched form clean by construction: a stored value the unit cannot express
 * exactly would otherwise parse back a step away from itself and offer to save a change nobody
 * made.
 */
export function lfmTimingDraftsOf(
    milliseconds: Partial<Record<TDynamicChannelLfmTimingsField, number>>
): TLfmTimingDrafts {
    return DYNAMIC_CHANNEL_LFM_TIMINGS_FIELDS.reduce( ( drafts, field ) => {
        const value = milliseconds[ field ] ?? DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS[ field ];

        drafts[ field ] = String( formatLfmTimingBound( field, value ) );

        return drafts;
    }, {} as TLfmTimingDrafts );
}

/**
 * Function formatLfmTiming() :: One clock as a sentence, in the unit its field is labelled with.
 *
 * Zero is written as none rather than as `0 minutes`, because that is what it does - the two
 * cooldowns are allowed to be nothing, and a rest of no length is not a rest.
 */
export function formatLfmTiming( field: TDynamicChannelLfmTimingsField, milliseconds: number ) {
    if ( 0 === milliseconds ) {
        return "None";
    }

    const value = formatLfmTimingBound( field, milliseconds ),
        unit = LFM_TIMING_FIELDS.find( ( entry ) => entry.field === field )!.unit;

    return `${ value } ${ 1 === value ? unit.replace( /s$/, "" ) : unit }`;
}
