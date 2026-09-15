import { ChannelTemplateModel } from "@vertix.gg/data/src/models/data/channel-template-model";

import { MAX_TEMPLATES } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-handlers";

import type { TAdapterMapping } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

/**
 * Function runVoiceTemplates() :: Fetches the member's kept settings, then shows them.
 *
 * The list is the screen, so it has to exist before the screen does - an interface opened without
 * it draws an empty one and tells the member they have saved nothing. The templates button's own
 * handler reads them for the same reason; this is that reading, done by the command.
 *
 * The channel comes along because everything past the list acts on it: saving captures the
 * channel's current settings, applying writes them back, and each of those is a separate press
 * arriving with no memory of which channel the first one was about.
 */
export async function runVoiceTemplates(
    interaction: CommandInteraction<"cached">,
    channel: VoiceChannel | null,
    adapter: TAdapterMapping[ "execution" ],
    _isV2: boolean
): Promise<void> {
    if ( ! channel ) {
        return;
    }

    const templates = await ChannelTemplateModel.$.getTemplates( interaction.user.id, interaction.guildId );

    await adapter.ephemeral( interaction, {
        channelId: channel.id,
        templates,
        maxTemplates: MAX_TEMPLATES
    } );
}
