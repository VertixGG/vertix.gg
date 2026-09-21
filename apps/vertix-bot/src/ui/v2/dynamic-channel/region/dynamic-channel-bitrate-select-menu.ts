import {
    BITRATE_INHERIT_VALUE,
    bitrateToKilobits,
    getBitrateSteps
} from "@vertix.gg/definitions/src/bitrate-definitions";

import { DynamicChannelStringMenuBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-string-menu-base";

import type { APISelectMenuOption } from "discord.js";

/**
 * The audio quality menu on the older interface, drawn under the region one.
 *
 * The same menu v3 draws, built on this version's own base and reading the same steps. Neither
 * version carries a button for it: this screen is reached by `/voice region` on a v2 generator, and
 * a button would be a slot in a set an admin curated - a set stored before the button existed goes
 * on being drawn without it.
 */
export class DynamicChannelBitrateSelectMenu extends DynamicChannelStringMenuBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelBitrateSelectMenu";
    }

    public getId(): number {
        return 18;
    }

    protected async getPlaceholder() {
        return "🎚 ∙ Select Bitrate";
    }

    /**
     * The steps this guild may use, and the one option that is not a step.
     *
     * `maxBitrate` missing means every step, because the ui exporter runs headless and hands an
     * element no args - a list narrowed to nothing there bakes an empty menu into the catalogue.
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
