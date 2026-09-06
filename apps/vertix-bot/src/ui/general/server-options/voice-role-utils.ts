import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { VoiceRoleManager } from "@vertix.gg/bot/src/managers/voice-role-manager";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { UIDefaultStringSelectRolesChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const REASON_MESSAGES: Record<string, string> = {
    "missing-manage-roles": "Manage Roles",
    "managed-role": "the role belongs to another bot or to a discord integration",
    "everyone-role": "the everyone role cannot be handed out",
    "role-above-bot": "the role is above the bot in the role list",
    "unknown-bot-member": "the bot is not resolvable in this server"
};

/**
 * Function warnOnUnassignableVoiceRole() :: Tells the admin when the bot cannot hand out the role
 * they just picked.
 *
 * Discord refuses a role that outranks the bot, and refuses managed roles outright. Without this
 * the pick looks accepted and then does nothing on every single join.
 */
export async function warnOnUnassignableVoiceRole(
    interaction: UIDefaultStringSelectRolesChannelTextInteraction,
    roleId: string | null
) {
    if ( ! roleId ) {
        return;
    }

    const role = interaction.guild.roles.cache.get( roleId );

    if ( ! role ) {
        return;
    }

    const { assignable, reason } = VoiceRoleManager.$.isRoleAssignable( role );

    if ( assignable ) {
        return;
    }

    GlobalLogger.$.admin(
        warnOnUnassignableVoiceRole,
        `🎙️ Voice role is not assignable - "${ role.name }" - ${ reason } ` +
            `(${ interaction.guild.name }) (${ interaction.guild.memberCount })`
    );

    if ( "missing-manage-roles" === reason ) {
        await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )
            ?.ephemeral( interaction, {
                missingPermissions: [ REASON_MESSAGES[ reason ] ],
                omitterDisplayName: interaction.guild.client.user.username
            } );

        return;
    }

    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/UnassignableRoleAdapter" )
        ?.ephemeral( interaction, {
            roleId,
            reason: REASON_MESSAGES[ reason ?? "" ] ?? "the bot cannot hand it out"
        } );
}
