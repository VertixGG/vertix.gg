import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelLimitInvalidInputEmbed extends UIEmbedBase {
    private static vars = {
        minValue: uiUtilsWrapAsTemplate( "minValue" ),
        maxValue: uiUtilsWrapAsTemplate( "maxValue" )
    };

    public static getName () {
        return "Vertix/UI-V3/DynamicChannelLimitInvalidInputEmbed";
    }

    public static getInstanceType (): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor (): number {
        return VERTIX_DEFAULT_COLOR_ORANGE_RED;
    }

    protected getTitle (): string {
        return `🙅  User limit must be between ${ DynamicChannelLimitInvalidInputEmbed.vars.minValue } and ${ DynamicChannelLimitInvalidInputEmbed.vars.maxValue }`;
    }

    protected getLogic ( args: UIArgs ) {
        return {
            minValue: args.minValue,
            maxValue: args.maxValue
        };
    }
}
