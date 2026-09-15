import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import {
    getInteractionChannelContext,
    interactionNamesAChannel
} from "@vertix.gg/bot/src/ui/general/misc/interaction-channel-context";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

/**
 * The claim button of each interface version. Named here as strings rather than imported: this
 * runs from the base every dynamic channel adapter extends, and the buttons reach that base
 * through their own elements group.
 */
const CLAIM_BUTTON_NAMES = new Set( [
    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton",
    "VertixBot/UI-V3/DynamicChannelClaimChannelButton"
] );

/**
 * Function answerClaimWithoutAChannel() :: Says where claiming happens, when the asking named
 * no channel.
 *
 * A control panel draws the same buttons as the interface inside a channel, and claim is left
 * pressable there so that what a member gets is a sentence rather than a button greyed out for
 * reasons it cannot state. The panel sits beside the generator rather than inside any one channel,
 * so there is no channel the press could mean - and a command typed away from a channel is the
 * same, which is why this asks what the interaction names rather than where it came from.
 *
 * Answered here, ahead of the ordinary requirements, because those would turn it into whichever
 * complaint fits the asker's own voice state - that they own no channel, or that the one they are
 * standing in is not theirs - and neither is what happened.
 *
 * The question is whether the interaction names a channel at all, not whether it came from a panel:
 * a command typed away from one names none either, and deserves the same sentence.
 *
 * Returns whether it answered, in which case the press is spent.
 */
export async function answerClaimWithoutAChannel(
    interaction: UIAdapterReplyContext,
    entityName: string | null
): Promise<boolean> {
    if ( ! entityName || ! CLAIM_BUTTON_NAMES.has( entityName ) ) {
        return false;
    }

    if ( interactionNamesAChannel( getInteractionChannelContext( interaction ) ) ) {
        return false;
    }

    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/ClaimInChannelOnlyAdapter" )
        ?.ephemeral( interaction, {} );

    return true;
}
