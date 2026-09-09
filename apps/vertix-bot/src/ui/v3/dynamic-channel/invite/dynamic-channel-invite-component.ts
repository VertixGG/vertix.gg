import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { NothingChangedEmbed } from "@vertix.gg/bot/src/ui/general/misc/nothing-changed-embed";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";
import { NoActiveDynamicChannelEmbed } from "@vertix.gg/bot/src/ui/general/no-active-dynamic-channel/no-active-dynamic-channel-embed";

import { DynamicChannelInviteEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-embed";
import { DynamicChannelInviteSentEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-sent-embed";
import { DynamicChannelInviteUserMenu } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-user-menu";
import { DynamicChannelInviteChannelMenu } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-channel-menu";
import { DynamicChannelInviteSelectChannelEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-select-channel-embed";

export class DynamicChannelInviteComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelInviteComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [
            UIElementsGroupBase.createSingleGroup( DynamicChannelInviteUserMenu ),
            UIElementsGroupBase.createSingleGroup( DynamicChannelInviteChannelMenu )
        ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelInviteEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelInviteSentEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelInviteSelectChannelEmbed ),
            UIEmbedsGroupBase.createSingleGroup( NoActiveDynamicChannelEmbed ),

            UIEmbedsGroupBase.createSingleGroup( NothingChangedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed )
        ];
    }

    public static getDefaultElementsGroup() {
        return null;
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }
}
