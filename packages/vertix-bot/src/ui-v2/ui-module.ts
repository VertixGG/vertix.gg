import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

import { UICustomIdPlainStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-plain-strategy";

import * as adapters from "@vertix.gg/bot/src/ui-v2/ui-adapters-index";

export class UIModuleV2 extends UIModuleBase {
    public static getName() {
        return "VertixBot/UI-V2/Module";
    }

    public static getAdapters() {
        return Object.values( adapters );
    }

    protected getCustomIdStrategy() {
        return new UICustomIdPlainStrategy();
    }

}

export default UIModuleV2;
