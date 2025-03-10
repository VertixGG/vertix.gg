import { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";

export class UICustomIdPlainStrategy extends UICustomIdStrategyBase {
    public static getName () {
        return "VertixGUI/UICustomIdWysiwygStrategy";
    }

    public generateId ( id: string ): string {
        return id;
    }

    public getId ( id: string ): string {
        return id;
    }
}
