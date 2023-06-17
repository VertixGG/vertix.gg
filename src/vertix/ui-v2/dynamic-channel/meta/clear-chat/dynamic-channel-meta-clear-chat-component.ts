import { DynamicChannelMetaClearChatSuccessEmbed } from "./embeds/dynamic-channel-meta-clear-chat-success-embed";
import { DynamicChannelMetaClearChatNothingToClearEmbed } from "./embeds/dynamic-channel-meta-clear-chat-nothing-to-clear-embed";

import { DynamicChannelMetaClearChatButton } from "./dynamic-channel-meta-clear-chat-button";

import { SomethingWentWrongEmbed } from "@vertix/ui-v2/_general/something-went-wrong-embed";

import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix/ui-v2/_base/ui-embeds-group-base";

import { UIElementsGroupBase } from "@vertix/ui-v2/_base/ui-elements-group-base";

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
