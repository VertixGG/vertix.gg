import process from "process";

import { SingletonBase } from "@vertix.gg/base/src/bases/singleton-base";

import {
    GUILD_TIMINGS_BOUNDS,
    GUILD_TIMINGS_ENV_VARS,
    GUILD_TIMINGS_FALLBACKS,
    GUILD_TIMINGS_FIELDS
} from "@vertix.gg/definitions/src/guild-timings-definitions";

import type {
    GuildTimingsBoundsInterface,
    GuildTimingsInterface,
    TGuildTimingsField,
    TGuildTimingsOverrides
} from "@vertix.gg/definitions/src/guild-timings-definitions";

/**
 * Class `GuildTimingsConfig` - What a guild falls back to, and what it is allowed to choose.
 *
 * Deliberately not a `ConfigBase`: those persist their defaults and rewrite the stored row
 * whenever the defaults move, which for values an operator sets in the environment would mean a
 * rewrite on every deployment that changed one.
 */
export class GuildTimingsConfig extends SingletonBase {
    private defaults: GuildTimingsInterface | null = null;

    public static getName() {
        return "VertixData/Config/GuildTimings";
    }

    public static get $() {
        return this.getInstance<GuildTimingsConfig>();
    }

    public constructor() {
        super();
    }

    /**
     * Function `getDefaults()` - The environment behind the five settings, read once.
     *
     * A variable that is missing, unparseable, or outside what a guild could have chosen itself
     * falls back to the built in value - an operator typo should not put the bot somewhere no
     * interface would let anyone put it.
     */
    public getDefaults(): GuildTimingsInterface {
        if ( this.defaults ) {
            return this.defaults;
        }

        const defaults = { ... GUILD_TIMINGS_FALLBACKS };

        GUILD_TIMINGS_FIELDS.forEach( ( field ) => {
            const value = Number( process.env[ GUILD_TIMINGS_ENV_VARS[ field ] ] );

            if ( this.isWithinBounds( field, value ) ) {
                defaults[ field ] = value;
            }
        } );

        this.defaults = defaults;

        return defaults;
    }

    /**
     * Function `resolve()` - A guild's own timings laid over the defaults.
     *
     * Out of bounds overrides are dropped rather than clamped: the interface refuses them on the
     * way in, so one that reached the row came from somewhere else and has no value worth keeping.
     */
    public resolve( overrides?: TGuildTimingsOverrides ): GuildTimingsInterface {
        const resolved = { ... this.getDefaults() };

        if ( !overrides ) {
            return resolved;
        }

        GUILD_TIMINGS_FIELDS.forEach( ( field ) => {
            const value = overrides[ field ];

            if ( undefined !== value && this.isWithinBounds( field, value ) ) {
                resolved[ field ] = value;
            }
        } );

        return resolved;
    }

    public isWithinBounds( field: TGuildTimingsField, value: number ): boolean {
        if ( !Number.isFinite( value ) ) {
            return false;
        }

        const { min, max } = this.getBounds( field );

        return value >= min && value <= max;
    }

    public getBounds( field: TGuildTimingsField ): GuildTimingsBoundsInterface {
        return GUILD_TIMINGS_BOUNDS[ field ];
    }
}

export default GuildTimingsConfig;
