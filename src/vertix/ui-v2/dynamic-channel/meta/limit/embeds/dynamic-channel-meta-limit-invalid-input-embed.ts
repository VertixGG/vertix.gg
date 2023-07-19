import { uiUtilsWrapAsTemplate } from "@vertix-base/utils/ui";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix/definitions/app";

export class DynamicChannelMetaLimitInvalidInputEmbed extends UIEmbedBase {
    private static vars = {
        minValue: uiUtilsWrapAsTemplate( "minValue" ),
        maxValue: uiUtilsWrapAsTemplate( "maxValue" )
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaLimitInvalidInputEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_ORANGE_RED;
    }

    protected getTitle(): string {
        return `🙅  User limit must be between ${ DynamicChannelMetaLimitInvalidInputEmbed.vars.minValue } and ${ DynamicChannelMetaLimitInvalidInputEmbed.vars.maxValue }`;
    }

    protected getLogic( args: UIArgs ) {
        return {
            minValue: args.minValue,
            maxValue: args.maxValue
        };
    }
}
