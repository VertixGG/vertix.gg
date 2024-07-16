import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { SetupEmbed } from "@vertix.gg/bot/src/ui-v2/setup/setup-embed";
import { SetupElementsGroup } from "@vertix.gg/bot/src/ui-v2/setup/setup-elements-group";
import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui-v2/setup/setup-max-master-channels-embed";
import { BadwordsModal } from "@vertix.gg/bot/src/ui-v2/badwords/badwords-modal";

export class SetupComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/SetupComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [
            SetupElementsGroup,
        ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup(  SetupEmbed ),
            UIEmbedsGroupBase.createSingleGroup(  SetupMaxMasterChannelsEmbed ),
        ];
    }

    public static getModals() {
        return [
            BadwordsModal,
        ];
    }

    protected static getDefaultElementsGroup() {
        return "Vertix/UI-V2/SetupElementsGroup";
    }

    protected static getDefaultEmbedsGroup() {
        return "Vertix/UI-V2/SetupEmbedGroup";
    }
}
