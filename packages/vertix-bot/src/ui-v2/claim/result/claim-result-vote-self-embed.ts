import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

/**
 * Shown when the user trying vote for himself
 */
export class ClaimResultVoteSelfEmbed extends UIEmbedBase {
    public static getName() {
        return "VertixBot/UI-V2/ClaimResultVoteSelfEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return VERTIX_DEFAULT_COLOR_ORANGE_RED;
    }

    protected getTitle() {
        return "🤷  You cannot vote for yourself";
    }

    protected getDescription() {
        return "It's great that you believe in yourself, but voting for yourself is not allowed in this election.";
    }
}
