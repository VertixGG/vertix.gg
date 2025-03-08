import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

// TODO: Use index

import { ChannelNameTemplateModal } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-modal";

import { SetupEditElementsGroup } from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-elements-group";
import { SetupEditButtonsElementsGroup } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-elements-group";
import { SetupEditButtonsEffectElementsGroup } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-effect-elements-group";

import { SetupEditEmbed } from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-embed";
import { SetupEditButtonsEmbed } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-embed";
import { SetupEditButtonsEffectEmbed } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-effect-embed";

import { SetupEditVerifiedRolesElementsGroup } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-verified-roles/setup-edit-verified-roles-elements-group";
import { SetupEditVerifiedRolesEmbed } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-verified-roles/setup-edit-verified-roles-embed";

/**
 * Used to configure "Master Channel(s)".
 */
export class SetupEditComponent extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V3/ConfigComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    public static getElementsGroups() {
        return [
            SetupEditElementsGroup,

            SetupEditButtonsElementsGroup,
            SetupEditButtonsEffectElementsGroup,

            SetupEditVerifiedRolesElementsGroup
        ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup(SetupEditEmbed),

            UIEmbedsGroupBase.createSingleGroup(SetupEditButtonsEmbed),
            UIEmbedsGroupBase.createSingleGroup(SetupEditButtonsEffectEmbed),

            UIEmbedsGroupBase.createSingleGroup(SetupEditVerifiedRolesEmbed)
        ];
    }

    public static getDefaultElementsGroup() {
        return "Vertix/UI-V3/SetupEditElementsGroup";
    }

    public static getDefaultEmbedsGroup() {
        return "Vertix/UI-V3/SetupEditEmbedGroup";
    }

    protected static getModals() {
        return [ChannelNameTemplateModal];
    }
}
