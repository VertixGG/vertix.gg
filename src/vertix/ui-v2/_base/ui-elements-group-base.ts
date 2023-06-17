import { UIGroupBase } from "@vertix/ui-v2/_base/ui-group-base";

export abstract class UIElementsGroupBase extends UIGroupBase {
    public static getName() {
        return "Vertix/UI-V2/UIElementsGroupBase";
    }

    public static getGroupTypeName() {
        return "Elements";
    }
}
