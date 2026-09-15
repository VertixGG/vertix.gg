import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

/**
 * The two server-settings screens, each saying what it is for.
 *
 * Both used to show the setup screen's own embed - a report of every generator the server has, its
 * buttons and its roles - which is what a member wants when looking over their configuration and
 * not what they want when they came to change one thing.
 */

const SetupServerOptionsEmbed = new EmbedBuilder( "VertixBot/UI-General/SetupServerOptionsEmbed" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "⚙️  Server settings" )
    .setDescription(
        "Settings that belong to the whole server rather than to one generator.\n\n" +
        "**Voice Role** — given to members while they are in a voice channel.\n" +
        "**Verified Roles** — who dynamic channels are for.\n" +
        "**Staff Roles** — who may act on a channel they do not own.\n" +
        "**Bad Words** — words a member cannot put in a channel name.\n" +
        "**Claim** — how long an abandoned channel waits, and how long the vote runs.\n\n" +
        "Pick one to change it."
    )
    .build();

const SetupServerOptionsRolesEmbed = new EmbedBuilder( "VertixBot/UI-General/SetupServerOptionsRolesEmbed" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "🛡️  Server roles" )
    .setDescription(
        "Which roles this server's dynamic channels answer to.\n\n" +
        "**Voice Role** — given to members while they are in a voice channel, and taken back when " +
        "they leave.\n" +
        "**Verified Roles** — who the channels are for. Everyone else is kept out.\n" +
        "**Staff Roles** — who may act on a channel they do not own.\n\n" +
        "Pick one to change it."
    )
    .build();

export { SetupServerOptionsEmbed, SetupServerOptionsRolesEmbed };
