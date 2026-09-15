import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

/**
 * Asks which kind of generator to make, and nothing else.
 *
 * The setup screen's own embed is a report - every generator the server has, its buttons, its
 * roles, its badwords - which is right when a member is looking over their configuration and wrong
 * when they have asked for one thing. `/manage new-generator` lands here, and what it needs to say
 * is which choices there are and what they mean.
 */
const SetupMasterCreateEmbed = new EmbedBuilder( "VertixBot/UI-General/SetupMasterCreateEmbed" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "➕  Create a channel generator" )
    .setDescription(
        "A generator is a voice channel members join to get one of their own, made for them and " +
        "removed when they leave.\n\n" +
        "**✨ Dynamic Channel (V3)** — the current interface. Pick this unless you have a reason not to.\n" +
        "**➕ Dynamic Channel (V2)** — the older interface, for servers already running it.\n" +
        "**📈 Auto-Scaling Channel** — one channel that grows into several as it fills up.\n\n" +
        "Choose below, and the rest is a few questions."
    )
    .build();

export { SetupMasterCreateEmbed };
