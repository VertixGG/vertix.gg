import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import { ClaimCommandChannelMenu } from "@vertix.gg/bot/src/ui/v3/claim/command/claim-command-channel-menu";

import {
    ClaimCommandPointedAtEmbed,
    ClaimCommandSelectEmbed
} from "@vertix.gg/bot/src/ui/v3/claim/command/claim-command-embeds";

export class ClaimCommandComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/ClaimCommandComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [ UIElementsGroupBase.createSingleGroup( ClaimCommandChannelMenu ) ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( ClaimCommandSelectEmbed ),
            UIEmbedsGroupBase.createSingleGroup( ClaimCommandPointedAtEmbed ),
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
