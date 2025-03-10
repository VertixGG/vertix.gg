import { DynamicChannelAdapterExuWithInitiatorElementBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-with-initiator-element-base";

import { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } from "@vertix.gg/bot/src/definitions/dynamic-channel";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterReplyContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { VoiceChannel } from "discord.js";

// TODO: Remove
export abstract class DynamicChannelAdapterExuWithPermissionsBase<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction
> extends DynamicChannelAdapterExuWithInitiatorElementBase<TInteraction> {
    protected async getUsersWithPermissions ( channel: VoiceChannel ) {
        return {
            allowedUsers: await this.dynamicChannelService.getChannelUsersWithPermissionState(
                channel,
                DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                true
            ),

            blockedUsers: await this.dynamicChannelService.getChannelUsersWithPermissionState(
                channel,
                DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                false
            )
        };
    }

    protected async assignUsersWithPermissions ( channel: VoiceChannel, args: UIArgs ) {
        Object.assign( args, await this.getUsersWithPermissions( channel ) );
    }
}
