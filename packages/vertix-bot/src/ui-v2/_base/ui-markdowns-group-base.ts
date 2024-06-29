import { UIGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-group-base";

export abstract class UIMarkdownsGroupBase extends UIGroupBase {
    public static getName() {
        return "VertixBot/UI-V2/UIMarkdownsGroupBase";
    }

    public static getGroupTypeName() {
        return "Markdowns";
    }
}
