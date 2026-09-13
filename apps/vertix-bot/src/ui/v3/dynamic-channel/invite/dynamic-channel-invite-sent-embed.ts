import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_INVITE_SENT_VARS = {
    inviteEmoji: uiUtilsWrapAsTemplate( "inviteEmoji" ),
    invitedDisplayName: uiUtilsWrapAsTemplate( "invitedDisplayName" ),
    deliveryDisplay: uiUtilsWrapAsTemplate( "deliveryDisplay" ),
    deliveryDelivered: uiUtilsWrapAsTemplate( "deliveryDelivered" ),
    deliveryBlocked: uiUtilsWrapAsTemplate( "deliveryBlocked" )
};

const DynamicChannelInviteSentEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_INVITE_SENT_VARS>(
    "VertixBot/UI-V3/DynamicChannelInviteSentEmbed",
    DYNAMIC_CHANNEL_INVITE_SENT_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( vars ) => `${ vars.inviteEmoji }  Invite sent` )
    .setDescription( ( vars ) => (
        `**${ vars.invitedDisplayName }** can now join this channel.\n\n` +
        vars.deliveryDisplay
    ) )
    .setOptions( ( vars ) => ( {
        deliveryDisplay: {
            [ vars.deliveryDelivered ]: "They have been sent a link to it.",
            [ vars.deliveryBlocked ]:
                "Their direct messages are closed, so tell them yourself - the access is already theirs."
        }
    } ) )
    /**
     * Function setLogic() :: Answers the two questions the description asks, and never leaves one
     * of them standing as its own token.
     *
     * `deliveryDisplay` is decided either way, so it always resolves. The name is read from the
     * member who was invited and had been passed straight through - which prints the raw
     * `{invitedDisplayName}` to the channel on any render that arrives without it, since a key
     * set to undefined is still a key and the default never gets its turn.
     */
    .setLogic( ( args?: UIArgs ) => {
        const result: Record<string, string> = {
            deliveryDisplay: args?.isInviteDelivered
                ? DYNAMIC_CHANNEL_INVITE_SENT_VARS.deliveryDelivered
                : DYNAMIC_CHANNEL_INVITE_SENT_VARS.deliveryBlocked
        };

        if ( args?.invitedDisplayName ) {
            result.invitedDisplayName = args.invitedDisplayName;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        inviteEmoji: EmojiManager.$.getMarkdown( "InviteChannel" ),
        // Stands in on a render that never learned who was invited, which is a sentence that
        // still reads rather than a token printed into somebody's channel.
        invitedDisplayName: "The member",
        deliveryDisplay: DYNAMIC_CHANNEL_INVITE_SENT_VARS.deliveryDelivered
    } ) )
    .build();

export { DynamicChannelInviteSentEmbed };
