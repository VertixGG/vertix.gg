import { DynamicChannelMetaClearChatSuccessEmbed } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/clear-chat/embeds/dynamic-channel-meta-clear-chat-success-embed";
import { DynamicChannelMetaClearChatNothingToClearEmbed } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/clear-chat/embeds/dynamic-channel-meta-clear-chat-nothing-to-clear-embed";

import { DynamicChannelMetaClearChatButton } from "@vertix.gg/bot/src/ui-v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-button";

import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui-v2/_general/something-went-wrong-embed";

import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embeds-group-base";

import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";

export class DynamicChannelMetaClearChatComponent extends UIComponentBase {
    public static getName(): string {
        return "VertixBot/UI-V2/DynamicChannelMetaClearChatComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElementsGroups() {
        return [
            // TODO: If i put `UIEmbedsGroupBase.createSingleGroup` here it does not throw error.
            UIElementsGroupBase.createSingleGroup( DynamicChannelMetaClearChatButton ),
        ];
    }

    public static getEmbedsGroups() {
        return [
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaClearChatSuccessEmbed ),
            UIEmbedsGroupBase.createSingleGroup( DynamicChannelMetaClearChatNothingToClearEmbed ),
            UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        ];
    }

    protected static getDefaultElementsGroup() {
        return null;
    }

    protected static getDefaultEmbedsGroup() {
        return null;
    }
}
