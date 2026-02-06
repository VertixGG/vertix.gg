import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Elapsed-time UIEmbedVars instance.
 *
 * Provides type-safe wrapped template variable placeholders for elapsed time display.
 * Used by `UIEmbedWithVarsExtend` to give `UIEmbedElapsedTimeBase` proper vars support,
 * making these variables visible through the metadata/export pipeline and the dashboard flow editor.
 */
export const vars = new UIEmbedVars(
    "elapsedTimeValue",
    "elapsedTimeValueFraction",
    "elapsedTimeFormat",
    "elapsedTimeFormatFraction",
    "formatMinuteUnits",
    "formatSecondUnits"
);

export abstract class UIEmbedElapsedTimeBase extends UIEmbedWithVarsExtend( UIEmbedBase, vars ) {
    public static getName() {
        return "VertixGUI/EmbedElapsedTimeBase";
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
        return vars.get( "elapsedTimeFormat" );
    }

    /**
     * getElapsedTimeFormatFractionVariable(): Used to display minutes and seconds.
     *
     * eg: 1 minute will be displayed as `1 minutes`.
     * eg: 1 minute and 30 seconds will be displayed as `1.5 minutes`.
     * eg: 30 seconds will be displayed as `30 seconds`.
     */
    protected getElapsedTimeFormatFractionVariable() {
        return vars.get( "elapsedTimeFormatFraction" );
    }

    protected getElapsedTimeOptions() {
        const timeValue = vars.get( "elapsedTimeValue" ),
            timeValueFraction = vars.get( "elapsedTimeValueFraction" ),
            formatMinuteUnits = vars.get( "formatMinuteUnits" ),
            formatSecondUnits = vars.get( "formatSecondUnits" );

        return {
            formatSecondUnits: {
                unit: "second",
                units: "seconds"
            },
            formatMinuteUnits: {
                unit: "minute",
                units: "minutes"
            },
            elapsedTimeFormat: {
                minutes: `${ timeValue } ${ formatMinuteUnits }`,
                seconds: `${ timeValue } ${ formatSecondUnits }`
            },
            elapsedTimeFormatFraction: {
                minutes: `${ timeValueFraction } ${ formatMinuteUnits }`,
                seconds: `${ timeValueFraction } ${ formatSecondUnits }`
            }
        };
    }

    protected getElapsedTimeLogic( args: UIArgs ) {
        const result: {
            elapsedTimeValue?: number;
            elapsedTimeValueFraction?: number;

            elapsedTimeFormat?: string;
            elapsedTimeFormatFraction?: string;

            formatMinuteUnits: string | null;
            formatSecondUnits: string | null;
        } = {
            formatMinuteUnits: null,
            formatSecondUnits: null
        };

        const timeValue: number = this.getEndTime( args ).getTime() - Date.now();

        // If less than 1 minute = shows `x` seconds.
        if ( timeValue <= 1000 * 60 ) {
            // Value.
            result.elapsedTimeValue = Math.max( 0, Math.floor( timeValue / 1000 ) );

            // Format.
            result.elapsedTimeFormat = "seconds";

            // Shared Value
            result.elapsedTimeValueFraction = result.elapsedTimeValue;

            // Unit(s)?.
            result.formatSecondUnits = result.elapsedTimeValue > 1 ? "units" : "unit";
        } else {
            // More than 1 minute.
            const minutes = Math.floor( timeValue / 1000 / 60 );
            const seconds = Math.floor( ( timeValue / 1000 ) % 60 );

            // Set value.
            if ( seconds > 0 ) {
                const fraction = Math.ceil( seconds / 6 ); // to tenths
                result.elapsedTimeValueFraction = parseFloat( `${ minutes }.${ fraction > 9 ? 9 : fraction }` );
            } else {
                result.elapsedTimeValueFraction = minutes;
            }
            result.elapsedTimeValue = minutes;

            // Format.
            result.elapsedTimeFormat = "minutes";

            // Unit(s)?.
            result.formatMinuteUnits = result.elapsedTimeValueFraction > 1 ? "units" : "unit";
        }

        // Same format for both.
        result.elapsedTimeFormatFraction = result.elapsedTimeFormat;

        return result;
    }

    protected getInternalOptions(): {} {
        return {
            ...this.getElapsedTimeOptions(),
            ...super.getInternalOptions()
        };
    }

    protected getInternalLogic( args: UIArgs ) {
        return {
            ...this.getElapsedTimeLogic( args ),
            ...super.getInternalLogic( args )
        };
    }
}
