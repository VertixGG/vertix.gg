import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import type UIService from "@vertix.gg/gui/src/ui-service";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const logger = new Logger( "VertixBot/UI-General/BotPermissionsRequirement" );

/**
 * Function isPassingBotGuildPermissions() :: Whether the bot itself holds what the guild-level
 * features need, and says so on the screen written for it when it does not.
 *
 * The middleware's own check reads `interaction.memberPermissions` - the permissions of the admin
 * who pressed the button. Nothing there looks at the bot. An admin with every permission in the
 * server can therefore walk a screen all the way to its final Discord call and be told only by a
 * raw API error that the bot was never granted what the screen needed, which is how a setup can
 * fail four times over with nothing said to the person doing it.
 *
 * Administrator short-circuits: it satisfies anything, and asking Discord to enumerate it produces
 * a list that means nothing to a server owner.
 */
export async function isPassingBotGuildPermissions( interaction: UIAdapterReplyContext ): Promise<boolean> {
    if ( PermissionsManager.$.isSelfAdministratorRole( interaction.guild ) ) {
        return true;
    }

    const missingPermissions = PermissionsManager.$
        .getRolesPermissions( interaction.guild )
        .missing( DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS );

    if ( !missingPermissions.length ) {
        return true;
    }

    logger.admin(
        isPassingBotGuildPermissions,
        `🔐 Bot missing permissions - "${ missingPermissions.join( ", " ) }" (${ interaction.guild.name }) (${ interaction.guild.memberCount })`
    );

    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )
        ?.ephemeral( interaction, {
            missingPermissions,
            omitterDisplayName: interaction.guild.client.user.username
        } );

    return false;
}
