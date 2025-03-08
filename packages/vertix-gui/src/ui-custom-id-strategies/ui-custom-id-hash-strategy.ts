import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";

import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

export class UICustomIdHashStrategy extends UICustomIdStrategyBase {
    private uiHashService: UIHashService;

    public static getName() {
        return "VertixGUI/UICustomIdHashStrategy";
    }

    public constructor() {
        super();

        this.uiHashService = ServiceLocator.$.get("VertixGUI/UIHashService");
    }

    public generateId(id: string): string {
        return this.uiHashService.generateId(id);
    }

    public getId(id: string): string {
        return this.uiHashService.getId(id);
    }
}
