import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { YesNoElementsGroup } from "@vertix.gg/bot/src/ui/general/decision/yes-no-elements-group";

import { DisabledWhileClaimEmbed } from "@vertix.gg/bot/src/ui/general/misc/disabled-while-claim-embed";

import {
    DynamicChannelTransferOwnerEmbed
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-embed";
import {
    DynamicChannelTransferOwnerUserMenu
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-user-menu";

import {
    DynamicChannelTransferOwnerUserSelectedEmbed
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-user-selected-embed";

import {
    DynamicChannelTransferOwnerTransferredEmbed
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-transferred-embed";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

export class DynamicChannelTransferOwnerComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelTransferOwnerComponent";
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

    public static getDefaultElementsGroup() {
        return null;
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }
}
