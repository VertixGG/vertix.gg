import ObjectBase from "@vertix.gg/base/src/bases/object-base";

export abstract class UICustomIdStrategyBase extends ObjectBase {
    public static getName() {
        return "VertixGUI/UICustomIdStrategyBase";
    }

    public abstract generateId( id: string ): string;
    public abstract getId( id: string ): string;

    /**
     * The plain id behind a custom id, or the custom id back when there is nothing behind it.
     *
     * Quiet where `getId` complains, because this is for asking about ids that were never ours -
     * components belonging to another adapter, or to another bot in the same channel. Not
     * recognising one of those is the answer, not a fault worth a line in the log.
     */
    public abstract getIdSilent( id: string ): string;
}
