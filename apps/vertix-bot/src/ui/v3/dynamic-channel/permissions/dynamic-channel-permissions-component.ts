import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { NothingChangedEmbed } from "@vertix.gg/bot/src/ui/general/misc/nothing-changed-embed";
import { StaffMemberEmbed } from "@vertix.gg/bot/src/ui/general/misc/staff-member-embed";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import { DynamicChannelPermissionsAccessElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/dynamic-channel-permissions-access-elements-group";

import {
    DynamicChannelPermissionsAccessEmbed,
    DynamicChannelPermissionsDeniedEmbed,
    DynamicChannelPermissionsGrantedEmbed,
    DynamicChannelPermissionsBlockedEmbed,
    DynamicChannelPermissionsUnblockedEmbed,
    DynamicChannelPermissionsKickEmbed
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/embeds";

export class DynamicChannelPermissionsComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPermissionsComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsGrantedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsDeniedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsBlockedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsUnblockedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsKickEmbed ),

            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsAccessEmbed ),

            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
            UIEmbedsGroupBase.createSingleGroup( NothingChangedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( StaffMemberEmbed )
        ];
    }

    public static getElementsGroups() {
        return [ DynamicChannelPermissionsAccessElementsGroup ];
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-V3/DynamicChannelPermissionsAccessElementsGroup";
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup";
    }

    public static getDefaultMarkdownsGroup() {
        return null;
    }
}
