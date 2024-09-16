import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

/**
 * Shown when the user trying to add him self to the vote list, but he is already in.
 */
export class ClaimResultStepAlreadyInEmbed extends UIEmbedBase {
    public static getName() {
        return "Vertix/UI-V2/ClaimResultStepAlreadyInEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return VERTIX_DEFAULT_COLOR_ORANGE_RED;
    }

    protected getTitle() {
        return "🤷  You are already in";
    }

    protected getDescription() {
        return "Your intentions are clear - you've already nominated yourself as a potential owner of this channel.";
    }
}
