import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelMetaLimitSuccessEmbed extends UIEmbedBase {
    private static vars = {
        userLimit: uiUtilsWrapAsTemplate( "userLimit" ),
        userLimitValue: uiUtilsWrapAsTemplate( "userLimitValue" ),
        userLimitUnlimited: uiUtilsWrapAsTemplate( "userLimitUnlimited" ),
    };

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelMetaLimitSuccessEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return 0xF5CF4D; // Hand like.
    }

    protected getTitle(): string {
        return `✋  Your channel's user limit has changed to ${ DynamicChannelMetaLimitSuccessEmbed.vars.userLimit }`;
    }

    protected getOptions() {
        const {
            userLimitValue,
            userLimitUnlimited,
        } = DynamicChannelMetaLimitSuccessEmbed.vars;

        return {
            userLimit: {
                [ userLimitValue ]: userLimitValue,
                [ userLimitUnlimited ]: "Unlimited",
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const {
            userLimitValue,
            userLimitUnlimited,
        } = DynamicChannelMetaLimitSuccessEmbed.vars;

        return {
            userLimit: args.userLimit === 0 ? userLimitUnlimited : userLimitValue,

            userLimitValue: args.userLimit,
        };
    }
}
