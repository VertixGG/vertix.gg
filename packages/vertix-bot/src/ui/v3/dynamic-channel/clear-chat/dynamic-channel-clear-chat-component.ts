import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import { DynamicChannelClearChatNothingToClearEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/embeds/dynamic-channel-clear-chat-nothing-to-clear-embed";

import { DynamicChannelClearChatSuccessEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/embeds/dynamic-channel-clear-chat-success-embed";

import { DynamicChannelClearChatButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-button";

export class DynamicChannelClearChatComponent extends UIComponentBase {
    public static getName(): string {
        return "Vertix/UI-V3/DynamicChannelClearChatComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [
            // TODO: If i put `UIEmbedsGroupBase.createSingleGroup` here it does not throw error.
            UIElementsGroupBase.createSingleGroup( DynamicChannelClearChatButton ),
        ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelClearChatSuccessEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelClearChatNothingToClearEmbed ),
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
