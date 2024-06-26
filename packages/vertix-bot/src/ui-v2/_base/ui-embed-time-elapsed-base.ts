import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

const VALUE_VARIABLE_NAME = "elapsedTimeValue",
    VALUE_FRACTION_VARIABLE_NAME = "elapsedTimeValueFraction",
    FORMAT_VARIABLE_NAME = "elapsedTimeFormat",
    FORMAT_FRACTION_VARIABLE_NAME = "elapsedTimeFormatFraction",
    FORMAT_MINUTE_UNITS = "formatMinuteUnits",
    FORMAT_SECOND_UNITS = "formatSecondUnits";

export abstract class UIEmbedElapsedTimeBase extends UIEmbedBase {
    public static getName() {
        return "VertixBot/UI-V2/EmbedElapsedTimeBase";
    }

    protected abstract getEndTime( args: UIArgs ): Date;

    /**
     * getElapsedTimeFormatVariable(): Used to display only minutes or seconds.
     *
     * eg: 1 minute will be displayed as `1 minutes`.
     * eg: 1 minute and 30 seconds will be displayed as `1 minutes`.
     * eg: 30 seconds will be displayed as `30 seconds`.
     */
    protected getElapsedTimeFormatVariable() {
        return uiUtilsWrapAsTemplate( FORMAT_VARIABLE_NAME );
    }

    /**
     * getElapsedTimeFormatFractionVariable(): Used to display minutes and seconds.
     *
     * eg: 1 minute will be displayed as `1 minutes`.
     * eg: 1 minute and 30 seconds will be displayed as `1.5 minutes`.
     * eg: 30 seconds will be displayed as `30 seconds`.
     */
    protected getElapsedTimeFormatFractionVariable() {
        return uiUtilsWrapAsTemplate( FORMAT_FRACTION_VARIABLE_NAME );
    }

    protected getElapsedTimeOptions() {
        const timeValue = uiUtilsWrapAsTemplate( VALUE_VARIABLE_NAME ),
            timeValueFraction = uiUtilsWrapAsTemplate( VALUE_FRACTION_VARIABLE_NAME ),
            formatMinuteUnits = uiUtilsWrapAsTemplate( FORMAT_MINUTE_UNITS ),
            formatSecondUnits = uiUtilsWrapAsTemplate( FORMAT_SECOND_UNITS );

        return {
            [ FORMAT_SECOND_UNITS ]: {
                "unit": "second",
                "units": "seconds",
            },
            [ FORMAT_MINUTE_UNITS ]: {
                "unit": "minute",
                "units": "minutes",
            },
            [ FORMAT_VARIABLE_NAME ]: {
                minutes: `${ timeValue } ${ formatMinuteUnits }`,
                seconds: `${ timeValue } ${ formatSecondUnits }`,
            },
            [ FORMAT_FRACTION_VARIABLE_NAME ]: {
                minutes: `${ timeValueFraction } ${ formatMinuteUnits }`,
                seconds: `${ timeValueFraction } ${ formatSecondUnits }`,
            },
        };
    }

    protected getElapsedTimeLogic( args: UIArgs ) {
        const result: {
            [ VALUE_VARIABLE_NAME ]?: number;
            [ VALUE_FRACTION_VARIABLE_NAME ]?: number;

            [ FORMAT_VARIABLE_NAME ]?: string;
            [ FORMAT_FRACTION_VARIABLE_NAME ]?: string;

            [ FORMAT_MINUTE_UNITS ]: string | null;
            [ FORMAT_SECOND_UNITS ]: string | null;
        } = {
            [ FORMAT_MINUTE_UNITS ]: null,
            [ FORMAT_SECOND_UNITS ]: null,
        };

        const timeValue: number = this.getEndTime( args ).getTime() - Date.now();

        // If less than 1 minute = shows `x` seconds.
        if ( timeValue <= 1000 * 60 ) {
            // Value.
            result[ VALUE_VARIABLE_NAME ] = Math.max( 0, Math.floor( timeValue / 1000 ) );

            // Format.
            result[ FORMAT_VARIABLE_NAME ] = "seconds";

            // Shared Value
            result[ VALUE_FRACTION_VARIABLE_NAME ] = result[ VALUE_VARIABLE_NAME ];

            // Unit(s)?.
            result[ FORMAT_SECOND_UNITS ] = result[ VALUE_VARIABLE_NAME ] > 1 ? "units" : "unit";
        } else {
            // More than 1 minute.
            const minutes = Math.floor( timeValue / 1000 / 60 );
            const seconds = Math.floor( ( timeValue / 1000 ) % 60 );

            // Set value.
            if ( seconds > 0 ) {
                const fraction = Math.ceil( seconds / 6 ); // to tenths
                result[ VALUE_FRACTION_VARIABLE_NAME ] = parseFloat( `${ minutes }.${ fraction > 9 ? 9 : fraction }` );
            } else {
                result[ VALUE_FRACTION_VARIABLE_NAME ] = minutes;
            }
            result[ VALUE_VARIABLE_NAME ] = minutes;

            // Format.
            result[ FORMAT_VARIABLE_NAME ] = "minutes";

            // Unit(s)?.
            result[ FORMAT_MINUTE_UNITS ] = result[ VALUE_FRACTION_VARIABLE_NAME ] > 1 ? "units" : "unit";
        }

        // Same format for both.
        result[ FORMAT_FRACTION_VARIABLE_NAME ] = result[ FORMAT_VARIABLE_NAME ];

        return result;
    }

    protected getInternalOptions(): {} {
        return {
            ... this.getElapsedTimeOptions(),
            ... super.getInternalOptions(),
        };
    }

    protected getInternalLogic( args: UIArgs ) {
        return {
            ... this.getElapsedTimeLogic( args ),
            ... super.getInternalLogic( args ),
        };
    }
}
