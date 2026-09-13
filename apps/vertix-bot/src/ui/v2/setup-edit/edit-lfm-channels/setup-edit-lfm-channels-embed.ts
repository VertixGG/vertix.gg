import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { dynamicChannelLfmTimingsResolve } from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import {
    MILLISECONDS_PER_MINUTE,
    MILLISECONDS_PER_SECOND
} from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-lfm-channels/setup-edit-lfm-timings-modal";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    index: uiUtilsWrapAsTemplate( "index" ),
    lfmChannels: uiUtilsWrapAsTemplate( "lfmChannels" ),
    lfmChannelsDisplay: uiUtilsWrapAsTemplate( "lfmChannelsDisplay" ),
    lfmChannelsNone: uiUtilsWrapAsTemplate( "lfmChannelsNone" ),
    pingRoles: uiUtilsWrapAsTemplate( "pingRoles" ),
    pingRolesDisplay: uiUtilsWrapAsTemplate( "pingRolesDisplay" ),
    pingRolesNone: uiUtilsWrapAsTemplate( "pingRolesNone" ),
    postCooldown: uiUtilsWrapAsTemplate( "postCooldown" ),
    pingCooldown: uiUtilsWrapAsTemplate( "pingCooldown" ),
    postExpiry: uiUtilsWrapAsTemplate( "postExpiry" ),
    occupancyDebounce: uiUtilsWrapAsTemplate( "occupancyDebounce" )
};

/**
 * Function composeDuration() :: A millisecond count as somebody would say it out loud.
 *
 * Not translated, because it is read beside the numbers the modal asks for in the same units -
 * a screen that says "10 minutes" over a field labelled minutes needs no dictionary.
 */
function composeDuration( milliseconds: number ) {
    if ( ! milliseconds ) {
        return "**Off**";
    }

    if ( milliseconds < MILLISECONDS_PER_MINUTE ) {
        return `**${ Number( ( milliseconds / MILLISECONDS_PER_SECOND ).toFixed( 1 ) ) }s**`;
    }

    return `**${ Number( ( milliseconds / MILLISECONDS_PER_MINUTE ).toFixed( 1 ) ) }m**`;
}

const SetupEditLfmChannelsEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-V2/SetupEditLfmChannelsEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `🔎  Edit LFM Of Master Channel #${ vars.index }` )
    .setDescription( () => (
        "A channel owner can advertise their channel to the text channels picked here, so members " +
        "who are reading chat can see a room that is looking for people and join it.\n\n" +
        "Members choose between these when they post, and can reach no other channel.\n\n" +
        "Leaving it empty turns the feature off for this master channel.\n\n" +
        "**_Current LFM Channels_**\n\n> " +
        vars.lfmChannelsDisplay +
        "\n\n**_Roles Pinged_**\n\n> " +
        vars.pingRolesDisplay +
        "\n\n**_Timings_**\n\n" +
        `> Post cooldown: ${ vars.postCooldown }\n` +
        `> Ping cooldown: ${ vars.pingCooldown }\n` +
        `> Post expiry: ${ vars.postExpiry }\n` +
        `> Member count refresh: ${ vars.occupancyDebounce }`
    ) )
    .setFooterText( () =>
        "Note: The bot needs to view, send messages and embed links in every channel picked here."
    )
    .setOptions( () => ( {
        lfmChannelsDisplay: {
            [ vars.lfmChannels ]: vars.lfmChannels,
            [ vars.lfmChannelsNone ]: "**None** *(the feature is off)*"
        },
        pingRolesDisplay: {
            [ vars.pingRoles ]: vars.pingRoles,
            [ vars.pingRolesNone ]: "**None** *(posts go up quietly)*"
        }
    } ) )
    .setArrayOptions( () => ( {
        lfmChannels: {
            format: `<#${ vars.value }>${ vars.separator }`,
            separator: ", "
        },
        pingRoles: {
            format: `<@&${ vars.value }>${ vars.separator }`,
            separator: ", "
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string | number | string[]> = {
            index: args.index + 1
        };

        const channelIds = Array.isArray( args.dynamicChannelLfmChannelIds )
            ? args.dynamicChannelLfmChannelIds
            : [];

        if ( channelIds.length ) {
            result.lfmChannels = channelIds;
            result.lfmChannelsDisplay = vars.lfmChannels;
        } else {
            result.lfmChannelsDisplay = vars.lfmChannelsNone;
        }

        const pingRoleIds = Array.isArray( args.dynamicChannelLfmPingRoleIds )
            ? args.dynamicChannelLfmPingRoleIds
            : [];

        if ( pingRoleIds.length ) {
            result.pingRoles = pingRoleIds;
            result.pingRolesDisplay = vars.pingRoles;
        } else {
            result.pingRolesDisplay = vars.pingRolesNone;
        }

        const timings = dynamicChannelLfmTimingsResolve( {
            postCooldown: args.dynamicChannelLfmPostCooldownMs,
            pingCooldown: args.dynamicChannelLfmPingCooldownMs,
            postExpiry: args.dynamicChannelLfmPostExpiryMs,
            occupancyDebounce: args.dynamicChannelLfmOccupancyDebounceMs
        } );

        result.postCooldown = composeDuration( timings.postCooldown );
        result.pingCooldown = composeDuration( timings.pingCooldown );
        result.postExpiry = composeDuration( timings.postExpiry );
        result.occupancyDebounce = composeDuration( timings.occupancyDebounce );

        return result;
    } )
    .build();

export { SetupEditLfmChannelsEmbed };
