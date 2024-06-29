import { UIGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-group-base";

export abstract class UIElementsGroupBase extends UIGroupBase {
    public static getName() {
        return "VertixBot/UI-V2/UIElementsGroupBase";
    }

    public static getGroupTypeName() {
        return "Elements";
    }
}
