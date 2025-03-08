import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { DynamicChannelMetaClearChatSuccessEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/clear-chat/embeds/dynamic-channel-meta-clear-chat-success-embed";
import { DynamicChannelMetaClearChatNothingToClearEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/clear-chat/embeds/dynamic-channel-meta-clear-chat-nothing-to-clear-embed";

import { DynamicChannelMetaClearChatButton } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-button";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

export class DynamicChannelMetaClearChatComponent extends UIComponentBase {
    public static getName(): string {
        return "Vertix/UI-V2/DynamicChannelMetaClearChatComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [
            // TODO: If i put `UIEmbedsGroupBase.createSingleGroup` here it does not throw error.
            UIElementsGroupBase.createSingleGroup(DynamicChannelMetaClearChatButton)
        ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup(DynamicChannelMetaClearChatSuccessEmbed),
            UIEmbedsGroupBase.createSingleGroup(DynamicChannelMetaClearChatNothingToClearEmbed),
            UIEmbedsGroupBase.createSingleGroup(SomethingWentWrongEmbed)
        ];
    }

    public static getDefaultElementsGroup() {
        return null;
    }

    public static getDefaultEmbedsGroup() {
        return null;
    }
}
