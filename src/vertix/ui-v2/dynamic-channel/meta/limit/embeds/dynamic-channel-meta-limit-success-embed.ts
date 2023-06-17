import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelMetaLimitSuccessEmbed extends UIEmbedBase {
    private static vars = {
        userLimit: uiUtilsWrapAsTemplate( "userLimit" ),
        userLimitValue: uiUtilsWrapAsTemplate( "userLimitValue" ),
        userLimitUnlimited: uiUtilsWrapAsTemplate( "userLimitUnlimited" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelMetaLimitSuccessEmbed";
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
