import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
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

const DynamicChannelEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "༄ Manage your Dynamic Channel" )
    .setDescription( () => (
        "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\n" +
            "Please be advised that the privilege to make alterations is vested solely of the channel owner.\n\n" +
            "_Current settings_:\n" +
        `- Name: **${ vars.name }**\n` +
        `- User Limit: ✋ **${ vars.limit }**\n` +
        `- State: ${ vars.state }\n` +
        `- Visibility State: ${ vars.visibilityState }\n` +
        `- Region: 🌍 **${ vars.region }**`
    ) )
    .setOptions( () => ( {
        limit: {
            [ vars.limitDisplayValue ]: vars.limitValue,
            [ vars.limitDisplayUnlimited ]: "Unlimited"
        },
        state: {
            [ vars.statePublic ]: "🌐 **Public**",
            [ vars.statePrivate ]: "🚫 **Private**"
        },
        visibilityState: {
            [ vars.visibilityStateShown ]: "🐵 **Shown**",
            [ vars.visibilityStateHidden ]: "🙈 **Hidden**"
        },
        region: {
            [ vars.regionDisplayValue ]: vars.regionValue,
            [ vars.regionDisplayAuto ]: "Automatic"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const {
            limitDisplayValue,
            limitDisplayUnlimited,
            statePublic,
            statePrivate,
            visibilityStateShown,
            visibilityStateHidden,
            regionDisplayValue,
            regionDisplayAuto
        } = vars;

        return {
            name: args.channelName,
            limit: 0 === args.userLimit ? limitDisplayUnlimited : limitDisplayValue,
            state: args.isPrivate ? statePrivate : statePublic,
            visibilityState: args.isHidden ? visibilityStateHidden : visibilityStateShown,
            region: args.region ? regionDisplayValue : regionDisplayAuto,
            limitValue: args.userLimit,
            regionValue: args.region
        };
    } )
    .setDefaultVars( () => ( {
        name: "Channel Name",
        limit: "Unlimited",
        state: "🌐 **Public**",
        visibilityState: "🐵 **Shown**",
        region: "Automatic"
    } ) )
    .build();

export { DynamicChannelEmbed };
