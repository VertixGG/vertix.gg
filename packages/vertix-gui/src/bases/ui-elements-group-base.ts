import { UIGroupBase } from "@vertix.gg/gui/src/bases/ui-group-base";

export abstract class UIElementsGroupBase extends UIGroupBase {
    public static getName () {
        return "VertixGUI/UIElementsGroupBase";
    }

    public static getGroupTypeName () {
        return "Elements";
    }
}
