import { UIGroupBase } from "@vertix.gg/gui/src/bases/ui-group-base";

export abstract class UIEmbedsGroupBase extends UIGroupBase {
    public static getName() {
        return "VertixGUI/UIEmbedsGroupBase";
    }

    public static getGroupTypeName() {
        return "Embeds";
    }
}
