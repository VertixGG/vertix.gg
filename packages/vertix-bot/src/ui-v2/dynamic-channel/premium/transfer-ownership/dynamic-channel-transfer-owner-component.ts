import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";

import {
    DynamicChannelTransferOwnerEmbed
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-embed";
import {
    DynamicChannelTransferOwnerUserMenu
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-user-menu";

import {
    DynamicChannelTransferOwnerUserSelectedEmbed
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-user-selected-embed";

import {
    DynamicChannelTransferOwnerTransferredEmbed
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-transferred-embed";

import { DisabledWhileClaimEmbed } from "@vertix.gg/bot/src/ui-v2/_general/disabled-while-claim-embed";
import { YesNoElementsGroup } from "@vertix.gg/bot/src/ui-v2/_general/yes-no-elements-group";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui-v2/_general/something-went-wrong-embed";

export class DynamicChannelTransferOwnerComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelTransferOwnerComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [
            UIElementsGroupBase.createSingleGroup( DynamicChannelTransferOwnerUserMenu ),

            YesNoElementsGroup,
        ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelTransferOwnerEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelTransferOwnerUserSelectedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelTransferOwnerTransferredEmbed ),

            UIEmbedsGroupBase.createSingleGroup( DisabledWhileClaimEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        ];
    }

    protected static getDefaultElementsGroup() {
        return null;
    }

    protected static getDefaultEmbedsGroup() {
        return null;
    }
}
