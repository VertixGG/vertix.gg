import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { PermissionsBitField } from "discord.js";

import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import {
    dynamicChannelBotPermissionsRequirements,
    dynamicChannelRequirements
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/_dynamic-channel-requirements";

import type { TCommandTier } from "@vertix.gg/bot/src/commands/base/command-tiers";
import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { VoiceChannel } from "discord.js";

/**
 * Function passesCommandTier() :: Whether this caller may run this command, and says so if not.
 *
 * Every branch here hands off to the check the buttons already use, so a command and the button
 * beside it refuse for the same reason and in the same words. Nothing new is decided here; what
 * this adds is the routing from a declared tier to the check that enforces it.
 *
 * Returns whether the command may proceed. A `false` has already answered the caller.
 */
export async function passesCommandTier(
    tier: TCommandTier,
    interaction: UIAdapterReplyContext,
    channel: VoiceChannel | null
): Promise<boolean> {
    switch ( tier ) {
        case COMMAND_TIERS.OWNER_OF_DYNAMIC:
            // Resolves the channel itself when handed none, and answers with whichever of
            // `NoActiveDynamicChannel` / `NotYourChannel` fits what the caller is standing in.
            return await dynamicChannelRequirements( interaction, channel );

        case COMMAND_TIERS.ANY:
            // No channel of the caller's own is assumed - only that the bot can act at all.
            return await dynamicChannelBotPermissionsRequirements( interaction );

        case COMMAND_TIERS.IN_CHANNEL:
            return await passesInChannelTier( interaction, channel );

        case COMMAND_TIERS.ADMIN:
            return await passesAdminTier( interaction );
    }
}

/**
 * Function passesAdminTier() :: Whether the caller may configure the server.
 *
 * Discord is asked to refuse these before the bot is reached, from the permissions the command
 * declares - but only where it can, and it cannot inside a group that also holds rows anyone may
 * run, because its permission covers a whole group at once. Asked again here so that the answer
 * does not depend on which kind of group a row happens to sit in.
 */
async function passesAdminTier( interaction: UIAdapterReplyContext ): Promise<boolean> {
    if ( interaction.memberPermissions?.has( new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS ) ) ) {
        return true;
    }

    // Its own notice rather than `MissingPermissionsAdapter`, which means the bot is missing
    // permissions and not the caller - the two read almost alike and mean opposite things.
    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/MissingAdminPermissionsAdapter" )
        ?.ephemeral( interaction );

    return false;
}

/**
 * Function passesInChannelTier() :: Whether the caller is standing somewhere the command can mean.
 *
 * Claiming is the tier's only member, and the thing it cannot do is happen at a distance: the
 * button is left pressable on a control panel so that what a member gets back is a sentence rather
 * than a button greyed out for reasons it cannot state, and a command typed in a text channel is
 * the same press from the same nowhere. So it gets the same sentence, from the same adapter.
 */
async function passesInChannelTier(
    interaction: UIAdapterReplyContext,
    channel: VoiceChannel | null
): Promise<boolean> {
    if ( ! channel ) {
        await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/ClaimInChannelOnlyAdapter" )
            ?.ephemeral( interaction, {} );

        return false;
    }

    return await dynamicChannelBotPermissionsRequirements( interaction );
}
