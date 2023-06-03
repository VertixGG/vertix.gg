import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { SetupEmbed } from "@vertix/ui-v2/setup/setup-embed";
import { SetupElementsGroup } from "@vertix/ui-v2/setup/setup-elements-group";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";
import { SetupMaxMasterChannelsEmbed } from "@vertix/ui-v2/setup/setup-max-master-channels-embed";
import { BadwordsModal } from "@vertix/ui-v2/badwords/badwords-modal";

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
