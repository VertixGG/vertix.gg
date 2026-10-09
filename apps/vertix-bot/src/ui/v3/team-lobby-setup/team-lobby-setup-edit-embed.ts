import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

const TEAM_LOBBY_SETUP_EDIT_EMBED_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    lobbyIndex: uiUtilsWrapAsTemplate( "lobbyIndex" ),
    lobbyChannelId: uiUtilsWrapAsTemplate( "lobbyChannelId" ),

    lobbyHostRoleIds: uiUtilsWrapAsTemplate( "lobbyHostRoleIds" ),
    hostsMessage: uiUtilsWrapAsTemplate( "hostsMessage" ),
    hostsMessageDefault: uiUtilsWrapAsTemplate( "hostsMessageDefault" )
};

/**
 * A team lobby's own screen in `/setup` - which channel it is, and who runs it.
 */
const TeamLobbySetupEditEmbed = new EmbedBuilder<UIArgs, typeof TEAM_LOBBY_SETUP_EDIT_EMBED_VARS>(
    "VertixBot/UI-V3/TeamLobbySetupEditEmbed",
    TEAM_LOBBY_SETUP_EDIT_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( vars ) => `🎮  Team Lobby #${ vars.lobbyIndex }` )
    .setDescription( ( vars ) =>
        "One voice channel people gather in, split from into team rooms or groups, and called back to.\n\n" +
        `➤ ∙ Lobby: <#${ vars.lobbyChannelId }>\n` +
        `➤ ∙ Channel ID: \`${ vars.lobbyChannelId }\`\n` +
        `➤ ∙ ${ vars.hostsMessage }\n\n` +
        "Pick the roles that run this lobby. With none, anyone in it can split it and call it back. " +
        "Admins always can."
    )
    .setArrayOptions( ( { value, separator } ) => ( {
        lobbyHostRoleIds: {
            format: `<@&${ value }>${ separator }`,
            separator: ", "
        }
    } ) )
    .setOptions( ( { lobbyHostRoleIds, hostsMessageDefault } ) => ( {
        hostsMessage: {
            [ String( lobbyHostRoleIds ) ]: `Hosts: ${ lobbyHostRoleIds }`,
            [ String( hostsMessageDefault ) ]: "Hosts: anyone in the lobby"
        }
    } ) )
    .setLogic( ( args: UIArgs, vars ) => {
        const result: Record<string, JsonValue> = {
            lobbyIndex: Number( args?.lobbyIndex ?? 0 ) + 1,
            lobbyChannelId: args?.lobbyChannelId ?? ""
        };

        if ( args?.lobbyHostRoleIds?.length ) {
            result.lobbyHostRoleIds = args.lobbyHostRoleIds;
            result.hostsMessage = vars.lobbyHostRoleIds;
        } else {
            result.hostsMessage = vars.hostsMessageDefault;
        }

        return result;
    } )
    .build();

export { TeamLobbySetupEditEmbed };
