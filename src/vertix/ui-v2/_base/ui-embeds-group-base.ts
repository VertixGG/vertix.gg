import { UIGroupBase } from "@vertix/ui-v2/_base/ui-group-base";

export abstract class UIEmbedsGroupBase extends UIGroupBase {
    public static getName() {
        return "Vertix/UI-V2/UIEmbedsGroupBase";
    }

    public static getGroupTypeName() {
        return "Embeds";
    }
}
