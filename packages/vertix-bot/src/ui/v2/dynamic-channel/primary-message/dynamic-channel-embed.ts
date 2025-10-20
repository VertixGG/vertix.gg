import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Show for each dynamic channel, as primary message.
 */
export class DynamicChannelEmbed extends UIEmbedBase {
    private static vars: any = {
        name: uiUtilsWrapAsTemplate( "name" ),
        limit: uiUtilsWrapAsTemplate( "limit" ),
        state: uiUtilsWrapAsTemplate( "state" ),
        region: uiUtilsWrapAsTemplate( "region" ),

        limitDisplayValue: uiUtilsWrapAsTemplate( "limitDisplayValue" ),
        limitDisplayUnlimited: uiUtilsWrapAsTemplate( "limitDisplayUnlimited" ),
        limitValue: uiUtilsWrapAsTemplate( "limitValue" ),

        statePublic: uiUtilsWrapAsTemplate( "statePublic" ),
        statePrivate: uiUtilsWrapAsTemplate( "statePrivate" ),

        visibilityState: uiUtilsWrapAsTemplate( "visibilityState" ),
        visibilityStateShown: uiUtilsWrapAsTemplate( "visibilityStateShown" ),
        visibilityStateHidden: uiUtilsWrapAsTemplate( "visibilityStateHidden" ),

        regionDisplayValue: uiUtilsWrapAsTemplate( "regionDisplayValue" ),
        regionDisplayAuto: uiUtilsWrapAsTemplate( "regionDisplayAuto" ),
        regionValue: uiUtilsWrapAsTemplate( "regionValue" )
    };

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle(): string {
        return "༄ Manage your Dynamic Channel";
    }

    protected getDescription(): string {
        const { name, limit, state, visibilityState, region } = DynamicChannelEmbed.vars;

        return (
            "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\n" +
            "Please be advised that the privilege to make alterations is vested solely of the channel owner.\n\n" +
            "_Current settings_:\n" +
            `- Name: **${ name }**\n` +
            `- User Limit: ✋ **${ limit }**\n` +
            `- State: ${ state }\n` +
            `- Visibility State: ${ visibilityState }\n` +
            `- Region: 🌍 **${ region }**`
        );
    }

    protected getOptions() {
        return {
            limit: {
                [ DynamicChannelEmbed.vars.limitDisplayValue ]: DynamicChannelEmbed.vars.limitValue,
                [ DynamicChannelEmbed.vars.limitDisplayUnlimited ]: "Unlimited"
            },
            state: {
                [ DynamicChannelEmbed.vars.statePublic ]: "🌐 **Public**",
                [ DynamicChannelEmbed.vars.statePrivate ]: "🚫 **Private**"
            },
            visibilityState: {
                [ DynamicChannelEmbed.vars.visibilityStateShown ]: "🐵 **Shown**",
                [ DynamicChannelEmbed.vars.visibilityStateHidden ]: "🙈 **Hidden**"
            },
            region: {
                [ DynamicChannelEmbed.vars.regionDisplayValue ]: DynamicChannelEmbed.vars.regionValue,
                [ DynamicChannelEmbed.vars.regionDisplayAuto ]: "Automatic"
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const {
            limitDisplayValue,
            limitDisplayUnlimited,

            statePublic,
            statePrivate,

            visibilityStateShown,
            visibilityStateHidden,

            regionDisplayValue,
            regionDisplayAuto
        } = DynamicChannelEmbed.vars;

        return {
            name: args.channelName,
            limit: 0 === args.userLimit ? limitDisplayUnlimited : limitDisplayValue,

            state: args.isPrivate ? statePrivate : statePublic,
            visibilityState: args.isHidden ? visibilityStateHidden : visibilityStateShown,

            region: args.region ? regionDisplayValue : regionDisplayAuto,

            limitValue: args.userLimit,

            regionValue: args.region
        };
    }
}
