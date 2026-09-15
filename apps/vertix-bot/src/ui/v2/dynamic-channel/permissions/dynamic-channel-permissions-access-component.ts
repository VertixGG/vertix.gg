import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { NothingChangedEmbed } from "@vertix.gg/bot/src/ui/general/misc/nothing-changed-embed";
import { StaffMemberEmbed } from "@vertix.gg/bot/src/ui/general/misc/staff-member-embed";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import {
    DynamicChannelPermissionsAccessEmbed,
    DynamicChannelPermissionsBlockedEmbed,
    DynamicChannelPermissionsDeniedEmbed,
    DynamicChannelPermissionsGrantedEmbed,
    DynamicChannelPermissionsKickEmbed,
    DynamicChannelPermissionsUnblockedEmbed
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/embeds";

import {
    DynamicChannelPermissionsAccessElementsGroup
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-access-elements-group";

/**
 * What the access screen draws, and nothing else.
 *
 * The permissions component holds the privacy wordings too - public, private, hidden, shown - since
 * the interface a member reaches by button is both questions at once. `/voice access` is only the
 * one, and `/voice privacy` is the other, so a component carrying the four embeds this can never
 * show would be describing an interface that does not exist.
 *
 * Every embed and the menu group are the permissions component's own, named rather than rewritten:
 * there is one wording of being granted access, and this is a different arrangement of it.
 */
export class DynamicChannelPermissionsAccessComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsAccessComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsAccessEmbed ),

            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsGrantedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsDeniedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsBlockedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsUnblockedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPermissionsKickEmbed ),

            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
            UIEmbedsGroupBase.createSingleGroup( NothingChangedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( StaffMemberEmbed )
        ];
    }

    public static getElementsGroups() {
        return [ DynamicChannelPermissionsAccessElementsGroup ];
    }

    public static getDefaultElementsGroup() {
        return null;
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }
}
