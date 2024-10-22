import { DynamicChannelPermissionsAccessElementsGroup } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/dynamic-channel-permissions-access-elements-group";

import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embeds-group-base";

import { NothingChangedEmbed } from "@vertix.gg/bot/src/ui-v2/_general/nothing-changed-embed";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui-v2/_general/something-went-wrong-embed";

import {
    DynamicChannelPermissionsAccessEmbed,
    DynamicChannelPermissionsDeniedEmbed,
    DynamicChannelPermissionsGrantedEmbed,
    DynamicChannelPermissionsHiddenEmbed,
    DynamicChannelPermissionsPrivateEmbed,
    DynamicChannelPermissionsPublicEmbed,
    DynamicChannelPermissionsShownEmbed,
    DynamicChannelPermissionsBlockedEmbed,
    DynamicChannelPermissionsUnblockedEmbed,
    DynamicChannelPermissionsKickEmbed,
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/embeds/";

export class DynamicChannelPermissionsComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsPrivateEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsPublicEmbed ),

            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsHiddenEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsShownEmbed ),

            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsGrantedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsDeniedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsBlockedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsUnblockedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsKickEmbed ),

            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsAccessEmbed ),

            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
            UIEmbedsGroupBase.createSingleGroup( NothingChangedEmbed ),
        ];
    }

    public static getElementsGroups() {
        return [
            DynamicChannelPermissionsAccessElementsGroup,
        ];
    }

    protected static getDefaultElementsGroup() {
        return null;
    }

    protected static getDefaultEmbedsGroup() {
        return null;
    }
}
