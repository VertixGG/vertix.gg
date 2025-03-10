import { ObjectBase } from "@vertix.gg/base/src/bases/index";

import type { Base } from "discord.js";

export abstract class UIVersionStrategyBase extends ObjectBase {
    public constructor ( protected readonly versions: Map<number, string> ) {
        super();

        this.versions = versions;
    }

    public abstract determine( context?: Base | any ): Promise<number>;
}
