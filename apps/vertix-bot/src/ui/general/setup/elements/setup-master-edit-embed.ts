import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

/**
 * Asks which generator to edit.
 *
 * Choosing one is the first thing editing needs and the one thing the editor itself cannot ask -
 * it opens already knowing which generator it is for. `/manage edit` used to open it anyway, with
 * nothing chosen.
 *
 * Whichever kind is picked, the menu behind this sends it to the right editor: a scaling generator
 * to the scaling one, anything else to the setup editor for its interface version. That is why
 * there is no separate command for scaling - it is one of the things this list contains.
 */
const SetupMasterEditEmbed = new EmbedBuilder( "VertixBot/UI-General/SetupMasterEditEmbed" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setThumbnail( VERTIX_BRAND_THUMBNAIL_URL )
    .setTitle( "🔧  Edit a channel generator" )
    .setDescription(
        "Pick the generator you want to change.\n\n" +
        "Its settings open next — the name new channels get, who may see them, which buttons their " +
        "owners have, and the rest.\n\n" +
        "*Nothing here? The server has no generators yet — `/manage new-generator` makes one.*"
    )
    .build();

export { SetupMasterEditEmbed };
