import type { Base } from "discord.js";

export abstract class UIVersionStrategyBase {
    protected readonly versions: Map<number, string>;

    public constructor(versions: typeof this.versions ) {
        this.versions = versions;
    }

    public abstract determine( context?: Base ): number;
}
