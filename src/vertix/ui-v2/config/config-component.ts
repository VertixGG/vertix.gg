
import { TemplateNameModal } from "@vertix/ui-v2/template/template-name-modal";

import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";

import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";

import { ConfigSelectEmbed } from "@vertix/ui-v2/config/select/config-select-embed";
import { ConfigModifyEmbed } from "@vertix/ui-v2/config/modify/config-modify-embed";

import ConfigModifyButtonsElementsGroup
    from "@vertix/ui-v2/config/modify-buttons/config-modify-buttons-elements-group";

import { ConfigModifyButtonsEmbed } from "@vertix/ui-v2/config/modify-buttons/config-modify-buttons-embed";

import { ConfigModifyElementsGroup } from "@vertix/ui-v2/config/modify/config-modify-elements-group";
import { ConfigSelectElementsGroup } from "@vertix/ui-v2/config/select/config-select-elements-group";

import { ConfigModifyButtonsEffectElementsGroup }
    from "@vertix/ui-v2/config/modify-buttons/config-modify-buttons-effect-elements-group";

import ConfigModifyButtonsEffectEmbed from "@vertix/ui-v2/config/modify-buttons/config-modify-buttons-effect-embed";

/**
 * Used to configure "Master Channel(s)".
 */
export class ConfigComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/ConfigComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getElementsGroups() {
        return [
            ConfigSelectElementsGroup,
            ConfigModifyElementsGroup,

            ConfigModifyButtonsElementsGroup,
            ConfigModifyButtonsEffectElementsGroup,
        ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( ConfigSelectEmbed ),
            UIEmbedsGroupBase.createSingleGroup( ConfigModifyEmbed ),

            UIElementsGroupBase.createSingleGroup( ConfigModifyButtonsEmbed ),
            UIElementsGroupBase.createSingleGroup( ConfigModifyButtonsEffectEmbed ),

        ];
    }

    protected static getModals() {
        return [
            TemplateNameModal,
        ];
    }

    protected static getDefaultElementsGroup() {
        return "Vertix/UI-V2/ConfigElementsSelectGroup";
    }

    protected static getDefaultEmbedsGroup() {
        return "Vertix/UI-V2/ConfigSelectEmbedGroup";
    }
}
