import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelLfmChannelMenu } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/dynamic-channel-lfm-channel-menu";
import { DynamicChannelLfmNoteModal } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/dynamic-channel-lfm-note-modal";

import { DynamicChannelLfmSelectChannelEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/embeds/dynamic-channel-lfm-select-channel-embed";
import { DynamicChannelLfmPostedEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/embeds/dynamic-channel-lfm-posted-embed";
import { DynamicChannelLfmCooldownEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/embeds/dynamic-channel-lfm-cooldown-embed";
import { DynamicChannelLfmUnavailableEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/embeds/dynamic-channel-lfm-unavailable-embed";

export class DynamicChannelLfmComponent extends UIComponentBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelLfmComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [ UIElementsGroupBase.createSingleGroup( DynamicChannelLfmChannelMenu ) ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelLfmSelectChannelEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelLfmPostedEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelLfmCooldownEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelLfmUnavailableEmbed )
        ];
    }

    public static getModals() {
        return [ DynamicChannelLfmNoteModal ];
    }

    public static getDefaultElementsGroup() {
        return null;
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }
}
