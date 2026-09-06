import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    index: uiUtilsWrapAsTemplate( "index" ),
    voiceRoleId: uiUtilsWrapAsTemplate( "voiceRoleId" ),
    voiceRoleDisplay: uiUtilsWrapAsTemplate( "voiceRoleDisplay" ),
    voiceRoleGuild: uiUtilsWrapAsTemplate( "voiceRoleGuild" ),
    voiceRoleNone: uiUtilsWrapAsTemplate( "voiceRoleNone" )
};

const SetupEditVoiceRoleEmbed = new EmbedBuilder<UIArgs, typeof vars>( "VertixBot/UI-V2/SetupEditVoiceRoleEmbed", vars )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `🎙️  Edit Voice Role Of Master Channel #${ vars.index }` )
    .setDescription( () => (
        "A member holds this role only while they sit in a dynamic channel of this master channel, " +
        "and loses it the moment they leave.\n\n" +
        "Use it to show a text channel to whoever is in voice right now, or to group them in the " +
        "member list.\n\n" +
        "Leaving it empty falls back to the server wide voice role.\n\n" +
        "**_Current Voice Role_**\n\n> " +
        vars.voiceRoleDisplay
    ) )
    .setFooterText( () =>
        "Note: The bot's own role has to sit above the role it hands out, or discord refuses it."
    )
    .setOptions( () => ( {
        voiceRoleDisplay: {
            [ vars.voiceRoleId ]: `<@&${ vars.voiceRoleId }>`,
            [ vars.voiceRoleGuild ]: `<@&${ vars.voiceRoleId }> *(from the server options)*`,
            [ vars.voiceRoleNone ]: "**None**"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const roleId = args.dynamicChannelVoiceRoleId as string | null,
            guildRoleId = args.guildVoiceRoleId as string | null;

        const result: Record<string, string | number> = {
            index: args.index + 1
        };

        if ( roleId ) {
            result.voiceRoleId = roleId;
            result.voiceRoleDisplay = vars.voiceRoleId;
        } else if ( guildRoleId ) {
            result.voiceRoleId = guildRoleId;
            result.voiceRoleDisplay = vars.voiceRoleGuild;
        } else {
            result.voiceRoleDisplay = vars.voiceRoleNone;
        }

        return result;
    } )
    .build();

export { SetupEditVoiceRoleEmbed };
