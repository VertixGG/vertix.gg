import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import {
    dynamicChannelBotPermissionsRequirements
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/_dynamic-channel-requirements";

import {
    answeredBecauseTheChannelIsGone
} from "@vertix.gg/bot/src/ui/general/channel-gone/channel-gone-gate";

import type {
    UIAdapterReplyContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * The base of an interface a slash command opens.
 *
 * Every other dynamic channel interface asks the same thing of whoever touches it: that they own
 * the channel they are standing in. That is the right question for a panel drawn inside a channel,
 * and the wrong one here twice over - the command already asked whatever its own tier asks before
 * opening anything, and some of these commands are about a channel the member pointedly does not
 * own. Knocking is asking a stranger to be let in.
 *
 * So what is left to check is the bot: the same permissions check the ordinary requirements end on,
 * without the channel resolution and ownership question above it.
 */
export abstract class DynamicChannelCommandAdapterExuBase<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction
> extends DynamicChannelAdapterExuBase<TInteraction> {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelCommandAdapterExuBase";
    }

    public async isPassingInteractionRequirementsInternal( interaction: TInteraction ): Promise<boolean> {
        if ( await answeredBecauseTheChannelIsGone(
            interaction,
            this.getArgsManager().getArgs( this, interaction )
        ) ) {
            return false;
        }

        return dynamicChannelBotPermissionsRequirements( interaction );
    }
}
