import {
    BITRATE_INHERIT_VALUE,
    bitrateToKilobits,
    getBitrateSteps
} from "@vertix.gg/definitions/src/bitrate-definitions";

import { DynamicChannelStringMenuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-string-menu-base";

import type { APISelectMenuOption } from "discord.js";

/**
 * The audio quality menu, drawn under the region one on the same screen.
 *
 * It lives in the region folder rather than one of its own because it is part of that screen: region
 * and bitrate are the two things about how a channel's voice is carried rather than who is in it, and
 * an owner moving their channel closer to their friends is the owner who wants it to sound better.
 *
 * A menu rather than a button, so nothing is added to any control panel. A button is a slot in a set
 * an admin curated, and a generator that stored its set before the button existed goes on drawing
 * what it stored - which is the whole reason `V2_DEFAULT_BUTTONS_BEFORE_LFM` exists.
 */
export class DynamicChannelBitrateSelectMenu extends DynamicChannelStringMenuBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelBitrateSelectMenu";
    }

    public getId(): string {
        return "dynamic-channel-bitrate-select-menu";
    }

    protected async getPlaceholder() {
        return "🎚 ∙ Select Bitrate";
    }

    /**
     * The steps this guild may use, and the one option that is not a step.
     *
     * `maxBitrate` missing means every step, and that is the case that matters rather than a
     * fallback: the ui exporter runs headless and hands an element no args at all, so a list
     * narrowed to nothing there would bake an empty menu into the catalogue - leaving the dashboard
     * nothing to reword and the seven language files nothing to translate.
     */
    protected async getSelectOptions() {
        const maximumBitrate = this.uiArgs?.maxBitrate as number | undefined;

        const options: APISelectMenuOption[] = [ {
            label: "Generator default",
            value: BITRATE_INHERIT_VALUE
        } ];

        getBitrateSteps( maximumBitrate ).forEach( ( bitrate ) => {
            options.push( {
                label: `${ bitrateToKilobits( bitrate ) } kbps`,
                value: String( bitrate )
            } );
        } );

        return options;
    }
}
