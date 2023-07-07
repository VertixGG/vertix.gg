import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix/definitions/app";

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
