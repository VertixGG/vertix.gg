import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

export abstract class UIDataBase<TData extends Object> extends UIBase {
    public static getName() {
        return "VertixGUI/UIDataBase";
    }

    public abstract create( identifier: any, data: any ): Promise<TData>;

    public abstract read( identifier: any ): Promise<TData | null>;

    public abstract update( identifier: any, data: any ): Promise<TData>;

    public abstract delete( identifier: any ): Promise<TData | boolean | void>;
}
