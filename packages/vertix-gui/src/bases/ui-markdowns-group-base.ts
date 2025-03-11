import { UIGroupBase } from "@vertix.gg/gui/src/bases/ui-group-base";

export abstract class UIMarkdownsGroupBase extends UIGroupBase {
    public static getName() {
        return "VertixGUI/UIMarkdownsGroupBase";
    }

    public static getGroupTypeName() {
        return "Markdowns";
    }
}
