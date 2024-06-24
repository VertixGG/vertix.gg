import { uiUtilsWrapAsTemplate } from "@vertix.gg/base/src/utils/ui";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class DynamicChannelMetaRenameBadwordEmbed extends UIEmbedBase {
    private static vars = {
        badword: uiUtilsWrapAsTemplate( "badword" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaRenameBadwordEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_ORANGE_RED;
    }

    protected getTitle(): string {
        return "🙅  Failed to rename your channel";
    }

    protected getDescription(): string {
        return `The word \`${ DynamicChannelMetaRenameBadwordEmbed.vars.badword }\` has been classified as inappropriate by the server administrator.`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            badword: args.badword,
        };
    }
}
