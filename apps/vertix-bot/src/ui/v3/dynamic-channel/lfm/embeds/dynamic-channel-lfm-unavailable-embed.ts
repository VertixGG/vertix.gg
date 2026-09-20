import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_ORANGE_RED } from "@vertix.gg/bot/src/definitions/app";

import { DynamicChannelLfmPostResultCode } from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    reason: uiUtilsWrapAsTemplate( "reason" ),
    reasonNotConfigured: uiUtilsWrapAsTemplate( "reasonNotConfigured" ),
    reasonDestinationUnavailable: uiUtilsWrapAsTemplate( "reasonDestinationUnavailable" ),
    reasonHidden: uiUtilsWrapAsTemplate( "reasonHidden" ),
    reasonPrivate: uiUtilsWrapAsTemplate( "reasonPrivate" ),
    reasonFull: uiUtilsWrapAsTemplate( "reasonFull" ),
    reasonAlreadyPosted: uiUtilsWrapAsTemplate( "reasonAlreadyPosted" ),
    reasonFailed: uiUtilsWrapAsTemplate( "reasonFailed" )
};

const DynamicChannelLfmUnavailableEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelLfmUnavailableEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_ORANGE_RED )
    .setTitle( () => "🔎  Nothing to post" )
    .setDescription( () => vars.reason )
    .setOptions( () => ( {
        reason: {
            [ vars.reasonNotConfigured ]:
                // Two things have to be true before this button can do anything, and an
                // admin reading only half of that goes looking for the other half in the
                // wrong screen: the button is out of the set a generator starts with, so
                // it has to be switched on as well as pointed somewhere.
                "Nobody has set this up yet. An admin runs `/setup`, turns the **LFM** button on in the channel interface, and picks the channels these posts go to.",
            [ vars.reasonDestinationUnavailable ]:
                "The channels these posts go to are not ones you can see. An admin picks them in the setup screen.",
            [ vars.reasonHidden ]:
                "Your channel is hidden, so nobody could find it anyway. Show it first.",
            [ vars.reasonPrivate ]:
                "Your channel is private, so nobody you invite could get in. Make it public first.",
            [ vars.reasonFull ]:
                "Your channel is already full.",
            [ vars.reasonAlreadyPosted ]:
                "Your channel is already on the board.",
            [ vars.reasonFailed ]:
                "Something went wrong while posting. Try again in a moment."
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const byCode: Partial<Record<DynamicChannelLfmPostResultCode, string>> = {
            [ DynamicChannelLfmPostResultCode.NotConfigured ]: vars.reasonNotConfigured,
            [ DynamicChannelLfmPostResultCode.DestinationUnavailable ]: vars.reasonDestinationUnavailable,
            [ DynamicChannelLfmPostResultCode.ChannelHidden ]: vars.reasonHidden,
            [ DynamicChannelLfmPostResultCode.ChannelPrivate ]: vars.reasonPrivate,
            [ DynamicChannelLfmPostResultCode.ChannelFull ]: vars.reasonFull,
            [ DynamicChannelLfmPostResultCode.AlreadyPosted ]: vars.reasonAlreadyPosted,
            [ DynamicChannelLfmPostResultCode.Error ]: vars.reasonFailed
        };

        // A code with nothing mapped to it is a failure we did not foresee, not a missing setup -
        // saying "nobody configured a channel" would send an admin looking for a switch that is
        // already on.
        return {
            reason: byCode[ args.reasonCode as DynamicChannelLfmPostResultCode ] ?? vars.reasonFailed
        };
    } )
    .setDefaultVars( () => ( {
        reason: vars.reasonNotConfigured
    } ) )
    .build();

export { DynamicChannelLfmUnavailableEmbed };
