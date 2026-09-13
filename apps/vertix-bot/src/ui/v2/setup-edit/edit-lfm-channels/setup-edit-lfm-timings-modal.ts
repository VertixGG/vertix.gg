import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS } from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

import type { UIArgs, UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export const MILLISECONDS_PER_MINUTE = 60 * 1000,
    MILLISECONDS_PER_SECOND = 1000;

/**
 * Minutes and seconds rather than milliseconds, because nobody sets a cooldown in milliseconds -
 * and a field that wants 600000 is a field people get wrong by a factor of sixty.
 *
 * One decimal place, then trailing zeroes dropped: the debounce default is a second and a half,
 * which "2" would round away and "1.5" says exactly.
 */
function toDisplay( milliseconds: number, unit: number ) {
    return String( Number( ( milliseconds / unit ).toFixed( 1 ) ) );
}

abstract class LfmTimingInputBase extends UIElementInputBase {
    protected abstract getArgName(): string;

    protected abstract getFallbackMs(): number;

    protected abstract getUnitMs(): number;

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getPlaceholder() {
        return toDisplay( this.getFallbackMs(), this.getUnitMs() );
    }

    protected override async getValue() {
        const value = this.uiArgs?.[ this.getArgName() ];

        if ( "number" === typeof value ) {
            return toDisplay( value, this.getUnitMs() );
        }

        return this.content?.placeholder || toDisplay( this.getFallbackMs(), this.getUnitMs() );
    }

    protected async getMinLength() {
        return 1;
    }

    protected async getMaxLength() {
        return 6;
    }
}

export class SetupEditLfmPostCooldownInput extends LfmTimingInputBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditLfmPostCooldownInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Post cooldown (minutes, 0 for none)";
    }

    protected getArgName() {
        return "dynamicChannelLfmPostCooldownMs";
    }

    protected getFallbackMs() {
        return DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postCooldown;
    }

    protected getUnitMs() {
        return MILLISECONDS_PER_MINUTE;
    }
}

export class SetupEditLfmPingCooldownInput extends LfmTimingInputBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditLfmPingCooldownInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Ping cooldown (minutes, 0 for none)";
    }

    protected getArgName() {
        return "dynamicChannelLfmPingCooldownMs";
    }

    protected getFallbackMs() {
        return DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.pingCooldown;
    }

    protected getUnitMs() {
        return MILLISECONDS_PER_MINUTE;
    }
}

export class SetupEditLfmPostExpiryInput extends LfmTimingInputBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditLfmPostExpiryInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Post expiry (minutes)";
    }

    protected getArgName() {
        return "dynamicChannelLfmPostExpiryMs";
    }

    protected getFallbackMs() {
        return DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postExpiry;
    }

    protected getUnitMs() {
        return MILLISECONDS_PER_MINUTE;
    }
}

export class SetupEditLfmOccupancyDebounceInput extends LfmTimingInputBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditLfmOccupancyDebounceInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Member count refresh delay (seconds)";
    }

    protected getArgName() {
        return "dynamicChannelLfmOccupancyDebounceMs";
    }

    protected getFallbackMs() {
        return DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.occupancyDebounce;
    }

    protected getUnitMs() {
        return MILLISECONDS_PER_SECOND;
    }
}

export class SetupEditLfmTimingsModal extends UIModalBase {
    private buildArgs: UIArgs | undefined;

    public static getName() {
        return "VertixBot/UI-V2/SetupEditLfmTimingsModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [
            [ SetupEditLfmPostCooldownInput ],
            [ SetupEditLfmPingCooldownInput ],
            [ SetupEditLfmPostExpiryInput ],
            [ SetupEditLfmOccupancyDebounceInput ]
        ];
    }

    public async build( args?: UIArgs ) {
        this.buildArgs = args;

        return super.build( args );
    }

    protected getTitle() {
        const index = this.buildArgs?.index;

        if ( "number" === typeof index || "string" === typeof index ) {
            return `⏱️ LFM Timings Of Master Channel #${ Number( index ) + 1 }`;
        }

        return "⏱️ LFM Timings";
    }
}
