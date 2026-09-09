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
    .setLogic( ( args?: UIArgs ) => ( {
        invitedDisplayName: args?.invitedDisplayName,
        deliveryDisplay: args?.isInviteDelivered
            ? DYNAMIC_CHANNEL_INVITE_SENT_VARS.deliveryDelivered
            : DYNAMIC_CHANNEL_INVITE_SENT_VARS.deliveryBlocked
    } ) )
    .setDefaultVars( () => ( {
        inviteEmoji: EmojiManager.$.getMarkdown( "InviteChannel" ),
        invitedDisplayName: "Example User",
        deliveryDisplay: DYNAMIC_CHANNEL_INVITE_SENT_VARS.deliveryDelivered
    } ) )
    .build();

export { DynamicChannelInviteSentEmbed };
