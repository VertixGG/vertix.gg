import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const TEAM_LOBBY_EMBED_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    lobbyId: uiUtilsWrapAsTemplate( "lobbyId" ),

    roomIds: uiUtilsWrapAsTemplate( "roomIds" ),
    splitMessage: uiUtilsWrapAsTemplate( "splitMessage" ),
    splitMessageDefault: uiUtilsWrapAsTemplate( "splitMessageDefault" ),

    hostRoleIds: uiUtilsWrapAsTemplate( "hostRoleIds" ),
    hostsMessage: uiUtilsWrapAsTemplate( "hostsMessage" ),
    hostsMessageDefault: uiUtilsWrapAsTemplate( "hostsMessageDefault" )
};

/**
 * The panel in a team lobby's panel channel - what the lobby is for, how it is split right now and who
 * runs it.
 *
 * It leads with joining the lobby: a split takes only the people in it, and the panel sits in a channel
 * of its own, so nothing else on the screen says where to go. The lobby and the rooms are named as
 * channel mentions, so a member gets to either with one click.
 */
const TeamLobbyEmbed = new EmbedBuilder<UIArgs, typeof TEAM_LOBBY_EMBED_VARS>(
    "VertixBot/UI-V3/TeamLobbyEmbed",
    TEAM_LOBBY_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "🎮  Team Lobby" )
    .setDescription( ( vars ) =>
        "Split the lobby into team rooms or small groups - and bring everyone back with one press.\n" +
        `👉 **Join <#${ vars.lobbyId }> to take part** - a split only takes the people who are in it.\n\n` +
        "🎲 **Random teams** - everyone in the lobby shuffled evenly into teams, and moved.\n" +
        "🙋 **Pick teams** - team rooms open, and everyone walks into the one they want.\n" +
        "👥 **Groups** - everyone in the lobby dealt into small groups of a size you choose, and moved.\n" +
        "↩️ **Recall** - everyone back to the lobby, and the rooms close.\n\n" +
        vars.splitMessage + "\n" +
        vars.hostsMessage
    )
    .setArrayOptions( ( { value, separator } ) => ( {
        roomIds: {
            format: `<#${ value }>${ separator }`,
            separator: " · "
        },
        hostRoleIds: {
            format: `<@&${ value }>${ separator }`,
            separator: ", "
        }
    } ) )
    .setOptions( ( { roomIds, splitMessageDefault, hostRoleIds, hostsMessageDefault } ) => ( {
        splitMessage: {
            [ String( roomIds ) ]: `**Split into:** ${ roomIds }`,
            [ String( splitMessageDefault ) ]: "**Not split** - everyone is in the lobby."
        },
        hostsMessage: {
            [ String( hostRoleIds ) ]: `**Hosts:** ${ hostRoleIds }`,
            [ String( hostsMessageDefault ) ]: "**Hosts:** anyone in the lobby"
        }
    } ) )
    .setLogic( ( args: UIArgs, vars ) => {
        const result: Record<string, JsonValue> = {
            lobbyId: String( args?.lobbyId ?? "" )
        };

        if ( args?.roomIds?.length ) {
            result.roomIds = args.roomIds;
            result.splitMessage = vars.roomIds;
        } else {
            result.splitMessage = vars.splitMessageDefault;
        }

        if ( args?.hostRoleIds?.length ) {
            result.hostRoleIds = args.hostRoleIds;
            result.hostsMessage = vars.hostRoleIds;
        } else {
            result.hostsMessage = vars.hostsMessageDefault;
        }

        return result;
    } )
    .build();

export { TeamLobbyEmbed, TEAM_LOBBY_EMBED_VARS };
