import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { TAdapterMapping } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

/**
 * Function runVoiceClearChat() :: Clears the channel's chat, then says what went.
 *
 * Answered to whoever typed it and to nobody else, in both interface versions. The v3 button leaves
 * a notice in the channel as well, and this deliberately does not: a command is a private thing to
 * do, and a member who wanted the channel told can say so themselves.
 *
 * The two versions name their screens differently and share nothing but the wording, so which one
 * to open is the only thing the version decides here.
 */
export async function runVoiceClearChat(
    interaction: CommandInteraction<"cached">,
    channel: VoiceChannel | null,
    adapter: TAdapterMapping[ "execution" ],
    isV2: boolean
): Promise<void> {
    if ( ! channel ) {
        return;
    }

    const result = await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
        .clearChat( interaction, channel );

    switch ( result?.code ) {
        case "success": {
            const args = {
                ownerDisplayName: await guildGetMemberDisplayName( channel.guild, interaction.user.id ),
                totalMessages: result.deletedCount
            };

            await adapter.ephemeralWithStep(
                interaction,
                isV2
                    ? "VertixBot/UI-V2/DynamicChannelMetaClearChatCommandSuccess"
                    : "VertixBot/UI-V3/DynamicChannelClearChatCommandSuccess",
                args
            );

            return;
        }

        case "nothing-to-delete":
            await adapter.ephemeralWithStep(
                interaction,
                isV2
                    ? "VertixBot/UI-V2/DynamicChannelMetaClearChatCommandNothingToClear"
                    : "VertixBot/UI-V3/DynamicChannelClearChatCommandNothingToClear",
                {}
            );

            return;

        default:
            await adapter.ephemeralWithStep(
                interaction,
                isV2
                    ? "VertixBot/UI-V2/DynamicChannelMetaClearChatCommandError"
                    : "VertixBot/UI-V3/DynamicChannelClearChatCommandError",
                {}
            );
    }
}
