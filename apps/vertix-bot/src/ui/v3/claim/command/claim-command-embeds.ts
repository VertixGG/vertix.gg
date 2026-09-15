import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const CLAIM_COMMAND_SELECT_VARS = {
    claimableCount: uiUtilsWrapAsTemplate( "claimableCount" )
};

/**
 * The channels whose owner has gone, for a member to pick from.
 *
 * `/voice claim` used to ask only about the channel the member was standing in, and answered "not
 * up for claiming" for every other one in the server - true of where they stood, and no use to
 * somebody looking for a channel to take over. This asks the whole server, the way knocking does.
 */
const ClaimCommandSelectEmbed = new EmbedBuilder<UIArgs, typeof CLAIM_COMMAND_SELECT_VARS>(
    "VertixBot/UI-V3/ClaimCommandSelectEmbed",
    CLAIM_COMMAND_SELECT_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "👑  Channels you can claim" )
    .setDescription( ( vars ) =>
        `There ${ vars.claimableCount } waiting for a new owner.\n\n` +
        "A channel becomes claimable when whoever owned it leaves and does not come back. " +
        "Whoever is still inside votes on who takes it.\n\n" +
        "Pick one and you will be sent to where the vote is."
    )
    .setOptions( () => ( {
        claimableCount: {
            "1": "is **one channel**",
            many: "are **{count} channels**"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const count = Array.isArray( args?.claimableChannels ) ? args.claimableChannels.length : 0;

        return {
            claimableCount: 1 === count ? "1" : "many",
            count
        };
    } )
    .build();

const CLAIM_COMMAND_POINTED_VARS = {
    claimedChannelName: uiUtilsWrapAsTemplate( "claimedChannelName" ),
    claimMessageUrl: uiUtilsWrapAsTemplate( "claimMessageUrl" )
};

/**
 * Where to go, once a channel is picked.
 *
 * A claim is a vote, and the vote is drawn by editing the very message its button sits on - so a
 * command cannot be the press. What it can do is hand back that message, which is the next best
 * thing and arguably the more useful one: the member lands on the vote already in progress.
 */
const ClaimCommandPointedAtEmbed = new EmbedBuilder<UIArgs, typeof CLAIM_COMMAND_POINTED_VARS>(
    "VertixBot/UI-V3/ClaimCommandPointedAtEmbed",
    CLAIM_COMMAND_POINTED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "👑  Claim it here" )
    .setDescription( ( vars ) =>
        `**${ vars.claimedChannelName }** is waiting for a new owner.\n\n` +
        `${ vars.claimMessageUrl }\n\n` +
        "Press **Claim** there to put yourself forward. Everyone still inside votes."
    )
    .setLogic( ( args: UIArgs ) => ( {
        claimedChannelName: args?.claimedChannelName,
        claimMessageUrl: args?.claimMessageUrl
    } ) )
    .build();

export { ClaimCommandSelectEmbed, ClaimCommandPointedAtEmbed };
