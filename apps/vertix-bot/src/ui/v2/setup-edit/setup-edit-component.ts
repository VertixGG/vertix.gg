import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";

// TODO: Use index
import { ChannelNameTemplateModal } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-modal";
import { DeleteConfirmModal } from "@vertix.gg/bot/src/ui/general/decision/delete-confirm-modal";

import { SetupEditElementsGroup } from "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-elements-group";
import { SetupEditButtonsElementsGroup } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-elements-group";
import { SetupEditButtonsEffectElementsGroup } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-effect-elements-group";

import { SetupEditEmbed } from "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-embed";
import { SetupEditButtonsEmbed } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-embed";
import { SetupEditButtonsEffectEmbed } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-effect-embed";

import { SetupEditVerifiedRolesElementsGroup } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-verified-roles/setup-edit-verified-roles-elements-group";
import { SetupEditVerifiedRolesEmbed } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-verified-roles/setup-edit-verified-roles-embed";

import { SetupEditStaffRolesElementsGroup } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-staff-roles/setup-edit-staff-roles-elements-group";
import { SetupEditStaffRolesEmbed } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-staff-roles/setup-edit-staff-roles-embed";

const SetupEditComponent = new ComponentBuilder( "VertixBot/UI-V2/ConfigComponent" )
    .addElementsGroup( SetupEditElementsGroup )
    .addElementsGroup( SetupEditButtonsElementsGroup )
    .addElementsGroup( SetupEditButtonsEffectElementsGroup )
    .addElementsGroup( SetupEditVerifiedRolesElementsGroup )
    .addElementsGroup( SetupEditStaffRolesElementsGroup )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditButtonsEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditButtonsEffectEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditVerifiedRolesEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditStaffRolesEmbed ) )
    .addModal( ChannelNameTemplateModal )
    .addModal( DeleteConfirmModal )
    .setDefaultElementsGroup( "VertixBot/UI-V2/SetupEditElementsGroup" )
    .setDefaultEmbedsGroup( "VertixBot/UI-V2/SetupEditEmbedGroup" )
    .setInstanceType( UIInstancesTypes.Static )
    .build();

export { SetupEditComponent };
