import { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

export class UIHashServiceMock extends UIHashService {
    public constructor() {
        super();
    }

    public isSaveHashEnabled(): boolean {
        return false;
    }
}
