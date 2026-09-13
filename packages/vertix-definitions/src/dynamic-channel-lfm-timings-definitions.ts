/**
 * The clocks an LFM post runs on, every value in milliseconds.
 *
 * Held per master channel rather than per guild, because a server that runs one generator for
 * ranked queues and another for its lounge wants different answers from each: the queue's posts
 * should turn over quickly, the lounge's should sit.
 */
export interface DynamicChannelLfmTimingsInterface {
    postCooldown: number;
    pingCooldown: number;
    postExpiry: number;
    occupancyDebounce: number;
}

export type TDynamicChannelLfmTimingsField = keyof DynamicChannelLfmTimingsInterface;

export type TDynamicChannelLfmTimingsOverrides = Partial<DynamicChannelLfmTimingsInterface>;

export interface DynamicChannelLfmTimingsBoundsInterface {
    min: number;
    max: number;
}

const SECOND = 1000,
    MINUTE = 60 * SECOND,
    HOUR = 60 * MINUTE;

export const DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS: Record<TDynamicChannelLfmTimingsField, number> = {
    postCooldown: 10 * MINUTE,
    pingCooldown: HOUR,
    postExpiry: 30 * MINUTE,
    occupancyDebounce: 1.5 * SECOND
} as const;

/**
 * What a master channel is allowed to choose.
 *
 * The two cooldowns may be set to nothing, because a small server where everyone already knows
 * each other has nothing to be protected from. An expiry may not: a post that expires immediately
 * is one nobody could ever answer, and a post that never expires is litter with no one left to
 * collect it. The debounce floor is cost rather than behaviour - it is what keeps a room whose
 * members are cycling from editing the same message on every move.
 */
export const DYNAMIC_CHANNEL_LFM_TIMINGS_BOUNDS:
Record<TDynamicChannelLfmTimingsField, DynamicChannelLfmTimingsBoundsInterface> = {
    postCooldown: { min: 0, max: 24 * HOUR },
    pingCooldown: { min: 0, max: 24 * HOUR },
    postExpiry: { min: MINUTE, max: 24 * HOUR },
    occupancyDebounce: { min: 500, max: MINUTE }
} as const;

export const DYNAMIC_CHANNEL_LFM_TIMINGS_FIELDS =
    Object.keys( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS ) as TDynamicChannelLfmTimingsField[];

/**
 * Function dynamicChannelLfmTimingIsWithinBounds() :: Whether a master channel could have chosen
 * this value itself.
 *
 * Asked on the way in by the interface, and again on the way out when resolving - a row written
 * before a bound moved is one nobody would be allowed to write today.
 */
export function dynamicChannelLfmTimingIsWithinBounds( field: TDynamicChannelLfmTimingsField, value: number ) {
    if ( ! Number.isFinite( value ) ) {
        return false;
    }

    const { min, max } = DYNAMIC_CHANNEL_LFM_TIMINGS_BOUNDS[ field ];

    return value >= min && value <= max;
}

/**
 * Function dynamicChannelLfmTimingsResolve() :: A master channel's own choices over the defaults.
 *
 * Out of bounds values are dropped rather than clamped, for the same reason the guild timings drop
 * theirs: the interface refuses them on the way in, so one that reached the row came from
 * somewhere else and has nothing worth keeping.
 */
export function dynamicChannelLfmTimingsResolve(
    overrides?: TDynamicChannelLfmTimingsOverrides
): DynamicChannelLfmTimingsInterface {
    const resolved = { ... DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS };

    if ( ! overrides ) {
        return resolved;
    }

    DYNAMIC_CHANNEL_LFM_TIMINGS_FIELDS.forEach( ( field ) => {
        const value = overrides[ field ];

        if ( undefined !== value && dynamicChannelLfmTimingIsWithinBounds( field, value ) ) {
            resolved[ field ] = value;
        }
    } );

    return resolved;
}
