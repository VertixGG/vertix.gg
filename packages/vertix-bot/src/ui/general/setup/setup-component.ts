import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { BadwordsModal } from "@vertix.gg/bot/src/ui/general/badwords/badwords-modal";

import { SetupElementsGroup } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-elements-group";

import { SetupEmbed } from "@vertix.gg/bot/src/ui/general/setup/setup-embed";
import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup/setup-max-master-channels-embed";

export class SetupComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-General/SetupComponent";
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
            UIEmbedsGroupBase.createSingleGroup( SetupEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SetupMaxMasterChannelsEmbed ),
        ];
    }

    public static getModals() {
        return [
            BadwordsModal,
        ];
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-General/SetupElementsGroup";
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-General/SetupEmbedGroup";
    }
}
