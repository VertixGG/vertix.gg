import ObjectBase from "@vertix.gg/base/src/bases/object-base";

export abstract class UICustomIdStrategyBase extends ObjectBase {
    public static getName () {
        return "VertixGUI/UICustomIdStrategyBase";
    }

    public abstract generateId( id: string ): string;
    public abstract getId( id: string ): string;
}
